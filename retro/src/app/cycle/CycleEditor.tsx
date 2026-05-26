'use client'

import { useState, useCallback } from 'react'
import type { Task, Phase } from '@prisma/client'
import { PHASE_LABELS, PERSON_LABELS, PERSONS } from '@/lib/constants'

type TaskGroup = { phase: Phase; label: string; tasks: Task[] }

const OWNER_COLORS: Record<string, string> = {
  cristhian: 'bg-purple-50 text-purple-600 border-purple-200',
  andres:    'bg-sky-50 text-sky-600 border-sky-200',
  sahian:    'bg-teal-50 text-teal-600 border-teal-200',
  sandra:    'bg-fuchsia-50 text-fuchsia-600 border-fuchsia-200',
}
const OWNER_COLORS_ACTIVE: Record<string, string> = {
  cristhian: 'bg-purple-600 text-white border-purple-600',
  andres:    'bg-sky-600 text-white border-sky-600',
  sahian:    'bg-teal-600 text-white border-teal-600',
  sandra:    'bg-fuchsia-600 text-white border-fuchsia-600',
}

function getCategory(title: string): { label: string; color: string } {
  const t = title.toLowerCase()
  if (t.includes('ads') || t.includes('pautar') || t.includes('retargeting activo') || t.includes('anuncio principal') || t.includes('anuncio early') || t.includes('últimos cupos activo'))
    return { label: 'Ads', color: 'bg-indigo-100 text-indigo-700' }
  if (t.includes('email') || t.includes('brevo') || t.includes('sendfox'))
    return { label: 'Email', color: 'bg-violet-100 text-violet-700' }
  if (t.includes('kommo'))
    return { label: 'CRM', color: 'bg-teal-100 text-teal-700' }
  if (t.includes('reel') || t.includes('historia') || t.includes('orgánico') || t.includes('video live') || t.includes('artworks'))
    return { label: 'Content', color: 'bg-rose-100 text-rose-700' }
  if (t.includes('live') || t.includes('zoom') || t.includes('sesión') || t.includes('clase bonus en vivo') || t.includes('streamyard'))
    return { label: 'Live', color: 'bg-orange-100 text-orange-700' }
  if (t.includes('circle'))
    return { label: 'Circle', color: 'bg-emerald-100 text-emerald-700' }
  if (t.includes('whatsapp'))
    return { label: 'WhatsApp', color: 'bg-lime-100 text-lime-700' }
  return { label: 'Ops', color: 'bg-slate-100 text-slate-500' }
}

function TaskRow({ task, onOwnersChange }: { task: Task; onOwnersChange: (id: string, owners: string[]) => void }) {
  const [editing, setEditing] = useState(false)
  const [owners, setOwners] = useState<string[]>(task.owners)
  const [saving, setSaving] = useState(false)
  const cat = getCategory(task.title)

  const toggleOwner = useCallback(async (person: string) => {
    const next = owners.includes(person) ? owners.filter((o) => o !== person) : [...owners, person]
    setOwners(next)
    setSaving(true)
    try {
      await fetch(`/api/tasks/${task.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ owners: next }),
      })
      onOwnersChange(task.id, next)
    } finally {
      setSaving(false)
    }
  }, [owners, task.id, onOwnersChange])

  return (
    <div className={`bg-white border rounded-lg px-4 py-3 transition-colors ${editing ? 'border-gray-400' : 'border-gray-200 hover:border-gray-300'}`}>
      <div className="flex items-center gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-medium text-gray-900 text-sm">{task.title}</p>
            {!editing && owners.map((o) => (
              <span key={o} className={`text-xs px-1.5 py-0.5 rounded font-medium border ${OWNER_COLORS[o] ?? 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                {PERSON_LABELS[o as keyof typeof PERSON_LABELS] ?? o}
              </span>
            ))}
            {!editing && owners.length === 0 && (
              <span className="text-xs text-gray-300 italic">sin asignar</span>
            )}
          </div>
          {task.description && !editing && (
            <p className="text-xs text-gray-400 mt-1 truncate">{task.description}</p>
          )}
          {editing && (
            <div className="flex gap-1.5 mt-2 flex-wrap">
              {PERSONS.map((p) => (
                <button
                  key={p}
                  onClick={() => toggleOwner(p)}
                  disabled={saving}
                  className={`text-xs px-2.5 py-1 rounded-full font-medium border transition-colors disabled:opacity-60
                    ${owners.includes(p) ? OWNER_COLORS_ACTIVE[p] : 'bg-white text-gray-400 border-gray-200 hover:border-gray-400'}`}
                >
                  {PERSON_LABELS[p]}
                </button>
              ))}
              {saving && <span className="text-xs text-amber-500 self-center">guardando…</span>}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${cat.color}`}>
            {cat.label}
          </span>
          <button
            onClick={() => setEditing((v) => !v)}
            title={editing ? 'Cerrar edición' : 'Editar responsables'}
            className={`text-xs w-6 h-6 flex items-center justify-center rounded transition-colors
              ${editing ? 'bg-gray-900 text-white' : 'text-gray-300 hover:text-gray-600 hover:bg-gray-100'}`}
          >
            {editing ? '×' : '✎'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function CycleEditor({ tasksByPhase }: { templateId: string; tasksByPhase: TaskGroup[] }) {
  const [filterPerson, setFilterPerson] = useState<string | null>(null)
  const [ownerMap, setOwnerMap] = useState<Record<string, string[]>>(() => {
    const map: Record<string, string[]> = {}
    tasksByPhase.forEach((g) => g.tasks.forEach((t) => { map[t.id] = t.owners }))
    return map
  })

  const handleOwnersChange = useCallback((id: string, owners: string[]) => {
    setOwnerMap((prev) => ({ ...prev, [id]: owners }))
  }, [])

  const filteredGroups = tasksByPhase
    .map((group) => ({
      ...group,
      tasks: filterPerson
        ? group.tasks.filter((t) => (ownerMap[t.id] ?? t.owners).includes(filterPerson))
        : group.tasks,
    }))
    .filter((group) => group.tasks.length > 0)

  return (
    <div className="space-y-8">
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setFilterPerson(null)}
          className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${filterPerson === null ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'}`}
        >
          Todos
        </button>
        {PERSONS.map((p) => (
          <button
            key={p}
            onClick={() => setFilterPerson(filterPerson === p ? null : p)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${filterPerson === p ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'}`}
          >
            {PERSON_LABELS[p]}
          </button>
        ))}
      </div>

      {filteredGroups.map((group) => (
        <div key={group.phase}>
          <div className="flex items-center gap-3 mb-3">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{group.label}</h2>
            <span className="text-xs text-gray-300">{group.tasks.length} tareas</span>
          </div>
          <div className="space-y-2">
            {group.tasks.map((task) => (
              <TaskRow key={task.id} task={{ ...task, owners: ownerMap[task.id] ?? task.owners }} onOwnersChange={handleOwnersChange} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
