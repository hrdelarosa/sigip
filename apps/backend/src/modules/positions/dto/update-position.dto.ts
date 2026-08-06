import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { UpdatePositionRequest } from '@sigip/shared';

export class UpdatePositionDto implements UpdatePositionRequest {
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(355)
  description?: string;
}
