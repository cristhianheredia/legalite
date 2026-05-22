import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  const retros = await prisma.retro.findMany({
    orderBy: { createdAt: 'desc' },
    include: { sessions: true, items: true },
  })
  return NextResponse.json(retros)
}

export async function POST(req: Request) {
  const { name, cycleDate } = await req.json()

  const template = await prisma.cycleTemplate.findFirst({ orderBy: { version: 'desc' } })
  if (!template) return NextResponse.json({ error: 'No template found' }, { status: 404 })

  const retro = await prisma.retro.create({
    data: { name, cycleDate: new Date(cycleDate), templateId: template.id },
  })
  return NextResponse.json(retro, { status: 201 })
}
