const fs = require('fs');
let code = fs.readFileSync('src/components/PosterPreview.tsx', 'utf-8');

code = code.replace(
  /<div className="fixed -left-\[9999px\] -top-\[9999px\] pointer-events-none opacity-0">/g,
  '<div className="fixed -left-[9999px] -top-[9999px] pointer-events-none">'
);

fs.writeFileSync('src/components/PosterPreview.tsx', code);
console.log('Opacity 0 removed');
