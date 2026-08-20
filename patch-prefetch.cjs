const fs = require('fs');
let code = fs.readFileSync('src/utils/exporter.ts', 'utf-8');

code = code.replace(
  "const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(url)}`;",
  "const proxyUrl = url.startsWith('/api/proxy-image') ? url : `/api/proxy-image?url=${encodeURIComponent(url)}`;"
);

fs.writeFileSync('src/utils/exporter.ts', code);
console.log('preFetchImage patched');
