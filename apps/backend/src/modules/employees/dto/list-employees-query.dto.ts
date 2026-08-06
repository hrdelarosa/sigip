import type { EmployeeStatus } from '@sigip/shared';
import { IsIn, IsOptional, IsUUID } from 'class-validator';
import { PaginationQueryDto } from '../../../common/pagination/dto/pagination-query.dto';

export const EMPLOYEE_SORT_OPTIONS = [
  'employeeNumber',
  '-employeeNumber',
  'fullName',
  '-fullName',
  'hireDate',
  '-hireDate',
  'createdAt',
  '-createdAt',
] as const;
export type EmployeeSort = (typeof EMPLOYEE_SORT_OPTIONS)[number];

export class ListEmployeesQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsIn(EMPLOYEE_SORT_OPTIONS)
  declare sort?: EmployeeSort;

  @IsOptional()
  @IsIn(['ACTIVE', 'INACTIVE'] satisfies EmployeeStatus[])
  status?: EmployeeStatus;

  @IsOptional()
  @IsUUID()
  organizationalUnitId?: string;

  @IsOptional()
  @IsUUID()
  positionId?: string;
}
