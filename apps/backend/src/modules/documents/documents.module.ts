import { Module } from '@nestjs/common';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';
import { DocumentsRepository } from './repositories/documents.repository';
import { DrizzleDocumentsRepository } from './repositories/drizzle-documents.repository';
import { DocumentStorageService } from './storage/document-storage.service';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [AuditModule],
  controllers: [DocumentsController],

  providers: [
    DocumentsService,
    DocumentStorageService,

    {
      provide: DocumentsRepository,

      useClass: DrizzleDocumentsRepository,
    },
  ],

  exports: [DocumentsService, DocumentStorageService, DocumentsRepository],
})
export class DocumentsModule {}
