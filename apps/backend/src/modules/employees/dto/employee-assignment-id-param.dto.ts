import { IsUUID } from 'class-validator';

export class EmployeeAssignmentIdParamDto {
  @IsUUID()
  employeeId!: string;

  @IsUUID()
  assignmentId!: string;
}
