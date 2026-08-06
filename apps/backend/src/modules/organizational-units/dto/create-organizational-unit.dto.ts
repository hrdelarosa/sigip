import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';
import { CreateOrganizationalUnitRequest } from '@sigip/shared';

export class CreateOrganizationalUnitDto implements CreateOrganizationalUnitRequest {
  @IsUUID()
  parentId!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(50)
  code!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(150)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(355)
  description?: string;

  @IsNumber()
  @IsNotEmpty()
  sortOrder?: number;
}
