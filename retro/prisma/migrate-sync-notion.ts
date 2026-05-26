import { PrismaClient, Phase, Weight } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔄 Sincronizando ciclo estándar con Notion...')

  const template = await prisma.cycleTemplate.findFirst({
    orderBy: { createdAt: 'asc' },
  })
  if (!template) throw new Error('No se encontró ningún CycleTemplate.')
  console.log(`✅ Template encontrado: ${template.id} (v${template.version})`)

  // ── 1. ARCHIVAR tarea obsoleta ──────────────────────────────────────────────
  const archived = await prisma.task.updateMany({
    where: {
      templateId: template.id,
      title: { contains: 'Testimonio o caso real' },
    },
    data: { archived: true },
  })
  console.log(`🗄️  Tareas archivadas: ${archived.count}`)

  // ── 2. ACTUALIZAR descripciones desactualizadas ─────────────────────────────

  // Micro campaña Kommo: agregar materiales Circle + WhatsApp
  await prisma.task.updateMany({
    where: { templateId: template.id, title: { contains: 'Micro campaña Kommo' } },
    data: {
      description:
        'Activar micro campaña en Kommo para reactivar leads calientes tras la primera sesión. Publicar materiales de la sesión en Circle y enviar al grupo de WhatsApp de inscritos.',
    },
  })

  // Grabaciones + certificados: mencionar herramienta automática
  await prisma.task.updateMany({
    where: { templateId: template.id, title: { contains: 'Grabaciones publicadas' } },
    data: {
      description:
        'Publicar las grabaciones de ambas sesiones en Circle. Generar los certificados/diplomas con la herramienta automática y enviarlos a todos los inscritos.',
    },
  })

  // Upsell / siguiente ciclo: alinear nombre y descripción con Notion
  await prisma.task.updateMany({
    where: { templateId: template.id, title: { contains: 'Upsell Legalité+' } },
    data: {
      title: 'Presentación del siguiente taller + oferta L+70',
      description:
        'Arrancar el nuevo ciclo: presentar el siguiente taller a la base de compradores activos y lanzar la oferta L+70 ($70 en vez de $120, incluye L+ + próximos 2 talleres, válida 1 semana).',
    },
  })

  console.log('✅ Descripciones actualizadas')

  // ── 3. AGREGAR 10 tareas faltantes ─────────────────────────────────────────

  const newTasks: {
    title: string
    description: string
    phase: Phase
    owners: string[]
    weight: Weight
    order: number
  }[] = [
    // PREP
    {
      title: 'Material del taller publicado en Circle — Semana 1',
      description:
        'Publicar el material del taller (workbook, recursos) en Circle desde la primera semana como valor agregado para inscritos tempranos y para incentivar la inscripción anticipada.',
      phase: 'PREP',
      owners: ['cristhian'],
      weight: 'MEDIUM',
      order: 34,
    },
    // WARM
    {
      title: 'LIVE exclusivo para miembros L+ — cierre oferta L+70',
      description:
        'Dictar un LIVE exclusivo para miembros L+ el domingo de la Semana 2 como cierre y último empuje de la oferta L+70 antes de que expire.',
      phase: 'WARM',
      owners: ['andres'],
      weight: 'HIGH',
      order: 35,
    },
    // CLOSE
    {
      title: 'Reel LIVE en Instagram + flujo ManyChat',
      description:
        'Publicar el reel del LIVE gratuito en Instagram y conectar flujo ManyChat para enviar el link de registro automáticamente por DM a quienes comenten o reaccionen.',
      phase: 'CLOSE',
      owners: ['cristhian'],
      weight: 'HIGH',
      order: 36,
    },
    {
      title: 'Video LIVE en TikTok',
      description:
        'Publicar el video del LIVE gratuito en TikTok (sin automatización de DM por ahora).',
      phase: 'CLOSE',
      owners: ['cristhian'],
      weight: 'MEDIUM',
      order: 37,
    },
    {
      title: 'Pautar reel LIVE en Meta Ads',
      description:
        'Activar pauta del reel del LIVE gratuito en Meta Ads para ampliar el alcance más allá de la audiencia orgánica.',
      phase: 'CLOSE',
      owners: ['sandra'],
      weight: 'MEDIUM',
      order: 38,
    },
    {
      title: 'Pautar video LIVE en TikTok Ads',
      description:
        'Activar pauta del video del LIVE gratuito en TikTok Ads.',
      phase: 'CLOSE',
      owners: ['sandra'],
      weight: 'MEDIUM',
      order: 39,
    },
    // EXEC
    {
      title: 'Verificar copy de ads Meta/TikTok — confirmar fechas',
      description:
        'Revisar que el copy de los anuncios activos en Meta y TikTok tenga las fechas correctas del taller. Coordinar con Sandra antes del día de inicio.',
      phase: 'EXEC',
      owners: ['cristhian', 'sandra'],
      weight: 'MEDIUM',
      order: 40,
    },
    {
      title: 'Contenido orgánico de último llamado en RRSS',
      description:
        'Publicar contenido orgánico de último llamado en Instagram y TikTok el día antes o el día del taller para cerrar inscritos de último momento.',
      phase: 'EXEC',
      owners: ['cristhian'],
      weight: 'LOW',
      order: 41,
    },
    // POST
    {
      title: 'WhatsApp inscritos — grabaciones disponibles + oferta L+',
      description:
        'Enviar mensaje al grupo de WhatsApp de inscritos informando que las grabaciones ya están disponibles en Circle y promoviendo la oferta L+ o el siguiente taller.',
      phase: 'POST',
      owners: ['cristhian'],
      weight: 'HIGH',
      order: 42,
    },
    {
      title: 'Oferta L+70 — presentación en vivo post-taller',
      description:
        'Al cerrar el taller (última sesión), presentar en vivo la oferta L+70: $70 en vez de $120, incluye L+ + próximos 2 talleres, válida por 1 semana. Este es el arranque del siguiente ciclo.',
      phase: 'POST',
      owners: ['andres', 'cristhian'],
      weight: 'HIGH',
      order: 43,
    },
  ]

  let created = 0
  for (const task of newTasks) {
    const exists = await prisma.task.findFirst({
      where: { templateId: template.id, title: task.title },
    })
    if (exists) {
      console.log(`⏭️  Ya existe: "${task.title}"`)
      continue
    }
    await prisma.task.create({ data: { ...task, templateId: template.id } })
    created++
    console.log(`➕ Creada: "${task.title}"`)
  }

  console.log(`\n✅ Migración completada. Tareas nuevas: ${created}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
