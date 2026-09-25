const fs = require('fs');

let content = fs.readFileSync('src/data/toolsRegistry.ts', 'utf8');

const titleRegex = /title:\s*['"]([^'"]+)['"]/g;
let changedCount = 0;

content = content.replace(titleRegex, (match, title) => {
  if (title.length > 70) {
    const hasBrand = title.endsWith(' | BharatUtility');
    let coreTitle = hasBrand ? title.replace(' | BharatUtility', '').trim() : title.trim();
    
    // Attempt 1: Remove " - Description"
    if (coreTitle.includes(' - ') && coreTitle.split(' - ')[0].length + 16 <= 70) {
      coreTitle = coreTitle.split(' - ')[0].trim();
    } 
    // Attempt 2: Remove anything in brackets (...)
    else if (coreTitle.includes('(') && coreTitle.replace(/\s*\([^)]*\)/g, '').length + 16 <= 70) {
      coreTitle = coreTitle.replace(/\s*\([^)]*\)/g, '').trim();
    }
    
    // Attempt 3: Hard truncate
    if (coreTitle.length + (hasBrand ? 16 : 0) > 70) {
       const maxLen = 70 - (hasBrand ? 16 : 0) - 3;
       coreTitle = coreTitle.substring(0, maxLen).trim() + '...';
    }
    
    const newTitle = hasBrand ? `${coreTitle} | BharatUtility` : coreTitle;
    
    if (newTitle !== title) {
        console.log(`- ${title}\n+ ${newTitle}\n`);
        changedCount++;
    }
    return `title: '${newTitle.replace(/'/g, "\\'")}'`;
  }
  return match;
});

fs.writeFileSync('src/data/toolsRegistry.ts', content, 'utf8');
console.log(`Fixed ${changedCount} titles in toolsRegistry.ts`);
