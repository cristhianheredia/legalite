import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json()
  const task = await prisma.task.update({ where: { id: params.id }, data: body })
  return NextResponse.json(task)
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const task = await prisma.task.update({ where: { id: params.id }, data: { archived: true } })
  return NextResponse.json(task)
}
