const fs = require('fs');
let code = fs.readFileSync('src/components/PosterPreview.tsx', 'utf-8');

code = code.replace(
  /<SyllabusPdfDocument config=\{config\} pdfDocRef=\{pdfDocRef\} onChange=\{onChange\} \/>/g,
  '<SyllabusPdfDocument config={config} pdfDocRef={pdfDocRef} onChange={onChange} scale={1} />'
);

fs.writeFileSync('src/components/PosterPreview.tsx', code);
console.log('Scale 1 patched');
