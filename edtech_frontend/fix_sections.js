const fs = require('fs');
const glob = require('glob');

const regex = /(<section[^>]*className="[^"]*?)(?:\s*(?:lg:)?p[tyb]-\d+)+\s*([^"]*")\s*>/g;

function processFile(file) {
  let content = fs.readFileSync(file, 'utf8');
  let newContent = content.replace(regex, (match, p1, p2) => {
    // p1 is the part before the paddings, p2 is the part after
    // Let's replace the whole padding block with py-[5px]
    // Wait, regex might match multiple times if there are multiple padding classes.
    // Better to just match the whole className string inside <section ...> and replace padding classes in it.
    return match;
  });
  
  // A safer approach:
  newContent = content.replace(/<section[^>]*className="([^"]*)"/g, (match, className) => {
    let newClassName = className.replace(/\b(?:lg:)?p[tyb]-\d+\b/g, '').replace(/\s+/g, ' ').trim();
    return match.replace(className, newClassName + ' py-[5px]');
  });
  
  if (content !== newContent) {
    fs.writeFileSync(file, newContent);
    console.log(`Updated ${file}`);
  }
}

const files = [
  'src/pages/Home.jsx',
  ...glob.sync('src/components/core/HomePage/*.jsx')
];

files.forEach(processFile);
