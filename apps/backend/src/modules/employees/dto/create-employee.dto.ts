import { CreateEmployeeRequest } from '@sigip/shared';
import { Transform } from 'class-transformer';
import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';
import { trimString } from './employee-dto.transforms';

export class CreateEmployeeDto implements CreateEmployeeRequest {
  @Transform(trimString)
  @IsString()
  @IsNotEmpty()
  @Length(1, 50)
  employeeNumber!: string;

  @Transform(trimString)
  @IsString()
  @IsNotEmpty()
  @Length(1, 200)
  fullName!: string;

  @IsOptional()
  @Transform(trimString)
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  @IsDateString({ strict: true })
  hireDate?: string | null;
}
