import {
  IsNotEmpty,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Transform } from 'class-transformer';
import type { CreateUserRequest } from '@sigip/shared';

export class CreateUserDto implements CreateUserRequest {
  @IsUUID()
  roleId!: string;

  @IsString()
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
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(150)
  fullName!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(255)
  password!: string;
}
