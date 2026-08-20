const fs = require('fs');
let code = fs.readFileSync('src/utils/exporter.ts', 'utf-8');

code = code.replace(
  /const dataUrl = await preFetchImage\(url\);\s*el\.style\.backgroundImage = `url\("\$\{dataUrl\}"\)`\;/g,
  `const dataUrl = await preFetchImage(url);
          await new Promise((resolve) => {
            const dummy = new Image();
            dummy.onload = resolve;
            dummy.onerror = resolve;
            dummy.src = dataUrl;
          });
          el.style.backgroundImage = \`url("\${dataUrl}")\`;`
);

fs.writeFileSync('src/utils/exporter.ts', code);
console.log('Bg wait patched');
