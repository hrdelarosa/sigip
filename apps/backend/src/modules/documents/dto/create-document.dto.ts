import { IsUUID } from 'class-validator';

export class CreateIncidentDocumentDto {
  @IsUUID()
  documentTypeId!: string;
}
