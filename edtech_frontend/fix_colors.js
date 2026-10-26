const fs = require('fs');
const files = [
  'src/components/Navbar/Navbar.jsx',
  'src/components/Navbar/NotificationBell.jsx',
  'src/pages/Catalog.jsx'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  // Replacements to bypass custom tailwind blue palette
  content = content.replace(/hover:bg-blue-50/g, 'hover:bg-[#EFF6FF]');
  content = content.replace(/bg-blue-50/g, 'bg-[#EFF6FF]');
  content = content.replace(/hover:text-blue-500/g, 'hover:text-[#3B82F6]');
  content = content.replace(/text-blue-500/g, 'text-[#3B82F6]');
  
  content = content.replace(/bg-blue-100/g, 'bg-[#DBEAFE]');
  content = content.replace(/border-blue-100/g, 'border-[#DBEAFE]');
  
  content = content.replace(/hover:text-blue-600/g, 'hover:text-[#3B82F6]');
  content = content.replace(/text-blue-600/g, 'text-[#4F8FF7]');
  
  fs.writeFileSync(file, content, 'utf8');
});
console.log("Colors fixed.");
