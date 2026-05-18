# CLAUDE.md — DiplomasGen

Guía para agentes de IA que trabajen en este proyecto. Lee esto antes de tocar cualquier archivo.

---

## Qué es este proyecto

**DiplomasGen** es una herramienta web para generar certificados PDF en lote. El usuario sube una plantilla (PNG o PDF), posiciona los campos de texto con drag & drop, sube una lista de estudiantes (CSV o Excel), y descarga un ZIP con un PDF por estudiante.

**Principio fundamental:** todo corre en el browser. No hay backend, no hay base de datos, no hay autenticación. Lo que veas en `src/` es todo el sistema.

**URL en producción:** `https://cristhianheredia.github.io/legalite/tools/diplomas/`  
**Repo de producción:** `cristhianheredia/legalite` → directorio `tools/diplomas/`  
**Repo de desarrollo:** este directorio (`DiplomasGen/`)

---

## Stack y decisiones técnicas

### Framework
- **Vite 8 + React 19 + TypeScript** — `npm run dev` en puerto 5174
- `defineConfig` se importa de `vitest/config` (no de `vite`) para que el campo `test` sea válido en TS

### Estilos
- **Tailwind CSS v4** con el plugin `@tailwindcss/vite` (no `tailwind.config.js` clásico)
- `verbatimModuleSyntax: true` en tsconfig — todos los imports de tipos deben usar `import type` o `import { type X }`

### Editor visual (Step 2)
- **fabric.js v7** monta un `<canvas>` sobre la imagen de la plantilla
- Los dos campos arrastrables (`IText`) tienen eventos `'modified'` (NO `'moved'` — ese nombre no existe en fabric 7.x)
- Las posiciones se capturan en píxeles del canvas y se convierten a PDF points en `coordinateMapper.ts`

### Generación de PDF (Step 4)
- **pdf-lib** escribe el texto sobre el template
- **pdfjs-dist v5+** requiere `canvas: HTMLCanvasElement` como parámetro obligatorio en `page.render()`, además de `canvasContext`
- La función `toPdfCoords()` en `coordinateMapper.ts` convierte coordenadas: el eje Y está invertido (canvas top-left → PDF bottom-left)

### Parsers de datos (Step 3)
- **PapaParse** para CSV — acepta aliases de columnas (ver `csvParser.ts`)
- **read-excel-file** para Excel — se importa como `read-excel-file/browser` (el import default `'read-excel-file'` no tiene export bajo condiciones browser/module)
- **xlsx (SheetJS) está PROHIBIDO** — tiene vulnerabilidades de alta severidad sin fix disponible

### ZIP y descarga
- **JSZip** empaqueta los PDFs
- **FileSaver.js** dispara la descarga — en TypeScript usar `@types/file-saver`

### Deploy
- Build va a `../legalite/tools/diplomas/`
- `base` en `vite.config.ts` debe ser `/legalite/tools/diplomas/`
- El repo legalite usa GitHub Pages desde `main /`

---

## Estructura de archivos

```
src/
├── components/
│   ├── Stepper.tsx          # Barra de progreso visual (4 pasos)
│   ├── TemplateUpload.tsx   # Step 1: drag & drop de plantilla PNG/PDF
│   ├── FieldEditor.tsx      # Step 2: canvas fabric.js con drag de campos
│   ├── CsvUpload.tsx        # Step 3: subir lista, preview tabla
│   └── Generator.tsx        # Step 4: generar PDFs + barra de progreso + ZIP
├── hooks/
│   └── useDiplomaState.ts   # Estado global del flujo (useState, sin Redux)
├── types/
│   └── read-excel-file.d.ts # Declaración de tipos manual para read-excel-file/browser
└── utils/
    ├── coordinateMapper.ts  # toPdfCoords() + sanitizeFilename()
    ├── csvParser.ts         # PapaParse + validación de columnas
    ├── excelParser.ts       # read-excel-file/browser + validación
    ├── pdfGenerator.ts      # pdf-lib: genera PDF por estudiante, JSZip, FileSaver
    └── pdfRenderer.ts       # pdfjs-dist: renderiza página 1 de PDF a dataURL

tests/
├── coordinateMapper.test.ts # Tests de conversión de coords y sanitizeFilename
└── csvParser.test.ts        # Tests de parsing y validación de CSV
```

---

## Historias de usuario

| ID | Como… | Quiero… | Para… |
|----|-------|---------|-------|
| US-01 | Docente | Subir mi plantilla PNG o PDF | Usar mi diseño propio como base del certificado |
| US-02 | Docente | Ver una preview de la plantilla subida | Confirmar que es el archivo correcto antes de continuar |
| US-03 | Docente | Arrastrar el campo de nombre sobre la plantilla | Ubicarlo exactamente donde quiero que aparezca |
| US-04 | Docente | Arrastrar el campo de cédula/ID sobre la plantilla | Ubicarlo en la posición deseada |
| US-05 | Docente | Elegir fuente, tamaño y color para cada campo | Que el texto se vea consistente con el diseño de la plantilla |
| US-06 | Docente | Subir una lista CSV o Excel con nombre y cédula | No tener que escribir cada certificado manualmente |
| US-07 | Docente | Ver una preview de los primeros estudiantes cargados | Verificar que el archivo fue leído correctamente |
| US-08 | Docente | Recibir un error claro si el CSV no tiene las columnas correctas | Saber exactamente qué corregir |
| US-09 | Docente | Hacer clic en "Generar" y ver el progreso en tiempo real | Saber cuántos certificados van siendo creados |
| US-10 | Docente | Descargar automáticamente un ZIP con todos los PDFs | No tener que descargar uno por uno |
| US-11 | Docente | Que los nombres de archivo del ZIP sean legibles | Identificar cada certificado fácilmente |
| US-12 | Docente | Que ningún dato salga de mi computador | Confiar en la herramienta con datos de mis estudiantes |

---

## Reglas de negocio y límites

- Plantilla: solo PNG o PDF, máx. 10 MB, se usa solo la primera página
- Lista: máx. 500 estudiantes por lote
- Columnas del CSV/Excel: case insensitive, acepta aliases (ver `csvParser.ts`)
- Nombres de archivo en el ZIP: sanitizados con `sanitizeFilename()` — elimina puntos, slashes y caracteres especiales (excepto letras españolas, guión, underscore)
- Si falla un certificado individual, se continúa con los demás y se reportan los fallidos al final

---

## Comandos útiles

```bash
npm run dev      # Servidor de desarrollo (puerto 5174)
npm test         # 15 tests unitarios con Vitest
npm run build    # Build de producción (output en dist/)
npm run deploy   # Build + gh-pages (NO usar — el deploy va a legalite/tools/diplomas/)
```

## Cómo actualizar producción

```bash
# 1. Hacer cambios en DiplomasGen/
# 2. Confirmar que los tests pasan
npm test

# 3. Build
npm run build

# 4. Copiar al repo legalite
cp -r dist/. ../legalite/tools/diplomas/

# 5. Commit y push desde legalite/
cd ../legalite
git add tools/diplomas/
git commit -m "chore: actualizar DiplomasGen"
git push
```

---

## Lo que NO hacer

- No instalar `xlsx` (SheetJS) — tiene vulnerabilidades de alta severidad sin fix
- No usar `import readXlsxFile from 'read-excel-file'` — usar `'read-excel-file/browser'`
- No usar `fabric.IText.on('moved', ...)` — el evento es `'modified'`
- No cambiar el `base` en `vite.config.ts` a otra ruta — debe quedar `/legalite/tools/diplomas/`
- No crear backend — la herramienta es 100% client-side por diseño
- No usar `innerHTML` con datos del usuario — XSS
