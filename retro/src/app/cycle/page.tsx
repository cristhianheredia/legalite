import { prisma } from '@/lib/prisma'
import { PHASE_LABELS, PHASE_ORDER, WEIGHT_LABELS, PERSON_LABELS } from '@/lib/constants'
import CycleEditor from './CycleEditor'

export const revalidate = 0

export default async function CyclePage() {
  const template = await prisma.cycleTemplate.findFirst({
    orderBy: { version: 'desc' },
    include: {
      tasks: { where: { archived: false }, orderBy: [{ phase: 'asc' }, { order: 'asc' }] },
    },
  })

  if (!template) {
    return (
      <div className="text-center py-16 text-gray-400">
        <p>No hay ciclo estándar. Ejecuta el seed para cargar las tareas.</p>
      </div>
    )
  }

  const tasksByPhase = PHASE_ORDER.map((phase) => ({
    phase,
    label: PHASE_LABELS[phase],
    tasks: template.tasks.filter((t) => t.phase === phase),
  }))

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ciclo Estándar</h1>
          <p className="text-sm text-gray-500 mt-1">
            Versión {template.version} · {template.tasks.length} tareas activas
          </p>
        </div>
      </div>

      <CycleEditor templateId={template.id} tasksByPhase={tasksByPhase} />
    </div>
  )
}
