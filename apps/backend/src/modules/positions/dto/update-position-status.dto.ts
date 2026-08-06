import { IsBoolean } from 'class-validator';
import type { UpdatePositionStatusRequest } from '@sigip/shared';

export class UpdatePositionStatusDto implements UpdatePositionStatusRequest {
  @IsBoolean()
  isActive!: boolean;
}
