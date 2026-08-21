import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash } from 'node:crypto';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, isAbsolute, relative, resolve } from 'node:path';
import type { UploadedMemoryFile } from '../../../common/types/uploaded-memory-file.type';

@Injectable()
export class DocumentStorageService {
  private readonly root: string;

  constructor(config: ConfigService) {
    this.root = resolve(process.cwd(), config.getOrThrow<string>('STORAGE_ROOT'));
  }

  async storeIncidentDocument(
    incidentId: string,
    documentId: string,
    file: UploadedMemoryFile,
  ) {
    const storedName = `${documentId}.pdf`;

    const relativePath = `incidents/${incidentId}/${storedName}`;

    const absolutePath = resolve(this.root, relativePath);

    await mkdir(dirname(absolutePath), {
      recursive: true,
    });

    await writeFile(absolutePath, file.buffer);

    const contentHash = createHash('sha256').update(file.buffer).digest('hex');

    return {
      storedName,
      storagePath: relativePath.replaceAll('\\', '/'),
      contentHash,
    };
  }

  async remove(storagePath: string): Promise<void> {
    const absolutePath = this.resolveStoragePath(storagePath);

    await rm(absolutePath, {
      force: true,
    });
  }

  async read(storagePath: string): Promise<Buffer> {
    return readFile(this.resolveStoragePath(storagePath));
  }

  private resolveStoragePath(storagePath: string): string {
    const absolutePath = resolve(this.root, storagePath);
    const relativePath = relative(this.root, absolutePath);

    if (relativePath.startsWith('..') || isAbsolute(relativePath)) {
      throw new Error('La ruta del documento está fuera del almacenamiento');
    }

    return absolutePath;
  }
}
