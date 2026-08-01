import { ArrayUnique, IsArray, IsUUID } from 'class-validator';

export class ReplaceRolePermissionsDto {
  @IsArray()
  @ArrayUnique()
  @IsUUID(undefined, {
    each: true,
  })
  permissionIds!: string[];
}
