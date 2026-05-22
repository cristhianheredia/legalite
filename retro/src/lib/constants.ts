import type { Phase, Weight } from '@prisma/client'

export const PERSONS = ['cristhian', 'andres', 'sahian', 'sandra'] as const
export type Person = (typeof PERSONS)[number]

export const PERSON_LABELS: Record<Person, string> = {
  cristhian: 'Cristhian',
  andres: 'Andrés',
  sahian: 'Sahian',
  sandra: 'Sandra',
}

export const PERSON_INITIALS: Record<Person, string> = {
  cristhian: 'C',
  andres: 'A',
  sahian: 'S',
  sandra: 'Sa',
}

export const PHASE_LABELS: Record<Phase, string> = {
  PREP: 'Preparación',
  WARM: 'Calentamiento',
  CLOSE: 'Cierre y Urgencia',
  EXEC: 'Ejecución',
  POST: 'Post-Taller',
}

export const PHASE_ORDER: Phase[] = ['PREP', 'WARM', 'CLOSE', 'EXEC', 'POST']

export const WEIGHT_LABELS: Record<Weight, string> = {
  HIGH: 'Alta',
  MEDIUM: 'Media',
  LOW: 'Baja',
}

export const STATUS_LABELS = {
  DONE: 'Hecho',
  NOT_DONE: 'No hecho',
  NA: 'No aplica',
} as const
