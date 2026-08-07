import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { Transform } from 'class-transformer';
import type { CreateOrganizationalUnitRequest } from '@sigip/shared';

export class CreateOrganizationalUnitDto implements CreateOrganizationalUnitRequest {
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @ValidateIf((_object: unknown, value: unknown) => value !== null)
  @IsUUID()
  parentId!: string | null;

  @IsString()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toUpperCase() : value,
  )
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(50)
  code!: string;

  @IsString()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(150)
  name!: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @MaxLength(355)
  description?: string | null;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(1_000_000)
  sortOrder?: number;
}
