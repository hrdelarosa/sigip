import type {
  EmployeeStatus,
  UpdateEmployeeStatusRequest,
} from '@sigip/shared';
import { IsIn } from 'class-validator';

export class UpdateEmployeeStatusDto implements UpdateEmployeeStatusRequest {
  @IsIn(['ACTIVE', 'INACTIVE'] satisfies EmployeeStatus[])
  status!: EmployeeStatus;
}
