import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Cada entrada: [título parcial para match, nueva fase, nuevo order]
const TASK_MAP: [string, string, number][] = [
  // ── SEMANA 1 — Lanzamiento (PREP) ─────────────────────────────────────────
  // Notion: grabación reels → artworks → email Brevo → email SendFox → reel lanzamiento
  // → ads Meta → ads TikTok → setup Kommo → plantillas Kommo → workbook → plan ads → landing → Circle
  ['Grabación de todos los reels',                         'PREP',     1],
  ['Artworks estáticos',                                   'PREP',     2],
  ['Anuncio del taller — Email Brevo',                     'PREP',     3],
  ['Anuncio del taller — Email SendFox',                   'PREP',     4],
  ['Reel + historia — Anuncio del taller',                 'PREP',     5],
  ['Anuncio principal del taller activo — Meta Ads',       'PREP',     6],  // ← mueve de WARM
  ['Ads TikTok: anuncio principal activo',                 'PREP',     7],
  ['Setup funnel Kommo taller nuevo',                      'PREP',     8],
  ['Setup Plantillas mensajes Kommo',                      'PREP',     9],
  ['Workbook, diapositivas y Zoom links',                  'PREP',    10],
  ['Plan de anuncios — GSheet',                            'PREP',    11],
  ['Landing page del taller',                              'PREP',    12],
  ['Material del taller publicado en Circle',              'PREP',    13],

  // ── SEMANA 2 — Early Bird (WARM) ──────────────────────────────────────────
  // Notion: ads Meta EB → ads TikTok EB → email EB Brevo → email EB SendFox
  // → push Kommo → reel EB → encuesta → espacio Circle → LIVE L+
  ['Anuncio Early Bird activo — Meta Ads',                 'WARM',    14],
  ['Ads TikTok: anuncio Early Bird activo',                'WARM',    15],
  ['Email urgencia Early Bird / Clase Bonus — Brevo',      'WARM',    16],
  ['Email urgencia Early Bird / Clase Bonus — SendFox',    'WARM',    17],
  ['Push pipeline Kommo',                                  'WARM',    18],
  ['Reel Early Bird / Clase Bonus',                        'WARM',    19],
  ['Pregunta o encuesta interactiva',                      'WARM',    20],
  ['Creación del espacio del taller en Circle',            'WARM',    21],  // ← mueve de PREP
  ['LIVE exclusivo para miembros L+',                      'WARM',    22],

  // ── SEMANA 3 — Clase Bonus (CLOSE) ────────────────────────────────────────
  // Notion: email último llamado EB Brevo → email SendFox → reel urgencia
  // → push Kommo cierre EB → envío material → Clase Bonus Zoom
  ['Push semana 3 — último llamado Early Bird (Brevo)',    'CLOSE',   23],
  ['Email push semana 3 — último llamado Early Bird — SendFox', 'CLOSE', 24],
  ['Reel de urgencia — últimas horas para la clase bonus', 'CLOSE',   25],
  ['Push Kommo — "hasta hoy puedes acceder',               'CLOSE',   26],
  ['Envío de material Clase Bonus',                        'CLOSE',   27],  // ← mueve de WARM
  ['Clase Bonus en vivo — Zoom',                           'CLOSE',   28],

  // ── SEMANA 4 — Retargeting + LIVE (RETARGET) ──────────────────────────────
  // Notion: retargeting Meta → retargeting TikTok → reel retargeting orgánico
  // → contenido orgánico → email LIVE Brevo → email LIVE SendFox
  // → reel LIVE IG + ManyChat → pautar LIVE Meta → LIVE YouTube/TikTok
  // → video TikTok → TikTok Ads → últimos cupos Meta
  ['Retargeting activo — Meta Ads',                        'RETARGET', 29],  // ← mueve de CLOSE
  ['Ads TikTok: retargeting + últimos cupos activos',      'RETARGET', 30],  // ← mueve de CLOSE
  ['Reel retargeting + reel últimos cupos — orgánico',     'RETARGET', 31],
  ['Reel orgánico semanal',                                'RETARGET', 32],  // ← mueve de WARM
  ['Anuncio del LIVE gratuito — Email Brevo',              'RETARGET', 33],  // ← mueve de CLOSE
  ['Email anuncio del LIVE gratuito — SendFox',            'RETARGET', 34],
  ['Reel LIVE en Instagram + flujo ManyChat',              'RETARGET', 35],  // ← mueve de CLOSE
  ['Pautar reel LIVE en Meta Ads',                         'RETARGET', 36],  // ← mueve de CLOSE
  ['LIVE gratuito mensual — YouTube',                      'RETARGET', 37],  // ← mueve de CLOSE
  ['Video LIVE en TikTok',                                 'RETARGET', 38],  // ← mueve de CLOSE
  ['Pautar video LIVE en TikTok Ads',                      'RETARGET', 39],  // ← mueve de CLOSE
  ['Últimos cupos activo — Meta Ads',                      'RETARGET', 40],  // ← mueve de CLOSE

  // ── SEMANA 5 — Taller en vivo (EXEC) ──────────────────────────────────────
  // Notion: email grabación LIVE streamyard → email último llamado → kommo últimos cupos
  // → verificar copy ads → contenido orgánico → comunicar cambio fecha
  // → sesión 1 → micro campaña kommo post S1 → sesión 2 → encuesta
  ['Email grabación LIVE Gratuito a registrados de Streamyard', 'EXEC', 41],
  ['Email último llamado (Brevo)',                         'EXEC',    42],  // ← mueve de CLOSE
  ['Micro campaña Kommo — últimos cupos',                  'EXEC',    43],
  ['Verificar copy de ads Meta',                           'EXEC',    44],
  ['Contenido orgánico de último llamado en RRSS',         'EXEC',    45],
  ['Comunicación cambio de fecha',                         'EXEC',    46],
  ['Sesión 1 del taller en vivo',                          'EXEC',    47],
  ['Micro campaña Kommo — Post Sesión 1',                  'EXEC',    48],
  ['Sesión 2 del taller en vivo',                          'EXEC',    49],
  ['Encuesta a miembros post-sesión 2',                    'EXEC',    50],

  // ── SEMANA 6 — Post-taller (POST) ─────────────────────────────────────────
  // Notion: grabaciones Circle + diplomas → email post-taller → WhatsApp grabaciones
  // → presentación siguiente taller → L+70 en vivo → promo 1 Brevo → push Kommo → promo 2
  ['Grabaciones publicadas en Circle',                     'POST',    51],
  ['Email post-taller (Brevo)',                            'POST',    52],
  ['WhatsApp inscritos — grabaciones disponibles',         'POST',    53],
  ['Presentación del siguiente taller + oferta L+70',      'POST',    54],
  ['Oferta L+70 — presentación en vivo post-taller',       'POST',    55],
  ['Oferta L+70 — Email Brevo Promo 1',                    'POST',    56],
  ['Push Oferta L+70 por Kommo',                           'POST',    57],
  ['Oferta L+70 — Email Brevo Promo 2',                    'POST',    58],
]

async function main() {
  console.log('🔄 Reordenando ciclo por semanas (Notion order)...')

  const template = await prisma.cycleTemplate.findFirst({ orderBy: { createdAt: 'asc' } })
  if (!template) throw new Error('No se encontró ningún CycleTemplate.')
  const tid = template.id

  let updated = 0
  let notFound: string[] = []

  for (const [match, phase, order] of TASK_MAP) {
    const task = await prisma.task.findFirst({
      where: { templateId: tid, title: { contains: match }, archived: false },
    })
    if (!task) {
      notFound.push(match)
      continue
    }
    await prisma.task.update({
      where: { id: task.id },
      data: { phase: phase as any, order },
    })
    updated++
  }

  console.log(`✅ Tareas actualizadas: ${updated}`)
  if (notFound.length > 0) {
    console.log(`⚠️  No encontradas (${notFound.length}):`)
    notFound.forEach((t) => console.log(`   - "${t}"`))
  }
  console.log('\n✅ Reordenamiento completado.')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
