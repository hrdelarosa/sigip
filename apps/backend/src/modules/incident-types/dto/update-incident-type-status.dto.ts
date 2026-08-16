import type { UpdateIncidentTypeStatusRequest } from '@sigip/shared';
import { IsBoolean } from 'class-validator';

export class UpdateIncidentTypeStatusDto implements UpdateIncidentTypeStatusRequest {
  @IsBoolean()
  isActive!: boolean;
}
