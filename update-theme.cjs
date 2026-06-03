const fs = require('fs');

const files = [
  'src/components/ContentView.tsx',
  'src/components/CalendarView.tsx',
];

const colorMap = {
  'bg-\\[#111216\\]': 'bg-[#111113]',
  'border-\\[#1F222B\\]': 'border-[#1f1f22]',
  'bg-\\[#13151A\\]': 'bg-[#09090b]',
  'border-\\[#20232E\\]': 'border-[#27272a]',
  'bg-\\[#252834\\]': 'bg-[#27272a]',
  'border-\\[#3A3E4E\\]': 'border-white/5',
  'bg-\\[#2A2E3D\\]': 'bg-[#27272a]',
  'text-slate-800': 'text-white',
  'text-slate-700': 'text-zinc-300',
  'text-slate-600': 'text-zinc-400',
  'text-slate-500': 'text-zinc-500',
  'text-slate-400': 'text-zinc-500',
  'text-slate-300': 'text-zinc-300',
  'text-slate-200': 'text-zinc-200',
  'bg-slate-50\\]?': 'bg-[#09090b]',
  'bg-slate-50': 'bg-[#09090b]',
  'bg-slate-100\\]?': 'bg-[#27272a]',
  'bg-slate-100': 'bg-[#27272a]',
  'bg-slate-200\\]?': 'bg-white/10',
  'bg-slate-200': 'bg-white/10',
  'border-slate-200\\/?8?0?': 'border-[#27272a]',
  'border-slate-200': 'border-[#27272a]',
  'border-slate-100': 'border-[#27272a]',
  'text-indigo-600': 'text-white',
  'bg-indigo-600': 'bg-white',
  'text-indigo-500': 'text-zinc-400',
  'hover:bg-indigo-700': 'hover:bg-zinc-200',
  'bg-slate-900': 'bg-[#111113]',
};

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf-8');

  // Replace bg-white specifically where it's a container
  content = content.replace(/bg-white rounded/g, 'bg-[#111113] rounded');
  content = content.replace(/bg-white border/g, 'bg-[#111113] border');
  content = content.replace(/bg-white flex/g, 'bg-[#111113] flex');
  content = content.replace(/bg-white p/g, 'bg-[#111113] p');
  
  // Custom manual replaces
  for (const [key, value] of Object.entries(colorMap)) {
    content = content.replace(new RegExp(key, 'g'), value);
  }

  // A couple of more granular fixes
  content = content.replace(/bg-[#111113] hover:bg-[#27272a] text-zinc-300 border border-[#27272a]/g, 'bg-white hover:bg-zinc-200 text-black border-transparent');
  content = content.replace(/bg-indigo-600 hover:bg-indigo-700 text-white/g, 'bg-white hover:bg-zinc-200 text-black');
  content = content.replace(/bg-blue-600 hover:bg-blue-700 text-white/g, 'bg-white hover:bg-zinc-200 text-black');
  
  fs.writeFileSync(file, content);
});

console.log('Done');
