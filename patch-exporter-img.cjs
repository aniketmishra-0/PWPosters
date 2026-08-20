const fs = require('fs');
let code = fs.readFileSync('src/utils/exporter.ts', 'utf-8');

code = code.replace(
  /img\.src = await preFetchImage\(src\);/g,
  `const dataUrl = await preFetchImage(src);
      await new Promise((resolve) => {
        img.onload = resolve;
        img.onerror = resolve;
        img.src = dataUrl;
      });`
);

fs.writeFileSync('src/utils/exporter.ts', code);
console.log('Exporter image wait patched');
