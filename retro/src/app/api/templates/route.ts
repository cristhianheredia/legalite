import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  const template = await prisma.cycleTemplate.findFirst({
    orderBy: { version: 'desc' },
    include: {
      tasks: {
        where: { archived: false },
        orderBy: [{ phase: 'asc' }, { order: 'asc' }],
      },
    },
  })
  if (!template) return NextResponse.json({ error: 'No template found' }, { status: 404 })
  return NextResponse.json(template)
}

export async function POST(req: Request) {
  const body = await req.json()
  const { taskId, patch } = body as { taskId: string; patch: Record<string, unknown> }

  const current = await prisma.cycleTemplate.findFirst({ orderBy: { version: 'desc' } })
  if (!current) return NextResponse.json({ error: 'No template' }, { status: 404 })

  const currentTasks = await prisma.task.findMany({
    where: { templateId: current.id, archived: false },
  })

  const newTemplate = await prisma.cycleTemplate.create({ data: { version: current.version + 1 } })

  for (const t of currentTasks) {
    const { id: _id, templateId: _tid, ...rest } = t
    const taskData = t.id === taskId ? { ...rest, ...patch } : rest
    await prisma.task.create({ data: { ...taskData, templateId: newTemplate.id } })
  }

  const updated = await prisma.cycleTemplate.findUnique({
    where: { id: newTemplate.id },
    include: { tasks: { where: { archived: false }, orderBy: [{ phase: 'asc' }, { order: 'asc' }] } },
  })
  return NextResponse.json(updated)
}
