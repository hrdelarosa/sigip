import { ArrayUnique, IsArray, IsUUID } from 'class-validator';
import type { ReplaceRolePermissionsRequest } from '@sigip/shared';
import { ApiProperty } from '@nestjs/swagger';

export class ReplaceRolePermissionsDto implements ReplaceRolePermissionsRequest {
  @IsArray()
  @ApiProperty({ type: String, isArray: true, format: 'uuid' })
  @ArrayUnique()
  @IsUUID(undefined, {
    each: true,
  })
  permissionIds!: string[];
}
