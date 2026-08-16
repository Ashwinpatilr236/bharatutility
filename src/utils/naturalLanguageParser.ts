/**
 * BharatUtility Natural Language Query & Parameter Extraction Engine
 * Fast, lightweight, client-side semantic parser for Indian everyday utility queries.
 * Interprets numerical values, Indian currency notations (lakh, crore, k), rates, tenures, and state names.
 */

export interface ParsedToolIntent {
  toolSlug: string;
  toolName: string;
  confidence: number;
  params: Record<string, any>;
  explanation: string;
  matchedTerms: string[];
}

/**
 * Normalizes Indian numbers like "20 lakh", "25L", "1.5 crore", "50k", "75,000" into numeric values
 */
export function extractIndianNumber(text: string): number | null {
  const clean = text.toLowerCase().replace(/,/g, '').trim();

  // Pattern: "1.5 crore" or "1.5 cr"
  const croreMatch = clean.match(/([\d.]+)\s*(?:crore|cr|crores)/i);
  if (croreMatch) {
    const val = parseFloat(croreMatch[1]);
    if (!isNaN(val)) return Math.round(val * 10000000);
  }

  // Pattern: "25 lakh" or "25 lac" or "25 l" or "25l"
  const lakhMatch = clean.match(/([\d.]+)\s*(?:lakh|lakhs|lac|lacs|l)\b/i);
  if (lakhMatch) {
    const val = parseFloat(lakhMatch[1]);
    if (!isNaN(val)) return Math.round(val * 100000);
  }

  // Pattern: "50k" or "75 k"
  const kMatch = clean.match(/([\d.]+)\s*k\b/i);
  if (kMatch) {
    const val = parseFloat(kMatch[1]);
    if (!isNaN(val)) return Math.round(val * 1000);
  }

  // Pattern: plain numbers like 75000, 2500000
  const plainMatch = clean.match(/\b\d{3,9}\b/);
  if (plainMatch) {
    const val = parseInt(plainMatch[0], 10);
    if (!isNaN(val)) return val;
  }

  return null;
}

/**
 * Extracts percentage values like "8.5%", "18 %", "12 percent"
 */
export function extractPercentage(text: string): number | null {
  const match = text.match(/([\d.]+)\s*(?:%|percent|prcnt|pct)/i);
  if (match) {
    const val = parseFloat(match[1]);
    if (!isNaN(val)) return val;
  }
  return null;
}

/**
 * Extracts tenure in years or months
 */
export function extractTenureYears(text: string): number | null {
  // Years match: "20 years", "15 yrs", "5 yr", "20 saal"
  const yearMatch = text.match(/(\d+)\s*(?:years|year|yrs|yr|saal|varsh)/i);
  if (yearMatch) {
    const val = parseInt(yearMatch[1], 10);
    if (!isNaN(val)) return val;
  }

  // Months match: "240 months", "36 mahine"
  const monthMatch = text.match(/(\d+)\s*(?:months|month|mahine)/i);
  if (monthMatch) {
    const val = parseInt(monthMatch[1], 10);
    if (!isNaN(val)) return Math.round(val / 12);
  }

  return null;
}

/**
 * Detects Indian State mentions
 */
const INDIAN_STATES = [
  { slug: 'maharashtra', names: ['maharashtra', 'mumbai', 'pune', 'nagpur', 'msedcl', 'best', 'adani mumbai', 'tata power mumbai'] },
  { slug: 'delhi', names: ['delhi', 'new delhi', 'ncr', 'bses', 'bypl', 'brpl', 'tpdld'] },
  { slug: 'gujarat', names: ['gujarat', 'ahmedabad', 'surat', 'vadodara', 'dgevcl', 'mgvcl', 'ugvcl', 'pgvcl', 'torrent'] },
  { slug: 'tamil-nadu', names: ['tamil nadu', 'tamilnadu', 'chennai', 'tangedco'] },
  { slug: 'karnataka', names: ['karnataka', 'bengaluru', 'bangalore', 'bescom', 'mescom', 'gescom', 'hescom'] },
  { slug: 'uttar-pradesh', names: ['uttar pradesh', 'up', 'noida', 'lucknow', 'kanpur', 'uppcl'] },
  { slug: 'west-bengal', names: ['west bengal', 'bengal', 'kolkata', 'wbsedcl', 'cesc'] },
  { slug: 'rajasthan', names: ['rajasthan', 'jaipur', 'jodhpur', 'jvvnl'] },
  { slug: 'telangana', names: ['telangana', 'hyderabad', 'tssspdcl', 'tsnpdcl'] },
  { slug: 'andhra-pradesh', names: ['andhra pradesh', 'ap', 'vizag', 'apepdcl', 'apspdcl'] },
  { slug: 'kerala', names: ['kerala', 'kochi', 'trivandrum', 'kseb'] },
  { slug: 'bihar', names: ['bihar', 'patna', 'nbpdcl', 'sbpdcl'] },
  { slug: 'punjab', names: ['punjab', 'chandigarh', 'pspcl'] },
  { slug: 'haryana', names: ['haryana', 'gurugram', 'gurgaon', 'uhbvn', 'dhbvn'] },
  { slug: 'madhya-pradesh', names: ['madhya pradesh', 'mp', 'bhopal', 'indore', 'mpcz', 'mpez', 'mpwz'] },
];

export function extractStateSlug(text: string): { slug: string; name: string } | null {
  const lower = text.toLowerCase();
  for (const state of INDIAN_STATES) {
    for (const name of state.names) {
      const regex = new RegExp(`\\b${name}\\b`, 'i');
      if (regex.test(lower)) {
        return { slug: state.slug, name: state.slug.replace('-', ' ') };
      }
    }
  }
  return null;
}

/**
 * Main Natural Language Intent Classifier & Parameter Extractor
 */
export function parseNaturalLanguageQuery(query: string): ParsedToolIntent | null {
  if (!query || query.trim().length < 3) return null;
  const q = query.toLowerCase().trim();

  // 1. In-Hand Salary / CTC
  if (
    q.includes('salary') ||
    q.includes('in hand') ||
    q.includes('in-hand') ||
    q.includes('ctc') ||
    q.includes('take home') ||
    q.includes('gross salary') ||
    q.includes('monthly salary') ||
    (q.includes('ka in hand') || q.includes('inhand'))
  ) {
    const num = extractIndianNumber(q);
    const params: Record<string, any> = {};
    let explanation = 'In-Hand Salary Calculator';

    if (num) {
      // If user typed 75000 monthly or 12 lakh annual
      if (num < 200000 && !q.includes('lakh') && !q.includes('lpa') && !q.includes('ctc')) {
        // likely monthly salary
        params.ctc = num * 12;
        explanation = `Calculate In-Hand Salary for ₹${num.toLocaleString('en-IN')}/mo (CTC: ₹${(num * 12).toLocaleString('en-IN')})`;
      } else {
        params.ctc = num;
        explanation = `Calculate In-Hand Salary for Annual CTC of ₹${num.toLocaleString('en-IN')}`;
      }
    }

    return {
      toolSlug: 'salary-calculator',
      toolName: 'In-Hand Salary & CTC Calculator',
      confidence: 0.95,
      params,
      explanation,
      matchedTerms: ['salary', 'in hand', 'ctc']
    };
  }

  // 2. Home / Personal / Car Loan EMI
  if (
    q.includes('emi') ||
    q.includes('loan') ||
    q.includes('home loan') ||
    q.includes('car loan') ||
    q.includes('personal loan') ||
    q.includes('interest rate') ||
    q.includes('monthly installment') ||
    q.includes('byaj') ||
    q.includes('karz')
  ) {
    const amount = extractIndianNumber(q);
    const rate = extractPercentage(q);
    const tenure = extractTenureYears(q);

    const params: Record<string, any> = {};
    const parts: string[] = [];

    if (amount) {
      params.amount = amount;
      parts.push(`Loan: ₹${amount.toLocaleString('en-IN')}`);
    }
    if (rate) {
      params.rate = rate;
      parts.push(`Interest: ${rate}%`);
    }
    if (tenure) {
      params.tenure = tenure;
      parts.push(`Tenure: ${tenure} yrs`);
    }

    const explanation = parts.length > 0
      ? `Calculate EMI (${parts.join(', ')})`
      : 'Calculate monthly loan EMI & amortization schedule';

    return {
      toolSlug: 'emi-calculator',
      toolName: 'Home & Personal Loan EMI Calculator',
      confidence: 0.95,
      params,
      explanation,
      matchedTerms: ['emi', 'loan', 'interest']
    };
  }

  // 3. GST Calculator
  if (
    q.includes('gst') ||
    q.includes('cgst') ||
    q.includes('sgst') ||
    q.includes('tax invoice') ||
    q.includes('gst 18') ||
    q.includes('reverse gst')
  ) {
    const amount = extractIndianNumber(q);
    const rate = extractPercentage(q) || (q.includes('18%') || q.includes('18') ? 18 : q.includes('5%') || q.includes('5') ? 5 : q.includes('12%') || q.includes('12') ? 12 : q.includes('28%') || q.includes('28') ? 28 : null);

    const params: Record<string, any> = {};
    const parts: string[] = [];
    if (amount) {
      params.amount = amount;
      parts.push(`Amount: ₹${amount.toLocaleString('en-IN')}`);
    }
    if (rate) {
      params.rate = rate;
      parts.push(`GST Slab: ${rate}%`);
    }

    const explanation = parts.length > 0
      ? `Calculate GST (${parts.join(', ')})`
      : 'Calculate GST inclusive, exclusive & CGST/SGST split';

    return {
      toolSlug: 'gst-calculator',
      toolName: 'GST Calculator (Goods & Services Tax)',
      confidence: 0.94,
      params,
      explanation,
      matchedTerms: ['gst', 'cgst', 'tax']
    };
  }

  // 5. Mutual Fund SIP Wealth
  if (
    q.includes('sip') ||
    q.includes('mutual fund') ||
    q.includes('sip return') ||
    q.includes('wealth creation') ||
    q.includes('crorepati') ||
    q.includes('compounding')
  ) {
    const monthly = extractIndianNumber(q);
    const rate = extractPercentage(q);
    const tenure = extractTenureYears(q);

    const params: Record<string, any> = {};
    const parts: string[] = [];
    if (monthly) {
      params.monthly = monthly;
      parts.push(`Monthly SIP: ₹${monthly.toLocaleString('en-IN')}`);
    }
    if (rate) {
      params.rate = rate;
      parts.push(`Expected Return: ${rate}%`);
    }
    if (tenure) {
      params.years = tenure;
      parts.push(`Tenure: ${tenure} yrs`);
    }

    const explanation = parts.length > 0
      ? `Estimate SIP Wealth (${parts.join(', ')})`
      : 'Estimate compounding mutual fund SIP returns';

    return {
      toolSlug: 'sip-calculator',
      toolName: 'SIP Wealth & Mutual Fund Calculator',
      confidence: 0.93,
      params,
      explanation,
      matchedTerms: ['sip', 'mutual fund', 'investment']
    };
  }

  // 6. Fuel Cost / Mileage Split
  if (
    q.includes('fuel') ||
    q.includes('petrol') ||
    q.includes('diesel') ||
    q.includes('mileage') ||
    q.includes('trip cost') ||
    q.includes('road trip') ||
    q.includes('car mileage') ||
    q.includes('bike mileage')
  ) {
    const num = extractIndianNumber(q);
    const params: Record<string, any> = {};
    if (num && num > 10 && num < 5000) {
      params.distance = num;
    }

    return {
      toolSlug: 'fuel-cost-calculator',
      toolName: 'Fuel Cost & Trip Expense Calculator',
      confidence: 0.9,
      params,
      explanation: num ? `Calculate Fuel Cost for ${num} km trip` : 'Calculate mileage, fuel expense & per-person trip cost',
      matchedTerms: ['fuel', 'petrol', 'mileage']
    };
  }

  // 7. Land Units / Unit Converter
  if (
    q.includes('gaj') ||
    q.includes('bigha') ||
    q.includes('katha') ||
    q.includes('guntha') ||
    q.includes('sq ft') ||
    q.includes('square feet') ||
    q.includes('acre') ||
    q.includes('hectare') ||
    q.includes('cent') ||
    q.includes('ground') ||
    q.includes('marla') ||
    q.includes('kanal')
  ) {
    return {
      toolSlug: 'unit-converter',
      toolName: 'Indian Land & Unit Converter',
      confidence: 0.95,
      params: { category: 'area' },
      explanation: 'Convert Gaj, Bigha, Guntha, Sq Ft, Acre, and Indian land measures',
      matchedTerms: ['gaj', 'bigha', 'sq ft', 'land']
    };
  }

  // 8. Age & DOB Calculator
  if (
    q.includes('age') ||
    q.includes('dob') ||
    q.includes('date of birth') ||
    q.includes('janam din') ||
    q.includes('umar') ||
    q.includes('how old')
  ) {
    return {
      toolSlug: 'age-calculator',
      toolName: 'Age & Date of Birth Calculator',
      confidence: 0.94,
      params: {},
      explanation: 'Calculate exact age in years, months, days, and next birthday countdown',
      matchedTerms: ['age', 'dob', 'birthday']
    };
  }

  // 9. CBSE CGPA & Marks
  if (
    q.includes('cgpa') ||
    q.includes('cbse') ||
    q.includes('grade') ||
    q.includes('percentage to cgpa') ||
    q.includes('cgpa to percentage')
  ) {
    return {
      toolSlug: 'cgpa-calculator',
      toolName: 'CBSE CGPA to Percentage Calculator',
      confidence: 0.95,
      params: {},
      explanation: 'Convert CBSE / College CGPA to Percentage using official multiplier (9.5)',
      matchedTerms: ['cgpa', 'cbse', 'percentage']
    };
  }

  // 10. Resignation & Letter Generator
  if (
    q.includes('resignation') ||
    q.includes('leave application') ||
    q.includes('sick leave') ||
    q.includes('casual leave') ||
    q.includes('wfh request') ||
    q.includes('notice period') ||
    q.includes('letter format')
  ) {
    return {
      toolSlug: 'letter-generator',
      toolName: 'Indian Resignation & Leave Letter Generator',
      confidence: 0.95,
      params: {},
      explanation: 'Generate professional resignation letters, sick leave, & casual leave formats',
      matchedTerms: ['resignation', 'leave', 'letter']
    };
  }

  // 11. Paint / Tile Construction
  if (q.includes('paint') || q.includes('wall paint') || q.includes('primer')) {
    return {
      toolSlug: 'paint-calculator',
      toolName: 'Wall Paint & Primer Calculator',
      confidence: 0.95,
      params: {},
      explanation: 'Estimate paint liters, primer, and material cost for rooms & exterior',
      matchedTerms: ['paint', 'primer', 'room']
    };
  }

  if (q.includes('tile') || q.includes('flooring') || q.includes('bathroom tiles')) {
    return {
      toolSlug: 'tile-calculator',
      toolName: 'Floor & Wall Tile Calculator',
      confidence: 0.95,
      params: {},
      explanation: 'Calculate exact number of tile boxes & wastage margin needed',
      matchedTerms: ['tile', 'flooring', 'boxes']
    };
  }

  return null;
}
