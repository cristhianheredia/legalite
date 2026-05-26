'use client'

import { useState } from 'react'
import type { Task, Phase } from '@prisma/client'
import { PHASE_LABELS, PERSON_LABELS, PERSONS } from '@/lib/constants'

type TaskGroup = { phase: Phase; label: string; tasks: Task[] }

const OWNER_COLORS: Record<string, string> = {
  cristhian: 'bg-indigo-100 text-indigo-700',
  andres:    'bg-violet-100 text-violet-700',
  sahian:    'bg-teal-100 text-teal-700',
  sandra:    'bg-rose-100 text-rose-700',
}

function getCategory(title: string): { label: string; color: string } {
  const t = title.toLowerCase()
  if (t.includes('ads') || t.includes('pautar') || t.includes('retargeting activo') || t.includes('anuncio principal') || t.includes('anuncio early') || t.includes('últimos cupos activo'))
    return { label: 'Ads', color: 'bg-purple-50 text-purple-600' }
  if (t.includes('email') || t.includes('brevo') || t.includes('sendfox'))
    return { label: 'Email', color: 'bg-sky-50 text-sky-600' }
  if (t.includes('kommo'))
    return { label: 'CRM', color: 'bg-cyan-50 text-cyan-600' }
  if (t.includes('reel') || t.includes('historia') || t.includes('orgánico') || t.includes('video live') || t.includes('artworks'))
    return { label: 'Content', color: 'bg-orange-50 text-orange-600' }
  if (t.includes('live') || t.includes('zoom') || t.includes('sesión') || t.includes('clase bonus en vivo') || t.includes('streamyard'))
    return { label: 'Live', color: 'bg-fuchsia-50 text-fuchsia-600' }
  if (t.includes('circle'))
    return { label: 'Circle', color: 'bg-emerald-50 text-emerald-600' }
  if (t.includes('whatsapp'))
    return { label: 'WhatsApp', color: 'bg-lime-50 text-lime-600' }
  return { label: 'Ops', color: 'bg-slate-100 text-slate-500' }
}

export default function CycleEditor({ tasksByPhase }: { templateId: string; tasksByPhase: TaskGroup[] }) {
  const [filterPerson, setFilterPerson] = useState<string | null>(null)

  const filteredGroups = tasksByPhase
    .map((group) => ({
      ...group,
      tasks: filterPerson ? group.tasks.filter((t) => t.owners.includes(filterPerson)) : group.tasks,
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
            {group.tasks.map((task) => {
              const cat = getCategory(task.title)
              return (
                <div key={task.id} className="bg-white border border-gray-200 rounded-lg px-4 py-3 hover:border-gray-300 transition-colors flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-gray-900 text-sm">{task.title}</p>
                      <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${cat.color}`}>
                        {cat.label}
                      </span>
                    </div>
                    {task.description && (
                      <p className="text-xs text-gray-400 mt-1 truncate">{task.description}</p>
                    )}
                  </div>
                  <div className="flex gap-1 shrink-0">
                    {task.owners.map((o) => (
                      <span key={o} className={`text-xs px-1.5 py-0.5 rounded font-medium ${OWNER_COLORS[o] ?? 'bg-gray-100 text-gray-600'}`}>
                        {PERSON_LABELS[o as keyof typeof PERSON_LABELS] ?? o}
                      </span>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
