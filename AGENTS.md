# Uni-Platforms — Guía de Arquitectura, Flujo de Trabajo y Despliegue en Vercel

Este monorepo (`uni-platforms`) aloja las plataformas interactivas de estudio para cursos de computación e ingeniería de UTEC (EDA, CPD, IoT, Redes, etc.).

---

## 1. Arquitectura del Monorepo

- **Tecnologías**: Astro 7 + React 19 + Tailwind v4 + KaTeX + pnpm workspaces + Turborepo.
- **Node.js**: `>=22.12.0` (En producción en Vercel: `24.x`).
- **Gestor de paquetes**: `pnpm@9.15.0`. Nunca usar `npm` ni `yarn`.
- **Estructura**:
  - `apps/eda`: Estructuras de Datos Avanzadas (`eda-platform`).
  - `apps/cpd`: Computación Paralela y Distribuida (`cpd-platform`).
  - `apps/iot`: Internet de las Cosas (`iot-platform`).
  - `apps/redes`: Redes y Comunicaciones (`redes-platform`).
  - `apps/template`: Plantilla base para instanciar nuevos cursos.
  - `packages/visualizations`: Motores y esquemas de visualización compartidos.
  - `packages/ui`: Componentes visuales comunes.

---

## 2. Despliegue en Vercel (Procedimiento Canónico Directo)

> [!IMPORTANT]
> **GitHub y Vercel CLI ya están autenticados** en este entorno:
> - **Usuario Vercel**: `joaquinsalinas06`
> - **Equipo activo**: `joaquin-salinas-projects` (Hobby)
> - **Repositorio GitHub**: `https://github.com/joaquinsalinas06/uni-platforms.git`
>
> **NO intentes comandos exploratorios ni uses `--help`**. Ejecuta directamente la secuencia exacta que se detalla a continuación.

### Paso a Paso para Crear y Vincular una Nueva Plataforma a Vercel

Cuando se crea un nuevo curso (por ejemplo, `apps/redes` con paquete `redes-platform`):

```bash
# 1. Crear el proyecto en Vercel
vercel project add redes-platform

# 2. Configurar el proyecto (Root Directory del monorepo, Framework Astro, Node 24.x)
vercel project update redes-platform --framework astro --root-directory apps/redes --node-version 24.x --yes

# 3. Vincular la carpeta local al proyecto de Vercel (genera .vercel/project.json)
vercel link --cwd apps/redes --project redes-platform --yes

# 4. Conectar el repositorio de GitHub al proyecto de Vercel (habilita CI/CD automático)
vercel git connect --cwd apps/redes --yes
```

### Regla Fundamental sobre Despliegues (Git Push vs. CLI Upload)

- **NUNCA ejecutes `vercel --prod` con subida directa de archivos locales**:
  Las carpetas `raw-materials/` contienen decenas de megabytes de PDFs escaneados y binarios que saturan el búfer de subida de la CLI de Vercel y provocan errores `Error: Upload aborted`.
- **El flujo de despliegue es 100% mediante Git**:
  Una vez ejecutado `vercel git connect`, cada `git push origin main` activa automáticamente el pipeline de CI/CD de Vercel en la nube. Vercel clona el repositorio, ejecuta `pnpm install` respetando el lockfile del monorepo, compila la app en `apps/<nombre>` y despliega a producción con URL asignada automáticamente (e.g. `https://redes-platform-joaquin-salinas-projects.vercel.app`).

```bash
# Para desplegar a producción:
git add apps/<nombre>
git commit -m "feat(<nombre>): agregar contenido de curso"
git push origin main
```

---

## 3. Creación de un Nuevo Curso desde `apps/template`

1. **Clonar la plantilla**:
   ```bash
   cp -R apps/template apps/<nuevo-curso>
   ```

2. **Renombrar en `package.json`**:
   Cambiar `"name": "course-template"` por `"name": "<nuevo-curso>-platform"`.

3. **Copiar y procesar material crudo**:
   - Colocar los PDFs en `apps/<nuevo-curso>/raw-materials/pdfs/`.
   - Extraer texto con `pdftotext -layout <archivo>.pdf apps/<nuevo-curso>/raw-materials/text/<archivo>.txt`.
   - Asegurarse de que `apps/<nuevo-curso>/.vercelignore` ignore `raw-materials/`.

4. **Estructura del Contenido (`content/`)**:
   - `knowledge-map.json`: Fuente de verdad única de unidades (`s1..s7`), temas y relaciones.
   - `units/s1.md..s7.md`: Portadas de cada semana.
   - `topics/<id>/meta.yaml`: Metadatos, prerequisitos y fórmulas (con `reasoning` $\ge 20$ caracteres).
   - `topics/<id>/theory.md`: Exposición teórica rigurosa desglosada con encabezados `##`.
   - `topics/<id>/subtopics/<nombre>.md`: Subtemas individuales con `order` entero.
   - `evaluaciones/`: Parciales y laboratorios resueltos.
   - `formulario.md`: Fórmulas clave del curso.
   - `practica.mdx`: Ejercicios interactivos con `ExerciseBlock`.

5. **Validación y Pruebas**:
   ```bash
   # Validar coherencia del mapa curricular (temas huérfanos, faltantes, sintaxis YAML)
   node apps/<nuevo-curso>/scripts/check-knowledge-map.mjs

   # Compilar la aplicación estática
   pnpm --filter <nuevo-curso>-platform build
   ```

6. **Vincular a Vercel**: Seguir los 4 comandos de la Sección 2.
