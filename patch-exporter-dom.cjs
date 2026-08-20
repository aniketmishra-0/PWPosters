const fs = require('fs');
let code = fs.readFileSync('src/utils/exporter.ts', 'utf-8');

// Replace the states logic which hides elements and removes attributes
code = code.replace(
  /\/\/ Store and remove contenteditable and placeholders[\s\S]*?try \{/m,
  "try {"
);

code = code.replace(
  /allEls\.forEach\(\(el, i\) => \{[\s\S]*?const s = states\[i\];[\s\S]*?el\.style\.display = s\.display;\s*\}\);/m,
  "allEls.forEach((el, i) => {\n      el.style.backgroundImage = originalBgs[i] || '';\n    });"
);

fs.writeFileSync('src/utils/exporter.ts', code);
console.log('Exporter DOM mutation patched');
