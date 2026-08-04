import { IsBoolean } from 'class-validator';
import type { UpdateRoleStatusRequest } from '@sigip/shared';

export class UpdateRoleStatusDto implements UpdateRoleStatusRequest {
  @IsBoolean()
  isActive!: boolean;
}
