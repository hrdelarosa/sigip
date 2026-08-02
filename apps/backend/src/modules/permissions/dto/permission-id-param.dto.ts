import { IsUUID } from 'class-validator';

export class PermissionIdParamDto {
  @IsUUID()
  id!: string;
}
