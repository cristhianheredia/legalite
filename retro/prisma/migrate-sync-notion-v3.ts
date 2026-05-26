import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Sincronización con Notion v3 — corregir owners faltantes del ciclo actualizado
// Fuente: "Ciclo del Taller Virtual — Protocolo de Ejecución" (Notion, 2026-05-26)

const ownerUpdates: { match: string; owners: string[] }[] = [
  // Grabación → Andrés (sesión rentada, él hace los reels)
  { match: 'Grabación de todos los reels',                    owners: ['andres'] },

  // Setup Kommo → Cristhian (Notion lo asigna explícitamente a Cristhian)
  { match: 'Setup funnel Kommo taller nuevo',                 owners: ['cristhian'] },

  // Contenido orgánico semana 2 → Andrés
  { match: 'Pregunta o encuesta interactiva',                 owners: ['andres'] },
  { match: 'Testimonio o caso real',                          owners: ['andres'] },

  // Clase Bonus → Andrés (él conduce la clase, él envía el material)
  { match: 'Envío de material Clase Bonus',                   owners: ['andres'] },

  // Pautar LIVE en Meta Ads → Cristhian (él maneja todos los Meta Ads)
  { match: 'Pautar reel LIVE en Meta Ads',                    owners: ['cristhian'] },

  // Presentación L+70 → solo Andrés (Notion: "presentación en vivo (Andrés)")
  { match: 'Oferta L+70 — presentación en vivo',              owners: ['andres'] },
  { match: 'Presentación del siguiente taller',               owners: ['andres'] },

  // Verificar copy → solo Cristhian (ya no incluye a Sandra)
  { match: 'Verificar copy de ads',                           owners: ['cristhian'] },

  // Comunicación cambio de fecha → solo Sahian (maneja WhatsApp de inscritos)
  { match: 'Comunicación cambio de fecha',                    owners: ['sahian'] },
]

async function main() {
  console.log('🔄 Sincronizando owners con Notion v3...')

  const template = await prisma.cycleTemplate.findFirst({ orderBy: { createdAt: 'asc' } })
  if (!template) throw new Error('No se encontró ningún CycleTemplate.')
  const tid = template.id
  console.log(`✅ Template: ${tid} (v${template.version})`)

  let updated = 0
  let notFound: string[] = []

  for (const u of ownerUpdates) {
    const task = await prisma.task.findFirst({
      where: { templateId: tid, title: { contains: u.match }, archived: false },
    })
    if (!task) {
      notFound.push(u.match)
      continue
    }
    await prisma.task.update({
      where: { id: task.id },
      data: { owners: u.owners },
    })
    console.log(`  ✓ "${task.title}" → ${JSON.stringify(u.owners)}`)
    updated++
  }

  console.log(`\n✅ Owners actualizados: ${updated}`)
  if (notFound.length > 0) {
    console.log(`⚠️  No encontradas (${notFound.length}):`)
    notFound.forEach((t) => console.log(`   - "${t}"`))
  }
  console.log('\n✅ Migración v3 completada.')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
