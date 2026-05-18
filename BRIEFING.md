# BRIEFING — repositorio `cristhianheredia/legalite`

> Documento de referencia para Claude Code. Última actualización: 17 mayo 2026.
> No reemplazar ni eliminar contenido existente en el repo sin confirmación explícita.

---

## Contexto del proyecto

Este repo es el ecosistema operativo de **Escuela Legalité** (Fideslaw), academia de derecho administrativo en Ecuador liderada por Andrés Moreta (@profedelderecho).

**Actores del sistema:**
- **Cristhian** — estratega, produce planes, mensajes y assets. Trabaja con Claude Pro + local (Coworker) + Notion.
- **Sahian** — asistente operativa, atiende leads, registra ventas, publica contenido. Trabaja con Claude Pro.
- **Andrés** — cliente/instructor, consume métricas desde el dashboard sin login.

---

## Estructura objetivo del repo

Respetar lo que ya existe. Crear solo lo que falta según esta estructura:

```
legalite/
├── dashboard/           ← home del repo, centro de métricas para Andrés (HTML)
│   └── index.html       ← ya existe, no reemplazar
├── data/                ← fuente de verdad, no interactivo
│   ├── ventas.csv       ← registro de ventas (fuente de verdad del sistema)
│   ├── planes/          ← planes semanales/mensuales en MD
│   ├── mensajes/        ← mensajes validados para Sahian en MD
│   └── metricas/        ← resúmenes de métricas en MD
└── tools/               ← herramientas interactivas y publicables
    └── diplomas/        ← generador de diplomas (ya existe o en desarrollo)
```

---

## Flujo 1 — Registro de ventas

1. Cliente paga y responde datos por WhatsApp/Kommo
2. Sahian pega el mensaje en su Claude Pro
3. Claude estructura los datos y llama webhook de n8n con los datos limpios
4. n8n escribe la fila en `data/ventas.csv` (este repo, vía GitHub API)
5. n8n también escribe en Google Sheets (receptor contable, 1x día)

**Campos del CSV de ventas:**
`fecha, taller, nombre_completo, cedula, telefono, ciudad, correo, factura, monto`

---

## Flujo 2 — Distribución de métricas

1. n8n Schedule lee `data/ventas.csv` periódicamente
2. Calcula totales y escribe `data/metricas/resumen.md`
3. Distribuye a: Notion (API), Google Sheets (contable), Dashboard HTML

**El dashboard HTML en `dashboard/` lee desde Google Sheets API o desde el MD de métricas.**

---

## Reglas de operación

- **No eliminar ni reemplazar** archivos existentes sin confirmación
- `data/ventas.csv` es la fuente de verdad; Sheets y Notion son receptores
- Los MD en `data/planes/` y `data/mensajes/` los escribe Cristhian vía Claude
- Sahian solo escribe en `data/ventas.csv` (vía n8n, no directo)
- El dashboard es para Andrés: sin login, lectura solamente
- Frecuencia de sincronización: ventas en tiempo real, métricas cada hora, Sheets 1x día

---

## Stack tecnológico

| Herramienta | Rol |
|---|---|
| GitHub (`cristhianheredia/legalite`) | Fuente de verdad, repo central |
| Claude Pro x2 | Interfaz de trabajo (Cristhian y Sahian) |
| n8n (Railway free) | Automatización y distribución |
| Google Sheets | Receptor contable |
| Notion | Métricas y contexto de Cristhian |
| Local · Coworker | Trabajo offline, git pull del repo |
| Dashboard HTML | Visibilidad para Andrés |
| Kommo | CRM, WhatsApp, pipeline de ventas |
| Brevo | Email marketing, triggered por n8n |

---

## Próximos pasos para Claude Code

1. Crear estructura de carpetas faltantes (`data/`, `tools/`) sin tocar `dashboard/`
2. Crear `data/ventas.csv` con headers: `fecha,taller,nombre_completo,cedula,telefono,ciudad,correo,factura,monto`
3. Crear `data/planes/plan-semanal.md` con estructura base
4. Crear `data/mensajes/mensajes-validados.md` con los mensajes ya aprobados
5. Crear `data/metricas/resumen.md` vacío como placeholder
6. Configurar webhook n8n para escritura en CSV vía GitHub API
