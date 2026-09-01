import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class OfficeIdParamDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  id!: string;
}
