'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function CloseRetroButton({ retroId }: { retroId: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleClose() {
    setLoading(true)
    await fetch(`/api/retros/${retroId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'CLOSED' }),
    })
    router.refresh()
  }

  return (
    <button
      onClick={handleClose}
      disabled={loading}
      className="bg-gray-900 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors disabled:opacity-50"
    >
      {loading ? 'Cerrando...' : 'Cerrar retro y generar reporte →'}
    </button>
  )
}
