import { PrismaClient, Phase, Weight } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔄 Sincronizando ciclo estándar con Notion v2...')

  const template = await prisma.cycleTemplate.findFirst({
    orderBy: { createdAt: 'asc' },
  })
  if (!template) throw new Error('No se encontró ningún CycleTemplate.')
  const tid = template.id
  console.log(`✅ Template: ${tid} (v${template.version})`)

  // ── 1. ACTUALIZAR TÍTULOS ───────────────────────────────────────────────────

  await prisma.task.updateMany({
    where: { templateId: tid, title: { contains: 'Setup funnel Kommo + plantillas' } },
    data: { title: 'Setup funnel Kommo taller nuevo' },
  })

  await prisma.task.updateMany({
    where: { templateId: tid, title: { contains: 'Email (Brevo + SendFox)' } },
    data: { title: 'Anuncio del taller — Email Brevo' },
  })

  console.log('✅ Títulos actualizados')

  // ── 2. ACTUALIZAR DUEÑOS ────────────────────────────────────────────────────
  // Redistribución real del equipo según Notion actualizado:
  // - Sandra sale de Meta Ads → pasa a Cristhian
  // - Cristhian pasa reels a Andrés
  // - Sahian asume distribución SendFox y WhatsApp

  const ownerUpdates: { match: string; owners: string[] }[] = [
    { match: 'Workbook, diapositivas',               owners: ['andres'] },
    { match: 'Artworks estáticos',                   owners: ['cristhian'] },
    { match: 'Plan de anuncios — GSheet',             owners: ['andres'] },
    { match: 'Anuncio del taller — Email Brevo',      owners: ['cristhian'] },
    { match: 'Reel + historia — Anuncio',             owners: ['andres'] },
    { match: 'Material del taller publicado en Circle', owners: ['sahian'] },
    { match: 'Anuncio principal del taller activo',   owners: ['cristhian'] },
    { match: 'Reel orgánico semanal',                 owners: ['andres'] },
    { match: 'Reel Early Bird',                       owners: ['andres'] },
    { match: 'Anuncio Early Bird activo',             owners: ['cristhian'] },
    { match: 'Reel de urgencia',                      owners: ['andres'] },
    { match: 'Retargeting activo',                    owners: ['cristhian'] },
    { match: 'Últimos cupos activo',                  owners: ['cristhian'] },
    { match: 'Reel LIVE en Instagram',                owners: ['sahian', 'cristhian'] },
    { match: 'Video LIVE en TikTok',                  owners: ['sahian'] },
    { match: 'Pautar video LIVE en TikTok Ads',       owners: ['cristhian'] },
    { match: 'Contenido orgánico de último llamado',  owners: ['andres'] },
    { match: 'Comunicación cambio de fecha',          owners: ['sahian'] },
    { match: 'Grabaciones publicadas en Circle',      owners: ['sahian'] },
    { match: 'WhatsApp inscritos — grabaciones',      owners: ['sahian'] },
  ]

  let ownerCount = 0
  for (const u of ownerUpdates) {
    const r = await prisma.task.updateMany({
      where: { templateId: tid, title: { contains: u.match } },
      data: { owners: u.owners },
    })
    if (r.count > 0) ownerCount += r.count
  }
  console.log(`✅ Dueños actualizados: ${ownerCount} tareas`)

  // ── 3. AGREGAR NUEVAS TAREAS ────────────────────────────────────────────────

  const newTasks: {
    title: string
    description: string
    phase: Phase
    owners: string[]
    weight: Weight
    order: number
  }[] = [
    // POST — L+70 (arranque del nuevo ciclo, al cerrar el taller anterior)
    {
      title: 'Oferta L+70 — Email Brevo Promo 1',
      description: 'Enviar primer email promocional de la oferta L+70 por Brevo a los miembros del taller anterior. Oferta: $70 en vez de $120, incluye L+ + próximos 2 talleres, válida 1 semana.',
      phase: 'POST',
      owners: ['cristhian'],
      weight: 'HIGH',
      order: 44,
    },
    {
      title: 'Push Oferta L+70 por Kommo',
      description: 'Enviar push de la oferta L+70 por Kommo a los miembros interesados del pipeline.',
      phase: 'POST',
      owners: ['sahian'],
      weight: 'HIGH',
      order: 45,
    },
    {
      title: 'Oferta L+70 — Email Brevo Promo 2 (recordatorio)',
      description: 'Enviar segundo email recordatorio de la oferta L+70 por Brevo antes de que expire.',
      phase: 'POST',
      owners: ['cristhian'],
      weight: 'MEDIUM',
      order: 46,
    },
    // PREP — nuevas tareas
    {
      title: 'Anuncio del taller — Email SendFox',
      description: 'Enviar el email de anuncio del taller a la lista de SendFox (Sahian).',
      phase: 'PREP',
      owners: ['sahian'],
      weight: 'MEDIUM',
      order: 47,
    },
    {
      title: 'Ads TikTok: anuncio principal activo',
      description: 'Activar la campaña principal de anuncios en TikTok Ads con reel y carrusel del taller.',
      phase: 'PREP',
      owners: ['cristhian'],
      weight: 'HIGH',
      order: 48,
    },
    {
      title: 'Setup Plantillas mensajes Kommo taller nuevo',
      description: 'Configurar y activar las plantillas de mensajes de WhatsApp en Kommo para el nuevo ciclo del taller.',
      phase: 'PREP',
      owners: ['sahian'],
      weight: 'MEDIUM',
      order: 49,
    },
    // WARM — nuevas tareas
    {
      title: 'Ads TikTok: anuncio Early Bird activo',
      description: 'Activar campaña de Early Bird en TikTok Ads con reel y carrusel.',
      phase: 'WARM',
      owners: ['cristhian'],
      weight: 'HIGH',
      order: 50,
    },
    {
      title: 'Email urgencia Early Bird / Clase Bonus — Brevo',
      description: 'Enviar email de urgencia Early Bird y Clase Bonus por Brevo a toda la lista.',
      phase: 'WARM',
      owners: ['cristhian'],
      weight: 'HIGH',
      order: 51,
    },
    {
      title: 'Email urgencia Early Bird / Clase Bonus — SendFox',
      description: 'Enviar email de urgencia Early Bird y Clase Bonus por SendFox (Sahian).',
      phase: 'WARM',
      owners: ['sahian'],
      weight: 'MEDIUM',
      order: 52,
    },
    // CLOSE — nuevas tareas
    {
      title: 'Email push semana 3 — último llamado Early Bird — SendFox',
      description: 'Enviar email de último llamado Early Bird por SendFox (Sahian).',
      phase: 'CLOSE',
      owners: ['sahian'],
      weight: 'HIGH',
      order: 53,
    },
    {
      title: 'Ads TikTok: retargeting + últimos cupos activos',
      description: 'Activar campaña de retargeting y últimos cupos en TikTok Ads con reel y carrusel.',
      phase: 'CLOSE',
      owners: ['cristhian'],
      weight: 'HIGH',
      order: 54,
    },
    {
      title: 'Reel retargeting + reel últimos cupos — orgánico',
      description: 'Publicar orgánicamente el reel de retargeting y el reel de últimos cupos (con spoiler de diapositivas del taller).',
      phase: 'CLOSE',
      owners: ['andres'],
      weight: 'MEDIUM',
      order: 55,
    },
    {
      title: 'Email anuncio del LIVE gratuito — SendFox',
      description: 'Enviar email anunciando el LIVE gratuito mensual por SendFox (Sahian).',
      phase: 'CLOSE',
      owners: ['sahian'],
      weight: 'MEDIUM',
      order: 56,
    },
    // EXEC — nuevas tareas
    {
      title: 'Email grabación LIVE Gratuito a registrados de Streamyard',
      description: 'Enviar email a los registrados del LIVE gratuito en Streamyard con el link a la grabación, promoviendo también el taller que arranca.',
      phase: 'EXEC',
      owners: ['cristhian'],
      weight: 'MEDIUM',
      order: 57,
    },
    {
      title: 'Micro campaña Kommo — últimos cupos',
      description: 'Activar micro campaña en Kommo de últimos cupos el lunes previo al taller (1 día antes).',
      phase: 'EXEC',
      owners: ['sahian'],
      weight: 'HIGH',
      order: 58,
    },
    {
      title: 'Encuesta a miembros post-sesión 2',
      description: 'Enviar encuesta de satisfacción a los inscritos al finalizar la Sesión 2 del taller.',
      phase: 'EXEC',
      owners: ['sahian'],
      weight: 'LOW',
      order: 59,
    },
  ]

  let created = 0
  for (const task of newTasks) {
    const exists = await prisma.task.findFirst({
      where: { templateId: tid, title: task.title },
    })
    if (exists) {
      console.log(`⏭️  Ya existe: "${task.title}"`)
      continue
    }
    await prisma.task.create({ data: { ...task, templateId: tid } })
    created++
    console.log(`➕ Creada: "${task.title}"`)
  }

  console.log(`\n✅ Migración v2 completada. Tareas nuevas: ${created}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
