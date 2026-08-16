import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { HealthModule } from './health/health.module';
import { UsersModule } from './modules/users/users.module';
import { ConfigModule } from '@nestjs/config';
import databaseConfig from './config/database.config';
import authConfig from './config/auth.config';
import { environmentValidationSchema } from './config/environment.validation';
import { DatabaseModule } from './database/database.module';
import { RolesModule } from './modules/roles/roles.module';
import { PermissionsModule } from './modules/permissions/permissions.module';
import { CryptoService } from './common/crypto/crypto.service';
import { CryptoModule } from './common/crypto/crypto.module';
import { OrganizationalUnitsModule } from './modules/organizational-units/organizational-units.module';
import { PositionsModule } from './modules/positions/positions.module';
import { EmployeesModule } from './modules/employees/employees.module';
import { AuthModule } from './modules/auth/auth.module';
import { SessionsModule } from './modules/sessions/sessions.module';
import { OriginGuard } from './common/guards/origin.guard';
import { SessionAuthGuard } from './common/guards/session-auth.guard';
import { PermissionsGuard } from './common/guards/permissions.guard';
import { AuditModule } from './modules/audit/audit.module';
import { IncidentsModule } from './modules/incidents/incidents.module';
import { IncidentTypesModule } from './modules/incident-types/incident-types.module';
import { DocumentsModule } from './modules/documents/documents.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      envFilePath: ['apps/backend/.env', '.env'],
      load: [databaseConfig, authConfig],
      validationSchema: environmentValidationSchema,
      validationOptions: {
        allowUnknown: true,
        abortEarly: false,
      },
    }),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 120 }]),
    DatabaseModule,
    HealthModule,
    UsersModule,
    RolesModule,
    PermissionsModule,
    CryptoModule,
    OrganizationalUnitsModule,
    PositionsModule,
    EmployeesModule,
    AuthModule,
    SessionsModule,
    AuditModule,
    IncidentsModule,
    IncidentTypesModule,
    DocumentsModule,
  ],
  providers: [
    CryptoService,
    { provide: APP_GUARD, useClass: OriginGuard },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: SessionAuthGuard },
    { provide: APP_GUARD, useClass: PermissionsGuard },
  ],
})
export class AppModule {}
