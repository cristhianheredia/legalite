import type { RetroItem, Task, Phase } from '@prisma/client'
import { executionScore, effectivenessScore } from './scoring'

type ItemWithTask = RetroItem & { task: Task }

function phaseItems(items: ItemWithTask[], phase: Phase) {
  return items.filter((i) => i.task.phase === phase)
}

function taskNotDone(items: ItemWithTask[], titleFragment: string): boolean {
  return items.some(
    (i) => i.task.title.toLowerCase().includes(titleFragment.toLowerCase()) && i.status === 'NOT_DONE',
  )
}

export function generateRecommendations(items: ItemWithTask[]): string[] {
  const recs: string[] = []

  // Regla 1: Fase Cierre con ejecución < 60%
  const closeItems = phaseItems(items, 'CLOSE')
  if (closeItems.length > 0 && executionScore(closeItems) < 60) {
    recs.push(
      'Reforzar el protocolo de urgencia de la última semana. Revisar si los mensajes de Kommo están activos con al menos 7 días de anticipación.',
    )
  }

  // Regla 2: Email último llamado no ejecutado
  if (taskNotDone(items, 'último llamado') || taskNotDone(items, 'ultima llamada')) {
    recs.push(
      'Activar recordatorio en Brevo 3 días antes del taller para no omitir el email de cierre.',
    )
  }

  // Regla 3: Efectividad de Ads < 3
  const adsItems = items.filter(
    (i) => i.task.owners.includes('sandra') && i.task.phase === 'PREP',
  )
  if (adsItems.length > 0 && effectivenessScore(adsItems) < 3 && effectivenessScore(adsItems) > 0) {
    recs.push(
      'Evaluar creativos con Sandra antes del siguiente ciclo. Considerar split test de copy.',
    )
  }

  // Regla 4: Post-Taller ejecución < 70%
  const postItems = phaseItems(items, 'POST')
  if (postItems.length > 0 && executionScore(postItems) < 70) {
    recs.push(
      'El post-taller es la ventana más rentable para L+. Agendar bloque de 2h el día siguiente al taller para ejecutar este bloque completo.',
    )
  }

  // Regla 5: Certificados no ejecutados
  if (taskNotDone(items, 'certificado')) {
    recs.push('Definir responsable fijo para certificados antes del siguiente ciclo.')
  }

  // Regla 6: Oferta Legalité+ dentro del taller no ejecutada
  if (taskNotDone(items, 'upsell') || taskNotDone(items, 'legalité+')) {
    recs.push(
      'Agregar slide de L+ al deck del taller como recordatorio para Andrés.',
    )
  }

  return recs
}
