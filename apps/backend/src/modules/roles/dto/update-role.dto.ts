import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import type { UpdateRoleRequest } from '@sigip/shared';

export class UpdateRoleDto implements UpdateRoleRequest {
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(355)
  description?: string;
}
