import { IsUUID } from 'class-validator';

export class IncidentIdParamDto {
  @IsUUID()
  id!: string;
}
