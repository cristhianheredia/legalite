import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
import { executionScore, effectivenessScore, criticalGaps } from '@/lib/scoring'

export async function GET() {
  const retros = await prisma.retro.findMany({
    where: { status: 'CLOSED' },
    orderBy: { cycleDate: 'desc' },
    include: { items: { include: { task: true } } },
  })

  const result = retros.map((r) => ({
    id: r.id,
    name: r.name,
    cycleDate: r.cycleDate,
    closedAt: r.closedAt,
    execution: executionScore(r.items),
    effectiveness: effectivenessScore(r.items),
    gaps: criticalGaps(r.items).length,
  }))

  return NextResponse.json(result)
}
