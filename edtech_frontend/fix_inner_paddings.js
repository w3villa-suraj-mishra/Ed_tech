const fs = require('fs');

function replaceFile(file) {
  let content = fs.readFileSync(file, 'utf8');
  
  // Fix 3 Simple Steps inner div
  content = content.replace(/p-8 sm:p-12 lg:p-16/g, 'p-[15px]');
  
  // Fix Bottom CTA inner div
  content = content.replace(/py-6 px-6 sm:py-7 sm:px-9 lg:py-8 lg:px-12/g, 'p-[15px]');
  
  // Fix Instructor Section inner div
  content = content.replace(/p-8 sm:p-12 lg:p-14/g, 'p-[15px]');
  
  // Fix absolute doodles top positions in Categories so they don't overlap
  content = content.replace(/absolute top-10/g, 'absolute top-0');
  
  fs.writeFileSync(file, content);
}

replaceFile('src/pages/Home.jsx');
replaceFile('src/components/core/HomePage/InstructorSection.jsx');

console.log("Inner paddings and overlapping doodles fixed.");
