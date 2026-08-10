import { IsBoolean } from 'class-validator';
import type { ChangeUserStatusRequest } from '@sigip/shared';
import { ApiProperty } from '@nestjs/swagger';

export class ChangeUserStatusDto implements ChangeUserStatusRequest {
  @IsBoolean()
  @ApiProperty({ example: true })
  isActive!: boolean;
}
