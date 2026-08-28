import { Module } from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { EmployeesController } from './employees.controller';
import { DrizzleEmployeesRepository } from './repositories/drizzle-employees.repository';
import { EmployeesRepository } from './repositories/employees.repository';
import { AuditModule } from '../audit/audit.module';
import { EmployeeControlsRepository } from './repositories/employee-controls.repository';
import { DrizzleEmployeeControlsRepository } from './repositories/drizzle-employee-controls.repository';

@Module({
  imports: [AuditModule],
  controllers: [EmployeesController],
  providers: [
    EmployeesService,
    {
      provide: EmployeesRepository,
      useClass: DrizzleEmployeesRepository,
    },
    {
      provide: EmployeeControlsRepository,
      useClass: DrizzleEmployeeControlsRepository,
    },
  ],
  exports: [EmployeesService, EmployeesRepository, EmployeeControlsRepository],
})
export class EmployeesModule {}
