import { IsBoolean } from 'class-validator';
import type { UpdateRoleStatusRequest } from '@sigip/shared';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateRoleStatusDto implements UpdateRoleStatusRequest {
  @IsBoolean()
  @ApiProperty({ example: true })
  isActive!: boolean;
}
