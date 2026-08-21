import { existsSync } from 'node:fs';
import { join } from 'node:path';

import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';

import type { IncidentsReportModel } from './models/incidents-report.model';

const PAGE_MARGIN = 42;
const FOOTER_MARGIN = 30;
const HEADER_IMAGE_FILE = 'institutional-header.jpeg';

type PdfWithOpenImage = PDFKit.PDFDocument & {
  openImage(src: string): { width: number; height: number };
};

function resolveHeaderImagePath(): string {
  const candidates = [
    join(__dirname, 'assets', HEADER_IMAGE_FILE),
    join(
      __dirname,
      '..',
      '..',
      '..',
      'modules',
      'reports',
      'assets',
      HEADER_IMAGE_FILE,
    ),
  ];

  return candidates.find((candidate) => existsSync(candidate)) ?? candidates[0];
}

const COLORS = {
  primary: '#12304D',
  primarySoft: '#1E4E7B',
  accent: '#0E7490',
  text: '#0F172A',
  muted: '#475569',
  light: '#F1F5F9',
  lighter: '#F8FAFC',
  border: '#CBD5E1',
  success: '#15803D',
  danger: '#B91C1C',
  white: '#FFFFFF',
};


@Injectable()
export class ReportsPdfService {
  async generate(report: IncidentsReportModel): Promise<Buffer> {
    const doc = new PDFDocument({
      size: 'LETTER',
      layout: 'portrait',
      margin: PAGE_MARGIN,
      bufferPages: true,
      info: {
        Title: 'Reporte de incidencias de personal',
        Author: 'Sistema de Gestión de Incidencias de Personal - INM Guerrero',
        Subject: report.period.label,
        Creator: 'SIGIP',
      },
    });

    const chunks: Buffer[] = [];

    doc.on('data', (chunk: Buffer) => chunks.push(chunk));

    const result = new Promise<Buffer>((resolve, reject) => {
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);
    });

    this.renderInstitutionalHeader(doc);
    this.renderRecipient(doc);
    this.renderTitle(doc, report);
    this.renderSummaryCards(doc, report);
    this.renderTypeSummary(doc, report);
    this.renderDetail(doc, report);
    this.renderPageNumbers(doc);

    doc.end();

    return result;
  }

  private renderInstitutionalHeader(doc: PDFKit.PDFDocument): void {
    const pageWidth = doc.page.width;
    const contentWidth = pageWidth - PAGE_MARGIN * 2;

    let headerBottom = 0;

    try {
      const headerImagePath = resolveHeaderImagePath();
      const image = (doc as PdfWithOpenImage).openImage(headerImagePath);
      const headerHeight = (contentWidth * image.height) / image.width;

      doc.image(headerImagePath, PAGE_MARGIN, 24, {
        width: contentWidth,
        height: headerHeight,
      });

      headerBottom = 24 + headerHeight;
    } catch {
      doc.rect(0, 0, pageWidth, 86).fill(COLORS.primary);

      doc
        .fillColor(COLORS.white)
        .font('Helvetica-Bold')
        .fontSize(15)
        .text('INSTITUTO NACIONAL DE MIGRACIÓN', 0, 24, {
          align: 'center',
          width: pageWidth,
        });

      doc.fontSize(10).text('OFICINA DE REPRESENTACIÓN EN GUERRERO', 0, 44, {
        align: 'center',
        width: pageWidth,
      });

      headerBottom = 86;
    }

    doc
      .moveTo(PAGE_MARGIN, headerBottom + 10)
      .lineTo(pageWidth - PAGE_MARGIN, headerBottom + 10)
      .strokeColor(COLORS.border)
      .lineWidth(0.75)
      .stroke();

    doc.y = headerBottom + 20;
  }

  private renderRecipient(doc: PDFKit.PDFDocument): void {
    doc
      .font('Helvetica')
      .fontSize(8)
      .fillColor(COLORS.muted)
      .text(`Acapulco de Juárez, Guerrero, a ${formatLongDate(new Date())}`, {
        align: 'right',
      });

    doc.moveDown(0.9);

    doc
      .font('Helvetica-Bold')
      .fontSize(9)
      .fillColor(COLORS.text)
      .text('MTRA. MINERVA NAVA GARCÍA')
      .text('TITULAR DE LA OFICINA DE REPRESENTACIÓN DEL INM EN GUERRERO');

    doc.font('Helvetica').text('P R E S E N T E');

    doc.moveDown(1.2);
  }

  private renderTitle(
    doc: PDFKit.PDFDocument,
    report: IncidentsReportModel,
  ): void {
    doc
      .font('Helvetica-Bold')
      .fontSize(13)
      .fillColor(COLORS.text)
      .text('REPORTE DE INCIDENCIAS DE PERSONAL', {
        align: 'center',
      });

    doc.moveDown(0.35);

    doc
      .fillColor(COLORS.primarySoft)
      .fontSize(9)
      .text(`Periodo: ${report.period.label}`, {
        align: 'center',
      });

    doc.moveDown(0.6);
  }

  private renderSummaryCards(
    doc: PDFKit.PDFDocument,
    report: IncidentsReportModel,
  ): void {
    const cards = [
      {
        label: 'Incidencias',
        value: report.summary.totalIncidents,
        color: COLORS.primarySoft,
      },
      {
        label: 'Trabajadores',
        value: report.summary.totalEmployees,
        color: COLORS.accent,
      },
      {
        label: 'Registradas',
        value: report.summary.registeredIncidents,
        color: COLORS.success,
      },
      {
        label: 'Canceladas',
        value: report.summary.cancelledIncidents,
        color: COLORS.danger,
      },
    ];

    const contentWidth = doc.page.width - PAGE_MARGIN * 2;
    const gap = 8;
    const cardWidth = (contentWidth - gap * (cards.length - 1)) / cards.length;
    const cardHeight = 44;
    const top = doc.y;

    cards.forEach((card, index) => {
      const x = PAGE_MARGIN + index * (cardWidth + gap);

      doc.roundedRect(x, top, cardWidth, cardHeight, 5).fill(COLORS.light);

      doc.rect(x, top, 4, cardHeight).fill(card.color);

      doc
        .fillColor(COLORS.muted)
        .font('Helvetica')
        .fontSize(7)
        .text(card.label, x + 12, top + 8, {
          width: cardWidth - 16,
          lineBreak: false,
        });

      doc
        .fillColor(COLORS.text)
        .font('Helvetica-Bold')
        .fontSize(15)
        .text(String(card.value), x + 12, top + 19, {
          width: cardWidth - 16,
          lineBreak: false,
        });
    });

    doc.y = top + cardHeight + 14;
  }

  private renderTypeSummary(
    doc: PDFKit.PDFDocument,
    report: IncidentsReportModel,
  ): void {
    if (report.summary.byType.length === 0) {
      return;
    }

    doc
      .font('Helvetica-Bold')
      .fontSize(10)
      .fillColor(COLORS.text)
      .text('Incidencias por tipo');

    doc.moveDown(0.4);

    const rows = report.summary.byType.map((item) => [
      { text: item.name },
      { text: String(item.count), align: 'center' as const },
    ]);

    doc.y = this.renderTable(
      doc,
      [
        { header: 'Tipo de incidencia', fraction: 0.85 },
        { header: 'Total', fraction: 0.15, align: 'center' },
      ],
      rows,
      { fontSize: 8 },
    );

    doc.moveDown(0.8);
  }

  private renderDetail(
    doc: PDFKit.PDFDocument,
    report: IncidentsReportModel,
  ): void {
    doc
      .font('Helvetica-Bold')
      .fontSize(10)
      .fillColor(COLORS.text)
      .text('Detalle de incidencias');

    doc.moveDown(0.4);

    if (report.items.length === 0) {
      doc
        .font('Helvetica')
        .fontSize(9)
        .fillColor(COLORS.muted)
        .text('No se encontraron incidencias para el periodo seleccionado.');

      return;
    }

    const rows = report.items.map((item, index) => [
      { text: String(index + 1), align: 'center' as const },
      { text: item.employee.employeeNumber },
      { text: item.employee.fullName },
      { text: item.organizationalUnit.name },
      { text: item.position.name },
      { text: item.incidentType.name },
      { text: formatOccurrences(item.occurrences) },
      {
        text: item.status === 'REGISTERED' ? 'Registrada' : 'Cancelada',
        align: 'center' as const,
        color: item.status === 'REGISTERED' ? COLORS.success : COLORS.danger,
      },
    ]);

    doc.y = this.renderTable(
      doc,
      [
        { header: 'No.', fraction: 0.04, align: 'center' },
        { header: 'No. empleado', fraction: 0.09 },
        { header: 'Nombre', fraction: 0.2 },
        { header: 'Unidad', fraction: 0.16 },
        { header: 'Puesto', fraction: 0.14 },
        { header: 'Tipo', fraction: 0.14 },
        { header: 'Fecha(s)', fraction: 0.17 },
        { header: 'Estado', fraction: 0.06, align: 'center' },
      ],
      rows,
      { fontSize: 7 },
    );
  }

  /**
   * Renderiza una tabla paginable sin depender de plugins externos de pdfkit.
   * Devuelve la coordenada Y final (parte inferior de la última fila dibujada).
   */
  private renderTable(
    doc: PDFKit.PDFDocument,
    columns: Array<{
      header: string;
      fraction: number;
      align?: 'left' | 'center' | 'right';
    }>,
    rows: Array<
      Array<{
        text: string;
        align?: 'left' | 'center' | 'right';
        color?: string;
      }>
    >,
    options: { fontSize?: number } = {},
  ): number {
    const fontSize = options.fontSize ?? 8;
    const headerFontSize = Math.min(fontSize + 1, 9);
    const padding = 4;

    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;
    const contentWidth = pageWidth - PAGE_MARGIN * 2;
    const tableLeft = PAGE_MARGIN;
    const bottomLimit = pageHeight - FOOTER_MARGIN;
    const maxRowHeight = pageHeight - PAGE_MARGIN - FOOTER_MARGIN;

    const widths = this.distributeWidths(
      columns.map((column) => column.fraction),
      contentWidth,
    );

    const drawHeader = () => {
      const rowHeight = this.measureRowHeight(
        doc,
        columns.map((column) => ({
          text: column.header,
          align: column.align,
        })),
        widths,
        headerFontSize,
        padding,
      );

      doc.rect(tableLeft, doc.y, contentWidth, rowHeight).fill(COLORS.primary);

      const rowTop = doc.y;

      columns.forEach((column, index) => {
        const cellX =
          tableLeft +
          widths.slice(0, index).reduce((sum, width) => sum + width, 0);

        this.drawCell(
          doc,
          { text: column.header, align: column.align, color: COLORS.white },
          cellX,
          rowTop,
          widths[index],
          rowHeight,
          headerFontSize,
          padding,
          'Helvetica-Bold',
        );
      });

      doc.y = rowTop + rowHeight;
    };

    drawHeader();

    rows.forEach((row, rowIndex) => {
      const rowHeight = this.measureRowHeight(
        doc,
        row,
        widths,
        fontSize,
        padding,
      );

      if (doc.y + rowHeight > bottomLimit) {
        doc.addPage();
        doc.y = PAGE_MARGIN;
        drawHeader();
      }

      if (rowHeight > maxRowHeight) {
        throw new Error('Una fila del reporte excede el alto imprimible.');
      }

      if (rowIndex % 2 === 1) {
        doc
          .rect(tableLeft, doc.y, contentWidth, rowHeight)
          .fill(COLORS.lighter);
      }

      const rowTop = doc.y;

      row.forEach((cell, columnIndex) => {
        const cellX =
          tableLeft +
          widths.slice(0, columnIndex).reduce((sum, width) => sum + width, 0);

        this.drawCell(
          doc,
          cell,
          cellX,
          rowTop,
          widths[columnIndex],
          rowHeight,
          fontSize,
          padding,
          'Helvetica',
        );
      });

      doc.y = rowTop + rowHeight;

      doc
        .moveTo(tableLeft, doc.y)
        .lineTo(tableLeft + contentWidth, doc.y)
        .strokeColor(COLORS.border)
        .lineWidth(0.25)
        .stroke();
    });

    return doc.y;
  }

  private measureRowHeight(
    doc: PDFKit.PDFDocument,
    cells: Array<{ text: string; align?: 'left' | 'center' | 'right' }>,
    widths: number[],
    fontSize: number,
    padding: number,
  ): number {
    doc.font('Helvetica').fontSize(fontSize);

    return cells.reduce(
      (maxHeight, cell, index) => {
        const innerWidth = Math.max(widths[index] - padding * 2, 10);
        const textHeight = doc.heightOfString(cell.text, {
          width: innerWidth,
          lineBreak: true,
        });

        return Math.max(maxHeight, textHeight + padding * 2);
      },
      fontSize + padding * 2,
    );
  }

  private drawCell(
    doc: PDFKit.PDFDocument,
    cell: { text: string; align?: 'left' | 'center' | 'right'; color?: string },
    x: number,
    y: number,
    width: number,
    rowHeight: number,
    fontSize: number,
    padding: number,
    font: 'Helvetica' | 'Helvetica-Bold',
  ): void {
    const innerWidth = Math.max(width - padding * 2, 10);

    doc.font(font).fontSize(fontSize);

    const textHeight = doc.heightOfString(cell.text, {
      width: innerWidth,
      lineBreak: true,
    });

    const textY = y + Math.max((rowHeight - textHeight) / 2, padding - 2);

    const align = cell.align ?? 'left';
    const textX =
      align === 'center'
        ? x + padding
        : align === 'right'
          ? x + width - innerWidth
          : x + padding;

    doc.fillColor(cell.color ?? COLORS.text).text(cell.text, textX, textY, {
      width: innerWidth,
      lineBreak: true,
      align,
    });
  }

  /**
   * Convierte fracciones relativas en anchos en puntos que suman exactamente
   * contentWidth, distribuyendo el residuo de redondeo.
   */
  private distributeWidths(fractions: number[], total: number): number[] {
    const rawWidths = fractions.map((fraction) => fraction * total);
    const widths = rawWidths.map((width) => Math.floor(width));

    let remainder = total - widths.reduce((sum, width) => sum + width, 0);

    let index = 0;
    while (remainder > 0) {
      widths[index % widths.length] += 1;
      remainder -= 1;
      index += 1;
    }

    return widths;
  }

  private renderPageNumbers(doc: PDFKit.PDFDocument): void {
    const range = doc.bufferedPageRange();

    for (
      let pageIndex = range.start;
      pageIndex < range.start + range.count;
      pageIndex++
    ) {
      doc.switchToPage(pageIndex);

      doc
        .font('Helvetica')
        .fontSize(7)
        .fillColor(COLORS.muted)
        .text(
          `SIGIP - INM Guerrero - Página ${pageIndex + 1} de ${range.count}`,
          PAGE_MARGIN,
          doc.page.height - 24,
          {
            width: doc.page.width - PAGE_MARGIN * 2,
            align: 'center',
            lineBreak: false,
          },
        );
    }
  }
}

function formatOccurrences(
  occurrences: Array<{
    startDate: Date;
    endDate: Date | null;
  }>,
): string {
  return occurrences
    .map((occurrence) => {
      if (
        !occurrence.endDate ||
        sameDate(occurrence.startDate, occurrence.endDate)
      ) {
        return formatShortDate(occurrence.startDate);
      }

      return `${formatShortDate(occurrence.startDate)} - ${formatShortDate(
        occurrence.endDate,
      )}`;
    })
    .join(', ');
}

function sameDate(a: Date, b: Date): boolean {
  return (
    a.getUTCFullYear() === b.getUTCFullYear() &&
    a.getUTCMonth() === b.getUTCMonth() &&
    a.getUTCDate() === b.getUTCDate()
  );
}

function formatShortDate(date: Date): string {
  return new Intl.DateTimeFormat('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}

function formatLongDate(date: Date): string {
  return new Intl.DateTimeFormat('es-MX', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'America/Mexico_City',
  }).format(date);
}
