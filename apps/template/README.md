# Plantilla de Curso — uni-platforms

Esta plantilla te permite instanciar un curso completo en el monorepo en segundos.

## 1. Crear un curso nuevo (ej. Big Data):
```bash
cp -R apps/template apps/big-data
```
Cambia el `"name": "big-data-platform"` en `apps/big-data/package.json`.

Ejecuta:
```bash
pnpm install
pnpm --filter big-data-platform dev
```

## 2. Vincular y Desplegar en Vercel (Procedimiento Directo)
GitHub y Vercel CLI ya están autenticados en el entorno (`joaquin-salinas-projects`):

```bash
# 1. Crear el proyecto en Vercel
vercel project add big-data-platform

# 2. Configurar el proyecto (Root Directory, Framework, Node 24.x)
vercel project update big-data-platform --framework astro --root-directory apps/big-data --node-version 24.x --yes

# 3. Vincular la carpeta local (crea .vercel/project.json)
vercel link --cwd apps/big-data --project big-data-platform --yes

# 4. Conectar al repositorio de GitHub para CI/CD automático
vercel git connect --cwd apps/big-data --yes
```

> **Importante**: No uses `vercel --prod` con subida manual de archivos locales (los archivos crudos y PDFs saturan el upload). Despliega siempre mediante `git push origin main`.
