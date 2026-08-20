const fs = require('fs');
let code = fs.readFileSync('src/components/SyllabusPdfDocument.tsx', 'utf-8');

code = code.replace(
  /        fontFamily: "'Plus Jakarta Sans', 'Inter', 'Poppins', sans-serif"\n      \}\}\n      style=\{\{ color: "#0f172a", backgroundColor: "#ffffff" \}\} className="relative select-text box-border shadow-2xl overflow-hidden"/g,
  `        fontFamily: "'Plus Jakarta Sans', 'Inter', 'Poppins', sans-serif",
        color: '#0f172a'
      }}
      className="relative select-text box-border shadow-2xl overflow-hidden"`
);

fs.writeFileSync('src/components/SyllabusPdfDocument.tsx', code);
console.log('Fixed SyllabusPdfDocument.tsx');
