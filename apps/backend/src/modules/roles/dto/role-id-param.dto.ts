import { IsUUID } from 'class-validator';

export class RoleIdParamDto {
  @IsUUID()
  id!: string;
}
