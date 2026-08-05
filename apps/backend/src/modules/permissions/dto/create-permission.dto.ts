import {
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Transform } from 'class-transformer';
import type { CreatePermissionRequest } from '@sigip/shared';

export class CreatePermissionDto implements CreatePermissionRequest {
  @IsString()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @MinLength(3)
  @MaxLength(100)
  @Matches(/^[a-z][a-z0-9-]*:[a-z][a-z0-9-]*$/, {
    message:
      'El código debe tener un formato como "modulo:accion", por ejemplo "users:create"',
  })
  code!: string;

  @IsString()
  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @MaxLength(500)
  description?: string | null;
}
