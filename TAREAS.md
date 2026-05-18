# TAREAS — Ecosistema Legalité

> Documento de seguimiento de progreso. Se actualiza en cada sesión de trabajo.
> Última actualización: 17 mayo 2026

---

## Leyenda de estados

| Estado | Significado |
|--------|-------------|
| ✅ Hecho | Completado y verificado |
| 🔄 En curso | Trabajo iniciado, pendiente de terminar |
| ⏳ Pendiente | No iniciado aún |
| 🚫 Bloqueado | Necesita algo externo para avanzar |
| 💬 En revisión | Esperando confirmación de Cristhian |

---

## FASE 0 — Fundamentos del repo

| # | Tarea | Estado | Sesión | Notas |
|---|-------|--------|--------|-------|
| 0.1 | Renombrar repo a `legalite` | ✅ Hecho | 2026-05-17 | Antes: `legalite-reportes` |
| 0.2 | Agregar `BRIEFING.md` a la raíz | ✅ Hecho | 2026-05-17 | Documento de referencia del ecosistema |
| 0.3 | Crear `TAREAS.md` para gestión de progreso | ✅ Hecho | 2026-05-17 | Este archivo |
| 0.4 | Crear estructura de carpetas (`data/`, `tools/`) | ✅ Hecho | 2026-05-17 | Sin archivos de datos aún |

---

## FASE 1 — Estructura de datos

| # | Tarea | Estado | Sesión | Notas |
|---|-------|--------|--------|-------|
| 1.1 | Crear `data/ventas.csv` con headers | ⏳ Pendiente | — | Esperar confirmación de campos finales |
| 1.2 | Crear `data/planes/plan-semanal.md` | ⏳ Pendiente | — | Cristhian define la estructura base |
| 1.3 | Crear `data/mensajes/mensajes-validados.md` | ⏳ Pendiente | — | Mensajes aprobados de Sahian |
| 1.4 | Crear `data/metricas/resumen.md` placeholder | ⏳ Pendiente | — | Se llena vía n8n |

---

## FASE 2 — Automatización n8n

| # | Tarea | Estado | Sesión | Notas |
|---|-------|--------|--------|-------|
| 2.1 | Configurar webhook n8n para recibir datos de ventas | ⏳ Pendiente | — | Entrada desde Claude de Sahian |
| 2.2 | n8n escribe fila en `ventas.csv` vía GitHub API | ⏳ Pendiente | — | Depende de 1.1 |
| 2.3 | n8n sincroniza con Google Sheets (1x día) | ⏳ Pendiente | — | Receptor contable |
| 2.4 | n8n Schedule calcula métricas y escribe `resumen.md` | ⏳ Pendiente | — | Depende de 2.2 |
| 2.5 | n8n distribuye métricas a Notion vía API | ⏳ Pendiente | — | Depende de 2.4 |

---

## FASE 3 — Dashboard para Andrés

| # | Tarea | Estado | Sesión | Notas |
|---|-------|--------|--------|-------|
| 3.1 | Revisar `dashboard/index.html` existente | ⏳ Pendiente | — | No reemplazar sin confirmación |
| 3.2 | Conectar dashboard a fuente de métricas | ⏳ Pendiente | — | Google Sheets API o `resumen.md` |
| 3.3 | Validar vista sin login para Andrés | ⏳ Pendiente | — | Solo lectura |

---

## FASE 4 — Herramientas (`tools/`)

| # | Tarea | Estado | Sesión | Notas |
|---|-------|--------|--------|-------|
| 4.1 | Generador de diplomas (`tools/diplomas/`) | ⏳ Pendiente | — | En desarrollo o ya existe |

---

## Log de sesiones

| Fecha | Resumen de lo trabajado |
|-------|------------------------|
| 2026-05-17 | Inicio del proyecto: renombre de repo, BRIEFING.md, TAREAS.md, estructura de carpetas |

