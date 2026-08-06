import { Module } from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { EmployeesController } from './employees.controller';
import { DrizzleEmployeesRepository } from './repositories/drizzle-employees.repository';
import { EmployeesRepository } from './repositories/employees.repository';
import { OrganizationalUnitsModule } from '../organizational-units/organizational-units.module';
import { PositionsModule } from '../positions/positions.module';

@Module({
  imports: [OrganizationalUnitsModule, PositionsModule],
  controllers: [EmployeesController],
  providers: [
    EmployeesService,
    {
      provide: EmployeesRepository,
      useClass: DrizzleEmployeesRepository,
    },
  ],
  exports: [EmployeesService, EmployeesRepository],
})
export class EmployeesModule {}
