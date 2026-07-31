import {
  IsNotEmpty,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsUUID()
  roleId!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(25)
  @Matches(/^[a-zA-Z0-9._-]+$/, {
    message:
      'username solo puede contener letras, números, puntos, guiones y guiones bajos',
  })
  username!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  fullName!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(100)
  password!: string;
}
