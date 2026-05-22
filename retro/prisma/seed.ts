import { PrismaClient, Phase, Weight } from '@prisma/client'

const prisma = new PrismaClient()

const tasks: {
  title: string
  description: string
  phase: Phase
  owners: string[]
  weight: Weight
  order: number
}[] = [
  // PREPARACIÓN
  {
    title: 'Workbook, diapositivas y Zoom links',
    description: 'Preparar el workbook del taller, las diapositivas de cada sesión y los links de Zoom.',
    phase: 'PREP',
    owners: ['cristhian'],
    weight: 'HIGH',
    order: 1,
  },
  {
    title: 'Artworks estáticos (carruseles, emails)',
    description: 'Diseñar los artworks para carruseles de redes sociales y piezas de email.',
    phase: 'PREP',
    owners: ['cristhian', 'sandra'],
    weight: 'MEDIUM',
    order: 2,
  },
  {
    title: 'Plan de anuncios — GSheet',
    description: 'Armar el plan de anuncios pagados en Google Sheets con presupuesto, fechas y creativos.',
    phase: 'PREP',
    owners: ['sandra'],
    weight: 'MEDIUM',
    order: 3,
  },
  {
    title: 'Setup funnel Kommo + plantillas WhatsApp',
    description: 'Configurar el funnel de ventas en Kommo y activar la secuencia de seguimiento por WhatsApp.',
    phase: 'PREP',
    owners: ['sahian'],
    weight: 'HIGH',
    order: 4,
  },
  {
    title: 'Landing page del taller — publicada',
    description: 'Publicar la landing page del taller con toda la información, precio y botón de inscripción activo.',
    phase: 'PREP',
    owners: ['cristhian'],
    weight: 'HIGH',
    order: 5,
  },
  {
    title: 'Anuncio del taller — Email (Brevo + SendFox)',
    description: 'Enviar el email de anuncio del taller a la lista completa de suscriptores.',
    phase: 'PREP',
    owners: ['cristhian'],
    weight: 'MEDIUM',
    order: 6,
  },
  {
    title: 'Reel + historia — Anuncio del taller',
    description: 'Publicar reel e historia en Instagram/TikTok anunciando el taller y la clase bonus.',
    phase: 'PREP',
    owners: ['cristhian'],
    weight: 'MEDIUM',
    order: 7,
  },
  {
    title: 'Grabación de todos los reels del ciclo',
    description: 'Sesión única de grabación de todos los reels: lanzamiento, Early Bird, retargeting y últimos cupos.',
    phase: 'PREP',
    owners: ['cristhian'],
    weight: 'HIGH',
    order: 8,
  },
  {
    title: 'Creación del espacio del taller en Circle',
    description: 'Crear y configurar el espacio del taller en Circle donde se publicarán los materiales.',
    phase: 'PREP',
    owners: ['cristhian'],
    weight: 'MEDIUM',
    order: 9,
  },
  // CALENTAMIENTO
  {
    title: 'Anuncio principal del taller activo — Meta Ads',
    description: 'Activar la campaña principal de anuncios en Meta con reel y carrusel.',
    phase: 'WARM',
    owners: ['sandra'],
    weight: 'HIGH',
    order: 10,
  },
  {
    title: 'Reel orgánico semanal',
    description: 'Publicar reel o historia orgánica para mantener visibilidad y calentar la audiencia.',
    phase: 'WARM',
    owners: ['cristhian'],
    weight: 'MEDIUM',
    order: 11,
  },
  {
    title: 'Testimonio o caso real relacionado al tema',
    description: 'Publicar reel corto con testimonio o caso real que genere credibilidad sobre el contenido del taller.',
    phase: 'WARM',
    owners: ['cristhian'],
    weight: 'LOW',
    order: 12,
  },
  {
    title: 'Reel Early Bird / Clase Bonus',
    description: 'Publicar reel promocionando el acceso Early Bird y la clase bonus para inscritos anticipados.',
    phase: 'WARM',
    owners: ['cristhian'],
    weight: 'MEDIUM',
    order: 13,
  },
  {
    title: 'Anuncio Early Bird activo — Meta Ads',
    description: 'Activar campaña de Early Bird en Meta con reel y carrusel.',
    phase: 'WARM',
    owners: ['sandra'],
    weight: 'HIGH',
    order: 14,
  },
  {
    title: 'Push pipeline Kommo — "falta una semana para la clase bonus"',
    description: 'Enviar push al pipeline de Kommo para activar leads que aún no se han inscrito.',
    phase: 'WARM',
    owners: ['sahian'],
    weight: 'MEDIUM',
    order: 15,
  },
  {
    title: 'Pregunta o encuesta interactiva — tema jurídico',
    description: 'Publicar historia/stories con pregunta o encuesta sobre el tema del taller para generar engagement.',
    phase: 'WARM',
    owners: ['cristhian'],
    weight: 'LOW',
    order: 16,
  },
  {
    title: 'Envío de material Clase Bonus a inscritos',
    description: 'Enviar el material de la Clase Bonus a los inscritos via Circle y grupos de WhatsApp.',
    phase: 'WARM',
    owners: ['cristhian'],
    weight: 'MEDIUM',
    order: 17,
  },
  // CIERRE Y URGENCIA
  {
    title: 'Push semana 3 — último llamado Early Bird (Brevo)',
    description: 'Enviar email de último llamado Early Bird a toda la lista.',
    phase: 'CLOSE',
    owners: ['cristhian'],
    weight: 'HIGH',
    order: 18,
  },
  {
    title: 'Reel de urgencia — últimas horas para la clase bonus',
    description: 'Publicar reel de urgencia comunicando que se acaba el tiempo para acceder al Early Bird.',
    phase: 'CLOSE',
    owners: ['cristhian'],
    weight: 'MEDIUM',
    order: 19,
  },
  {
    title: 'Push Kommo — "hasta hoy puedes acceder a la clase bonus"',
    description: 'Enviar push de cierre de Early Bird al pipeline de Kommo.',
    phase: 'CLOSE',
    owners: ['sahian'],
    weight: 'HIGH',
    order: 20,
  },
  {
    title: 'Clase Bonus en vivo — Zoom',
    description: 'Dictar la clase bonus en vivo por Zoom exclusivamente para inscritos anticipados.',
    phase: 'CLOSE',
    owners: ['andres'],
    weight: 'HIGH',
    order: 21,
  },
  {
    title: 'Anuncio del LIVE gratuito — Email Brevo',
    description: 'Enviar email anunciando el LIVE gratuito mensual a toda la lista.',
    phase: 'CLOSE',
    owners: ['cristhian'],
    weight: 'MEDIUM',
    order: 22,
  },
  {
    title: 'LIVE gratuito mensual — YouTube / TikTok',
    description: 'Dictar el LIVE gratuito mensual en YouTube y TikTok vía Streamyard. Mantiene momentum y promueve el taller.',
    phase: 'CLOSE',
    owners: ['andres'],
    weight: 'HIGH',
    order: 23,
  },
  {
    title: 'Retargeting activo — Meta Ads',
    description: 'Activar campaña de retargeting en Meta con reel y carrusel.',
    phase: 'CLOSE',
    owners: ['sandra'],
    weight: 'HIGH',
    order: 24,
  },
  {
    title: 'Últimos cupos activo — Meta Ads',
    description: 'Activar campaña de últimos cupos en Meta.',
    phase: 'CLOSE',
    owners: ['sandra'],
    weight: 'HIGH',
    order: 25,
  },
  {
    title: 'Email último llamado (Brevo)',
    description: 'Enviar el email de último llamado antes del cierre definitivo de inscripciones.',
    phase: 'CLOSE',
    owners: ['cristhian'],
    weight: 'HIGH',
    order: 26,
  },
  // EJECUCIÓN
  {
    title: 'Comunicación cambio de fecha / confirmación a inscritos',
    description: 'Comunicar confirmación o cambio de fecha a todos los inscritos vía WhatsApp, email y redes sociales.',
    phase: 'EXEC',
    owners: ['cristhian', 'sahian'],
    weight: 'HIGH',
    order: 27,
  },
  {
    title: 'Sesión 1 del taller en vivo — Zoom',
    description: 'Dictar la Sesión 1 del taller. Publicar materiales en Circle y WhatsApp post-sesión.',
    phase: 'EXEC',
    owners: ['andres'],
    weight: 'HIGH',
    order: 28,
  },
  {
    title: 'Micro campaña Kommo — Post Sesión 1',
    description: 'Activar micro campaña en Kommo para reactivar leads calientes tras la primera sesión.',
    phase: 'EXEC',
    owners: ['sahian'],
    weight: 'MEDIUM',
    order: 29,
  },
  {
    title: 'Sesión 2 del taller en vivo — Zoom',
    description: 'Dictar la Sesión 2 del taller. Publicar clip/foto al finalizar para redes sociales.',
    phase: 'EXEC',
    owners: ['andres'],
    weight: 'HIGH',
    order: 30,
  },
  // POST-TALLER
  {
    title: 'Grabaciones publicadas en Circle + Certificados digitales',
    description: 'Publicar las grabaciones de ambas sesiones en Circle y enviar los certificados digitales a todos los inscritos.',
    phase: 'POST',
    owners: ['cristhian'],
    weight: 'HIGH',
    order: 31,
  },
  {
    title: 'Email post-taller (Brevo)',
    description: 'Enviar email post-taller con acceso a grabaciones y próximos pasos para los participantes.',
    phase: 'POST',
    owners: ['cristhian'],
    weight: 'HIGH',
    order: 32,
  },
  {
    title: 'Upsell Legalité+ / Inicio ciclo siguiente taller',
    description: 'Iniciar el próximo ciclo con la base de compradores activos. Promover Legalité+ y el siguiente taller.',
    phase: 'POST',
    owners: ['andres', 'cristhian'],
    weight: 'HIGH',
    order: 33,
  },
]

async function main() {
  console.log('Seeding database...')

  const template = await prisma.cycleTemplate.create({
    data: { version: 1 },
  })

  for (const task of tasks) {
    await prisma.task.create({
      data: { ...task, templateId: template.id },
    })
  }

  console.log(`Created template v1 with ${tasks.length} tasks.`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
