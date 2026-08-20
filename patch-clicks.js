const fs = require('fs');
let code = fs.readFileSync('src/components/PosterPreview.tsx', 'utf-8');

code = code.replace(
  /onClick=\{\(\) => setActiveCanvasElement\('batchName'\)\}\s*onDoubleClick=\{\(\) => setEditingElement\('batchName'\)\}/g,
  "onClick={() => { setActiveCanvasElement('batchName'); setEditingElement('batchName'); }}"
);

code = code.replace(
  /onClick=\{\(\) => setActiveCanvasElement\('title'\)\}\s*onDoubleClick=\{\(\) => setEditingElement\('title'\)\}/g,
  "onClick={() => { setActiveCanvasElement('title'); setEditingElement('title'); }}"
);

code = code.replace(
  /onClick=\{\(\) => setActiveCanvasElement\('date'\)\}\s*onDoubleClick=\{\(\) => setEditingElement\('date'\)\}/g,
  "onClick={() => { setActiveCanvasElement('date'); setEditingElement('date'); }}"
);

code = code.replace(
  /onClick=\{\(\) => setActiveCanvasElement\(isHeaderRow \|\| isLeftCol \? 'tableHeader' : 'tableCell'\)\}\s*onDoubleClick=\{\(\) => setEditingElement\(isHeaderRow \|\| isLeftCol \? 'tableHeader' : 'tableCell'\)\}/g,
  "onClick={() => { setActiveCanvasElement(isHeaderRow || isLeftCol ? 'tableHeader' : 'tableCell'); setEditingElement(isHeaderRow || isLeftCol ? 'tableHeader' : 'tableCell'); }}"
);

fs.writeFileSync('src/components/PosterPreview.tsx', code);
console.log('Clicks patched');
