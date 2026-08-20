const fs = require('fs');
let code = fs.readFileSync('src/components/PwLogo.tsx', 'utf-8');

code = code.replace(
  /className=\`relative shrink-0 select-none rounded-full flex items-center justify-center overflow-hidden shadow-md border-2" style=\{\{ backgroundColor: "#ffffff", borderColor: "#ffffff" \}\} \$\{className\}\`/g,
  `className={\`relative shrink-0 select-none rounded-full flex items-center justify-center overflow-hidden shadow-md border-2 \${className}\`} style={{ backgroundColor: '#ffffff', borderColor: '#ffffff' }}`
);

code = code.replace(
  /className=\`relative shrink-0 select-none rounded-full flex items-center justify-center overflow-hidden shadow-md border-2" style=\{\{ backgroundColor: "#000000", borderColor: "#ffffff" \}\} \$\{className\}\`/g,
  `className={\`relative shrink-0 select-none rounded-full flex items-center justify-center overflow-hidden shadow-md border-2 \${className}\`} style={{ backgroundColor: '#000000', borderColor: '#ffffff' }}`
);

code = code.replace(
  /className="absolute inset-0 rounded-full border-\[3px\] " style=\{\{ borderColor: "#111827" \}\}\s+style=\{\{ margin: '2px' \}\}/g,
  `className="absolute inset-0 rounded-full border-[3px]" style={{ borderColor: '#111827', margin: '2px' }}`
);

fs.writeFileSync('src/components/PwLogo.tsx', code);
console.log('Fixed PwLogo.tsx');
