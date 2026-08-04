import { ArrayUnique, IsArray, IsUUID } from 'class-validator';
import type { ReplaceRolePermissionsRequest } from '@sigip/shared';

export class ReplaceRolePermissionsDto implements ReplaceRolePermissionsRequest {
  @IsArray()
  @ArrayUnique()
  @IsUUID(undefined, {
    each: true,
  })
  permissionIds!: string[];
}
