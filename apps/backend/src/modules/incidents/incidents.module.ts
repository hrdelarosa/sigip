import { Module } from '@nestjs/common';
import { IncidentsService } from './incidents.service';
import { IncidentsController } from './incidents.controller';
import { DocumentsModule } from '../documents/documents.module';
import { IncidentsRepository } from './repositories/incidents.repository';
import { DrizzleIncidentsRepository } from './repositories/drizzle-incidents.repository';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [AuditModule, DocumentsModule],
  controllers: [IncidentsController],
  providers: [
    IncidentsService,
    {
      provide: IncidentsRepository,
      useClass: DrizzleIncidentsRepository,
    },
  ],
  exports: [IncidentsService, IncidentsRepository],
})
export class IncidentsModule {}
