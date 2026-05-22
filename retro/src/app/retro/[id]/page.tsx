import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { PERSONS, PERSON_LABELS, PERSON_INITIALS, PHASE_LABELS, PHASE_ORDER } from '@/lib/constants'
import RetroSession from './RetroSession'

export const revalidate = 0

type Props = { params: { id: string }; searchParams: { person?: string } }

export default async function RetroPage({ params, searchParams }: Props) {
  const retro = await prisma.retro.findUnique({
    where: { id: params.id },
    include: {
      sessions: true,
      items: { include: { task: true } },
      template: {
        include: {
          tasks: { where: { archived: false }, orderBy: [{ phase: 'asc' }, { order: 'asc' }] },
        },
      },
    },
  })

  if (!retro) notFound()

  const selectedPerson = searchParams.person as (typeof PERSONS)[number] | undefined
  const completedPersons = retro.sessions.map((s) => s.person)

  // If person in query is already completed, show selection screen
  const showSession = selectedPerson && PERSONS.includes(selectedPerson) && !completedPersons.includes(selectedPerson)

  if (showSession && selectedPerson) {
    const personTasks = retro.template.tasks.filter((t) => t.owners.includes(selectedPerson))
    const personItems = retro.items.filter((i) => i.person === selectedPerson)

    const tasksByPhase = PHASE_ORDER.map((phase) => ({
      phase,
      label: PHASE_LABELS[phase],
      tasks: personTasks.filter((t) => t.phase === phase),
    })).filter((g) => g.tasks.length > 0)

    return (
      <RetroSession
        retroId={retro.id}
        retroName={retro.name}
        person={selectedPerson}
        personLabel={PERSON_LABELS[selectedPerson]}
        tasksByPhase={tasksByPhase}
        existingItems={personItems}
      />
    )
  }

  // Selection screen
  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Retro activa</p>
        <h1 className="text-2xl font-bold text-gray-900">{retro.name}</h1>
        <p className="text-sm text-gray-500 mt-1">
          {new Date(retro.cycleDate).toLocaleDateString('es-EC', { day: 'numeric', month: 'long', year: 'numeric' })}
          {' · '}{completedPersons.length} de {PERSONS.length} sesiones completadas
        </p>
      </div>

      <div>
        <p className="text-sm font-medium text-gray-700 mb-4">¿Quién eres?</p>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {PERSONS.map((person) => {
            const done = completedPersons.includes(person)
            return (
              <a
                key={person}
                href={done ? undefined : `/retro/${retro.id}?person=${person}`}
                className={`flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all text-center
                  ${done
                    ? 'border-green-200 bg-green-50 cursor-not-allowed opacity-80'
                    : 'border-gray-200 bg-white hover:border-red-400 hover:shadow-md cursor-pointer'
                  }`}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold
                  ${done ? 'bg-green-600 text-white' : 'bg-gray-900 text-white'}`}
                >
                  {done ? '✓' : PERSON_INITIALS[person]}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{PERSON_LABELS[person]}</p>
                  <p className={`text-xs mt-0.5 ${done ? 'text-green-600 font-medium' : 'text-gray-400'}`}>
                    {done ? 'Completado' : 'Pendiente'}
                  </p>
                </div>
              </a>
            )
          })}
        </div>
      </div>

      {completedPersons.length === PERSONS.length && retro.status === 'OPEN' && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-center justify-between">
          <p className="text-sm text-amber-800 font-medium">
            Todas las sesiones completadas. ¿Listo para cerrar la retro y generar el reporte?
          </p>
          <a
            href={`/report/${retro.id}`}
            className="ml-4 bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-amber-700 transition-colors whitespace-nowrap"
          >
            Cerrar y ver reporte →
          </a>
        </div>
      )}
    </div>
  )
}
