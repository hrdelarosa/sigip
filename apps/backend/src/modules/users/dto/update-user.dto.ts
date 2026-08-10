import {
  IsNotEmpty,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { Transform } from 'class-transformer';
import type { UpdateUserRequest } from '@sigip/shared';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto implements UpdateUserRequest {
  @ValidateIf((_object: unknown, value: unknown) => value !== undefined)
  @ApiPropertyOptional({ format: 'uuid' })
  @IsUUID()
  roleId?: string;

  @ValidateIf((_object: unknown, value: unknown) => value !== undefined)
  @ApiPropertyOptional({ minLength: 3, maxLength: 50 })
  @IsString()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @MinLength(3)
  @MaxLength(50)
  @Matches(/^[a-zA-Z0-9._-]+$/, {
    message:
      'username solo puede contener letras, números, puntos, guiones y guiones bajos',
  })
  username?: string;

  @ValidateIf((_object: unknown, value: unknown) => value !== undefined)
  @ApiPropertyOptional({ maxLength: 150 })
  @IsString()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(150)
  fullName?: string;
}
