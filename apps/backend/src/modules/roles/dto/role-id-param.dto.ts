import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RoleIdParamDto {
  @IsUUID()
  @ApiProperty({ format: 'uuid' })
  id!: string;
}
