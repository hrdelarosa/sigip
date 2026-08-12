import { IsUUID } from 'class-validator';

export class UserSessionsParamDto {
  @IsUUID('7')
  userId!: string;
}
