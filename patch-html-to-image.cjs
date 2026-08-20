const fs = require('fs');
let code = fs.readFileSync('src/utils/exporter.ts', 'utf-8');

code = code.replace(
  /cacheBust: true,/g,
  `cacheBust: true,
      useCORS: true,
      allowTaint: true,`
);

fs.writeFileSync('src/utils/exporter.ts', code);
console.log('html-to-image CORS patched');
