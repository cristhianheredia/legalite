import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: Request, { params }: { params: { id: string } }) {
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
  if (!retro) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(retro)
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json()
  const data: Record<string, unknown> = { ...body }
  if (body.status === 'CLOSED') data.closedAt = new Date()

  const retro = await prisma.retro.update({ where: { id: params.id }, data })
  return NextResponse.json(retro)
}
