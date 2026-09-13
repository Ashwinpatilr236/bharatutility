import { getPathForView } from '../src/utils/seo.ts';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('====================================');
console.log('🕉️ VERIFYING SANATAN NEXT SHOWCASE INTEGRATION');
console.log('====================================\n');

let passedTests = 0;
let totalTests = 0;

function assert(condition: boolean, message: string) {
  totalTests++;
  if (condition) {
    console.log(`✅ [PASS] ${message}`);
    passedTests++;
  } else {
    console.error(`❌ [FAIL] ${message}`);
  }
}

// 1. Check getPathForView
const sanatanNextPath = getPathForView({ type: 'sanatan-next' });
assert(sanatanNextPath === '/sanatan-next', `getPathForView({ type: 'sanatan-next' }) returns '/sanatan-next' (got: ${sanatanNextPath})`);

// 2. Check sitemap.xml contains /sanatan-next
const sitemapPath = path.resolve(__dirname, '../public/sitemap.xml');
const sitemapContent = fs.readFileSync(sitemapPath, 'utf-8');
assert(sitemapContent.includes('https://bharatutility.tech/sanatan-next'), 'sitemap.xml contains https://bharatutility.tech/sanatan-next');

// 3. Verify SanatanNextPromoView file exists
const promoViewPath = path.resolve(__dirname, '../src/components/views/SanatanNextPromoView.tsx');
assert(fs.existsSync(promoViewPath), 'SanatanNextPromoView.tsx exists');
const promoContent = fs.readFileSync(promoViewPath, 'utf-8');

// 4. Verify external destination URL is exact
assert(
  promoContent.includes('https://sanatannext.netlify.app/'),
  'SanatanNextPromoView contains exact destination https://sanatannext.netlify.app/'
);
assert(
  promoContent.includes('https://github.com/Ashwinpatilr236/sanatannext'),
  'SanatanNextPromoView contains verified GitHub repository URL https://github.com/Ashwinpatilr236/sanatannext'
);
assert(
  promoContent.includes('https://arrjs-technologies.netlify.app/'),
  'SanatanNextPromoView contains verified ARRJS Technologies URL https://arrjs-technologies.netlify.app/'
);
assert(
  promoContent.includes('Aane wali peedhi ke liye Sanatan gyan'),
  'SanatanNextPromoView contains required tagline "Aane wali peedhi ke liye Sanatan gyan"'
);
assert(
  promoContent.includes('12 Sacred Jyotirlingas') && promoContent.includes('51 Shakti Peeth Shrines'),
  'SanatanNextPromoView includes 12 Jyotirlingas and 51 Shakti Peeth feature cards'
);

// 5. Verify Homepage Showcase Section
const showcasePath = path.resolve(__dirname, '../src/components/home/SanatanNextShowcaseSection.tsx');
assert(fs.existsSync(showcasePath), 'SanatanNextShowcaseSection.tsx exists');
const showcaseContent = fs.readFileSync(showcasePath, 'utf-8');
assert(
  showcaseContent.includes('https://sanatannext.netlify.app/'),
  'SanatanNextShowcaseSection links directly to https://sanatannext.netlify.app/'
);
assert(
  showcaseContent.includes('/sanatan-next'),
  'SanatanNextShowcaseSection includes internal link to /sanatan-next'
);

// 6. Verify Footer contains Sanatan Next links
const footerPath = path.resolve(__dirname, '../src/components/common/Footer.tsx');
const footerContent = fs.readFileSync(footerPath, 'utf-8');
assert(footerContent.includes('/sanatan-next'), 'Footer.tsx contains link to /sanatan-next');

// 7. Verify Header contains Sanatan Next discovery
const headerPath = path.resolve(__dirname, '../src/components/common/Header.tsx');
const headerContent = fs.readFileSync(headerPath, 'utf-8');
assert(headerContent.includes('/sanatan-next'), 'Header.tsx contains link to /sanatan-next');

// 8. Verify App.tsx renders SanatanNextPromoView and SanatanNextShowcaseSection
const appPath = path.resolve(__dirname, '../src/App.tsx');
const appContent = fs.readFileSync(appPath, 'utf-8');
assert(appContent.includes('SanatanNextShowcaseSection'), 'App.tsx includes SanatanNextShowcaseSection');
assert(appContent.includes('SanatanNextPromoView'), 'App.tsx includes SanatanNextPromoView');

console.log('\n====================================');
console.log(`🏁 SANATAN NEXT VERIFICATION: ${passedTests} / ${totalTests} TESTS PASSED`);
console.log('====================================\n');

if (passedTests === totalTests) {
  process.exit(0);
} else {
  process.exit(1);
}
