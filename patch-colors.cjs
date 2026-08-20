const fs = require('fs');

function replaceColors(filePath) {
  let code = fs.readFileSync(filePath, 'utf-8');
  
  // Replace text-slate-900 bg-white
  code = code.replace(/className="relative text-slate-900 bg-white/g, 'style={{ color: "#0f172a", backgroundColor: "#ffffff" }} className="relative');
  
  // text-black
  code = code.replace(/text-black/g, '');
  code = code.replace(/<span className="font-bold text-\[17\.5px\] font-serif tracking-normal/g, '<span style={{ color: "#000000" }} className="font-bold text-[17.5px] font-serif tracking-normal');
  
  // text-[#1d4ed8] hover:text-blue-900
  code = code.replace(/text-\[#1d4ed8\] hover:text-blue-900/g, '');
  code = code.replace(/className="font-normal text-\[17\.5px\]/g, 'style={{ color: "#1d4ed8" }} className="font-normal text-[17.5px]');
  
  // bg-black -> style backgroundColor
  code = code.replace(/bg-black/g, '');
  code = code.replace(/className="w-full h-\[1\.5px\] "/g, 'style={{ backgroundColor: "#000000" }} className="w-full h-[1.5px] "');
  
  // bg-[#0c2a52] -> style backgroundColor
  code = code.replace(/bg-\[#0c2a52\]/g, '');
  code = code.replace(/className="w-full h-\[4px\] "/g, 'style={{ backgroundColor: "#0c2a52" }} className="w-full h-[4px] "');
  
  // border-black -> style borderColor
  code = code.replace(/border-black/g, '');
  code = code.replace(/className="absolute inset-\[24px\] border-\[1\.5px\]/g, 'style={{ borderColor: "#000000" }} className="absolute inset-[24px] border-[1.5px]');
  code = code.replace(/className="w-full border-t-\[1\.5px\]/g, 'style={{ borderColor: "#000000" }} className="w-full border-t-[1.5px]');
  
  // bg-[#0000ff]
  code = code.replace(/bg-\[#0000ff\]/g, '');
  code = code.replace(/className="absolute right-0 top-0 w-\[260px\] h-\[3px\] "/g, 'style={{ backgroundColor: "#0000ff" }} className="absolute right-0 top-0 w-[260px] h-[3px] "');
  
  // bg-transparent
  code = code.replace(/bg-transparent/g, '');
  
  // text-white
  code = code.replace(/text-white/g, '');
  code = code.replace(/className="pw-pdf-header text-\[19px\]/g, 'style={{ color: "#ffffff" }} className="pw-pdf-header text-[19px]');
  code = code.replace(/text-white\/95/g, '');
  code = code.replace(/className="pw-pdf-header text-\[14px\]/g, 'style={{ color: "rgba(255,255,255,0.95)" }} className="pw-pdf-header text-[14px]');
  
  // focus:ring-* (html2canvas doesn't trigger focus so we can just remove them or leave them if they don't break until focused)
  // Actually html2canvas parses the whole stylesheet. If the stylesheet contains oklch, it breaks!
  
  fs.writeFileSync(filePath, code);
}

replaceColors('src/components/SyllabusPdfDocument.tsx');
console.log('Done');
