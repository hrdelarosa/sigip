import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import type { CreateRoleRequest } from '@sigip/shared';

export class CreateRoleDto implements CreateRoleRequest {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(50)
  code!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(100)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(355)
  description?: string;
}
