import { Module } from '@nestjs/common';
import { OrganizationalUnitsService } from './organizational-units.service';
import { OrganizationalUnitsController } from './organizational-units.controller';
import { OrganizationalUnitsRepository } from './repositories/organizational-units.repository';
import { DrizzleOrganizationalUnitsRepository } from './repositories/drizzle-organizational-units.repository';

@Module({
  controllers: [OrganizationalUnitsController],
  providers: [
    OrganizationalUnitsService,
    {
      provide: OrganizationalUnitsRepository,
      useClass: DrizzleOrganizationalUnitsRepository,
    },
  ],
  exports: [OrganizationalUnitsService, OrganizationalUnitsRepository],
})
export class OrganizationalUnitsModule {}
