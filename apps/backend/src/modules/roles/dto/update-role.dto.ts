import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import type { UpdateRoleRequest } from '@sigip/shared';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateRoleDto implements UpdateRoleRequest {
  @IsOptional()
  @ApiPropertyOptional({ minLength: 3, maxLength: 100 })
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @ApiPropertyOptional({ maxLength: 355, nullable: true })
  @IsString()
  @MaxLength(355)
  description?: string;
}
