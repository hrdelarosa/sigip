import type { DeleteDocumentRequest } from '@sigip/shared';
import { IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class DeleteDocumentDto implements DeleteDocumentRequest {
  @IsString()
  @MinLength(3)
  @MaxLength(500)
  @Matches(/\S/, { message: 'El motivo no puede contener solo espacios' })
  reason!: string;
}
