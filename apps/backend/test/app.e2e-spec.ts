import { Test } from '@nestjs/testing';
import request from 'supertest';
import type { NestExpressApplication } from '@nestjs/platform-express';
import type { AuthMeResponse, SessionsResponse } from '@sigip/shared';
import { eq } from 'drizzle-orm';

import { AppModule } from '../src/app.module';
import { configureApplication } from '../src/configure-application';
import { DRIZZLE_DATABASE } from '../src/database/database.constants';
import type { DrizzleDatabase } from '../src/database/database.types';
import { roles, sessions, users } from '../src/database/schema';
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
    const list = await agent.get('/api/sessions').expect(200);
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
    const list = await agent.get('/api/sessions').expect(200);
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
    const userId = generateUuidV7();
    const username = `e2e-${userId.slice(-8)}`;
    const password = 'Temporary-e2e-password';
    const cryptoService = app.get(CryptoService);

    await db.insert(users).values({
      id: uuidToBuffer(userId),
      roleId: role.id,
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

      const admin = request.agent(app.getHttpServer());
      await admin
        .post('/api/auth/login')
        .set('Origin', frontendOrigin)
        .send({
          username: process.env.E2E_USERNAME ?? 'admin',
          password: process.env.E2E_PASSWORD ?? 'admin123',
        })
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
});
