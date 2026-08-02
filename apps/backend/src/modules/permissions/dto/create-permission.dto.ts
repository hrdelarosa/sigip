import {
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreatePermissionDto {
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  @Matches(/^[a-z][a-z0-9-]*:[a-z][a-z0-9-]*$/, {
    message:
      'Code debe tener un formato como "modulo:accion", por ejemplo "users:create"',
  })
  code!: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;
}
