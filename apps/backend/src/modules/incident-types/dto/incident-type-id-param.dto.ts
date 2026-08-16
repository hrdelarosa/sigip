import { IsUUID } from 'class-validator';

export class IncidentTypeIdParamDto {
  @IsUUID()
  id!: string;
}
