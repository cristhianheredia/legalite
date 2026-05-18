# DiplomasGen

Generador de certificados PDF en lote, 100% en el navegador. Sin servidores, sin instalaciones.

🔗 **App en vivo:** https://cristhianheredia.github.io/legalite/tools/diplomas/

---

## ¿Para qué sirve?

Permite a docentes y organizadores generar certificados o diplomas personalizados para cada estudiante a partir de:

- Una **plantilla** diseñada (PNG o PDF)
- Una **lista de estudiantes** en CSV o Excel

El resultado es un **archivo ZIP** con un PDF individual por estudiante, listo para enviar.

---

## Flujo de uso

```
1. Sube tu plantilla (PNG o PDF, máx. 10 MB)
        ↓
2. Arrastra los campos de Nombre e ID/Cédula sobre la plantilla
   Elige fuente, tamaño y color para cada campo
        ↓
3. Sube tu lista de estudiantes (CSV o Excel)
   Columnas requeridas: nombre | cedula  (o aliases: alumno, id, documento…)
        ↓
4. Haz clic en "Generar" → descarga ZIP con todos los PDFs
```

---

## Formato del archivo de lista

El archivo CSV o Excel debe tener al menos estas dos columnas (nombre insensible a mayúsculas):

| nombre         | cedula     |
|---------------|------------|
| María García  | 1020304050 |
| Juan Pérez    | 9876543210 |

**Aliases aceptados:**
- Nombre: `nombre`, `name`, `alumno`, `estudiante`, `participante`
- Cédula: `cedula`, `cédula`, `id`, `documento`, `dni`, `identificacion`

**Límites:** máx. 500 estudiantes por lote · máx. 10 MB por plantilla

---

## Privacidad

Todos los archivos se procesan **localmente en tu navegador**. Ningún dato se envía a servidores externos.

---

## Desarrollo local

```bash
cd DiplomasGen
npm install
npm run dev        # http://localhost:5174/legalite/tools/diplomas/
npm test           # 15 tests unitarios
npm run build      # Build de producción
```

---

## Stack

| Capa | Tecnología |
|---|---|
| Framework | Vite + React + TypeScript |
| Estilos | Tailwind CSS v4 |
| Editor visual | fabric.js |
| Preview PDF | pdfjs-dist (Mozilla) |
| Generación PDF | pdf-lib |
| CSV | PapaParse |
| Excel | read-excel-file |
| ZIP | JSZip + FileSaver.js |
| Tests | Vitest |
| Deploy | GitHub Pages (repo legalite) |

---

## Deploy

El build vive en `tools/diplomas/` del repo [legalite](https://github.com/cristhianheredia/legalite).

Para actualizar después de cambios en el código fuente:

```bash
# Desde DiplomasGen/
npm run build

# Copiar dist/ al repo legalite
cp -r dist/. ../legalite/tools/diplomas/

# Commit y push desde legalite/
cd ../legalite
git add tools/diplomas/
git commit -m "chore: actualizar DiplomasGen"
git push
```
