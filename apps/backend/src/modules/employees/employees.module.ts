import { Module } from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { EmployeesController } from './employees.controller';
import { DrizzleEmployeesRepository } from './repositories/drizzle-employees.repository';
import { EmployeesRepository } from './repositories/employees.repository';

@Module({
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
