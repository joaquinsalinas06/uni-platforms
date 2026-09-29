# Plantilla de Curso - uni-platforms

Esta plantilla te permite instanciar un curso completo en segundos.

## Para crear un curso nuevo (ej. Big Data):
```bash
cp -R apps/template apps/big-data
```
Cambia el `"name": "big-data-platform"` en `apps/big-data/package.json` y ejecuta:
```bash
pnpm install
pnpm --filter big-data-platform dev
```
