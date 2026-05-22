import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const { taskId, person, status, effectiveness, note } = await req.json()

  // Block saves if session is already completed
  const session = await prisma.personSession.findUnique({
    where: { retroId_person: { retroId: params.id, person } },
  })
  if (session) {
    return NextResponse.json({ error: 'Session already completed' }, { status: 403 })
  }

  const effectivenessValue = status === 'DONE' ? effectiveness ?? null : null

  const item = await prisma.retroItem.upsert({
    where: { retroId_taskId_person: { retroId: params.id, taskId, person } },
    update: { status, effectiveness: effectivenessValue, note: note ?? null },
    create: { retroId: params.id, taskId, person, status, effectiveness: effectivenessValue, note: note ?? null },
  })
  return NextResponse.json(item)
}
