import { z } from 'zod'

import { INCIDENT_TEMPORAL_MODES } from '@sigip/shared'
import {
  isOrdinaryVacation,
  MAX_VACATION_DAYS,
} from '../lib/vacation-date-range'

const calendarDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Seleccione una fecha válida')

const occurrenceSchema = z.object({
  startDate: calendarDate,
  endDate: z.union([calendarDate, z.literal(''), z.null()]).optional(),
})

export const incidentFormSchema = z
  .object({
    employeeId: z.string().uuid('Seleccione un empleado'),
    employeeAssignmentId: z.string().uuid('Seleccione una asignación'),
    incidentTypeId: z.string().uuid('Seleccione un tipo de incidencia'),
    incidentTypeCode: z.string(),
    temporalMode: z.enum(INCIDENT_TEMPORAL_MODES),
    assignmentEffectiveFrom: calendarDate,
    assignmentEffectiveTo: z.string().nullable(),
    issuedDate: z.string().nullable(),
    receivedAt: z
      .string()
      .min(1, 'Indique la fecha y hora de recepción')
      .refine((value) => !Number.isNaN(Date.parse(value)), 'Indique una fecha válida'),
    referenceYear: z.string().refine(
      (value) =>
        value === '' ||
        (/^\d{4}$/.test(value) && Number(value) >= 2000 && Number(value) <= 2100),
      'Indique un año entre 2000 y 2100',
    ),
    observations: z.string().max(5000, 'Máximo 5000 caracteres'),
    occurrences: z
      .array(occurrenceSchema)
      .min(1, 'Indique al menos una fecha')
      .max(366, 'No puede capturar más de 366 fechas'),
    file: z.custom<File | null>().nullable(),
    commissionAnnex: z.custom<File | null>().nullable(),
  })
  .superRefine((values, context) => {
    const occurrences = values.occurrences

    if (
      isOrdinaryVacation(values.incidentTypeCode) &&
      occurrences.length > MAX_VACATION_DAYS
    ) {
      context.addIssue({
        code: 'custom',
        path: ['occurrences'],
        message: `Solo puede capturar hasta ${MAX_VACATION_DAYS} días de vacaciones por periodo`,
      })
    }

    if (
      values.temporalMode === 'SINGLE_DATE' &&
      (occurrences.length !== 1 || Boolean(occurrences[0]?.endDate))
    ) {
      context.addIssue({
        code: 'custom',
        path: ['occurrences', 0, 'endDate'],
        message: 'Este tipo requiere una sola fecha',
      })
    }

    if (
      values.temporalMode === 'DATE_RANGE' &&
      (occurrences.length !== 1 || !occurrences[0]?.endDate)
    ) {
      context.addIssue({
        code: 'custom',
        path: ['occurrences', 0, 'endDate'],
        message: 'Este tipo requiere una fecha inicial y una fecha final',
      })
    }

    const normalized = occurrences
      .map((occurrence, index) => ({
        index,
        start: occurrence.startDate,
        end: occurrence.endDate || occurrence.startDate,
      }))
      .sort((left, right) => left.start.localeCompare(right.start))

    normalized.forEach((occurrence) => {
      if (occurrence.end < occurrence.start) {
        context.addIssue({
          code: 'custom',
          path: ['occurrences', occurrence.index, 'endDate'],
          message: 'La fecha final no puede ser anterior a la inicial',
        })
      }

      if (
        occurrence.start < values.assignmentEffectiveFrom ||
        (values.assignmentEffectiveTo &&
          occurrence.end > values.assignmentEffectiveTo)
      ) {
        context.addIssue({
          code: 'custom',
          path: ['occurrences', occurrence.index, 'startDate'],
          message: 'La fecha está fuera de la vigencia de la asignación',
        })
      }
    })

    for (let index = 1; index < normalized.length; index += 1) {
      if (normalized[index].start <= normalized[index - 1].end) {
        context.addIssue({
          code: 'custom',
          path: ['occurrences', normalized[index].index, 'startDate'],
          message: 'La fecha se repite o se superpone con otra ocurrencia',
        })
      }
    }
  })

export type IncidentFormValues = z.infer<typeof incidentFormSchema>

export const incidentFileSchema = z
  .custom<File>((value) =>
    typeof File !== 'undefined' ? value instanceof File : false,
  )
  .refine((file) => file?.type === 'application/pdf', 'El archivo debe ser PDF')
  .refine(
    (file) => (file?.size ?? Number.POSITIVE_INFINITY) <= 10 * 1024 * 1024,
    'El archivo no puede superar 10 MB',
  )

export const commissionAnnexSchema = z
  .custom<File>((value) =>
    typeof File !== 'undefined' ? value instanceof File : false,
  )
  .refine((file) => file?.type === 'application/pdf', 'El oficio debe ser PDF')
  .refine(
    (file) => (file?.size ?? Number.POSITIVE_INFINITY) <= 5 * 1024 * 1024,
    'El oficio no puede superar 5 MB',
  )

export const createIncidentFormSchema = incidentFormSchema.superRefine(
  (values, context) => {
    if (!values.file) {
      context.addIssue({
        code: 'custom',
        path: ['file'],
        message: 'Seleccione un archivo PDF',
      })
    } else {
      const fileResult = incidentFileSchema.safeParse(values.file)

      if (!fileResult.success) {
        context.addIssue({
          code: 'custom',
          path: ['file'],
          message:
            fileResult.error.issues[0]?.message ??
            'El archivo debe ser un PDF de hasta 10 MB',
        })
      }
    }

    if (values.commissionAnnex) {
      const annexResult = commissionAnnexSchema.safeParse(values.commissionAnnex)

      if (!annexResult.success) {
        context.addIssue({
          code: 'custom',
          path: ['commissionAnnex'],
          message:
            annexResult.error.issues[0]?.message ??
            'El oficio debe ser un PDF de hasta 5 MB',
        })
      }
    }
  },
)
