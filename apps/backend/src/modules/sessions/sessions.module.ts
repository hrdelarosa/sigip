import { Module } from '@nestjs/common';

import { DrizzleSessionsRepository } from './repositories/drizzle-sessions.repository';
import { SessionsRepository } from './repositories/sessions.repository';
import { SessionsController } from './sessions.controller';
import { SessionsService } from './sessions.service';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [AuditModule],
  controllers: [SessionsController],
  providers: [
    SessionsService,
    { provide: SessionsRepository, useClass: DrizzleSessionsRepository },
  ],
  exports: [SessionsService, SessionsRepository],
})
export class SessionsModule {}
