const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'src/components/calculators');
const files = fs.readdirSync(dir);

let modifiedCount = 0;

for (const file of files) {
  if (file.includes('Suite') && file.endsWith('.tsx')) {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    let originalLength = content.length;

    // 1. Remove standard dark mode header
    content = content.replace(/\{\/\*\s*Suite Header\s*\*\/\}.*?\{\/\*\s*Tabs Navigation\s*\*\/\}/s, '{/* Tabs Navigation */}');
    content = content.replace(/\{\/\*\s*Suite Tabs Header\s*\*\/\}.*?\{\/\*\s*Tabs Navigation\s*\*\/\}/s, '{/* Tabs Navigation */}');

    // 2. Remove any Tabs block (light or dark mode)
    // It usually looks like {/* Tab Switcher */} ... </div> followed by {/* Main Content Area */} or something
    // Or {/* Tabs Navigation */} ... </div> followed by {/* 1. ... */}
    
    // Light mode style
    content = content.replace(/\{\/\*\s*Tab Switcher\s*\*\/\}.*?<\/div>\s*\{\/\*\s*Main Content Area\s*\*\/\}/s, '{/* Main Content Area */}');
    
    // Dark mode style
    content = content.replace(/\{\/\*\s*Tabs Navigation\s*\*\/\}.*?<\/div>\s*\{\/\*\s*1\./s, '{/* 1.');
    
    // Another variation
    content = content.replace(/\{\/\*\s*Tabs Navigation\s*\*\/\}.*?<\/div>\s*\{\/\*/s, '{/*');

    if (content.length !== originalLength) {
      fs.writeFileSync(filePath, content, 'utf8');
      modifiedCount++;
      console.log('Modified:', file);
    }
  }
}

console.log('Total files modified:', modifiedCount);
