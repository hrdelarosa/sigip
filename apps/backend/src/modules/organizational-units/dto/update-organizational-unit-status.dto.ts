import { IsBoolean } from 'class-validator';
import type { UpdateOrganizationalUnitStatusRequest } from '@sigip/shared';

export class UpdateOrganizationalUnitStatusDto implements UpdateOrganizationalUnitStatusRequest {
  @IsBoolean()
  isActive!: boolean;
}
