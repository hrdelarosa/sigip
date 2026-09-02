import { inflateSync } from 'node:zlib';

import { ReportsPdfService } from './reports-pdf.service';
import type { IncidentsReportModel } from './models/incidents-report.model';

describe('ReportsPdfService', () => {
  const service = new ReportsPdfService();

  const report: IncidentsReportModel = {
    period: {
      type: 'MONTH',
      startDate: new Date('2026-08-01T00:00:00.000Z'),
      endDate: new Date('2026-08-31T00:00:00.000Z'),
      label: 'Agosto de 2026',
    },
    summary: {
      totalIncidents: 2,
      totalEmployees: 2,
      registeredIncidents: 1,
      cancelledIncidents: 1,
      averageIncidentsPerEmployee: 1,
      byType: [
        {
          incidentTypeId: 'type-1',
          code: 'PERMISO',
          name: 'Permiso económico',
          count: 1,
          percentage: 50,
        },
        {
          incidentTypeId: 'type-2',
          code: 'COMISION',
          name: 'Comisión',
          count: 1,
          percentage: 50,
        },
      ],
      byOrganizationalUnit: [
        {
          organizationalUnitId: 'unit-1',
          name: 'Unidad Jurídica',
          count: 1,
          percentage: 50,
        },
        {
          organizationalUnitId: 'unit-2',
          name: 'Departamento de RH',
          count: 1,
          percentage: 50,
        },
      ],
    },
    items: [
      {
        incidentId: 'incident-1',
        employee: {
          id: 'employee-1',
          employeeNumber: 'EMP001',
          fullName: 'María García López',
        },
        organizationalUnit: { id: 'unit-1', name: 'Unidad Jurídica' },
        position: { id: 'position-1', name: 'Analista' },
        incidentType: { id: 'type-1', code: 'PERMISO', name: 'Permiso' },
        occurrences: [
          { startDate: new Date('2026-08-05T00:00:00.000Z'), endDate: null },
        ],
        issuedDate: new Date('2026-08-01T00:00:00.000Z'),
        receivedAt: new Date('2026-08-01T12:00:00.000Z'),
        status: 'REGISTERED',
        observations: 'Permiso personal',
      },
      {
        incidentId: 'incident-2',
        employee: {
          id: 'employee-2',
          employeeNumber: 'EMP002',
          fullName: 'Juan Pérez Ramírez',
        },
        organizationalUnit: { id: 'unit-2', name: 'Departamento de RH' },
        position: { id: 'position-2', name: 'Coordinador' },
        incidentType: { id: 'type-2', code: 'COMISION', name: 'Comisión' },
        occurrences: [
          {
            startDate: new Date('2026-08-10T00:00:00.000Z'),
            endDate: new Date('2026-08-14T00:00:00.000Z'),
          },
        ],
        issuedDate: new Date('2026-08-05T00:00:00.000Z'),
        receivedAt: new Date('2026-08-05T12:00:00.000Z'),
        status: 'CANCELLED',
        observations: 'Comisión cancelada',
      },
    ],
  };

  it('generates a valid PDF buffer for a populated report', async () => {
    const pdf = await service.generate(report);

    expect(Buffer.isBuffer(pdf)).toBe(true);
    expect(pdf.length).toBeGreaterThan(1000);
    expect(pdf.subarray(0, 5).toString()).toBe('%PDF-');
  });

  it('generates a PDF when there are no incidents in the period', async () => {
    const emptyReport: IncidentsReportModel = {
      ...report,
      summary: {
        totalIncidents: 0,
        totalEmployees: 0,
        registeredIncidents: 0,
        cancelledIncidents: 0,
        averageIncidentsPerEmployee: 0,
        byType: [],
        byOrganizationalUnit: [],
      },
      items: [],
    };

    const pdf = await service.generate(emptyReport);

    expect(Buffer.isBuffer(pdf)).toBe(true);
    expect(pdf.subarray(0, 5).toString()).toBe('%PDF-');
  });

  it('renders missing assignment details as No asignado', async () => {
    const assignmentlessReport: IncidentsReportModel = {
      ...report,
      items: [
        {
          ...report.items[0],
          organizationalUnit: null,
          position: null,
        },
      ],
    };

    const pdf = await service.generate(assignmentlessReport);
    const text = extractTextOps(pdf.toString('latin1'))
      .map((operation) => operation.text)
      .join(' ');

    expect(text.match(/No asignado/g)).toHaveLength(2);
  });

  it('uses the institutional portrait letter format', async () => {
    const pdf = await service.generate(report);

    const mediaBoxes = [
      ...pdf.toString('latin1').matchAll(/\/MediaBox\s*\[([^\]]+)\]/g),
    ].map((match) => match[1].trim());

    expect(mediaBoxes).toContain('0 0 612 792');
  });

  it('uses sober institutional section labels and omits system branding', async () => {
    const pdf = await service.generate(report);
    const text = extractTextOps(pdf.toString('latin1'))
      .map((operation) => operation.text)
      .join(' ');

    expect(text).toContain('RESUMEN GENERAL');
    expect(text).toContain('DISTRIBUCIÓN POR TIPO');
    expect(text).toMatch(/DETALLE DE\s+INCIDENCIAS/);
    expect(text).not.toContain('SIGIP - INM Guerrero');
  });

  it('draws every cell of a detail row at the same height (no cascade)', async () => {
    const pdf = await service.generate(report);
    const latin = pdf.toString('latin1');

    const ops = extractTextOps(latin);
    const anchors = ops.filter(({ text }) => /^EMP/i.test(text));

    expect(anchors.length).toBeGreaterThan(0);

    for (const anchor of anchors) {
      const rowOps = ops.filter(
        ({ y, text }) => Math.abs(y - anchor.y) <= 40 && text !== anchor.text,
      );

      expect(
        rowOps.some(
          ({ text }) => text.startsWith('Registr') || text.startsWith('Cancel'),
        ),
      ).toBe(true);
    }
  });
});

interface PdfTextOp {
  x: number;
  y: number;
  text: string;
}

function extractTextOps(latin: string): PdfTextOp[] {
  const ops: PdfTextOp[] = [];

  const streamPattern = /stream\r?\n([\s\S]*?)\r?\nendstream/g;
  let streamMatch: RegExpExecArray | null;

  while ((streamMatch = streamPattern.exec(latin)) !== null) {
    let content: Buffer;

    try {
      content = inflateSync(Buffer.from(streamMatch[1], 'latin1'));
    } catch {
      continue;
    }

    const text = content.toString('latin1');
    const blockPattern = /BT\s*([\s\S]*?)\s*ET/g;
    let blockMatch: RegExpExecArray | null;

    while ((blockMatch = blockPattern.exec(text)) !== null) {
      const block = blockMatch[1];
      const positionMatch = block.match(/1 0 0 1 ([\d.]+) ([\d.]+) Tm/);
      const textMatch = block.match(/\[([^\]]+)\]\s*TJ/);

      if (!positionMatch || !textMatch) {
        continue;
      }

      ops.push({
        x: +positionMatch[1],
        y: +positionMatch[2],
        text: decodeHexText(textMatch[1]),
      });
    }
  }

  return ops;
}

function decodeHexText(tjContent: string): string {
  let decoded = '';

  for (const part of tjContent.split('>')) {
    const hexMatch = part.match(/<([0-9A-Fa-f]+)/);

    if (!hexMatch) {
      continue;
    }

    for (let index = 0; index < hexMatch[1].length; index += 2) {
      const code = parseInt(hexMatch[1].slice(index, index + 2), 16);
      decoded += String.fromCharCode(code);
    }
  }

  return decoded;
}
