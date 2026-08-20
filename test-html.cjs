const fs = require('fs');
let code = fs.readFileSync('src/components/PosterPreview.tsx', 'utf-8');

code = code.replace(
  /\{\/\* Always keep Syllabus PDF in DOM for background export \*\/\}\s*<div className="fixed -left-\[9999px\] -top-\[9999px\] pointer-events-none">\s*<SyllabusPdfDocument config=\{config\} pdfDocRef=\{pdfDocRef\} onChange=\{onChange\} scale=\{1\} \/>\s*<\/div>/g,
  `{previewMode === 'poster' && (
              <div className="fixed -left-[9999px] -top-[9999px] pointer-events-none">
                <SyllabusPdfDocument config={config} pdfDocRef={pdfDocRef} onChange={onChange} scale={1} />
              </div>
            )}`
);

fs.writeFileSync('src/components/PosterPreview.tsx', code);
console.log('Fixed double render of SyllabusPdfDocument');
