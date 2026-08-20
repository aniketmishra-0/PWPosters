const fs = require('fs');
let code = fs.readFileSync('src/components/PosterPreview.tsx', 'utf-8');

code = code.replace(/contentEditable=\{\!\!onChange && editingElement === '([^']+)'\}/g, "contentEditable={!!onChange}");
code = code.replace(/contentEditable=\{\!\!onChange && editingElement === \([^)]+\)\}/g, "contentEditable={!!onChange}");

fs.writeFileSync('src/components/PosterPreview.tsx', code);
console.log('patched contentEditable');
