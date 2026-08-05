import { IsOptional, IsString, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';
import type { UpdatePermissionRequest } from '@sigip/shared';

export class UpdatePermissionDto implements UpdatePermissionRequest {
  @IsOptional()
  @IsString()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @MaxLength(500)
  description?: string | null;
}
