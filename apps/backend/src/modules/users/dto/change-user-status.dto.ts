import { IsBoolean } from 'class-validator';
import type { ChangeUserStatusRequest } from '@sigip/shared';

export class ChangeUserStatusDto implements ChangeUserStatusRequest {
  @IsBoolean()
  isActive!: boolean;
}
