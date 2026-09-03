import { ConfigService } from '@nestjs/config';
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { DocumentStorageService } from './document-storage.service';

describe('DocumentStorageService', () => {
  const send = jest.spyOn(S3Client.prototype, 'send');
  const file = {
    buffer: Buffer.from('%PDF-1.7 test'),
    fieldname: 'file',
    originalname: 'formato.pdf',
    encoding: '7bit',
    mimetype: 'application/pdf',
    size: 13,
  };

  let service: DocumentStorageService;

  beforeEach(() => {
    send.mockReset();
    service = new DocumentStorageService(
      new ConfigService({
        storage: {
          endpoint: 'http://localhost:3900',
          region: 'garage',
          accessKeyId: 'access-key',
          secretAccessKey: 'secret-key',
          bucket: 'sigip-test',
          forcePathStyle: true,
        },
      }),
    );
  });

  afterAll(() => {
    send.mockRestore();
  });

  it('stores a PDF in the incident prefix and returns its metadata', async () => {
    send.mockResolvedValueOnce({} as never);

    const result = await service.storeIncidentDocument(
      'incident-id',
      'document-id',
      file,
    );

    expect(send).toHaveBeenCalledTimes(1);
    const command = send.mock.calls[0][0];
    expect(command).toBeInstanceOf(PutObjectCommand);
    expect((command as PutObjectCommand).input).toEqual({
      Bucket: 'sigip-test',
      Key: 'incidents/incident-id/document-id.pdf',
      Body: file.buffer,
      ContentType: 'application/pdf',
    });
    expect(result).toEqual({
      storedName: 'document-id.pdf',
      storagePath: 'incidents/incident-id/document-id.pdf',
      contentHash:
        'eddc31937fbdaf708e866af0d20b9fb8c79dd001881c8a11e4c617f2882e779f',
    });
  });

  it('propagates an upload error', async () => {
    const error = new Error('Garage unavailable');
    send.mockRejectedValueOnce(error as never);

    await expect(
      service.storeIncidentDocument('incident-id', 'document-id', file),
    ).rejects.toBe(error);
  });

  it('reads the complete object body as a buffer', async () => {
    const contents = Uint8Array.from([0, 1, 2, 255]);
    const transformToByteArray = jest.fn().mockResolvedValue(contents);
    send.mockResolvedValueOnce({ Body: { transformToByteArray } } as never);

    const result = await service.read('incidents/incident-id/document-id.pdf');

    const command = send.mock.calls[0][0];
    expect(command).toBeInstanceOf(GetObjectCommand);
    expect((command as GetObjectCommand).input).toEqual({
      Bucket: 'sigip-test',
      Key: 'incidents/incident-id/document-id.pdf',
    });
    expect(transformToByteArray).toHaveBeenCalledTimes(1);
    expect(result).toEqual(Buffer.from(contents));
  });

  it('rejects an object response without a body', async () => {
    send.mockResolvedValueOnce({} as never);

    await expect(
      service.read('incidents/incident-id/document-id.pdf'),
    ).rejects.toThrow('El documento no tiene contenido en el almacenamiento');
  });

  it('removes the object from the configured bucket', async () => {
    send.mockResolvedValueOnce({} as never);

    await service.remove('incidents/incident-id/document-id.pdf');

    const command = send.mock.calls[0][0];
    expect(command).toBeInstanceOf(DeleteObjectCommand);
    expect((command as DeleteObjectCommand).input).toEqual({
      Bucket: 'sigip-test',
      Key: 'incidents/incident-id/document-id.pdf',
    });
  });
});
