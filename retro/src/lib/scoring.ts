import type { RetroItem, Task, Phase } from '@prisma/client'

type ItemWithTask = RetroItem & { task: Task }

export function executionScore(items: ItemWithTask[]): number {
  const eligible = items.filter((i) => i.status !== 'NA')
  if (eligible.length === 0) return 0
  const done = eligible.filter((i) => i.status === 'DONE').length
  return Math.round((done / eligible.length) * 100)
}

export function effectivenessScore(items: ItemWithTask[]): number {
  const rated = items.filter((i) => i.status === 'DONE' && i.effectiveness != null)
  if (rated.length === 0) return 0
  const sum = rated.reduce((acc, i) => acc + (i.effectiveness ?? 0), 0)
  return Math.round((sum / rated.length) * 10) / 10
}

export function phaseScores(
  items: ItemWithTask[],
): Record<Phase, { execution: number; effectiveness: number; total: number; done: number }> {
  const phases: Phase[] = ['PREP', 'WARM', 'CLOSE', 'EXEC', 'POST']
  const result = {} as Record<Phase, { execution: number; effectiveness: number; total: number; done: number }>

  for (const phase of phases) {
    const phaseItems = items.filter((i) => i.task.phase === phase)
    result[phase] = {
      execution: executionScore(phaseItems),
      effectiveness: effectivenessScore(phaseItems),
      total: phaseItems.filter((i) => i.status !== 'NA').length,
      done: phaseItems.filter((i) => i.status === 'DONE').length,
    }
  }
  return result
}

export function criticalGaps(items: ItemWithTask[]): ItemWithTask[] {
  return items.filter((i) => i.task.weight === 'HIGH' && i.status === 'NOT_DONE')
}

export function personProgress(
  items: RetroItem[],
  allTaskIds: string[],
  person: string,
): { completed: number; total: number; pct: number } {
  const personItems = items.filter((i) => i.person === person)
  const withStatus = personItems.filter((i) => i.status != null)
  return {
    completed: withStatus.length,
    total: allTaskIds.length,
    pct: allTaskIds.length === 0 ? 0 : Math.round((withStatus.length / allTaskIds.length) * 100),
  }
}
