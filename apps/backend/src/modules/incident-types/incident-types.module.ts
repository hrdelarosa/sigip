import { Module } from '@nestjs/common';

import { IncidentTypesController } from './incident-types.controller';
import { IncidentTypesService } from './incident-types.service';
import { IncidentTypesRepository } from './repositories/incident-types.repository';
import { DrizzleIncidentTypesRepository } from './repositories/drizzle-incident-types.repository';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [AuditModule],
  controllers: [IncidentTypesController],

  providers: [
    IncidentTypesService,

    {
      provide: IncidentTypesRepository,
      useClass: DrizzleIncidentTypesRepository,
    },
  ],

  exports: [IncidentTypesService, IncidentTypesRepository],
})
export class IncidentTypesModule {}
