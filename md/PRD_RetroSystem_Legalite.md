# PRD — Legalité Retro System
**Versión:** 1.0  
**Fecha:** Mayo 2026  
**Owner:** Cristhian Heredia  
**Estado:** Listo para desarrollo

---

## 1. Contexto y problema

Escuela Legalité opera un ciclo mensual de talleres virtuales de derecho administrativo. Cada ciclo involucra ~31 tareas distribuidas en 5 fases operativas (Preparación, Calentamiento, Cierre/Urgencia, Ejecución, Post-Taller) y 4 responsables: Cristhian, Andrés, Sahian y Sandra.

Actualmente no existe un sistema que permita:
- Documentar el estándar operativo del ciclo como fuente de verdad única
- Evaluar al cierre de cada ciclo qué se ejecutó y con qué efectividad
- Generar un reporte estructurado por ciclo para tomar decisiones en el siguiente
- Acumular aprendizajes históricos entre ciclos

El resultado es que cada ciclo empieza desde cero sin memoria institucional, con errores que se repiten y sin métricas de operación.

---

## 2. Objetivo del producto

Construir una aplicación web interna que permita al equipo de Legalité:

1. **Gestionar el ciclo estándar** como plantilla editable
2. **Ejecutar retrospectivas** por ciclo, capturando ejecución y efectividad por tarea
3. **Generar un reporte de lectura** estructurado al cierre de cada retro
4. **Acumular historial** de ciclos para identificar patrones en el tiempo

**North star metric del producto:** reducir brechas operativas repetidas entre ciclos consecutivos.

---

## 3. Usuarios

| Usuario | Rol en el sistema |
|---|---|
| Cristhian | Admin. Gestiona el ciclo estándar, inicia retros, lee reportes |
| Andrés | Participante. Llena su sección de retro |
| Sahian | Participante. Llena su sección de retro |
| Sandra | Participante. Llena su sección de retro |

No hay roles de autenticación diferenciados en v1. Acceso por URL directa.

---

## 4. Historias de usuario

### Módulo A — Ciclo Estándar (Template)

**A1.** Como Cristhian, quiero ver todas las tareas del ciclo ordenadas por fase, con su descripción, responsable(s) y criterios de referencia, para tener la fuente de verdad del proceso en un solo lugar.

**A2.** Como Cristhian, quiero poder editar una tarea existente (título, descripción, responsables, fase, orden) para afinar el ciclo estándar después de cada retro.

**A3.** Como Cristhian, quiero poder agregar o eliminar tareas del ciclo estándar para que el template evolucione con el negocio.

**A4.** Como Cristhian, quiero ver un historial de versiones del ciclo estándar para entender cómo ha evolucionado el proceso.

---

### Módulo B — Retrospectiva por Ciclo

**B1.** Como Cristhian, quiero crear una nueva retro asociada a un ciclo específico (ej. "Taller Mayo 2026"), que tome como base el snapshot del ciclo estándar en ese momento.

**B2.** Como cualquier miembro del equipo, quiero acceder a la retro de mi ciclo y, por cada tarea que me corresponde, marcar si la ejecuté o no, calificar su efectividad del 1 al 5, y agregar una nota libre.

**B3.** Como Cristhian, quiero ver en tiempo real qué porcentaje del equipo ha completado su sección de retro, para hacer seguimiento antes de la reunión de cierre.

**B4.** Como Cristhian, quiero que el sistema distinga entre tareas que "no aplican" para un ciclo específico (ej. no hubo sesión bonus) y tareas que simplemente no se ejecutaron.

**B5.** Como equipo, queremos poder llenar la retro de forma asíncrona y que los datos se consoliden automáticamente.

---

### Módulo C — Reporte de Ciclo

**C1.** Como Cristhian, quiero generar un reporte de lectura del ciclo cerrado que muestre de forma clara: score de ejecución, score de efectividad promedio, breakdown por fase y tabla de tareas con notas.

**C2.** Como Cristhian, quiero que el reporte identifique automáticamente las brechas críticas (tareas de alta ponderación no ejecutadas o con efectividad baja) y las liste como alertas.

**C3.** Como Cristhian, quiero que el reporte incluya una sección de recomendaciones para el siguiente ciclo, generadas por reglas basadas en los datos (no IA en v1).

**C4.** Como Cristhian, quiero poder exportar el reporte como PDF para guardarlo en Notion o compartirlo con Andrés.

---

### Módulo D — Historial

**D1.** Como Cristhian, quiero ver la lista de todos los ciclos con retro completada, con su score de ejecución e impacto, para comparar la evolución en el tiempo.

**D2.** Como Cristhian, quiero poder ver qué tareas han tenido brechas en 2 o más ciclos consecutivos, para priorizarlas en la siguiente revisión del ciclo estándar.

---

## 5. Funcionalidades por módulo (scope v1)

### Módulo A — Ciclo Estándar

- Vista de lista del ciclo completo ordenado por fase
- CRUD de tareas: crear, editar, reordenar, archivar
- Campos por tarea: título, descripción, fase, responsable(s), ponderación (alta / media / baja)
- Versioning simple: cada vez que se guarda un cambio al template, se crea un snapshot con fecha

### Módulo B — Retrospectiva

- Crear retro: nombre del ciclo, fecha, snapshot del template en ese momento
- Vista de retro dividida por persona activa (selector de persona, sin auth)
- Por cada tarea, capturar:
  - Estado: `Hecho` / `No hecho` / `No aplica`
  - Efectividad: escala 1–5 (solo visible si estado = Hecho)
  - Nota libre: texto abierto
- Guardado automático al cambiar cualquier campo (no requiere botón "guardar")
- Indicador de progreso por persona y global

### Módulo C — Reporte

- Página de reporte generada al marcar la retro como cerrada
- Secciones del reporte:
  1. **Encabezado:** ciclo, fecha, participantes
  2. **Scores globales:** % ejecución, promedio de efectividad (1–5)
  3. **Breakdown por fase:** score de ejecución e impacto por fase, con barra visual
  4. **Tabla de tareas:** estado, efectividad, responsable, nota (colapsable por fase)
  5. **Brechas detectadas:** tareas no ejecutadas con ponderación alta o media
  6. **Recomendaciones para el siguiente ciclo:** generadas por reglas (ver sección 6)
- Exportación a PDF desde el browser (print-to-PDF optimizado con CSS)

### Módulo D — Historial

- Lista de ciclos con retro cerrada
- Métricas por ciclo: % ejecución, promedio efectividad, # brechas
- Vista de brechas recurrentes (tareas con brecha en ≥2 ciclos)

---

## 6. Lógica de scores y recomendaciones

### Score de ejecución
```
% Ejecución = (tareas con estado "Hecho") / (tareas totales - tareas "No aplica") × 100
```

### Score de efectividad
```
Efectividad promedio = suma de calificaciones (1–5) / cantidad de tareas con estado "Hecho"
```

### Ponderación por fase (para alertas)

| Fase | Ponderación |
|---|---|
| Preparación | Media |
| Calentamiento | Media |
| Cierre y Urgencia | Alta |
| Ejecución | Alta |
| Post-Taller | Media |

Una brecha es **crítica** si la tarea tiene ponderación Alta y estado "No hecho".

### Reglas de recomendaciones (v1)

| Condición | Recomendación generada |
|---|---|
| Fase "Cierre" con ejecución < 60% | "Reforzar el protocolo de urgencia de la última semana. Revisar si los mensajes de Kommo están activos con al menos 7 días de anticipación." |
| Tarea "Email última llamada" = No hecho | "Activar recordatorio en Brevo 3 días antes del taller para no omitir el email de cierre." |
| Efectividad promedio de Ads < 3 | "Evaluar creativos con Sandra antes del siguiente ciclo. Considerar split test de copy." |
| Post-Taller ejecución < 70% | "El post-taller es la ventana más rentable para L+. Agendar bloque de 2h el día siguiente al taller para ejecutar este bloque completo." |
| Certificados = No hecho | "Definir responsable fijo para certificados antes del siguiente ciclo." |
| Oferta L+ dentro del taller = No hecho | "Agregar slide de L+ al deck del taller como recordatorio para Andrés." |

---

## 7. Stack técnico

### Framework
- **Next.js 14** (App Router)

### Base de datos
- **Neon** (Postgres serverless, tier gratuito)
- ORM: **Prisma**

### UI
- **Tailwind CSS**
- Componentes propios (sin librería de UI externa en v1 para mantener el bundle liviano)

### Exportación PDF
- CSS `@media print` optimizado, activado con `window.print()` desde el reporte
- Sin dependencia de Puppeteer en v1 (simplifica el deploy)

### Deploy
- **Vercel** (tier gratuito, deploy automático desde GitHub)
- Variables de entorno: `DATABASE_URL` (Neon connection string)

### Repositorio
- GitHub, rama `main` conectada a Vercel para deploy automático en cada push

---

## 8. Modelo de datos (Prisma schema)

```prisma
model CycleTemplate {
  id        String   @id @default(cuid())
  version   Int
  createdAt DateTime @default(now())
  tasks     Task[]
  retros    Retro[]
}

model Task {
  id           String        @id @default(cuid())
  title        String
  description  String
  phase        Phase
  owners       String[]
  weight       Weight        @default(MEDIUM)
  order        Int
  archived     Boolean       @default(false)
  templateId   String
  template     CycleTemplate @relation(fields:[templateId], references:[id])
  retroItems   RetroItem[]
}

model Retro {
  id          String        @id @default(cuid())
  name        String        // ej. "Taller Mayo 2026"
  cycleDate   DateTime
  status      RetroStatus   @default(OPEN)
  createdAt   DateTime      @default(now())
  closedAt    DateTime?
  templateId  String
  template    CycleTemplate @relation(fields:[templateId], references:[id])
  items       RetroItem[]
}

model RetroItem {
  id           String       @id @default(cuid())
  retroId      String
  retro        Retro        @relation(fields:[retroId], references:[id])
  taskId       String
  task         Task         @relation(fields:[taskId], references:[id])
  person       String       // "cristhian" | "andres" | "sahian" | "sandra"
  status       ItemStatus?  // DONE | NOT_DONE | NA
  effectiveness Int?        // 1–5, solo si status = DONE
  note         String?
  updatedAt    DateTime     @updatedAt
}

enum Phase {
  PREP
  WARM
  CLOSE
  EXEC
  POST
}

enum Weight {
  HIGH
  MEDIUM
  LOW
}

enum RetroStatus {
  OPEN
  CLOSED
}

enum ItemStatus {
  DONE
  NOT_DONE
  NA
}
```

---

## 9. Rutas de la aplicación

| Ruta | Descripción |
|---|---|
| `/` | Dashboard: lista de retros activas e historial |
| `/cycle` | Vista y edición del ciclo estándar (template) |
| `/retro/new` | Crear nueva retro |
| `/retro/[id]` | Llenar retro (selector de persona + tareas) |
| `/report/[id]` | Reporte de lectura del ciclo cerrado |
| `/history` | Historial de ciclos con scores comparativos |

---

## 10. Criterios de aceptación (MVP)

- [ ] El ciclo estándar muestra las 31 tareas en 5 fases y es editable
- [ ] Se puede crear una retro nueva desde el template actual
- [ ] Cada persona puede seleccionar su nombre y llenar su sección de forma independiente
- [ ] Los cambios se guardan automáticamente (sin botón guardar)
- [ ] El reporte se genera al cerrar la retro y muestra score de ejecución, score de efectividad y brechas
- [ ] El reporte es imprimible como PDF desde el browser
- [ ] El historial muestra los ciclos anteriores con sus scores

---

## 11. Fuera de scope (v1)

- Autenticación con login/password o SSO
- Notificaciones por email o WhatsApp cuando alguien completa su retro
- Integración directa con Notion (export manual como PDF)
- Generación de recomendaciones con IA
- Aplicación móvil nativa
- Multi-tenant (el sistema es exclusivo para el equipo Legalité)

---

## 12. Criterios para v2 (backlog)

- Push automático del reporte a Notion vía API
- Generación de recomendaciones con OpenAI basada en el historial
- Autenticación básica (NextAuth con credenciales)
- Notificación por WhatsApp a cada persona cuando se abre una retro nueva
- Comparativa visual entre dos ciclos seleccionados

---

## 13. Ciclo de datos iniciales (seed)

Al instalar la app, el script de seed carga:

- 1 CycleTemplate con versión 1
- 31 tareas distribuidas en 5 fases (Preparación, Calentamiento, Cierre/Urgencia, Ejecución, Post-Taller)
- Responsables por tarea según la asignación actual del equipo
- Ponderación inicial por tarea según la tabla de la sección 6

---

*Documento generado para uso en Claude Code. Cualquier decisión de implementación no cubierta aquí debe resolverse priorizando simplicidad y velocidad de deploy.*
