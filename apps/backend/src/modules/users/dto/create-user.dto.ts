import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Transform } from 'class-transformer';
import type { CreateUserRequest } from '@sigip/shared';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto implements CreateUserRequest {
  @IsUUID()
  @ApiProperty({ format: 'uuid' })
  roleId!: string;

  @IsOptional()
  @IsUUID()
  @ApiProperty({ format: 'uuid', required: false })
  officeId?: string;

  @IsString()
  @ApiProperty({ example: 'jdoe', minLength: 3, maxLength: 50 })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(50)
  @Matches(/^[a-zA-Z0-9._-]+$/, {
    message:
      'username solo puede contener letras, números, puntos, guiones y guiones bajos',
  })
  username!: string;

  @IsString()
  @ApiProperty({ example: 'Jane Doe', maxLength: 150 })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(150)
  fullName!: string;

  @IsString()
  @ApiProperty({ minLength: 8, maxLength: 255, writeOnly: true })
  @MinLength(8)
  @MaxLength(255)
  password!: string;
}
