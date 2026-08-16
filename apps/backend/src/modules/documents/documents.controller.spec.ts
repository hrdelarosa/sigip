import { Test } from '@nestjs/testing';
import type { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';

import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';

describe('DocumentsController', () => {
  let app: NestExpressApplication;
  const service = {
    getContent: jest.fn().mockResolvedValue({
      buffer: Buffer.from('%PDF'),
      document: {
        originalName: 'Formato de José (RH) 100%*.pdf',
        mimeType: 'application/pdf',
      },
    }),
    uploadCommissionAnnex: jest.fn().mockResolvedValue({
      id: 'document-id',
      incidentId: 'incident-id',
      documentType: {
        id: 'document-type-id',
        code: 'OFICIO_COMISION',
        name: 'Oficio de comisión',
        description: null,
        isActive: true,
      },
      originalName: 'oficio.pdf',
      storedName: 'document-id.pdf',
      storagePath: 'incidents/incident-id/document-id.pdf',
      mimeType: 'application/pdf',
      sizeBytes: 4,
      contentHash: 'hash',
      uploadedBy: 'user-id',
      createdAt: new Date('2026-08-14T12:00:00.000Z'),
      deletedAt: null,
      deletedBy: null,
      deletionReason: null,
    }),
  };

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      controllers: [DocumentsController],
      providers: [
        {
          provide: DocumentsService,
          useValue: service,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication<NestExpressApplication>();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('returns an RFC 8187 filename with a safe ASCII fallback', async () => {
    const response = await request(app.getHttpServer())
      .get('/documents/document-id')
      .expect(200);

    expect(response.headers['content-disposition']).toBe(
      'attachment; filename="Formato de Jose (RH) 100%*.pdf"; ' +
        "filename*=UTF-8''Formato%20de%20Jos%C3%A9%20%28RH%29%20100%25%2A.pdf",
    );
  });

  it('accepts a commission annex upload and decodes the filename as UTF-8', async () => {
    const uploadCommissionAnnex = service.uploadCommissionAnnex as jest.Mock<
      Promise<object>,
      [string, { originalname: string }, unknown]
    >;
    uploadCommissionAnnex.mockClear();

    const response = await request(app.getHttpServer())
      .post('/incidents/incident-id/documents')
      .attach('file', Buffer.from('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n'), {
        filename: 'Oficio de comisión.pdf',
        contentType: 'application/pdf',
      });

    expect(response.status).toBe(201);
    expect(uploadCommissionAnnex).toHaveBeenCalledTimes(1);
    const receivedFile = uploadCommissionAnnex.mock.calls[0]?.[1];
    expect(receivedFile?.originalname).toBe('Oficio de comisión.pdf');
  });
});
