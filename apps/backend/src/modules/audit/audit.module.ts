import { Module } from '@nestjs/common';

import { AuditController } from './audit.controller';
import { AuditService } from './audit.service';
import { AuditRepository } from './repositories/audit.repository';
import { DrizzleAuditRepository } from './repositories/drizzle-audit.repository';

@Module({
  controllers: [AuditController],
  providers: [
    AuditService,
    { provide: AuditRepository, useClass: DrizzleAuditRepository },
  ],
  exports: [AuditService, AuditRepository],
})
export class AuditModule {}
