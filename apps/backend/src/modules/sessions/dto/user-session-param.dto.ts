import { IsUUID } from 'class-validator';

export class UserSessionParamDto {
  @IsUUID('7')
  userId!: string;

  @IsUUID('7')
  id!: string;
}
