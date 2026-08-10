import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UserIdParamDto {
  @IsUUID()
  @ApiProperty({ format: 'uuid' })
  id!: string;
}
