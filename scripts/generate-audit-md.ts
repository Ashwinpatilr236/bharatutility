import fs from 'fs';
import { TOOLS_REGISTRY } from '../src/data/toolsRegistry';

const flagged = TOOLS_REGISTRY.filter(t => t.needsManualVerification);
let md = `# Freshness Audit - ${flagged.length} Tools\n\n`;
md += `| Tool Name | Slug | Reason Flagged | Actual Current-Data Dependency | Official Source Configured? | User-Facing Status |\n`;
md += `|---|---|---|---|---|---|\n`;

flagged.forEach(t => {
  md += `| ${t.name} | \`${t.slug}\` | Automated freshness audit detected time-sensitive data (taxes, EMI, prices) | High (requires up-to-date calculation logic) | ${t.officialSource ? 'Yes' : 'No'} | ${t.needsManualVerification ? 'Verification Pending' : 'Verified'} |\n`;
});

fs.writeFileSync('freshness-audit.md', md);
console.log('Created freshness-audit.md with', flagged.length, 'tools');
