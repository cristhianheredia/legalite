import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { executionScore, effectivenessScore, criticalGaps } from '@/lib/scoring'
import { PHASE_LABELS } from '@/lib/constants'

export const revalidate = 0

export default async function HistoryPage() {
  const retros = await prisma.retro.findMany({
    where: { status: 'CLOSED' },
    orderBy: { cycleDate: 'desc' },
    include: { items: { include: { task: true } } },
  })

  // Recurring gaps: tasks with NOT_DONE in 2+ cycles
  const gapCounts: Record<string, { title: string; phase: string; count: number }> = {}
  for (const retro of retros) {
    const gaps = criticalGaps(retro.items)
    for (const gap of gaps) {
      if (!gapCounts[gap.taskId]) {
        gapCounts[gap.taskId] = { title: gap.task.title, phase: PHASE_LABELS[gap.task.phase], count: 0 }
      }
      gapCounts[gap.taskId].count++
    }
  }
  const recurringGaps = Object.values(gapCounts).filter((g) => g.count >= 2).sort((a, b) => b.count - a.count)

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Historial de ciclos</h1>
        <p className="text-sm text-gray-500 mt-1">{retros.length} ciclos cerrados</p>
      </div>

      {retros.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-10 text-center text-gray-400 text-sm">
          No hay ciclos cerrados aún.
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Ciclo</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500">Ejecución</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500">Efectividad</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500">Brechas</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {retros.map((retro) => {
                const exec = executionScore(retro.items)
                const ef = effectivenessScore(retro.items)
                const gaps = criticalGaps(retro.items).length
                return (
                  <tr key={retro.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{retro.name}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(retro.cycleDate).toLocaleDateString('es-EC', { month: 'long', year: 'numeric' })}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={`font-bold text-base ${exec >= 70 ? 'text-green-600' : exec >= 50 ? 'text-amber-600' : 'text-red-600'}`}>
                        {exec}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-gray-700 font-medium">
                      {ef > 0 ? `${ef}/5` : '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={`font-medium ${gaps > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {gaps}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/report/${retro.id}`} className="text-xs text-red-600 hover:underline">
                        Ver →
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {recurringGaps.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Brechas recurrentes</h2>
          <p className="text-xs text-gray-400 mb-3">Tareas con brecha crítica en 2 o más ciclos consecutivos</p>
          <div className="space-y-2">
            {recurringGaps.map((g, i) => (
              <div key={i} className="flex items-center gap-4 bg-white border border-red-200 rounded-lg px-4 py-3">
                <span className="text-2xl font-bold text-red-400 w-8 shrink-0">{g.count}×</span>
                <div>
                  <p className="text-sm font-medium text-gray-900">{g.title}</p>
                  <p className="text-xs text-gray-400">{g.phase}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
