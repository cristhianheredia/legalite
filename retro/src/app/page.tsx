import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { PERSONS, PERSON_LABELS } from '@/lib/constants'
import { executionScore } from '@/lib/scoring'

export const revalidate = 0

export default async function Dashboard() {
  const allRetros = await prisma.retro.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      sessions: true,
      items: { include: { task: true } },
    },
  })

  const open = allRetros.filter((r) => r.status === 'OPEN')
  const closed = allRetros.filter((r) => r.status === 'CLOSED').slice(0, 5)

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Retrospectivas</h1>
          <p className="text-sm text-gray-500 mt-1">Gestión del ciclo operativo Legalité</p>
        </div>
        <Link
          href="/retro/new"
          className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
        >
          + Iniciar nueva retro
        </Link>
      </div>

      {/* Retros activas */}
      <section>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Retros activas
        </h2>
        {open.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg p-8 text-center text-gray-400 text-sm">
            No hay retros activas.{' '}
            <Link href="/retro/new" className="text-red-600 hover:underline">
              Inicia una nueva retro
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {open.map((retro) => {
              const completed = retro.sessions.length
              const total = PERSONS.length
              return (
                <div key={retro.id} className="bg-white border border-gray-200 rounded-lg p-5 flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-gray-900">{retro.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {new Date(retro.cycleDate).toLocaleDateString('es-EC', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                    <div className="flex gap-2 mt-2">
                      {PERSONS.map((p) => {
                        const done = retro.sessions.some((s) => s.person === p)
                        return (
                          <span
                            key={p}
                            className={`text-xs px-2 py-0.5 rounded-full ${done ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}
                          >
                            {done ? '✓ ' : ''}{PERSON_LABELS[p]}
                          </span>
                        )
                      })}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900">{completed}<span className="text-sm font-normal text-gray-400">/{total}</span></p>
                      <p className="text-xs text-gray-400">sesiones</p>
                    </div>
                    <Link
                      href={`/retro/${retro.id}`}
                      className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors whitespace-nowrap"
                    >
                      Abrir retro →
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* Historial reciente */}
      {closed.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
              Historial reciente
            </h2>
            <Link href="/history" className="text-xs text-red-600 hover:underline">
              Ver todo →
            </Link>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-100 bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Ciclo</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500">Ejecución</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500">Reporte</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {closed.map((retro) => (
                  <tr key={retro.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{retro.name}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={`font-bold ${executionScore(retro.items) >= 70 ? 'text-green-600' : 'text-red-600'}`}>
                        {executionScore(retro.items)}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/report/${retro.id}`} className="text-red-600 hover:underline text-xs">
                        Ver →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  )
}
