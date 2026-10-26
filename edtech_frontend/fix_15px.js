const fs = require('fs');
const glob = require('glob');

const files = [
  'src/pages/Home.jsx',
  ...glob.sync('src/components/core/HomePage/*.jsx')
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let newContent = content.replace(/py-\[10px\]/g, 'py-[15px]');
  if (content !== newContent) {
    fs.writeFileSync(file, newContent);
    console.log(`Updated ${file}`);
  }
});
