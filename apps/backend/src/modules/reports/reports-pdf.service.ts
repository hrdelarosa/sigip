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
  text: '#171717',
  muted: '#525252',
  light: '#F2F2F2',
  border: '#A3A3A3',
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
    this.renderAppliedFilters(doc, report);
    this.renderSummary(doc, report);
    this.renderTypeSummary(doc, report);
    this.renderUnitSummary(doc, report);
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
      doc
        .fillColor(COLORS.text)
        .font('Helvetica-Bold')
        .fontSize(14)
        .text('SECRETARÍA DE GOBERNACIÓN', PAGE_MARGIN, 30, {
          width: contentWidth,
        });

      doc
        .fontSize(11)
        .text('INSTITUTO NACIONAL DE MIGRACIÓN', PAGE_MARGIN, 49, {
          width: contentWidth,
        });

      doc
        .font('Helvetica')
        .fontSize(8)
        .text('OFICINA DE REPRESENTACIÓN EN GUERRERO', PAGE_MARGIN, 66, {
          width: contentWidth,
        });

      headerBottom = 86;
    }

    doc
      .moveTo(PAGE_MARGIN, headerBottom + 10)
      .lineTo(pageWidth - PAGE_MARGIN, headerBottom + 10)
      .strokeColor(COLORS.text)
      .lineWidth(0.5)
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
      .fillColor(COLORS.muted)
      .font('Helvetica')
      .fontSize(9)
      .text(`PERIODO: ${report.period.label.toUpperCase()}`, {
        align: 'center',
      });

    doc.moveDown(0.6);
  }

  private renderSummary(
    doc: PDFKit.PDFDocument,
    report: IncidentsReportModel,
  ): void {
    const metrics = [
      {
        label: 'INCIDENCIAS',
        value: report.summary.totalIncidents,
      },
      {
        label: 'PERSONAS SERVIDORAS PÚBLICAS',
        value: report.summary.totalEmployees,
      },
      {
        label: 'PROMEDIO POR PERSONA',
        value: report.summary.averageIncidentsPerEmployee.toFixed(1),
      },
    ];

    this.renderSectionHeading(doc, 'RESUMEN GENERAL');

    const contentWidth = doc.page.width - PAGE_MARGIN * 2;
    const columnWidth = contentWidth / metrics.length;
    const blockHeight = 40;
    const top = doc.y;

    doc
      .moveTo(PAGE_MARGIN, top)
      .lineTo(PAGE_MARGIN + contentWidth, top)
      .moveTo(PAGE_MARGIN, top + blockHeight)
      .lineTo(PAGE_MARGIN + contentWidth, top + blockHeight)
      .strokeColor(COLORS.border)
      .lineWidth(0.5)
      .stroke();

    metrics.forEach((metric, index) => {
      const x = PAGE_MARGIN + index * columnWidth;

      if (index > 0) {
        doc
          .moveTo(x, top + 6)
          .lineTo(x, top + blockHeight - 6)
          .strokeColor(COLORS.border)
          .lineWidth(0.35)
          .stroke();
      }

      doc
        .fillColor(COLORS.muted)
        .font('Helvetica-Bold')
        .fontSize(6.5)
        .text(metric.label, x + 6, top + 8, {
          width: columnWidth - 12,
          align: 'center',
          lineBreak: false,
        });

      doc
        .fillColor(COLORS.text)
        .font('Helvetica-Bold')
        .fontSize(13)
        .text(String(metric.value), x + 6, top + 20, {
          width: columnWidth - 12,
          align: 'center',
          lineBreak: false,
        });
    });

    doc.y = top + blockHeight + 14;
  }

  private renderAppliedFilters(
    doc: PDFKit.PDFDocument,
    report: IncidentsReportModel,
  ): void {
    const filters = report.filters;
    if (!filters) return;

    const labels: string[] = [];
    if (filters.incidentTypeId) {
      const item = report.items.find(
        (candidate) => candidate.incidentType.id === filters.incidentTypeId,
      );
      labels.push(
        `Tipo de incidencia: ${item?.incidentType.name ?? 'Aplicado'}`,
      );
    }
    if (filters.organizationalUnitId) {
      const item = report.items.find(
        (candidate) =>
          candidate.organizationalUnit?.id === filters.organizationalUnitId,
      );
      labels.push(
        `Unidad organizacional: ${item?.organizationalUnit?.name ?? 'Aplicado'}`,
      );
    }
    if (filters.includeCancelled) labels.push('Incluye canceladas: Sí');

    if (labels.length === 0) return;

    doc
      .font('Helvetica')
      .fontSize(7.5)
      .fillColor(COLORS.muted)
      .text(`FILTROS APLICADOS: ${labels.join('  |  ')}`);
    doc.moveDown(0.7);
  }

  private renderTypeSummary(
    doc: PDFKit.PDFDocument,
    report: IncidentsReportModel,
  ): void {
    if (report.summary.byType.length === 0) {
      return;
    }

    this.renderSectionHeading(doc, 'DISTRIBUCIÓN POR TIPO');

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

  private renderUnitSummary(
    doc: PDFKit.PDFDocument,
    report: IncidentsReportModel,
  ): void {
    if (report.summary.byOrganizationalUnit.length === 0) return;

    this.renderSectionHeading(doc, 'DISTRIBUCIÓN POR UNIDAD ORGANIZACIONAL');
    const rows = report.summary.byOrganizationalUnit.map((item) => [
      { text: item.name },
      { text: String(item.count), align: 'center' as const },
    ]);
    doc.y = this.renderTable(
      doc,
      [
        { header: 'Unidad organizacional', fraction: 0.85 },
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
    this.renderSectionHeading(doc, 'DETALLE DE INCIDENCIAS');

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
      { text: item.organizationalUnit?.name ?? 'No asignado' },
      { text: item.position?.name ?? 'No asignado' },
      { text: item.incidentType.name },
      { text: formatOccurrences(item.occurrences) },
      {
        text: item.status === 'REGISTERED' ? 'Registrada' : 'Cancelada',
        align: 'center' as const,
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

  private renderSectionHeading(doc: PDFKit.PDFDocument, title: string): void {
    if (doc.y + 48 > doc.page.height - FOOTER_MARGIN) {
      doc.addPage();
      doc.y = PAGE_MARGIN;
    }

    doc.font('Helvetica-Bold').fontSize(9).fillColor(COLORS.text).text(title);

    const lineY = doc.y + 3;
    doc
      .moveTo(PAGE_MARGIN, lineY)
      .lineTo(doc.page.width - PAGE_MARGIN, lineY)
      .strokeColor(COLORS.text)
      .lineWidth(0.5)
      .stroke();

    doc.y = lineY + 7;
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

      const rowTop = doc.y;

      doc
        .rect(tableLeft, rowTop, contentWidth, rowHeight)
        .fillAndStroke(COLORS.light, COLORS.border);

      columns.forEach((column, index) => {
        const cellX =
          tableLeft +
          widths.slice(0, index).reduce((sum, width) => sum + width, 0);

        this.drawCell(
          doc,
          { text: column.header, align: column.align, color: COLORS.text },
          cellX,
          rowTop,
          widths[index],
          rowHeight,
          headerFontSize,
          padding,
          'Helvetica-Bold',
        );
      });

      this.drawColumnLines(doc, tableLeft, rowTop, rowHeight, widths);

      doc.y = rowTop + rowHeight;
    };

    drawHeader();

    rows.forEach((row) => {
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
        .rect(tableLeft, rowTop, contentWidth, rowHeight)
        .strokeColor(COLORS.border)
        .lineWidth(0.25)
        .stroke();

      this.drawColumnLines(doc, tableLeft, rowTop, rowHeight, widths);
    });

    return doc.y;
  }

  private drawColumnLines(
    doc: PDFKit.PDFDocument,
    tableLeft: number,
    rowTop: number,
    rowHeight: number,
    widths: number[],
  ): void {
    let x = tableLeft;

    widths.slice(0, -1).forEach((width) => {
      x += width;
      doc
        .moveTo(x, rowTop)
        .lineTo(x, rowTop + rowHeight)
        .strokeColor(COLORS.border)
        .lineWidth(0.25)
        .stroke();
    });
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

      const footerY = doc.page.height - 28;
      doc
        .moveTo(PAGE_MARGIN, footerY - 5)
        .lineTo(doc.page.width - PAGE_MARGIN, footerY - 5)
        .strokeColor(COLORS.border)
        .lineWidth(0.35)
        .stroke();

      doc
        .font('Helvetica')
        .fontSize(7)
        .fillColor(COLORS.muted)
        .text(
          `Instituto Nacional de Migración  |  Oficina de Representación en Guerrero  |  Página ${pageIndex + 1} de ${range.count}`,
          PAGE_MARGIN,
          footerY,
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
