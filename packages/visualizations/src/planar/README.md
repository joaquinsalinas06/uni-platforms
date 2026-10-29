# Geometría plana

Familia `planar`, construida sobre `VisualizationCanvas`. EDA valida su contrato
con `planarSchema` en `apps/eda/src/lib/schemas.ts`, tanto en frontmatter como en
MDX. No confundir con `geometric`: esa familia representa llave × tiempo.

```yaml
visualization:
  type: planar
  steps:
    - note: El rayo sube desde Q hasta el primer segmento.
      planar:
        bounds: [-1, 0, 12, 12]
        mode: ray
        query: {x: 4, y: 3}
        segments:
          - {id: A, label: A, from: [1, 7], to: [10, 9]}
```

Cada escena puede incluir `points`, `segments`, `polygons`, `query`, `range`,
`sweepX`, `xLabel` y `yLabel`. Los límites `[xmin,ymin,xmax,ymax]` deben ser
crecientes y mantenerse entre pasos de una misma escena. Los polígonos admiten
`labelAt: [x,y]` para ubicar su etiqueta dentro de una cara cóncava. IDs únicos
por escena; coordenadas finitas, negativas o decimales.

- `parity`: comprueba frontera primero y luego cuenta cruces hacia +x. Los
  intervalos semiabiertos evitan duplicar vértices; dos contribuciones de un
  roce se cancelan. Varias caras se prueban por separado, no sumando sus cruces.
- `ray`: primer impacto hacia arriba (default) o hacia la derecha. Incluye
  segmentos colineales y devuelve todos los segmentos empatados; un impacto
  geométrico compartido se marca una sola vez. El rayo termina en la respuesta.
- `dominance`: selecciona `point.x <= query.x && point.y <= query.y`; muestra
  rayos verticales de los puntos y el rayo horizontal izquierdo de la consulta.
- `range`: selecciona puntos en `[xmin,ymin,xmax,ymax]`, bordes incluidos.
- `sweep`: ordena segmentos no verticales por altura de cruce con `sweepX` y
  cuenta cruces de verticales coincidentes. `sweepAfter` retira segmentos que
  terminan en esa x después de las consultas. Un empate de altura es un evento,
  no una prueba de que el orden del árbol se actualice automáticamente.

`showRay: false` y `showHits: false` permiten introducir la entrada antes de
revelar el resultado. Los estados usan el vocabulario del canvas. Las notas
explican el paso; las etiquetas SVG deben ser breves.

«Explorar» permite arrastrar la consulta, la ventana de rango o el barrido,
y ofrece sliders de teclado y restablecer. Si el primer paso solo presenta la
entrada, abre el primer paso de la escena que tenga una consulta.

Pruebas: `node --test packages/visualizations/src/planar/layout.test.ts`.
Las consultas del mapa original se verifican en
`apps/eda/src/visualizations/planar/examples.test.ts`.
