// remark-math v6 trata `$$x$$` escrito en UNA línea como matemática en línea.
// En este sitio un párrafo que sólo contiene `$$…$$` siempre quiere ser una
// ecuación en bloque: se reescribe al mismo nodo `math` que produce remark-math
// para el caso multilínea, así rehype-katex lo renderiza en displayMode.
export default function remarkDisplayMath() {
  return (tree, file) => {
    const src = String(file.value ?? '');
    const walk = (node) => {
      if (!node.children) return;
      node.children = node.children.map((child) => {
        const only = child.type === 'paragraph' && child.children?.length === 1 ? child.children[0] : null;
        if (only?.type === 'inlineMath' && src.slice(only.position?.start.offset, (only.position?.start.offset ?? 0) + 2) === '$$') {
          return {
            type: 'math',
            meta: null,
            value: only.value,
            position: child.position,
            data: {
              hName: 'pre',
              hChildren: [{ type: 'element', tagName: 'code', properties: { className: ['language-math', 'math-display'] }, children: [{ type: 'text', value: only.value }] }],
            },
          };
        }
        walk(child);
        return child;
      });
    };
    walk(tree);
  };
}
