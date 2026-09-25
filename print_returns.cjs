const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'src/components/calculators');
const files = fs.readdirSync(dir);

for (const file of files) {
  if (file.includes('Suite') && file.endsWith('.tsx')) {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    const returnIndex = content.indexOf('return (');
    if (returnIndex !== -1) {
      const snippet = content.substring(returnIndex, returnIndex + 500);
      console.log('---', file, '---');
      console.log(snippet);
    }
  }
}
