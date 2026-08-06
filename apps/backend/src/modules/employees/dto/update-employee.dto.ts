import { UpdateEmployeeRequest } from '@sigip/shared';
import { IsDateString, IsOptional, IsString, Length } from 'class-validator';

export class UpdateEmployeeDto implements UpdateEmployeeRequest {
  @IsOptional()
  @IsString()
  @Length(1, 50)
  employeeNumber?: string;

  @IsOptional()
  @IsString()
  @Length(1, 200)
  fullName?: string;

  @IsOptional()
  @IsDateString()
  hireDate?: string | null;
}
