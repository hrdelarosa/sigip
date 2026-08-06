import { IsUUID } from 'class-validator';

export class EmployeeIdParamDto {
  @IsUUID()
  id!: string;
}
