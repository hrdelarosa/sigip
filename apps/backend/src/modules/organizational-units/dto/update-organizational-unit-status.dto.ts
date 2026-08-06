import { IsBoolean } from 'class-validator';
import { UpdateOrganizationalUnitStatusRequest } from '@sigip/shared';

export class UpdateOrganizationalUnitStatusDto implements UpdateOrganizationalUnitStatusRequest {
  @IsBoolean()
  isActive!: boolean;
}
