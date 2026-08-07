import { IsUUID } from 'class-validator';

export class PositionIdParamDto {
  @IsUUID()
  id!: string;
}
