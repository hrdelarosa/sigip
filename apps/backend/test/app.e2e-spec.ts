import { Test } from '@nestjs/testing';
import request from 'supertest';
import type { NestExpressApplication } from '@nestjs/platform-express';
import type { AuthMeResponse, SessionsResponse } from '@sigip/shared';
import { eq } from 'drizzle-orm';

import { AppModule } from '../src/app.module';
import { configureApplication } from '../src/configure-application';
import { DRIZZLE_DATABASE } from '../src/database/database.constants';
import type { DrizzleDatabase } from '../src/database/database.types';
import {
  auditLogs,
  employeeAssignments,
  employees,
  employeeVacationAdjustments,
  roles,
  offices,
  sessions,
  users,
  organizationalUnits,
  positions,
} from '../src/database/schema';
import { uuidToBuffer } from '../src/database/utils/uuid.util';
import { CryptoService } from '../src/common/crypto/crypto.service';
import { generateUuidV7 } from '../src/common/utils/generate-uuid-v7.util';

describe('Authentication flow (e2e)', () => {
  const frontendOrigin = process.env.FRONTEND_ORIGIN ?? 'http://localhost:5173';
  let app: NestExpressApplication;
  let db: DrizzleDatabase;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication<NestExpressApplication>();
    configureApplication(app);
    await app.init();
    db = app.get(DRIZZLE_DATABASE);
  }, 30_000);

  afterAll(async () => {
    await app.close();
  });

  it('keeps health public while administrative routes require a session', async () => {
    await request(app.getHttpServer()).get('/api/health').expect(200);
    await request(app.getHttpServer()).get('/api/users').expect(401);
  });

  it('exposes the download filename header to the frontend origin', async () => {
    const response = await request(app.getHttpServer())
      .options('/api/documents/test')
      .set('Origin', frontendOrigin)
      .set('Access-Control-Request-Method', 'GET')
      .expect(204);

    expect(response.headers['access-control-expose-headers']).toContain(
      'Content-Disposition',
    );
  });

  it('rejects invalid credentials without exposing which field failed', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/auth/login')
      .set('Origin', frontendOrigin)
      .send({ username: 'does-not-exist', password: 'invalid-password' })
      .expect(401);

    const body = response.body as unknown as { message: string };
    expect(body.message).toBe('Usuario o contraseña inválidos');
  });

  it('logs in, restores identity, logs out, and rejects the revoked session', async () => {
    const agent = request.agent(app.getHttpServer());
    const login = await agent
      .post('/api/auth/login')
      .set('Origin', frontendOrigin)
      .send({
        username: process.env.E2E_USERNAME ?? 'admin',
        password: process.env.E2E_PASSWORD ?? 'admin123',
      })
      .expect(200);

    expect(login.headers['set-cookie']?.[0]).toContain('HttpOnly');
    expect(login.headers['set-cookie']?.[0]).toContain('SameSite=Lax');
    const loginBody = login.body as unknown as AuthMeResponse;
    expect(loginBody.username).toBe(process.env.E2E_USERNAME ?? 'admin');
    expect(loginBody.role.code).toEqual(expect.any(String));
    expect(Array.isArray(loginBody.permissions)).toBe(true);
    expect(loginBody).not.toHaveProperty('sessionId');
    expect(loginBody).not.toHaveProperty('passwordHash');

    await agent.get('/api/auth/me').expect(200).expect(loginBody);
    await agent.get('/api/users').expect(200);
    await agent
      .post('/api/auth/logout')
      .set('Origin', frontendOrigin)
      .expect(204);
    await agent.get('/api/auth/me').expect(401);
  });

  it('rejects an idle-expired session', async () => {
    const agent = request.agent(app.getHttpServer());
    await agent
      .post('/api/auth/login')
      .set('Origin', frontendOrigin)
      .send({
        username: process.env.E2E_USERNAME ?? 'admin',
        password: process.env.E2E_PASSWORD ?? 'admin123',
      })
      .expect(200);
    const currentUser = await agent.get('/api/auth/me').expect(200);
    const userId = (currentUser.body as unknown as AuthMeResponse).id;
    const list = await agent.get(`/api/users/${userId}/sessions`).expect(200);
    const listedSessions = list.body as unknown as SessionsResponse;
    const current = listedSessions.find((session) => session.isCurrent);
    expect(current).toBeDefined();

    await db
      .update(sessions)
      .set({ idleExpiresAt: new Date(Date.now() - 1_000) })
      .where(eq(sessions.id, uuidToBuffer(current!.id)));

    await agent.get('/api/auth/me').expect(401);
  });

  it('rejects an absolute-expired session', async () => {
    const agent = request.agent(app.getHttpServer());
    await agent
      .post('/api/auth/login')
      .set('Origin', frontendOrigin)
      .send({
        username: process.env.E2E_USERNAME ?? 'admin',
        password: process.env.E2E_PASSWORD ?? 'admin123',
      })
      .expect(200);
    const currentUser = await agent.get('/api/auth/me').expect(200);
    const userId = (currentUser.body as unknown as AuthMeResponse).id;
    const list = await agent.get(`/api/users/${userId}/sessions`).expect(200);
    const listedSessions = list.body as unknown as SessionsResponse;
    const current = listedSessions.find((session) => session.isCurrent);
    expect(current).toBeDefined();

    await db
      .update(sessions)
      .set({ absoluteExpiresAt: new Date(Date.now() - 1_000) })
      .where(eq(sessions.id, uuidToBuffer(current!.id)));

    await agent.get('/api/auth/me').expect(401);
  });

  it('enforces permissions and revokes sessions on password reset and deactivation', async () => {
    const [role] = await db
      .select({ id: roles.id })
      .from(roles)
      .where(eq(roles.code, 'data-entry-clerk'))
      .limit(1);
    const [office] = await db
      .select({ id: offices.id })
      .from(offices)
      .where(eq(offices.code, 'ORGRO'))
      .limit(1);
    const userId = generateUuidV7();
    const username = `e2e-${userId.slice(-8)}`;
    const password = 'Temporary-e2e-password';
    const cryptoService = app.get(CryptoService);

    await db.insert(users).values({
      id: uuidToBuffer(userId),
      roleId: role.id,
      officeId: office.id,
      username,
      fullName: 'Usuario E2E',
      password: await cryptoService.hashPassword(password),
      isActive: true,
    });

    try {
      const agent = request.agent(app.getHttpServer());
      await agent
        .post('/api/auth/login')
        .set('Origin', frontendOrigin)
        .send({ username, password })
        .expect(200);
      await agent.get('/api/users').expect(403);
      await agent.get(`/api/users/${userId}/sessions`).expect(403);

      const admin = request.agent(app.getHttpServer());
      await admin
        .post('/api/auth/login')
        .set('Origin', frontendOrigin)
        .send({
          username: process.env.E2E_USERNAME ?? 'admin',
          password: process.env.E2E_PASSWORD ?? 'admin123',
        })
        .expect(200);

      const userSessions = await admin
        .get(`/api/users/${userId}/sessions`)
        .expect(200);
      const activeSession = (
        userSessions.body as unknown as SessionsResponse
      ).find((session) => !session.revokedAt);
      expect(activeSession).toBeDefined();

      await admin
        .delete(`/api/users/${userId}/sessions/${activeSession!.id}`)
        .set('Origin', frontendOrigin)
        .expect(204);
      await agent.get('/api/auth/me').expect(401);

      await agent
        .post('/api/auth/login')
        .set('Origin', frontendOrigin)
        .send({ username, password })
        .expect(200);

      const replacementPassword = 'Replacement-e2e-password';
      await admin
        .patch(`/api/users/${userId}/password`)
        .set('Origin', frontendOrigin)
        .send({ password: replacementPassword })
        .expect(200);
      await agent.get('/api/auth/me').expect(401);

      await agent
        .post('/api/auth/login')
        .set('Origin', frontendOrigin)
        .send({ username, password: replacementPassword })
        .expect(200);
      await admin
        .patch(`/api/users/${userId}/status`)
        .set('Origin', frontendOrigin)
        .send({ isActive: false })
        .expect(200);
      await agent.get('/api/auth/me').expect(401);
    } finally {
      await db
        .delete(auditLogs)
        .where(eq(auditLogs.userId, uuidToBuffer(userId)));
      await db
        .delete(sessions)
        .where(eq(sessions.userId, uuidToBuffer(userId)));
      await db.delete(users).where(eq(users.id, uuidToBuffer(userId)));
    }
  });

  it('rejects unsafe requests without an allowed origin', async () => {
    for (let attempt = 0; attempt < 11; attempt += 1) {
      await request(app.getHttpServer())
        .post('/api/auth/login')
        .set('Origin', 'https://malicious.example')
        .send({ username: 'admin', password: 'admin123' })
        .expect(403);
    }

    await request(app.getHttpServer())
      .post('/api/auth/login')
      .set('Origin', frontendOrigin)
      .send({ username: 'does-not-exist', password: 'invalid-password' })
      .expect(401);
  });

  it('registers an audited vacation adjustment and exposes the employee controls', async () => {
    const admin = request.agent(app.getHttpServer());
    await admin
      .post('/api/auth/login')
      .set('Origin', frontendOrigin)
      .send({
        username: process.env.E2E_USERNAME ?? 'admin',
        password: process.env.E2E_PASSWORD ?? 'admin123',
      })
      .expect(200);
    const employeeNumber = `VAC-${generateUuidV7().slice(-8)}`;
    const createdEmployee = await admin
      .post('/api/employees')
      .set('Origin', frontendOrigin)
      .send({
        employeeNumber,
        fullName: 'Empleado control vacacional E2E',
        hireDate: '2025-01-01',
      })
      .expect(201);
    const employeeId = (createdEmployee.body as unknown as { id: string }).id;
    const [office] = await db
      .select({ id: offices.id })
      .from(offices)
      .where(eq(offices.code, 'ORGRO'))
      .limit(1);
    const [unit] = await db
      .select({ id: organizationalUnits.id })
      .from(organizationalUnits)
      .limit(1);
    const [position] = await db
      .select({ id: positions.id })
      .from(positions)
      .limit(1);
    const assignmentId = generateUuidV7();
    if (!office || !unit || !position) throw new Error('Faltan catálogos E2E');
    await db.insert(employeeAssignments).values({
      id: uuidToBuffer(assignmentId),
      employeeId: uuidToBuffer(employeeId),
      officeId: office.id,
      organizationalUnitId: unit.id,
      positionId: position.id,
      appointmentType: 'BASE',
      effectiveFrom: new Date('2020-01-01T00:00:00.000Z'),
      effectiveTo: null,
      schedule: null,
      notes: null,
    });
    let adjustmentId: string | undefined;

    try {
      await admin
        .post(`/api/employees/${employeeId}/vacation-adjustments`)
        .set('Origin', frontendOrigin)
        .send({
          year: 2026,
          period: 'SECOND',
          daysDelta: 2,
          reason: 'Consumo anterior a SIGIP',
          createdBy: generateUuidV7(),
        })
        .expect(400);

      const adjustmentResponse = await admin
        .post(`/api/employees/${employeeId}/vacation-adjustments`)
        .set('Origin', frontendOrigin)
        .send({
          year: 2026,
          period: 'SECOND',
          daysDelta: 2,
          reason: 'Consumo anterior a SIGIP',
        })
        .expect(201);
      adjustmentId = (adjustmentResponse.body as unknown as { id: string }).id;

      const details = await admin
        .get(`/api/employees/${employeeId}`)
        .expect(200);
      const vacationControl = (
        details.body as unknown as {
          vacationControl: {
            years: Array<{
              year: number;
              periods: Array<{
                period: string;
                adjustmentDays: number;
                remainingDays: number;
              }>;
            }>;
          };
        }
      ).vacationControl;
      const secondPeriod = vacationControl.years
        .find((year) => year.year === 2026)
        ?.periods.find((period) => period.period === 'SECOND');
      expect(secondPeriod).toMatchObject({
        adjustmentDays: 2,
        remainingDays: 8,
      });

      const [audit] = await db
        .select({ entityType: auditLogs.entityType })
        .from(auditLogs)
        .where(eq(auditLogs.entityId, uuidToBuffer(adjustmentId)));
      expect(audit?.entityType).toBe('EMPLOYEE_VACATION_ADJUSTMENT');
    } finally {
      if (adjustmentId) {
        await db
          .delete(auditLogs)
          .where(eq(auditLogs.entityId, uuidToBuffer(adjustmentId)));
      }
      await db
        .delete(employeeVacationAdjustments)
        .where(
          eq(employeeVacationAdjustments.employeeId, uuidToBuffer(employeeId)),
        );
      await db
        .delete(employeeAssignments)
        .where(eq(employeeAssignments.employeeId, uuidToBuffer(employeeId)));
      await db
        .delete(employees)
        .where(eq(employees.id, uuidToBuffer(employeeId)));
    }
  });
});
