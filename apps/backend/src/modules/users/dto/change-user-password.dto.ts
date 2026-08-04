import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import type { ChangeUserPasswordRequest } from '@sigip/shared';

export class ChangeUserPasswordDto implements ChangeUserPasswordRequest {
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(255)
  password!: string;
}
