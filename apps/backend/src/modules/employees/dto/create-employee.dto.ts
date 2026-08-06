import { CreateEmployeeRequest } from '@sigip/shared';
import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';

export class CreateEmployeeDto implements CreateEmployeeRequest {
  @IsString()
  @IsNotEmpty()
  @Length(1, 50)
  employeeNumber!: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 200)
  fullName!: string;

  @IsOptional()
  @IsDateString()
  hireDate?: string | null;
}
