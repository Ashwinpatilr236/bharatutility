import { TOOLS_REGISTRY } from '../src/data/toolsRegistry';
import { CATEGORIES } from '../src/data/categories';
import fs from 'fs';

let md = `# BharatUtility Tools List\n\nTotal Tools: ${TOOLS_REGISTRY.length}\n\n`;

CATEGORIES.forEach(cat => {
  const tools = TOOLS_REGISTRY.filter(t => t.category === cat.id);
  md += `## ${cat.name} (${tools.length})\n`;
  tools.forEach(t => {
    md += `- **${t.name}**: ${t.description}\n`;
  });
  md += `\n`;
});

fs.writeFileSync('tools-list.md', md);
console.log('Saved to tools-list.md');
