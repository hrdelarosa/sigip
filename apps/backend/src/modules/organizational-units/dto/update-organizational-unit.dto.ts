import { UpdateOrganizationalUnitRequest } from '@sigip/shared';
import {
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdateOrganizationalUnitDto implements UpdateOrganizationalUnitRequest {
  @IsOptional()
  @IsUUID()
  parentId?: string;

  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(150)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(355)
  description?: string;

  @IsOptional()
  @IsNumber()
  sortOrder?: number;
}
