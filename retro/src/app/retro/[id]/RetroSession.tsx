'use client'

import { useState, useRef, useCallback } from 'react'
import type { Task, RetroItem, Phase } from '@prisma/client'
import { useRouter } from 'next/navigation'
import { WEIGHT_LABELS, STATUS_LABELS } from '@/lib/constants'

type TaskGroup = { phase: Phase; label: string; tasks: Task[] }
type Props = {
  retroId: string
  retroName: string
  person: string
  personLabel: string
  tasksByPhase: TaskGroup[]
  existingItems: RetroItem[]
}

type SaveState = 'idle' | 'saving' | 'saved'

function TaskCard({
  task,
  retroId,
  person,
  initialItem,
}: {
  task: Task
  retroId: string
  person: string
  initialItem: RetroItem | undefined
}) {
  const [status, setStatus] = useState<string | null>(initialItem?.status ?? null)
  const [effectiveness, setEffectiveness] = useState<number | null>(initialItem?.effectiveness ?? null)
  const [note, setNote] = useState(initialItem?.note ?? '')
  const [saveState, setSaveState] = useState<SaveState>('idle')
  const noteTimerRef = useRef<NodeJS.Timeout>()

  const save = useCallback(
    async (patch: { status?: string | null; effectiveness?: number | null; note?: string }) => {
      setSaveState('saving')
      try {
        await fetch(`/api/retros/${retroId}/items`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ taskId: task.id, person, ...patch }),
        })
        setSaveState('saved')
        setTimeout(() => setSaveState('idle'), 2000)
      } catch {
        setSaveState('idle')
      }
    },
    [retroId, task.id, person],
  )

  function handleStatusChange(newStatus: string) {
    const newEffectiveness = newStatus === 'DONE' ? effectiveness : null
    setStatus(newStatus)
    if (newStatus !== 'DONE') setEffectiveness(null)
    save({ status: newStatus, effectiveness: newEffectiveness, note })
  }

  function handleEffectivenessChange(val: number) {
    setEffectiveness(val)
    save({ status, effectiveness: val, note })
  }

  function handleNoteChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const val = e.target.value
    setNote(val)
    clearTimeout(noteTimerRef.current)
    noteTimerRef.current = setTimeout(() => save({ status, effectiveness, note: val }), 600)
  }

  const weightColor = task.weight === 'HIGH' ? 'text-red-600 bg-red-50' : task.weight === 'MEDIUM' ? 'text-amber-600 bg-amber-50' : 'text-gray-500 bg-gray-100'

  return (
    <div className={`bg-white border rounded-lg p-4 space-y-3 ${status === 'DONE' ? 'border-green-200' : status === 'NOT_DONE' ? 'border-red-200' : status === 'NA' ? 'border-gray-200 opacity-70' : 'border-gray-200'}`}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-medium text-gray-900 text-sm">{task.title}</p>
          {task.description && <p className="text-xs text-gray-400 mt-0.5">{task.description}</p>}
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${weightColor}`}>
            {WEIGHT_LABELS[task.weight]}
          </span>
          <span className={`text-xs ${saveState === 'saving' ? 'text-amber-500' : saveState === 'saved' ? 'text-green-500' : 'text-transparent'}`}>
            {saveState === 'saving' ? '●' : '✓'}
          </span>
        </div>
      </div>

      {/* Status toggle */}
      <div className="flex gap-2">
        {(['DONE', 'NOT_DONE', 'NA'] as const).map((s) => (
          <button
            key={s}
            onClick={() => handleStatusChange(s)}
            className={`flex-1 text-xs py-1.5 rounded-md font-medium transition-colors border
              ${status === s
                ? s === 'DONE' ? 'bg-green-600 text-white border-green-600' : s === 'NOT_DONE' ? 'bg-red-600 text-white border-red-600' : 'bg-gray-500 text-white border-gray-500'
                : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'
              }`}
          >
            {STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      {/* Effectiveness (only if DONE) */}
      {status === 'DONE' && (
        <div>
          <p className="text-xs text-gray-500 mb-1.5">Efectividad</p>
          <div className="flex gap-1.5">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                onClick={() => handleEffectivenessChange(n)}
                className={`w-8 h-8 rounded-md text-sm font-bold transition-colors
                  ${effectiveness === n ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Note */}
      {status && status !== 'NA' && (
        <textarea
          value={note}
          onChange={handleNoteChange}
          placeholder="Nota opcional..."
          rows={2}
          className="w-full text-xs border border-gray-200 rounded-md px-2 py-1.5 resize-none focus:outline-none focus:ring-1 focus:ring-gray-400 text-gray-700 placeholder-gray-300"
        />
      )}
    </div>
  )
}

export default function RetroSession({ retroId, retroName, person, personLabel, tasksByPhase, existingItems }: Props) {
  const router = useRouter()
  const [closing, setClosing] = useState(false)
  const [error, setError] = useState('')

  const totalTasks = tasksByPhase.reduce((acc, g) => acc + g.tasks.length, 0)

  async function handleClose() {
    setClosing(true)
    setError('')
    try {
      const res = await fetch(`/api/retros/${retroId}/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ person }),
      })
      if (!res.ok) throw new Error()
      router.push(`/retro/${retroId}`)
    } catch {
      setError('Error al cerrar la sesión. Intenta de nuevo.')
      setClosing(false)
    }
  }

  return (
    <div className="space-y-8">
      <div data-print-hide>
        <a href={`/retro/${retroId}`} className="text-xs text-gray-400 hover:text-gray-600">← Volver</a>
        <div className="flex items-center justify-between mt-2">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{retroName}</h1>
            <p className="text-sm text-gray-500 mt-0.5">Sesión de <span className="font-semibold text-gray-700">{personLabel}</span> · {totalTasks} tareas asignadas</p>
          </div>
        </div>
      </div>

      {tasksByPhase.map((group) => (
        <div key={group.phase} className="phase-section space-y-3">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{group.label}</h2>
          <div className="space-y-3">
            {group.tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                retroId={retroId}
                person={person}
                initialItem={existingItems.find((i) => i.taskId === task.id)}
              />
            ))}
          </div>
        </div>
      ))}

      <div className="pt-4 border-t border-gray-200" data-print-hide>
        {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
        <button
          onClick={handleClose}
          disabled={closing}
          className="w-full bg-gray-900 text-white py-3 rounded-xl font-medium hover:bg-gray-700 transition-colors disabled:opacity-50"
        >
          {closing ? 'Guardando...' : 'Guardar y cerrar mi sesión ✓'}
        </button>
        <p className="text-xs text-gray-400 text-center mt-2">
          Una vez cerrada, no podrás editar tu sección.
        </p>
      </div>
    </div>
  )
}
