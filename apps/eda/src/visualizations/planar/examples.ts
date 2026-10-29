import type { PlanarInput, XY } from '@uni/visualizations/src/planar/layout';

// Edges transcribed visually from Sem4_Planar_Point_Location.pdf, pp. 9/23.
// The slide drawing is schematic; the SVG uses its written coordinates.
export const mapFaces = [
  { id: 'A', label: 'A', labelAt: [4,11] as XY, vertices: [[0,0],[0,4],[2,15],[10,15],[14,8],[8,10]] as XY[], state: 'idle' as const },
  { id: 'B', label: 'B', labelAt: [10,4] as XY, vertices: [[0,0],[8,10],[14,8],[16,13],[20,15],[14,2],[8,0]] as XY[], state: 'idle' as const },
  { id: 'C', label: 'C', labelAt: [18,17] as XY, vertices: [[10,15],[16,21],[23,15],[21,1],[14,2],[20,15],[16,13],[14,8]] as XY[], state: 'idle' as const },
  { id: 'D', label: 'D', labelAt: [25,6] as XY, vertices: [[23,15],[27,5],[21,1]] as XY[], state: 'idle' as const },
];
export const mapSegments = [...new Map(mapFaces.flatMap(face => face.vertices.map((from, i) => {
  const to = face.vertices[(i+1)%face.vertices.length];
  const id = [from.join(','), to.join(',')].sort().join('—');
  return [id, { id, from, to } ] as const;
}))).values()].map((s, i) => ({ ...s, id: `e${i+1}` }));
export const mapLesson = {
  type: 'planar' as const,
  steps: [
    { note: 'Mapa de las diapositivas #9/#23, reconstruido siguiendo sus aristas. Las letras A–D son etiquetas didácticas. Se usan las coordenadas escritas; el dibujo original no está a escala.', planar: { bounds: [-3,-3,30,24], polygons: mapFaces, query: {x:8,y:4}, showRay:false, showHits:false } },
    { note: 'Desde Q=(8,4), el rayo horizontal cruza una vez la frontera de B. Impar significa dentro de B. Contar cruces es un test por cara, no el algoritmo eficiente de barrido.', planar: { bounds: [-3,-3,30,24], polygons: mapFaces, query:{x:8,y:4}, mode:'parity' } },
    { note: 'Q=(4,12) pertenece a A. La prueba usa la misma regla, pero evalúa otro contorno. Compartir una coordenada no determina la cara.', planar: { bounds: [-3,-3,30,24], polygons: mapFaces, query:{x:4,y:12}, mode:'parity' } },
    { note: 'Q=(19,4) está en C, no en B. Puedes mover la consulta en Explorar para ver cómo cambia la cara.', planar: { bounds: [-3,-3,30,24], polygons: mapFaces, query:{x:19,y:4}, mode:'parity' } },
    { note: 'Q=(28,18) queda fuera de todas las caras acotadas: pertenece a la cara infinita. Paridad par para una cara significa fuera de esa cara.', planar: { bounds: [-3,-3,30,24], polygons: mapFaces, query:{x:28,y:18}, mode:'parity' } },
  ] satisfies {note:string;planar:PlanarInput}[],
};
export const parityLesson = {
  type: 'planar' as const,
  steps: [
    { note:'Ejemplo didáctico derivado: un polígono cóncavo. Primero observa su frontera y Q=(3,3), sin contar todavía.', planar:{ bounds:[-3,-2,12,11], polygons:[{id:'P',vertices:[[0,0],[8,0],[8,8],[4,5],[0,8]]}], query:{x:3,y:3},mode:'parity',showRay:false,showHits:false } },
    { note:'El rayo hacia la derecha cruza una vez: al atravesar la frontera cambia de dentro a fuera. Un número impar de cruces deja Q dentro.', planar:{ bounds:[-3,-2,12,11],polygons:[{id:'P',vertices:[[0,0],[8,0],[8,8],[4,5],[0,8]]}],query:{x:3,y:3},mode:'parity' } },
    { note:'Ahora Q=(-2,3). El rayo entra y sale: dos cruces. Un número par significa fuera. Cero cruces también es par.',planar:{bounds:[-3,-2,12,11],polygons:[{id:'P',vertices:[[0,0],[8,0],[8,8],[4,5],[0,8]]}],query:{x:-2,y:3},mode:'parity'} },
    { note:'Q=(8,4) está exactamente en una arista. Se comprueba frontera antes de aplicar paridad: no se debe etiquetar este caso como interior estricto.',planar:{bounds:[-3,-2,12,11],polygons:[{id:'P',vertices:[[0,0],[8,0],[8,8],[4,5],[0,8]]}],query:{x:8,y:4},mode:'parity'} },
    { note:'A la altura del vértice cóncavo, un roce no cambia interior por exterior. Usamos intervalos semiabiertos y cancelamos las dos contribuciones del mismo roce; así no se cuenta dos veces un cruce.',planar:{bounds:[-3,-2,12,11],polygons:[{id:'P',vertices:[[0,0],[8,0],[8,8],[4,5],[0,8]]}],query:{x:-2,y:5},mode:'parity'} },
  ] satisfies {note:string;planar:PlanarInput}[],
};
export const raySegments = [{id:'B',label:'B',from:[1,2] as XY,to:[10,2] as XY},{id:'A',label:'A',from:[2,7] as XY,to:[10,9] as XY},{id:'C',label:'C',from:[7,11] as XY,to:[11,11] as XY}];
export const rayLesson = {
  type:'planar' as const,
  steps:[
    {note:'Ejemplo didáctico derivado. Q=(4,4) consulta hacia arriba. Se dibujan los segmentos completos: sus alturas dependen de la columna x.',planar:{bounds:[-1,0,13,14],segments:raySegments,query:{x:4,y:4},mode:'ray',showRay:false,showHits:false}},
    {note:'El rayo mantiene x=4 y aumenta y. B queda debajo de Q, y C ni siquiera cruza esta columna. Solo A puede ser la respuesta.',planar:{bounds:[-1,0,13,14],segments:raySegments,query:{x:4,y:4},mode:'ray',showHits:false}},
    {note:'Primer impacto en A, a y=7.5. Buscamos la menor altura mayor o igual que y de Q; no contamos todos los cruces como en el test de paridad.',planar:{bounds:[-1,0,13,14],segments:raySegments,query:{x:4,y:4},mode:'ray'}},
    {note:'Al subir Q por encima de A en la misma columna, el rayo ya no toca ningún segmento. La respuesta es sin impacto, no el segmento más cercano por debajo.',planar:{bounds:[-1,0,13,14],segments:raySegments,query:{x:4,y:10},mode:'ray'}},
  ] satisfies {note:string;planar:PlanarInput}[],
};
export const sweepSegments = [{id:'H1',label:'H1',from:[1,3] as XY,to:[6,3] as XY},{id:'H2',label:'H2',from:[4,5] as XY,to:[7,5] as XY},{id:'V1',label:'V1',from:[4,0] as XY,to:[4,5] as XY}];
export const sweepLesson = {
  type:'planar' as const,
  steps:[
    {note:'Ejemplo derivado de activación y consulta (#34–38). La vertical azul barre de izquierda a derecha. H1 y H2 todavía no cruzan el barrido.',planar:{bounds:[-1,-1,9,7],segments:sweepSegments,mode:'sweep',sweepX:0}},
    {note:'x=1: se activa H1 antes de procesar consultas en su extremo izquierdo. El estado guarda su altura y=3.',planar:{bounds:[-1,-1,9,7],segments:sweepSegments,mode:'sweep',sweepX:1}},
    {note:'x=4: primero se activa H2; luego V1 consulta el intervalo y∈[0,5]. Hay dos horizontales activas dentro del intervalo: dos cruces.',planar:{bounds:[-1,-1,9,7],segments:sweepSegments,mode:'sweep',sweepX:4}},
    {note:'x=6, durante las consultas: H1 aún cuenta en su extremo derecho. La regla es activar → consultar → desactivar cuando los eventos comparten x.',planar:{bounds:[-1,-1,9,7],segments:sweepSegments,mode:'sweep',sweepX:6}},
    {note:'Después de las consultas en x=6 se desactiva H1. Solo H2 queda en el estado del barrido.',planar:{bounds:[-1,-1,9,7],segments:sweepSegments,mode:'sweep',sweepX:6,sweepAfter:true}},
    {note:'Después de x=7 también se retira H2. El estado queda vacío. Explorar mueve la vertical; los cruces con V1 aparecen al coincidir con x=4.',planar:{bounds:[-1,-1,9,7],segments:sweepSegments,mode:'sweep',sweepX:7,sweepAfter:true}},
  ] satisfies {note:string;planar:PlanarInput}[],
};
export const crossingLesson = {
  type:'planar' as const,
  steps:[1,2,3].map(x=>({note:x===1?'Antes del cruce: de abajo arriba se encuentran S1 y luego S2. La clave de comparación es la altura en la x actual.':x===2?'En (2,2) se cruzan: ambas alturas coinciden. El empate es un evento; justo después hay que actualizar el orden, no conservar un comparador con claves obsoletas.':'Después del cruce: S2 queda debajo de S1. En un mapa planar las aristas no se cruzan en su interior; este ejemplo pertenece al caso general de segmentos.',planar:{bounds:[-1,-1,5,5] as [number,number,number,number],segments:[{id:'S1',label:'S1',from:[0,0] as XY,to:[4,4] as XY},{id:'S2',label:'S2',from:[0,4] as XY,to:[4,0] as XY}],mode:'sweep' as const,sweepX:x}})),
};
