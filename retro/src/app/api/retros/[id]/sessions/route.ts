import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const { person } = await req.json()

  const existing = await prisma.personSession.findUnique({
    where: { retroId_person: { retroId: params.id, person } },
  })
  if (existing) {
    return NextResponse.json({ error: 'Session already completed' }, { status: 409 })
  }

  const session = await prisma.personSession.create({
    data: { retroId: params.id, person },
  })
  return NextResponse.json(session, { status: 201 })
}
