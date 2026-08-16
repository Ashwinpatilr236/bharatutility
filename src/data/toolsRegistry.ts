import { Tool } from '../types';

export const TOOLS_REGISTRY: Tool[] = [
  // 1. EMI Calculator
  {
    id: 'emi-calculator',
    slug: 'emi-calculator',
    name: 'Home & Personal Loan EMI Calculator',
    shortName: 'EMI Calculator',
    tagline: 'Calculate monthly loan EMI, interest payout, and amortization schedule',
    description: 'Calculate your exact monthly Equated Monthly Installment (EMI) for Home, Car, or Personal Loans in India. Includes principal vs interest breakdown and yearly schedule.',
    category: 'money',
    icon: 'Calculator',
    keywords: ['emi', 'loan', 'home loan emi', 'car loan', 'personal loan', 'interest', 'sbi emi', 'hdfc emi', 'amortization'],
    popular: true,
    trending: true,
    featured: true,
    badge: 'Top Tool',
    views: 48200,
    seo: {
      title: 'Loan EMI Calculator India — Home, Personal & Car Loan EMI',
      description: 'Accurate and fast Indian Loan EMI Calculator with monthly breakdown, total interest payable, loan amortization table, and prepayment impact.',
      keywords: ['loan emi calculator', 'home loan emi calculator india', 'calculate monthly emi', 'personal loan emi'],
      canonicalSlug: 'emi-calculator',
    },
    formulaDescription: 'EMI is calculated using the reducing balance method formula: E = P × r × (1 + r)^n / ((1 + r)^n - 1)',
    formulaLatex: 'E = \\frac{P \\times r \\times (1 + r)^n}{(1 + r)^n - 1}',
    workedExample: {
      inputSummary: 'Loan of ₹25,00,000 at 8.5% p.a. for 20 years (240 months)',
      calculationSteps: [
        'Monthly interest rate r = 8.5 / (12 × 100) = 0.007083',
        'Tenure in months n = 20 × 12 = 240',
        'EMI = 25,00,000 × 0.007083 × (1.007083)^240 / ((1.007083)^240 - 1)',
        'Total Interest = (EMI × 240) - Principal'
      ],
      finalResult: 'Monthly EMI: ₹21,696 | Total Interest: ₹27,07,080 | Total Payable: ₹52,07,080',
    },
    faqs: [
      {
        question: 'How is Home Loan EMI calculated in India?',
        answer: 'Home loan EMIs are calculated on a monthly reducing balance method where your principal reduces each month with every payment, reducing the interest charged on subsequent months.'
      },
      {
        question: 'Does making part-prepayment reduce EMI or tenure?',
        answer: 'Most Indian banks give you the choice to either reduce your monthly EMI amount or reduce the total loan tenure (which saves significantly more interest).'
      },
      {
        question: 'Are there tax benefits on Home Loan EMI?',
        answer: 'Under the Old Tax Regime, you can claim up to ₹1.5 Lakh on principal repayment under Section 80C and up to ₹2 Lakh on interest paid under Section 24(b).'
      }
    ],
    relatedToolSlugs: ['sip-calculator', 'salary-calculator', 'fd-calculator', 'gst-calculator']
  },

  // 2. SIP Calculator
  {
    id: 'sip-calculator',
    slug: 'sip-calculator',
    name: 'SIP Wealth & Mutual Fund Calculator',
    shortName: 'SIP Calculator',
    tagline: 'Estimate wealth growth through monthly mutual fund investments',
    description: 'Calculate maturity value and compounding returns of your Systematic Investment Plan (SIP) in Indian mutual funds. View year-by-year wealth accumulation.',
    category: 'money',
    icon: 'TrendingUp',
    keywords: ['sip', 'mutual fund', 'sip return', 'wealth', 'investment', 'nifty', 'compound interest', 'lumpsum'],
    popular: true,
    trending: true,
    featured: true,
    badge: 'Popular',
    views: 42100,
    seo: {
      title: 'SIP Calculator — Calculate Mutual Fund SIP Returns & Maturity',
      description: 'Free Indian SIP Calculator to estimate expected returns and wealth created on monthly mutual fund investments with inflation adjustment option.',
      keywords: ['sip calculator', 'mutual fund sip returns', 'monthly sip wealth calculator', 'sip compound growth'],
      canonicalSlug: 'sip-calculator',
    },
    formulaDescription: 'M = P × [((1 + i)^n - 1) / i] × (1 + i), where i is monthly return rate (r/12) and n is number of installments.',
    workedExample: {
      inputSummary: 'Monthly SIP: ₹10,000 for 15 years with an expected return of 12% p.a.',
      calculationSteps: [
        'Total Invested Amount = ₹10,000 × 180 months = ₹18,00,000',
        'Monthly rate i = 12% / 12 = 1% = 0.01',
        'Compounded future value = ₹50,45,760'
      ],
      finalResult: 'Invested: ₹18,00,000 | Est. Returns: ₹32,45,760 | Total Maturity Value: ₹50,45,760',
    },
    faqs: [
      {
        question: 'What is a realistic expected return for equity SIP in India?',
        answer: 'Historically, broad Indian equity indices (Nifty 50, Sensex) have delivered 11% to 14% CAGR over 10-15 year horizons. However, past returns do not guarantee future performance.'
      },
      {
        question: 'Is SIP better than Fixed Deposit?',
        answer: 'SIPs in equity mutual funds carry market risk but offer higher inflation-beating potential over long horizons (>5-7 years). FDs offer guaranteed capital safety with lower post-tax yields.'
      }
    ],
    relatedToolSlugs: ['fd-calculator', 'emi-calculator', 'salary-calculator']
  },

  // 3. FD Calculator
  {
    id: 'fd-calculator',
    slug: 'fd-calculator',
    name: 'Fixed Deposit (FD) Maturity Calculator',
    shortName: 'FD Calculator',
    tagline: 'Calculate Indian bank FD maturity value with quarterly compounding',
    description: 'Calculate maturity payout and interest on Bank Fixed Deposits in India. Includes Senior Citizen rate boost (+0.50%) and compounding frequencies.',
    category: 'money',
    icon: 'PiggyBank',
    keywords: ['fd', 'fixed deposit', 'bank fd', 'sbi fd', 'hdfc fd', 'senior citizen fd', 'interest payout'],
    popular: true,
    views: 31500,
    seo: {
      title: 'FD Calculator India — Bank Fixed Deposit Maturity & Interest',
      description: 'Calculate Indian Bank Fixed Deposit maturity interest with quarterly compounding and Senior Citizen special rates.',
      keywords: ['fd calculator', 'fixed deposit maturity calculator', 'bank fd interest rates india'],
      canonicalSlug: 'fd-calculator',
    },
    formulaDescription: 'A = P × (1 + r/n)^(n×t), where n = 4 for quarterly compounding as used by Indian commercial banks.',
    workedExample: {
      inputSummary: 'Deposit of ₹5,00,000 for 3 years at 7.10% p.a. compounded quarterly',
      calculationSteps: [
        'Principal P = ₹5,00,000, Rate r = 0.071, n = 4, t = 3',
        'Maturity Amount A = 500000 × (1 + 0.071/4)^(4×3) = ₹6,17,823'
      ],
      finalResult: 'Invested: ₹5,00,000 | Interest Earned: ₹1,17,823 | Maturity: ₹6,17,823',
    },
    faqs: [
      {
        question: 'How frequently do Indian banks compound FD interest?',
        answer: 'Most scheduled commercial banks in India (SBI, HDFC, ICICI, etc.) compound FD interest on a quarterly basis (every 3 months).'
      },
      {
        question: 'Is FD interest taxable in India?',
        answer: 'Yes, FD interest is added to your total income and taxed according to your income tax slab. Banks deduct TDS (10%) if annual interest exceeds ₹40,000 (₹50,000 for senior citizens).'
      }
    ],
    relatedToolSlugs: ['sip-calculator', 'emi-calculator', 'salary-calculator']
  },

  // 4. GST Calculator
  {
    id: 'gst-calculator',
    slug: 'gst-calculator',
    name: 'GST Calculator (Goods & Services Tax)',
    shortName: 'GST Calculator',
    tagline: 'Calculate GST inclusive/exclusive amounts with CGST, SGST & IGST',
    description: 'Easily calculate GST for Indian goods & services across all standard tax slabs (0%, 5%, 12%, 18%, 28%). View exact CGST/SGST split and net amount.',
    category: 'money',
    icon: 'Receipt',
    keywords: ['gst', 'goods and services tax', 'gst 18', 'cgst', 'sgst', 'igst', 'gst invoice', 'gst billing'],
    popular: true,
    trending: true,
    views: 46000,
    seo: {
      title: 'GST Calculator India — Calculate GST Amount, CGST & SGST Split',
      description: 'Quick Indian GST Calculator for adding or removing GST with 5%, 12%, 18%, and 28% tax rates. Instant CGST, SGST & IGST breakdown.',
      keywords: ['gst calculator', 'gst calculator online india', 'calculate 18 percent gst', 'gst reverse calculation'],
      canonicalSlug: 'gst-calculator',
    },
    formulaDescription: 'GST Amount (Exclusive) = (Amount × GST Rate) / 100 | Original Amount (Inclusive) = Amount / (1 + GST Rate / 100)',
    workedExample: {
      inputSummary: 'Base amount ₹10,000 with 18% GST (Exclusive)',
      calculationSteps: [
        'Total GST = 10,000 × 0.18 = ₹1,800',
        'CGST (9%) = ₹900, SGST (9%) = ₹900',
        'Final Invoice Amount = ₹10,000 + ₹1,800 = ₹11,800'
      ],
      finalResult: 'Base: ₹10,000 | CGST: ₹900 | SGST: ₹900 | Total: ₹11,800',
    },
    faqs: [
      {
        question: 'What are the current GST tax slabs in India?',
        answer: 'The primary GST rate slabs in India are 0% (essential food items), 5% (basic necessities), 12% (processed foods/computers), 18% (most services & capital goods), and 28% (luxury items & automobiles).'
      },
      {
        question: 'What is the difference between CGST, SGST, and IGST?',
        answer: 'For intrastate (within the same state) sales, GST is split equally into CGST (Central GST) and SGST (State GST). For interstate (across state borders) sales, IGST (Integrated GST) applies.'
      }
    ],
    relatedToolSlugs: ['salary-calculator', 'emi-calculator', 'percentage-calculator']
  },

  // 5. Salary Calculator (In-Hand)
  {
    id: 'salary-calculator',
    slug: 'salary-calculator',
    name: 'In-Hand Salary Calculator (India)',
    shortName: 'Salary Calculator',
    tagline: 'Calculate take-home monthly salary after New Tax Regime, EPF & deductions',
    description: 'Convert your annual Cost to Company (CTC) into exact monthly take-home salary in India. Supports the New Tax Regime (FY 2024-25/2025-26 with ₹75,000 Standard Deduction), EPF, and Professional Tax.',
    category: 'money',
    icon: 'Banknote',
    keywords: ['salary', 'ctc to in hand', 'take home salary', 'new tax regime', 'income tax slabs', 'epf deduction', 'provident fund', 'tds on salary'],
    popular: true,
    trending: true,
    featured: true,
    badge: 'Updated FY 24-26',
    views: 52000,
    seo: {
      title: 'In-Hand Salary Calculator India — CTC to Take Home Pay (New Tax Regime)',
      description: 'Calculate your exact monthly in-hand salary from annual CTC. Includes Standard Deduction (₹75k), EPF, Professional Tax, and New Tax Regime slabs.',
      keywords: ['in hand salary calculator', 'ctc to take home calculator', 'salary calculator india new tax regime'],
      canonicalSlug: 'salary-calculator',
    },
    formulaDescription: 'Take Home = Gross Salary - (Income Tax / TDS + Employee EPF + Professional Tax)',
    workedExample: {
      inputSummary: 'Annual CTC ₹12,00,000 in the New Tax Regime',
      calculationSteps: [
        'Gross Monthly Salary ≈ ₹1,00,000',
        'Standard Deduction = ₹75,000',
        'Taxable Income = ₹11,25,000',
        'Tax under New Regime slabs + 4% cess ≈ ₹65,000/yr',
        'EPF (12% of basic) ≈ ₹4,800/mo | PT = ₹200/mo'
      ],
      finalResult: 'Gross: ₹1,00,000/mo | Deductions: ₹10,416/mo | Monthly In-Hand: ₹89,584',
    },
    faqs: [
      {
        question: 'What is the Standard Deduction in the New Tax Regime for salaried employees?',
        answer: 'The Standard Deduction has been enhanced to ₹75,000 for salaried employees under the New Tax Regime.'
      },
      {
        question: 'At what income is zero tax payable under the New Tax Regime?',
        answer: 'Salaried individuals with total income up to ₹7,75,000 pay zero income tax due to the ₹75,000 standard deduction and Section 87A rebate (up to ₹7 Lakh taxable income).'
      }
    ],
    relatedToolSlugs: ['emi-calculator', 'sip-calculator', 'gst-calculator']
  },

  // 6. Age Calculator
  {
    id: 'age-calculator',
    slug: 'age-calculator',
    name: 'Age & Birthday Countdown Calculator',
    shortName: 'Age Calculator',
    tagline: 'Calculate exact age in years, months, days, and time until next birthday',
    description: 'Find your precise age down to the day and minute, discover what day of the week you were born on, see total hours lived, and countdown to your next birthday.',
    category: 'daily-life',
    icon: 'Cake',
    keywords: ['age', 'dob', 'date of birth', 'age calculator online', 'birthday countdown', 'how old am i', 'exact age'],
    popular: true,
    trending: true,
    views: 49000,
    seo: {
      title: 'Age Calculator — Calculate Exact Age in Years, Months & Days Online',
      description: 'Free online Age Calculator to determine your exact age from Date of Birth, next birthday countdown, day of birth, and total days/hours lived.',
      keywords: ['age calculator', 'date of birth calculator', 'calculate exact age', 'how old am i calculator'],
      canonicalSlug: 'age-calculator',
    },
    formulaDescription: 'Calculates the difference between Date of Birth and Target Date accounting for leap years and exact calendar month days.',
    workedExample: {
      inputSummary: 'Date of Birth: 15 August 1995 | Reference Date: Today',
      calculationSteps: [
        'Computes year difference and adjusts for elapsed months',
        'Accounts for 28/29/30/31 days in intermediate months',
        'Calculates total calendar days and next birthday weekday'
      ],
      finalResult: 'Exact Age: 30 Years, 6 Months, 12 Days | Next Birthday in 172 Days',
    },
    faqs: [
      {
        question: 'How does this calculator handle leap years?',
        answer: 'The calculator calculates leap years precisely by checking if a year is divisible by 4 (and not 100, unless divisible by 400), ensuring accurate day totals.'
      },
      {
        question: 'Can I calculate my age on a past or future date?',
        answer: 'Yes! You can customize the reference "Age at Date" to see how old you were on a specific milestone or will be on a future date.'
      }
    ],
    relatedToolSlugs: ['date-difference-calculator', 'percentage-calculator', 'marks-percentage-calculator']
  },

  // 7. Percentage Calculator
  {
    id: 'percentage-calculator',
    slug: 'percentage-calculator',
    name: 'All-in-One Percentage Calculator',
    shortName: 'Percentage Calculator',
    tagline: 'Calculate percentage values, percentage increase/decrease, markup & discounts',
    description: 'Solve any percentage problem instantly: What is X% of Y? X is what % of Y? Percentage increase/decrease, discount savings, and profit margins.',
    category: 'daily-life',
    icon: 'Percent',
    keywords: ['percentage', 'percent', 'percentage increase', 'percentage decrease', 'discount calculator', 'markup', 'percentage formula'],
    popular: true,
    views: 39000,
    seo: {
      title: 'Percentage Calculator Online — Percentage Increase, Decrease & Discounts',
      description: 'Fast, multi-mode Percentage Calculator. Calculate percentage of a number, percentage change, markup, and discount values effortlessly.',
      keywords: ['percentage calculator', 'percent change calculator', 'calculate percentage of number', 'discount calculator'],
      canonicalSlug: 'percentage-calculator',
    },
    formulaDescription: 'Percentage = (Value / Total) × 100 | Percentage Change = ((New Value - Old Value) / Old Value) × 100',
    workedExample: {
      inputSummary: 'What is 18% of ₹45,000?',
      calculationSteps: [
        'Percentage value = (18 / 100) × 45,000 = 0.18 × 45,000 = 8,100'
      ],
      finalResult: '18% of ₹45,000 is ₹8,100',
    },
    faqs: [
      {
        question: 'How do you calculate percentage increase?',
        answer: 'Subtract the old value from the new value, divide by the old value, and multiply by 100. Formula: ((New - Old) / Old) × 100.'
      }
    ],
    relatedToolSlugs: ['gst-calculator', 'marks-percentage-calculator', 'cgpa-calculator']
  },

  // 8. Date Difference Calculator
  {
    id: 'date-difference-calculator',
    slug: 'date-difference-calculator',
    name: 'Date Difference & Working Days Calculator',
    shortName: 'Date Difference',
    tagline: 'Find days between two dates with working day & weekend exclusion',
    description: 'Calculate the exact number of days, weeks, months, and working days between two dates. Exclude Saturdays, Sundays, or calculate project deadlines.',
    category: 'daily-life',
    icon: 'Calendar',
    keywords: ['date difference', 'days between dates', 'working days', 'business days', 'calendar days', 'date duration'],
    popular: false,
    views: 22400,
    seo: {
      title: 'Date Difference Calculator — Days Between Dates & Working Days',
      description: 'Calculate the total days, calendar weeks, and business/working days between two dates. Filter out weekends and national holidays easily.',
      keywords: ['date difference calculator', 'days between dates calculator', 'working days calculator india'],
      canonicalSlug: 'date-difference-calculator',
    },
    formulaDescription: 'Duration = End Date - Start Date. Working days iterate through the range skipping designated weekend days.',
    workedExample: {
      inputSummary: '1st January to 31st March (90 Days)',
      calculationSteps: [
        'Total Calendar Days = 90 Days',
        'Total Weeks = 12 Weeks and 6 Days',
        'Working Days (excluding weekends) = 64 Days'
      ],
      finalResult: '90 Calendar Days | 64 Working Days',
    },
    faqs: [
      {
        question: 'Can I add or subtract days from a given date?',
        answer: 'Yes, this tool provides a "Date Adder" mode to find the exact target date after adding N days or business days.'
      }
    ],
    relatedToolSlugs: ['age-calculator', 'percentage-calculator']
  },

  // 9. Unit Converter (Indian & Global)
  {
    id: 'unit-converter',
    slug: 'unit-converter',
    name: 'Multi-Unit Converter (with Indian Land Units)',
    shortName: 'Unit Converter',
    tagline: 'Convert Area (Gaj, Bigha, Guntha, Sq Ft), Length, Weight, Temp & Speed',
    description: 'Convert between Indian land measurement units (Gaj, Bigha, Guntha, Cent, Biswa, Acre, Square Feet) as well as global units for length, mass, temperature, and speed.',
    category: 'daily-life',
    icon: 'ArrowLeftRight',
    keywords: ['unit converter', 'gaj to square feet', 'bigha to acre', 'guntha to sq ft', 'land measurement india', 'kg to lbs', 'meters to feet'],
    popular: true,
    featured: true,
    views: 37800,
    seo: {
      title: 'Indian Land & Multi-Unit Converter — Gaj, Bigha, Guntha, Sq Ft, Length, Weight',
      description: 'Complete Indian land unit converter: convert Gaj, Bigha, Guntha, Cent, Biswa, Acres to Square Feet. Also convert weight, length, volume, and temp.',
      keywords: ['indian land unit converter', 'gaj to sq ft converter', 'bigha to acre converter', 'unit converter online'],
      canonicalSlug: 'unit-converter',
    },
    formulaDescription: '1 Gaj = 9 Sq Ft (1 Sq Yard) | 1 Guntha = 1,089 Sq Ft (33x33 ft) | 1 Acre = 43,560 Sq Ft | 1 Bigha ≈ 27,225 Sq Ft (Standard Pucca)',
    workedExample: {
      inputSummary: 'Convert 100 Gaj to Square Feet and Square Meters',
      calculationSteps: [
        '1 Gaj = 9 Square Feet',
        '100 Gaj × 9 = 900 Square Feet',
        '900 Sq Ft / 10.764 = 83.61 Square Meters'
      ],
      finalResult: '100 Gaj = 900 Sq Ft = 83.61 Sq Meters',
    },
    faqs: [
      {
        question: 'How many square feet is 1 Gaj in India?',
        answer: '1 Gaj is equal to 9 Square Feet (or 1 Square Yard). For example, a 100 Gaj plot is 900 Sq Ft.'
      },
      {
        question: 'What is 1 Guntha in Maharashtra/Karnataka?',
        answer: '1 Guntha is standardly equal to 1,089 Square Feet (121 square yards or 101.17 square meters).'
      }
    ],
    relatedToolSlugs: ['area-calculator', 'paint-calculator', 'tile-calculator']
  },

  // 10. Paint Quantity & Cost Calculator
  {
    id: 'paint-calculator',
    slug: 'paint-calculator',
    name: 'Wall Paint Quantity & Cost Estimator',
    shortName: 'Paint Calculator',
    tagline: 'Calculate paint liters required, primer, and budget for rooms/home',
    description: 'Estimate exact liters of wall primer and emulsion paint needed for your house or room painting. Deduct doors & windows and calculate budget across Economy, Premium, and Luxury paint tiers.',
    category: 'home',
    icon: 'Paintbrush',
    keywords: ['paint calculator', 'wall paint liters', 'asian paints estimate', 'room painting cost', 'carpet area paint', 'primer requirement'],
    popular: false,
    views: 18500,
    seo: {
      title: 'Paint Calculator India — Estimate Paint Liters & Cost for Home Painting',
      description: 'Calculate paint quantity in liters and overall painting cost for your house or room. Accounts for carpet area, wall height, doors/windows, and 2 coats.',
      keywords: ['paint calculator india', 'wall paint estimator', 'how much paint do i need', 'home painting cost calculator'],
      canonicalSlug: 'paint-calculator',
    },
    formulaDescription: 'Wall Area = (2 × (Length + Width) × Height) - (Doors × 21 Sq Ft + Windows × 16 Sq Ft) + Ceiling Area. Paint Liters = (Wall Area × Coats) / Paint Coverage (Sq Ft/L).',
    workedExample: {
      inputSummary: '12 x 10 ft Room with 10 ft height, 1 door, 2 windows (2 Coats)',
      calculationSteps: [
        'Wall Perimeter = 2 × (12 + 10) = 44 ft | Wall Area = 44 × 10 = 440 sq ft',
        'Deductions = (1 door × 21) + (2 windows × 16) = 53 sq ft',
        'Ceiling Area = 12 × 10 = 120 sq ft',
        'Total Paintable Area = (440 - 53) + 120 = 507 sq ft',
        '2 Coats @ 120 sq ft/liter per coat ≈ 8.5 Liters'
      ],
      finalResult: 'Paint Required: 9 Liters (2 Coats) | Primer: 5 Liters | Est. Cost: ₹3,200 - ₹5,400',
    },
    faqs: [
      {
        question: 'What is the average coverage of 1 liter of emulsion paint in India?',
        answer: '1 liter of standard interior emulsion paint typically covers 110 to 140 square feet for a single coat (or 60-70 sq ft for two coats) on primed plaster walls.'
      }
    ],
    relatedToolSlugs: ['tile-calculator', 'unit-converter', 'area-calculator']
  },

  // 12. Tile Requirement Calculator
  {
    id: 'tile-calculator',
    slug: 'tile-calculator',
    name: 'Floor & Wall Tile Requirement Calculator',
    shortName: 'Tile Calculator',
    tagline: 'Calculate number of tile boxes & pieces with cutting wastage',
    description: 'Calculate exact number of floor or bathroom wall tiles and boxes needed for your room dimensions. Automatically includes 5%–10% cutting and breakage wastage.',
    category: 'home',
    icon: 'Grid',
    keywords: ['tile calculator', 'floor tiles', 'tile boxes required', 'tile square feet', 'kajaria tiles', 'bathroom tiles', 'tile wastage'],
    popular: false,
    views: 16900,
    seo: {
      title: 'Tile Calculator India — Calculate Floor & Wall Tiles Required & Box Count',
      description: 'Calculate the total number of tiles and boxes needed for your room or bathroom floor/walls. Includes customizable wastage allowance and pricing.',
      keywords: ['tile calculator', 'floor tile calculator india', 'calculate tile boxes needed', 'tile area calculator'],
      canonicalSlug: 'tile-calculator',
    },
    formulaDescription: 'Room Area = Length × Width | Tile Area = (Tile L × Tile W) / 144 (for inches) | Total Tiles = (Room Area / Tile Area) × (1 + Wastage %)',
    workedExample: {
      inputSummary: '14 x 12 ft Room using 2 x 2 ft (24x24 inch) vitrified tiles with 8% wastage',
      calculationSteps: [
        'Room Area = 14 × 12 = 168 Sq Ft',
        'Tile Size = 2 × 2 = 4 Sq Ft per tile',
        'Base Tiles = 168 / 4 = 42 tiles',
        'With 8% wastage = 42 × 1.08 = 45.36 → 46 Tiles',
        'Standard 4 tiles per box = 12 Boxes (48 tiles total)'
      ],
      finalResult: 'Total Area: 168 Sq Ft | Tiles Needed: 46 (12 Boxes)',
    },
    faqs: [
      {
        question: 'Why should I add 5% to 10% wastage when buying tiles?',
        answer: 'Tiles must be cut to fit along walls, corners, pipes, and doorways. Unavoidable cutting breakage makes having extra tiles essential so you don’t run short of the same dye lot.'
      }
    ],
    relatedToolSlugs: ['paint-calculator', 'unit-converter']
  },

  // 13. Marks Percentage Calculator
  {
    id: 'marks-percentage-calculator',
    slug: 'marks-percentage-calculator',
    name: 'Marks Percentage & Grade Calculator',
    shortName: 'Marks Percentage',
    tagline: 'Calculate total percentage, CBSE/State grade, and exam cutoff',
    description: 'Calculate your overall percentage and letter grade from total marks obtained across subjects. Enter subject-by-subject marks or overall aggregate.',
    category: 'education',
    icon: 'Award',
    keywords: ['marks percentage', '10th percentage', '12th percentage', 'cbse grade', 'exam percentage calculator', 'board exam marks'],
    popular: true,
    views: 34000,
    seo: {
      title: 'Marks Percentage Calculator — CBSE & State Board Marks to Percentage',
      description: 'Calculate total percentage from marks scored in school and college board exams. Find your CBSE grade point, division, and cutoff marks.',
      keywords: ['marks percentage calculator', 'cbse marks to percentage', 'calculate 12th board percentage'],
      canonicalSlug: 'marks-percentage-calculator',
    },
    formulaDescription: 'Percentage = (Total Marks Obtained / Maximum Total Marks) × 100',
    workedExample: {
      inputSummary: 'Scored 465 out of 500 in 12th Board Exams (5 subjects)',
      calculationSteps: [
        'Percentage = (465 / 500) × 100 = 0.93 × 100 = 93.00%',
        'Grade: A1 (Top tier) | Distinction Division'
      ],
      finalResult: 'Percentage: 93.00% | Grade: A1 (Distinction)',
    },
    faqs: [
      {
        question: 'How is best-of-5 percentage calculated for CBSE class 10/12?',
        answer: 'CBSE calculates aggregate percentage based on one language subject plus your top 4 highest-scoring academic subjects out of the 6 subjects taken.'
      }
    ],
    relatedToolSlugs: ['cgpa-calculator', 'percentage-calculator']
  },

  // 14. CGPA to Percentage Calculator
  {
    id: 'cgpa-calculator',
    slug: 'cgpa-calculator',
    name: 'CGPA to Percentage & Division Converter',
    shortName: 'CGPA Converter',
    tagline: 'Convert 10-point CGPA/SGPA to percentage for CBSE, Mumbai, VTU, KTU, AICTE',
    description: 'Convert your cumulative grade point average (CGPA) into equivalent percentage and classification division using standardized Indian university and CBSE conversion formulas.',
    category: 'education',
    icon: 'GraduationCap',
    keywords: ['cgpa to percentage', 'cbse cgpa', 'cgpa converter', 'sgpa to percentage', 'vtu cgpa', 'mumbai university cgpa', 'aicte cgpa formula'],
    popular: true,
    trending: true,
    views: 41000,
    seo: {
      title: 'CGPA to Percentage Calculator — CBSE, AICTE & Indian University Formula',
      description: 'Convert CGPA to percentage online using CBSE (CGPA × 9.5), AICTE ((CGPA - 0.75) × 10), Mumbai Uni, and VTU conversion standards.',
      keywords: ['cgpa to percentage calculator', 'convert cgpa to percentage', 'cbse 9.5 formula cgpa', 'sgpa to percentage'],
      canonicalSlug: 'cgpa-calculator',
    },
    formulaDescription: 'CBSE Formula: Percentage = CGPA × 9.5 | AICTE Formula: Percentage = (CGPA - 0.75) × 10 | Mumbai University: (CGPA × 7.1) + 11 or 7.25 scale',
    workedExample: {
      inputSummary: '8.8 CGPA converted using CBSE standard formula',
      calculationSteps: [
        'Formula: Percentage = 8.8 × 9.5',
        'Percentage = 83.60%',
        'Division: First Class with Distinction'
      ],
      finalResult: '8.8 CGPA = 83.60% (First Class with Distinction)',
    },
    faqs: [
      {
        question: 'Why does CBSE multiply CGPA by 9.5 to get percentage?',
        answer: 'CBSE analyzed historical candidate scores and found that the average percentage obtained by top performers corresponds to a 9.5 scaling factor.'
      },
      {
        question: 'What is the AICTE formula for converting CGPA to percentage in engineering?',
        answer: 'The official AICTE guideline specifies: Percentage Marks = (CGPA - 0.75) × 10.'
      }
    ],
    relatedToolSlugs: ['marks-percentage-calculator', 'percentage-calculator']
  },

  // 15. Fuel Cost & Trip Split Calculator
  {
    id: 'fuel-cost-calculator',
    slug: 'fuel-cost-calculator',
    name: 'Fuel Cost & Trip Expense Split Calculator',
    shortName: 'Fuel Cost Calculator',
    tagline: 'Calculate petrol/diesel cost and split road trip expenses per person',
    description: 'Calculate fuel expenses for your vehicle road trip across India based on distance (km), vehicle mileage (km/l), and current petrol, diesel, or CNG rates. Split the bill among passengers.',
    category: 'travel',
    icon: 'Fuel',
    keywords: ['fuel cost', 'petrol cost calculator', 'mileage calculator', 'road trip cost', 'diesel price trip', 'split fuel cost', 'car trip budget'],
    popular: false,
    trending: true,
    views: 28300,
    seo: {
      title: 'Fuel Cost Calculator India — Petrol & Diesel Road Trip Expense Split',
      description: 'Calculate total fuel required and cost for your road trip in India. Input mileage, fuel price, AC factor, and split expenses equally among friends.',
      keywords: ['fuel cost calculator india', 'petrol cost for trip', 'road trip expense split calculator', 'car mileage calculator'],
      canonicalSlug: 'fuel-cost-calculator',
    },
    formulaDescription: 'Fuel Needed (Liters) = Distance (km) / Mileage (km/L). Total Fuel Cost = Fuel Needed × Price per Liter. Per Person = Total Cost / Passengers.',
    workedExample: {
      inputSummary: 'Mumbai to Goa Trip (580 km), Car Mileage 16 km/l, Petrol ₹104/L, 4 Passengers',
      calculationSteps: [
        'Total Fuel Liters = 580 / 16 = 36.25 Liters',
        'Total Fuel Cost = 36.25 × ₹104 = ₹3,770',
        'Toll budget estimate = ₹650 | Total Trip = ₹4,420',
        'Per Person Split = ₹4,420 / 4 = ₹1,105'
      ],
      finalResult: 'Fuel Liters: 36.25 L | Total Cost: ₹3,770 | Cost Per Person: ₹942.50 (Fuel only)',
    },
    faqs: [
      {
        question: 'How much does continuous AC usage reduce car fuel economy?',
        answer: 'In Indian driving conditions, running the car air conditioner continuously generally reduces fuel economy by approximately 8% to 12% in city traffic and 5% to 8% on highways.'
      }
    ],
    relatedToolSlugs: ['unit-converter', 'salary-calculator', 'emi-calculator']
  },

  // 16. Indian Formal Letter & Leave Generator
  {
    id: 'letter-generator',
    slug: 'letter-generator',
    name: 'Indian Resignation & Leave Letter Generator',
    shortName: 'Letter Generator',
    tagline: 'Generate professional resignation letters, sick/casual leave, & WFH requests',
    description: 'Quickly create well-formatted, professional Indian workplace letters: Formal Resignation Letter (with notice period waiver/standard terms), Medical/Sick Leave, Casual Leave, and Work From Home requests with 1-click copy & print.',
    category: 'documents',
    icon: 'FileText',
    keywords: ['resignation letter', 'leave application', 'sick leave format', 'casual leave application', 'resignation letter format india', 'notice period email'],
    popular: true,
    trending: false,
    featured: true,
    badge: 'Utility',
    views: 31000,
    seo: {
      title: 'Indian Resignation Letter & Leave Application Generator — Formats & Templates',
      description: 'Generate customized professional resignation letters and leave application formats for Indian companies with notice period options. 100% free with 1-click copy.',
      keywords: ['resignation letter format india', 'leave application format', 'sick leave application office', 'wfh email template'],
      canonicalSlug: 'letter-generator',
    },
    formulaDescription: 'Generates standardized HR-compliant Indian corporate correspondence templates with dynamic company, role, date, and reason variables.',
    workedExample: {
      inputSummary: 'Software Engineer resigning with 30-day notice period',
      calculationSteps: [
        'Injects employee name, manager name, designation, and last working date',
        'Structures standard gratitude paragraph, handover commitment, and formal closure'
      ],
      finalResult: 'Ready-to-send formal resignation letter ready for email or PDF export',
    },
    faqs: [
      {
        question: 'What should be included in a formal Indian resignation letter?',
        answer: 'Always include your official resignation statement, designation, requested last working day based on your employment contract notice period, offer of smooth handover assistance, and a polite note of gratitude.'
      }
    ],
    relatedToolSlugs: ['salary-calculator', 'date-difference-calculator']
  }
];

export function getToolBySlug(slug: string): Tool | undefined {
  return TOOLS_REGISTRY.find(t => t.slug === slug || t.id === slug);
}

export function getToolsByCategory(categoryId: string): Tool[] {
  return TOOLS_REGISTRY.filter(t => t.category === categoryId);
}

export function getPopularTools(limit: number = 8): Tool[] {
  return TOOLS_REGISTRY.filter(t => t.popular).slice(0, limit);
}

export function getTrendingTools(limit: number = 6): Tool[] {
  return TOOLS_REGISTRY.filter(t => t.trending || t.popular).slice(0, limit);
}
