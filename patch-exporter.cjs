const fs = require('fs');
let code = fs.readFileSync('src/utils/exporter.ts', 'utf-8');

code = code.replace(
  /originalSrcs\[i\] = src;/g,
  `originalSrcs[i] = src;
    const crossOrigin = img.getAttribute('crossOrigin');
    if (crossOrigin) img.removeAttribute('crossOrigin');`
);

fs.writeFileSync('src/utils/exporter.ts', code);
console.log('Patched exporter');
