import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import type { CreateRoleRequest } from '@sigip/shared';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateRoleDto implements CreateRoleRequest {
  @IsString()
  @ApiProperty({ example: 'ADMIN', minLength: 3, maxLength: 50 })
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(50)
  code!: string;

  @IsString()
  @ApiProperty({ example: 'Administrador', minLength: 3, maxLength: 100 })
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(100)
  name!: string;

  @IsOptional()
  @ApiPropertyOptional({ maxLength: 355, nullable: true })
  @IsString()
  @MaxLength(355)
  description?: string;
}
