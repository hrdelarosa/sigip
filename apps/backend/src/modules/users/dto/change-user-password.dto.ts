import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import type { ChangeUserPasswordRequest } from '@sigip/shared';
import { ApiProperty } from '@nestjs/swagger';

export class ChangeUserPasswordDto implements ChangeUserPasswordRequest {
  @IsString()
  @ApiProperty({ minLength: 8, maxLength: 255, writeOnly: true })
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(255)
  password!: string;
}
