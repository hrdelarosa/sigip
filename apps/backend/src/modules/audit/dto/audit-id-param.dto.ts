import { IsUUID } from 'class-validator';

export class AuditIdParamDto {
  @IsUUID()
  id!: string;
}
