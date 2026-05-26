'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Task, Phase } from '@prisma/client'
import { PHASE_LABELS, WEIGHT_LABELS, PERSON_LABELS, PERSONS } from '@/lib/constants'

type TaskGroup = { phase: Phase; label: string; tasks: Task[] }

export default function CycleEditor({ templateId, tasksByPhase }: { templateId: string; tasksByPhase: TaskGroup[] }) {
  const router = useRouter()
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [saving, setSaving] = useState(false)
  const [filterPerson, setFilterPerson] = useState<string | null>(null)

  const filteredGroups = tasksByPhase.map((group) => ({
    ...group,
    tasks: filterPerson ? group.tasks.filter((t) => t.owners.includes(filterPerson)) : group.tasks,
  })).filter((group) => group.tasks.length > 0)

  async function handleSave(task: Task, patch: Partial<Task>) {
    setSaving(true)
    await fetch('/api/templates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taskId: task.id, patch }),
    })
    setSaving(false)
    setEditingTask(null)
    router.refresh()
  }

  async function handleArchive(taskId: string) {
    if (!confirm('¿Archivar esta tarea?')) return
    await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' })
    router.refresh()
  }

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
              <div key={task.id} className="bg-white border border-gray-200 rounded-lg p-4 flex items-start justify-between gap-4 hover:border-gray-300 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-gray-900 text-sm">{task.title}</p>
                    <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${task.weight === 'HIGH' ? 'bg-red-50 text-red-600' : task.weight === 'MEDIUM' ? 'bg-amber-50 text-amber-600' : 'bg-gray-100 text-gray-500'}`}>
                      {WEIGHT_LABELS[task.weight]}
                    </span>
                  </div>
                  {task.description && <p className="text-xs text-gray-400 mt-0.5 truncate">{task.description}</p>}
                  <div className="flex gap-1 mt-1.5 flex-wrap">
                    {task.owners.map((o) => (
                      <span key={o} className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                        {PERSON_LABELS[o as keyof typeof PERSON_LABELS] ?? o}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => setEditingTask(task)}
                    className="text-xs text-gray-400 hover:text-gray-700 transition-colors px-2 py-1 rounded hover:bg-gray-100"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleArchive(task.id)}
                    className="text-xs text-gray-300 hover:text-red-500 transition-colors px-2 py-1 rounded hover:bg-red-50"
                  >
                    Archivar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Edit modal */}
      {editingTask && (
        <TaskEditModal
          task={editingTask}
          onSave={(patch) => handleSave(editingTask, patch)}
          onClose={() => setEditingTask(null)}
          saving={saving}
        />
      )}
    </div>
  )
}

function TaskEditModal({
  task,
  onSave,
  onClose,
  saving,
}: {
  task: Task
  onSave: (patch: Partial<Task>) => void
  onClose: () => void
  saving: boolean
}) {
  const [title, setTitle] = useState(task.title)
  const [description, setDescription] = useState(task.description)
  const [weight, setWeight] = useState(task.weight)
  const [owners, setOwners] = useState<string[]>(task.owners)
  const [phase, setPhase] = useState(task.phase)

  function toggleOwner(person: string) {
    setOwners((prev) => prev.includes(person) ? prev.filter((o) => o !== person) : [...prev, person])
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-gray-900">Editar tarea</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg">✕</button>
        </div>

        <div>
          <label className="text-xs font-medium text-gray-500 block mb-1">Título</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400" />
        </div>

        <div>
          <label className="text-xs font-medium text-gray-500 block mb-1">Descripción</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 resize-none" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1">Fase</label>
            <select value={phase} onChange={(e) => setPhase(e.target.value as Phase)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400">
              {Object.entries(PHASE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1">Ponderación</label>
            <select value={weight} onChange={(e) => setWeight(e.target.value as Task['weight'])} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400">
              <option value="HIGH">Alta</option>
              <option value="MEDIUM">Media</option>
              <option value="LOW">Baja</option>
            </select>
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-gray-500 block mb-2">Responsables</label>
          <div className="flex gap-2 flex-wrap">
            {PERSONS.map((p) => (
              <button
                key={p}
                onClick={() => toggleOwner(p)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${owners.includes(p) ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'}`}
              >
                {PERSON_LABELS[p]}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button onClick={onClose} className="flex-1 border border-gray-200 rounded-lg py-2 text-sm text-gray-600 hover:bg-gray-50">
            Cancelar
          </button>
          <button
            onClick={() => onSave({ title, description, weight, owners, phase })}
            disabled={saving || !title.trim()}
            className="flex-1 bg-gray-900 text-white rounded-lg py-2 text-sm font-medium hover:bg-gray-700 disabled:opacity-50"
          >
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </div>
    </div>
  )
}
