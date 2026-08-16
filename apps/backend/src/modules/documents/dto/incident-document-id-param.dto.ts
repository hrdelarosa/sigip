import { IsUUID } from 'class-validator';

export class IncidentDocumentIdParamDto {
  @IsUUID()
  incidentId!: string;
}
