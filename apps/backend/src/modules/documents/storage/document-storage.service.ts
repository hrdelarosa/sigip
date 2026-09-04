import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash } from 'node:crypto';
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import type { UploadedMemoryFile } from '../../../common/types/uploaded-memory-file.type';

@Injectable()
export class DocumentStorageService {
  private readonly client: S3Client;
  private readonly bucket: string;

  constructor(config: ConfigService) {
    this.bucket = config.getOrThrow<string>('storage.bucket');
    this.client = new S3Client({
      endpoint: config.getOrThrow<string>('storage.endpoint'),
      region: config.getOrThrow<string>('storage.region'),
      forcePathStyle: config.get<boolean>('storage.forcePathStyle') ?? true,
      credentials: {
        accessKeyId: config.getOrThrow<string>('storage.accessKeyId'),
        secretAccessKey: config.getOrThrow<string>('storage.secretAccessKey'),
      },
    });
  }

  async storeIncidentDocument(
    incidentId: string,
    documentId: string,
    file: UploadedMemoryFile,
  ) {
    const storedName = `${documentId}.pdf`;
    const storagePath = `incidents/${incidentId}/${storedName}`;
    const contentHash = createHash('sha256').update(file.buffer).digest('hex');

    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: storagePath,
        Body: file.buffer,
        ContentType: file.mimetype,
      }),
    );

    return { storedName, storagePath, contentHash };
  }

  async remove(storagePath: string): Promise<void> {
    await this.client.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: storagePath,
      }),
    );
  }

  async read(storagePath: string): Promise<Buffer> {
    const result = await this.client.send(
      new GetObjectCommand({
        Bucket: this.bucket,
        Key: storagePath,
      }),
    );

    if (!result.Body) {
      throw new Error('El documento no tiene contenido en el almacenamiento');
    }

    return Buffer.from(await result.Body.transformToByteArray());
  }
}
