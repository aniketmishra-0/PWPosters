const fs = require('fs');

function patchFile(file) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(
    /throw new Error\("Attempting to parse an unsupported color function \\"" \+ value\.name \+ "\\""\);/g,
    'console.warn("Attempting to parse an unsupported color function \\"" + value.name + "\\""); return 0;' // Return transparent black
  );
  fs.writeFileSync(file, content);
}

patchFile('node_modules/html2canvas/dist/html2canvas.js');
patchFile('node_modules/html2canvas/dist/html2canvas.min.js');
patchFile('node_modules/html2canvas/dist/html2canvas.esm.js');
console.log('Patched html2canvas');
