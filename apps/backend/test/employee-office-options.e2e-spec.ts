import { UnauthorizedException, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { APP_GUARD } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';
import cookieParser from 'cookie-parser';
import { EmployeesController } from '../src/modules/employees/employees.controller';
import { EmployeesService } from '../src/modules/employees/employees.service';
import { EmployeeOfficeOptionsGuard } from '../src/modules/employees/employee-office-options.guard';
import { OfficesController } from '../src/modules/offices/offices.controller';
import { OfficesService } from '../src/modules/offices/offices.service';
import { SessionAuthGuard } from '../src/common/guards/session-auth.guard';
import { PermissionsGuard } from '../src/common/guards/permissions.guard';
import { SessionsService } from '../src/modules/sessions/sessions.service';
import { ConfigService } from '@nestjs/config';
import type { AuthenticatedUserModel } from '../src/modules/auth/models/authenticated-user.model';
import type { OfficeModel } from '../src/modules/offices/models/office.model';

describe('GET /api/employees/office-options authorization (e2e isolated)', () => {
  let app: NestExpressApplication;
  const actor = (
    permissions: string[],
    officeId = 'office-local',
  ): AuthenticatedUserModel => ({
    userId: 'user-id',
    sessionId: 'session-id',
    username: 'test',
    fullName: 'Test',
    office: { id: officeId, code: 'LOCAL', name: 'Local office' },
    role: { id: 'role-id', code: 'test', name: 'Test' },
    permissions,
  });
  const offices: OfficeModel[] = [
    {
      id: 'office-local',
      code: 'LOCAL',
      name: 'Local',
      description: null,
      municipality: null,
      address: null,
      isActive: true,
      sortOrder: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'office-other',
      code: 'OTHER',
      name: 'Other',
      description: null,
      municipality: null,
      address: null,
      isActive: true,
      sortOrder: 2,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'office-inactive',
      code: 'OLD',
      name: 'Inactive',
      description: null,
      municipality: null,
      address: null,
      isActive: false,
      sortOrder: 3,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];
  const officesService = {
    findAll: jest.fn().mockResolvedValue(offices),
    findById: jest.fn(),
  };
  const employeesService = {};
  const sessionsService = {
    authenticateToken: jest.fn((token?: string) => {
      if (!token) throw new UnauthorizedException();
      const permissions = JSON.parse(token) as string[];
      return actor(permissions);
    }),
  };

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      controllers: [EmployeesController, OfficesController],
      providers: [
        EmployeeOfficeOptionsGuard,
        { provide: EmployeesService, useValue: employeesService },
        { provide: OfficesService, useValue: officesService },
        { provide: SessionsService, useValue: sessionsService },
        { provide: ConfigService, useValue: { getOrThrow: () => 'session' } },
        { provide: APP_GUARD, useClass: SessionAuthGuard },
        { provide: APP_GUARD, useClass: PermissionsGuard },
      ],
    }).compile();
    app = module.createNestApplication<NestExpressApplication>();
    app.use(cookieParser());
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => app.close());

  const getWithPermissions = (
    permissions: string[],
    path = '/api/employees/office-options',
  ) =>
    request(app.getHttpServer())
      .get(path)
      .set(
        'Cookie',
        `session=${encodeURIComponent(JSON.stringify(permissions))}`,
      );

  it('requires an authenticated session', async () => {
    await request(app.getHttpServer())
      .get('/api/employees/office-options')
      .expect(401);
  });

  it.each([
    ['catalogs:read'],
    ['offices:access-all'],
    ['catalogs:read', 'offices:access-all'],
  ])('denies users with only %j', async (...permissions: string[]) => {
    await getWithPermissions(permissions).expect(403);
  });

  it.each(['employees:create', 'employees:update'])(
    'allows %s without catalogs:read and returns own active office only',
    async (permission) => {
      const response = await getWithPermissions([permission]).expect(200);
      expect(response.body).toEqual([
        { id: 'office-local', name: 'Local', code: 'LOCAL' },
      ]);
    },
  );

  it('returns every active office to a global employee editor and is not captured by /:id', async () => {
    const response = await getWithPermissions([
      'employees:update',
      'offices:access-all',
    ]).expect(200);
    expect(response.body).toEqual([
      { id: 'office-local', name: 'Local', code: 'LOCAL' },
      { id: 'office-other', name: 'Other', code: 'OTHER' },
    ]);
  });

  it('preserves catalogs:read on the general offices endpoint', async () => {
    await getWithPermissions(['employees:create'], '/api/offices').expect(403);
    const response = await getWithPermissions(
      ['catalogs:read'],
      '/api/offices',
    ).expect(200);
    expect(response.body).toHaveLength(3);
  });
});
