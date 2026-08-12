import { IsUUID } from 'class-validator';

export class SessionIdParamDto {
  @IsUUID('7')
  id!: string;
}
