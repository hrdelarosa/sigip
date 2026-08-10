import { UpdateEmployeeRequest } from '@sigip/shared';
import { Transform } from 'class-transformer';
import {
  IsDateString,
  IsNotEmpty,
  IsString,
  Length,
  Matches,
  ValidateIf,
} from 'class-validator';
import { trimString } from './employee-dto.transforms';

export class UpdateEmployeeDto implements UpdateEmployeeRequest {
  @ValidateIf((_object: unknown, value: unknown) => value !== undefined)
  @Transform(trimString)
  @IsString()
  @IsNotEmpty()
  @Length(1, 50)
  employeeNumber?: string;

  @ValidateIf((_object: unknown, value: unknown) => value !== undefined)
  @Transform(trimString)
  @IsString()
  @IsNotEmpty()
  @Length(1, 200)
  fullName?: string;

  @ValidateIf(
    (_object: unknown, value: unknown) => value !== undefined && value !== null,
  )
  @Transform(trimString)
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  @IsDateString({ strict: true })
  hireDate?: string | null;
}
