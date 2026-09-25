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

    // Remove {/* Mode Switcher Tabs */} ... </div> 
    content = content.replace(/\{\/\*\s*Mode Switcher Tabs\s*\*\/\}.*?<\/div>\s*<\/div>\s*\{\/\*/s, '{/*');
    // For single child div scenarios:
    content = content.replace(/\{\/\*\s*Mode Switcher Tabs\s*\*\/\}.*?<\/div>\s*(?=\{\/\*)/s, '');
    
    // Also change the wrapper `<div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 sm:p-8 border border-neutral-200/80 dark:border-neutral-800 shadow-sm space-y-6">`
    // to just `div className="w-full space-y-6"` to prevent double cards
    content = content.replace(/<div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 sm:p-8 border border-neutral-200\/80 dark:border-neutral-800 shadow-sm space-y-6">/g, '<div className="w-full space-y-6">');

    if (content.length !== originalLength) {
      fs.writeFileSync(filePath, content, 'utf8');
      modifiedCount++;
      console.log('Modified:', file);
    }
  }
}

console.log('Total files modified:', modifiedCount);
