import { ElectricityTariff, StateDiscomGroup } from '../types/electricity';

export const ALL_ELECTRICITY_TARIFFS: ElectricityTariff[] = [
  // ==========================================
  // 1. ANDHRA PRADESH
  // ==========================================
  {
    id: 'ap-domestic',
    state: 'Andhra Pradesh',
    stateSlug: 'andhra-pradesh',
    stateCode: 'AP',
    unionTerritory: false,
    discom: 'APCPDCL / APEPDCL / APSPDCL',
    discomShort: 'AP DISCOMs',
    category: 'LT Category-I Domestic (Residential)',
    billingCycle: 'monthly',
    defaultSanctionedLoadKw: 1,
    fixedCharge: 10,
    fixedChargeUnit: 'per_kw_month',
    meterCharge: 0,
    dutyType: 'per_unit',
    dutyRate: 0.06,
    fuelAdjustmentChargePerUnit: 0.20,
    slabs: [
      { minUnits: 0, maxUnits: 30, ratePerUnit: 1.90, name: '0–30 Units' },
      { minUnits: 31, maxUnits: 75, ratePerUnit: 3.00, name: '31–75 Units' },
      { minUnits: 76, maxUnits: 125, ratePerUnit: 4.50, name: '76–125 Units' },
      { minUnits: 126, maxUnits: 225, ratePerUnit: 6.00, name: '126–225 Units' },
      { minUnits: 226, maxUnits: 400, ratePerUnit: 8.75, name: '226–400 Units' },
      { minUnits: 401, maxUnits: null, ratePerUnit: 9.75, name: 'Above 400 Units' },
    ],
    subsidy: null,
    effectiveFrom: '2024-04-01',
    effectiveTo: null,
    source: 'Andhra Pradesh Electricity Regulatory Commission (APERC)',
    sourceUrl: 'https://aperc.gov.in',
    lastUpdated: 'FY 2024–25 Tariff Order',
    notes: 'Telescopic telescopic domestic billing with graded slab progression across AP Discoms.'
  },

  // ==========================================
  // 2. ARUNACHAL PRADESH
  // ==========================================
  {
    id: 'arunachal-domestic',
    state: 'Arunachal Pradesh',
    stateSlug: 'arunachal-pradesh',
    stateCode: 'AR',
    unionTerritory: false,
    discom: 'Department of Power, Arunachal Pradesh',
    discomShort: 'DoP Arunachal',
    category: 'Domestic (Residential)',
    billingCycle: 'monthly',
    defaultSanctionedLoadKw: 1,
    fixedCharge: 40,
    fixedChargeUnit: 'per_month',
    meterCharge: 10,
    dutyType: 'percentage',
    dutyRate: 5,
    slabs: [
      { minUnits: 0, maxUnits: 50, ratePerUnit: 4.00, name: '0–50 Units' },
      { minUnits: 51, maxUnits: 200, ratePerUnit: 4.60, name: '51–200 Units' },
      { minUnits: 201, maxUnits: null, ratePerUnit: 5.10, name: 'Above 200 Units' },
    ],
    effectiveFrom: '2024-04-01',
    source: 'Joint Electricity Regulatory Commission (JERC) / APERC',
    sourceUrl: 'https://jerc.mizoram.gov.in',
    lastUpdated: 'FY 2024–25 Tariff Order',
  },

  // ==========================================
  // 3. ASSAM
  // ==========================================
  {
    id: 'assam-domestic',
    state: 'Assam',
    stateSlug: 'assam',
    stateCode: 'AS',
    unionTerritory: false,
    discom: 'Assam Power Distribution Company Limited (APDCL)',
    discomShort: 'APDCL',
    category: 'Domestic-A (LT Residential)',
    billingCycle: 'monthly',
    defaultSanctionedLoadKw: 2,
    fixedCharge: 60,
    fixedChargeUnit: 'per_kw_month',
    meterCharge: 0,
    dutyType: 'per_unit',
    dutyRate: 0.20,
    fuelAdjustmentChargePerUnit: 0.30,
    slabs: [
      { minUnits: 0, maxUnits: 120, ratePerUnit: 5.90, name: '0–120 Units' },
      { minUnits: 121, maxUnits: 240, ratePerUnit: 7.25, name: '121–240 Units' },
      { minUnits: 241, maxUnits: null, ratePerUnit: 8.30, name: 'Above 240 Units' },
    ],
    subsidy: null,
    effectiveFrom: '2024-04-01',
    source: 'Assam Electricity Regulatory Commission (AERC)',
    sourceUrl: 'https://www.apdcl.org',
    lastUpdated: 'FY 2024–25 Retail Tariff Schedule',
    notes: 'Jeevan Dhara BPL tariff is ₹4.35/unit for consumption up to 30 units.'
  },

  // ==========================================
  // 4. BIHAR
  // ==========================================
  {
    id: 'bihar-urban',
    state: 'Bihar',
    stateSlug: 'bihar',
    stateCode: 'BR',
    unionTerritory: false,
    discom: 'NBPDCL / SBPDCL (Urban Domestic DS-II)',
    discomShort: 'NBPDCL / SBPDCL',
    category: 'Domestic DS-II (Urban Residential)',
    billingCycle: 'monthly',
    defaultSanctionedLoadKw: 2,
    fixedCharge: 40,
    fixedChargeUnit: 'per_kw_month',
    meterCharge: 0,
    dutyType: 'percentage',
    dutyRate: 6,
    slabs: [
      { minUnits: 0, maxUnits: 100, ratePerUnit: 4.27, name: '0–100 Units (Post-Subsidy)' },
      { minUnits: 101, maxUnits: 200, ratePerUnit: 5.22, name: '101–200 Units' },
      { minUnits: 201, maxUnits: 300, ratePerUnit: 6.12, name: '201–300 Units' },
      { minUnits: 301, maxUnits: null, ratePerUnit: 7.22, name: 'Above 300 Units' },
    ],
    effectiveFrom: '2024-04-01',
    source: 'Bihar Electricity Regulatory Commission (BERC)',
    sourceUrl: 'https://berc.bihar.gov.in',
    lastUpdated: 'FY 2024–25 Tariff Order (Includes State Govt Energy Subvention)',
  },

  // ==========================================
  // 5. CHHATTISGARH
  // ==========================================
  {
    id: 'chhattisgarh-domestic',
    state: 'Chhattisgarh',
    stateSlug: 'chhattisgarh',
    stateCode: 'CG',
    unionTerritory: false,
    discom: 'Chhattisgarh State Power Distribution Company Ltd (CSPDCL)',
    discomShort: 'CSPDCL',
    category: 'LV-1 Domestic Residential',
    billingCycle: 'monthly',
    defaultSanctionedLoadKw: 2,
    fixedCharge: 20,
    fixedChargeUnit: 'per_kw_month',
    meterCharge: 0,
    dutyType: 'percentage',
    dutyRate: 7,
    slabs: [
      { minUnits: 0, maxUnits: 100, ratePerUnit: 3.70, name: '0–100 Units' },
      { minUnits: 101, maxUnits: 200, ratePerUnit: 3.90, name: '101–200 Units' },
      { minUnits: 201, maxUnits: 400, ratePerUnit: 5.30, name: '201–400 Units' },
      { minUnits: 401, maxUnits: 600, ratePerUnit: 6.30, name: '401–600 Units' },
      { minUnits: 601, maxUnits: null, ratePerUnit: 7.90, name: 'Above 600 Units' },
    ],
    subsidy: {
      name: 'Half Electricity Bill Scheme (Bijli Bill Half Yojana)',
      schemeName: 'Chhattisgarh Half Electricity Scheme',
      description: '50% discount on energy charges for domestic consumption up to 400 units/month.',
      type: 'percentage_discount',
      percentageDiscount: 50,
      qualifyingMaxUnits: 400,
      defaultOptIn: true,
    },
    effectiveFrom: '2024-04-01',
    source: 'Chhattisgarh State Electricity Regulatory Commission (CSERC)',
    sourceUrl: 'https://cserc.gov.in',
    lastUpdated: 'FY 2024–25 Tariff Order',
  },

  // ==========================================
  // 6. GOA
  // ==========================================
  {
    id: 'goa-domestic',
    state: 'Goa',
    stateSlug: 'goa',
    stateCode: 'GA',
    unionTerritory: false,
    discom: 'Electricity Department, Government of Goa',
    discomShort: 'Goa Electricity Dept',
    category: 'LTD Domestic Residential',
    billingCycle: 'monthly',
    defaultSanctionedLoadKw: 2,
    fixedCharge: 35,
    fixedChargeUnit: 'per_kw_month',
    meterCharge: 15,
    dutyType: 'per_unit',
    dutyRate: 0.05,
    slabs: [
      { minUnits: 0, maxUnits: 100, ratePerUnit: 1.75, name: '0–100 Units' },
      { minUnits: 101, maxUnits: 200, ratePerUnit: 2.60, name: '101–200 Units' },
      { minUnits: 201, maxUnits: 300, ratePerUnit: 3.30, name: '201–300 Units' },
      { minUnits: 301, maxUnits: 400, ratePerUnit: 4.40, name: '301–400 Units' },
      { minUnits: 401, maxUnits: null, ratePerUnit: 5.10, name: 'Above 400 Units' },
    ],
    effectiveFrom: '2024-04-01',
    source: 'Joint Electricity Regulatory Commission (JERC Goa & UTs)',
    sourceUrl: 'https://jercuts.gov.in',
    lastUpdated: 'FY 2024–25 Tariff Schedule',
  },

  // ==========================================
  // 7. GUJARAT
  // ==========================================
  {
    id: 'gujarat-guvnl',
    state: 'Gujarat',
    stateSlug: 'gujarat',
    stateCode: 'GJ',
    unionTerritory: false,
    discom: 'GUVNL (UGVCL, DGVCL, MGVCL, PGVCL)',
    discomShort: 'UGVCL / DGVCL / MGVCL / PGVCL',
    category: 'RGP (Residential General Purpose)',
    billingCycle: 'monthly',
    defaultSanctionedLoadKw: 2,
    fixedCharge: 25,
    fixedChargeUnit: 'per_month',
    meterCharge: 0,
    dutyType: 'percentage',
    dutyRate: 15,
    fuelAdjustmentChargePerUnit: 2.15,
    slabs: [
      { minUnits: 0, maxUnits: 100, ratePerUnit: 3.05, name: '0–100 Units' },
      { minUnits: 101, maxUnits: 250, ratePerUnit: 3.50, name: '101–250 Units' },
      { minUnits: 251, maxUnits: null, ratePerUnit: 5.20, name: 'Above 250 Units' },
    ],
    effectiveFrom: '2024-04-01',
    source: 'Gujarat Electricity Regulatory Commission (GERC)',
    sourceUrl: 'https://gercin.org',
    lastUpdated: 'FY 2024–25 Tariff Order & FPPPA',
    notes: 'Includes FPPPA (Fuel Price and Power Purchase Adjustment) of ₹2.15/unit.'
  },
  {
    id: 'gujarat-torrent',
    state: 'Gujarat',
    stateSlug: 'gujarat',
    stateCode: 'GJ',
    unionTerritory: false,
    discom: 'Torrent Power (Ahmedabad / Gandhinagar / Surat)',
    discomShort: 'Torrent Power',
    category: 'RGP (Residential General Purpose)',
    billingCycle: 'monthly',
    defaultSanctionedLoadKw: 2,
    fixedCharge: 25,
    fixedChargeUnit: 'per_month',
    meterCharge: 0,
    dutyType: 'percentage',
    dutyRate: 15,
    fuelAdjustmentChargePerUnit: 2.20,
    slabs: [
      { minUnits: 0, maxUnits: 50, ratePerUnit: 3.20, name: '0–50 Units' },
      { minUnits: 51, maxUnits: 100, ratePerUnit: 3.65, name: '51–100 Units' },
      { minUnits: 101, maxUnits: 250, ratePerUnit: 4.25, name: '101–250 Units' },
      { minUnits: 251, maxUnits: null, ratePerUnit: 5.05, name: 'Above 250 Units' },
    ],
    effectiveFrom: '2024-04-01',
    source: 'Gujarat Electricity Regulatory Commission (GERC)',
    sourceUrl: 'https://www.torrentpower.com',
    lastUpdated: 'FY 2024–25 Tariff Schedule',
  },

  // ==========================================
  // 8. HARYANA
  // ==========================================
  {
    id: 'haryana-domestic',
    state: 'Haryana',
    stateSlug: 'haryana',
    stateCode: 'HR',
    unionTerritory: false,
    discom: 'DHBVN / UHBVN',
    discomShort: 'DHBVN / UHBVN',
    category: 'Domestic Supply (DS Category)',
    billingCycle: 'monthly',
    defaultSanctionedLoadKw: 2,
    fixedCharge: 50,
    fixedChargeUnit: 'per_kw_month',
    meterCharge: 0,
    dutyType: 'per_unit',
    dutyRate: 0.10,
    fuelAdjustmentChargePerUnit: 0.37,
    slabs: [
      { minUnits: 0, maxUnits: 50, ratePerUnit: 2.00, name: '0–50 Units' },
      { minUnits: 51, maxUnits: 100, ratePerUnit: 2.50, name: '51–100 Units' },
      { minUnits: 101, maxUnits: 150, ratePerUnit: 2.75, name: '101–150 Units' },
      { minUnits: 151, maxUnits: 250, ratePerUnit: 5.25, name: '151–250 Units' },
      { minUnits: 251, maxUnits: 500, ratePerUnit: 6.30, name: '251–500 Units' },
      { minUnits: 501, maxUnits: null, ratePerUnit: 7.10, name: 'Above 500 Units' },
    ],
    effectiveFrom: '2024-04-01',
    source: 'Haryana Electricity Regulatory Commission (HERC)',
    sourceUrl: 'https://herc.gov.in',
    lastUpdated: 'FY 2024–25 Distribution Tariff Order',
  },

  // ==========================================
  // 9. HIMACHAL PRADESH
  // ==========================================
  {
    id: 'himachal-domestic',
    state: 'Himachal Pradesh',
    stateSlug: 'himachal-pradesh',
    stateCode: 'HP',
    unionTerritory: false,
    discom: 'Himachal Pradesh State Electricity Board (HPSEBL)',
    discomShort: 'HPSEBL',
    category: 'Domestic Supply (DS)',
    billingCycle: 'monthly',
    defaultSanctionedLoadKw: 2,
    fixedCharge: 50,
    fixedChargeUnit: 'per_month',
    meterCharge: 0,
    dutyType: 'percentage',
    dutyRate: 11,
    slabs: [
      { minUnits: 0, maxUnits: 60, ratePerUnit: 0.00, name: '0–60 Units (Lifeline Subsidized)' },
      { minUnits: 61, maxUnits: 125, ratePerUnit: 1.55, name: '61–125 Units' },
      { minUnits: 126, maxUnits: 300, ratePerUnit: 3.95, name: '126–300 Units' },
      { minUnits: 301, maxUnits: null, ratePerUnit: 5.05, name: 'Above 300 Units' },
    ],
    subsidy: {
      name: 'HP Free 125 Units Scheme',
      schemeName: 'HP Domestic Relief Subsidy',
      description: 'First 60 units free and heavily subsidized energy charge for consumption up to 125 units.',
      type: 'free_units_threshold',
      qualifyingMaxUnits: 125,
      defaultOptIn: true,
    },
    effectiveFrom: '2024-04-01',
    source: 'Himachal Pradesh Electricity Regulatory Commission (HPERC)',
    sourceUrl: 'https://www.hpseb.in',
    lastUpdated: 'FY 2024–25 Tariff Order',
  },

  // ==========================================
  // 10. JHARKHAND
  // ==========================================
  {
    id: 'jharkhand-domestic',
    state: 'Jharkhand',
    stateSlug: 'jharkhand',
    stateCode: 'JH',
    unionTerritory: false,
    discom: 'Jharkhand Bijli Vitran Nigam Ltd (JBVNL)',
    discomShort: 'JBVNL',
    category: 'Domestic (DS-II Urban)',
    billingCycle: 'monthly',
    defaultSanctionedLoadKw: 2,
    fixedCharge: 75,
    fixedChargeUnit: 'per_month',
    meterCharge: 0,
    dutyType: 'percentage',
    dutyRate: 6,
    slabs: [
      { minUnits: 0, maxUnits: 125, ratePerUnit: 0.00, name: '0–125 Units (State Free Subsidy)' },
      { minUnits: 126, maxUnits: 400, ratePerUnit: 6.25, name: '126–400 Units' },
      { minUnits: 401, maxUnits: null, ratePerUnit: 6.25, name: 'Above 400 Units' },
    ],
    subsidy: {
      name: 'Jharkhand 125 Units Free Scheme',
      schemeName: 'Mukhyamantri Urja Yojana',
      description: '125 units free electricity per month for domestic consumers in Jharkhand.',
      type: 'free_units_threshold',
      qualifyingMaxUnits: 125,
      defaultOptIn: true,
    },
    effectiveFrom: '2024-04-01',
    source: 'Jharkhand State Electricity Regulatory Commission (JSERC)',
    sourceUrl: 'https://jserc.org',
    lastUpdated: 'FY 2024–25 Tariff Order',
  },

  // ==========================================
  // 11. KARNATAKA
  // ==========================================
  {
    id: 'karnataka-bescom',
    state: 'Karnataka',
    stateSlug: 'karnataka',
    stateCode: 'KA',
    unionTerritory: false,
    discom: 'BESCOM / HESCOM / MESCOM / GESCOM / CESC',
    discomShort: 'BESCOM & State DISCOMs',
    category: 'LT-2(a) Domestic Residential',
    billingCycle: 'monthly',
    defaultSanctionedLoadKw: 2,
    fixedCharge: 110,
    fixedChargeUnit: 'per_kw_month',
    meterCharge: 0,
    dutyType: 'percentage',
    dutyRate: 9,
    fuelAdjustmentChargePerUnit: 0.28,
    slabs: [
      { minUnits: 0, maxUnits: 100, ratePerUnit: 4.75, name: '0–100 Units' },
      { minUnits: 101, maxUnits: 200, ratePerUnit: 7.00, name: '101–200 Units' },
      { minUnits: 201, maxUnits: null, ratePerUnit: 8.25, name: 'Above 200 Units' },
    ],
    subsidy: {
      name: 'Gruha Jyothi Scheme',
      schemeName: 'Karnataka Gruha Jyothi (Up to 200 Units Free)',
      description: 'Zero electricity bill for eligible domestic consumers utilizing up to 200 units/month (based on entitlement average).',
      type: 'free_units_threshold',
      qualifyingMaxUnits: 200,
      waiveFixedCharge: true,
      defaultOptIn: true,
    },
    effectiveFrom: '2024-04-01',
    source: 'Karnataka Electricity Regulatory Commission (KERC)',
    sourceUrl: 'https://kerc.karnataka.gov.in',
    lastUpdated: 'FY 2024–25 Tariff Order & Gruha Jyothi Guidelines',
  },

  // ==========================================
  // 12. KERALA
  // ==========================================
  {
    id: 'kerala-kseb',
    state: 'Kerala',
    stateSlug: 'kerala',
    stateCode: 'KL',
    unionTerritory: false,
    discom: 'Kerala State Electricity Board (KSEBL)',
    discomShort: 'KSEB',
    category: 'LT-1A Domestic Residential (Telescopic)',
    billingCycle: 'monthly',
    defaultSanctionedLoadKw: 2,
    fixedCharge: 70,
    fixedChargeUnit: 'per_month',
    meterCharge: 0,
    dutyType: 'percentage',
    dutyRate: 10,
    fuelAdjustmentChargePerUnit: 0.10,
    slabs: [
      { minUnits: 0, maxUnits: 50, ratePerUnit: 3.25, name: '0–50 Units' },
      { minUnits: 51, maxUnits: 100, ratePerUnit: 4.05, name: '51–100 Units' },
      { minUnits: 101, maxUnits: 150, ratePerUnit: 5.10, name: '101–150 Units' },
      { minUnits: 151, maxUnits: 200, ratePerUnit: 6.95, name: '151–200 Units' },
      { minUnits: 201, maxUnits: 250, ratePerUnit: 8.20, name: '201–250 Units' },
      { minUnits: 251, maxUnits: null, ratePerUnit: 8.80, name: 'Above 250 Units (Non-telescopic)' },
    ],
    effectiveFrom: '2024-04-01',
    source: 'Kerala State Electricity Regulatory Commission (KSERC)',
    sourceUrl: 'https://erckerala.org',
    lastUpdated: 'FY 2024–25 Tariff Order',
  },

  // ==========================================
  // 13. MADHYA PRADESH
  // ==========================================
  {
    id: 'madhyapradesh-domestic',
    state: 'Madhya Pradesh',
    stateSlug: 'madhya-pradesh',
    stateCode: 'MP',
    unionTerritory: false,
    discom: 'MPPKVVCL (East / West / Central Discoms)',
    discomShort: 'MPPKVVCL',
    category: 'LV-1 Domestic (Urban/Rural)',
    billingCycle: 'monthly',
    defaultSanctionedLoadKw: 1,
    fixedCharge: 80,
    fixedChargeUnit: 'per_kw_month',
    meterCharge: 0,
    dutyType: 'percentage',
    dutyRate: 9,
    fuelAdjustmentChargePerUnit: 0.15,
    slabs: [
      { minUnits: 0, maxUnits: 30, ratePerUnit: 3.34, name: '0–30 Units' },
      { minUnits: 31, maxUnits: 50, ratePerUnit: 4.27, name: '31–50 Units' },
      { minUnits: 51, maxUnits: 100, ratePerUnit: 5.23, name: '51–100 Units' },
      { minUnits: 101, maxUnits: 300, ratePerUnit: 6.61, name: '101–300 Units' },
      { minUnits: 301, maxUnits: null, ratePerUnit: 6.85, name: 'Above 300 Units' },
    ],
    subsidy: {
      name: 'Indira Grah Jyoti Yojana (IGJY)',
      schemeName: 'MP Indira Grah Jyoti Subsidy',
      description: 'Eligible domestic consumers billed ₹100 flat for first 100 units.',
      type: 'flat_rebate',
      qualifyingMaxUnits: 150,
      flatAmount: 150,
      defaultOptIn: false,
    },
    effectiveFrom: '2024-04-01',
    source: 'Madhya Pradesh Electricity Regulatory Commission (MPERC)',
    sourceUrl: 'https://mperc.in',
    lastUpdated: 'FY 2024–25 Tariff Order',
  },

  // ==========================================
  // 14. MAHARASHTRA
  // ==========================================
  {
    id: 'maharashtra-msedcl',
    state: 'Maharashtra',
    stateSlug: 'maharashtra',
    stateCode: 'MH',
    unionTerritory: false,
    discom: 'MSEDCL (Mahavitaran - Rest of Maharashtra & MMR)',
    discomShort: 'MSEDCL (Mahavitaran)',
    category: 'LT-I (B) Residential (Domestic)',
    billingCycle: 'monthly',
    defaultSanctionedLoadKw: 2,
    fixedCharge: 128,
    fixedChargeUnit: 'per_month',
    meterCharge: 0,
    dutyType: 'percentage',
    dutyRate: 16,
    fuelAdjustmentChargePerUnit: 0.45,
    slabs: [
      { minUnits: 0, maxUnits: 100, ratePerUnit: 4.71, name: '0–100 Units' },
      { minUnits: 101, maxUnits: 300, ratePerUnit: 10.29, name: '101–300 Units' },
      { minUnits: 301, maxUnits: 500, ratePerUnit: 14.55, name: '301–500 Units' },
      { minUnits: 501, maxUnits: null, ratePerUnit: 16.64, name: 'Above 500 Units' },
    ],
    effectiveFrom: '2024-04-01',
    source: 'Maharashtra Electricity Regulatory Commission (MERC)',
    sourceUrl: 'https://merc.gov.in',
    lastUpdated: 'FY 2024–25 Tariff Order (Multi-Year Tariff MYT)',
    notes: 'Electricity Duty is 16% + Tax on Sale of Electricity (TOSE) and FAC (Fuel Adjustment Charge).'
  },
  {
    id: 'maharashtra-tata',
    state: 'Maharashtra',
    stateSlug: 'maharashtra',
    stateCode: 'MH',
    unionTerritory: false,
    discom: 'Tata Power (Mumbai Suburban & City)',
    discomShort: 'Tata Power Mumbai',
    category: 'LT-1 Domestic Residential',
    billingCycle: 'monthly',
    defaultSanctionedLoadKw: 2,
    fixedCharge: 90,
    fixedChargeUnit: 'per_month',
    meterCharge: 0,
    dutyType: 'percentage',
    dutyRate: 16,
    fuelAdjustmentChargePerUnit: 0.35,
    slabs: [
      { minUnits: 0, maxUnits: 100, ratePerUnit: 3.74, name: '0–100 Units' },
      { minUnits: 101, maxUnits: 300, ratePerUnit: 6.92, name: '101–300 Units' },
      { minUnits: 301, maxUnits: 500, ratePerUnit: 11.16, name: '301–500 Units' },
      { minUnits: 501, maxUnits: null, ratePerUnit: 12.98, name: 'Above 500 Units' },
    ],
    effectiveFrom: '2024-04-01',
    source: 'Maharashtra Electricity Regulatory Commission (MERC)',
    sourceUrl: 'https://www.tatapower.com',
    lastUpdated: 'FY 2024–25 Tariff Schedule',
  },
  {
    id: 'maharashtra-adani',
    state: 'Maharashtra',
    stateSlug: 'maharashtra',
    stateCode: 'MH',
    unionTerritory: false,
    discom: 'Adani Electricity (Mumbai Suburban)',
    discomShort: 'Adani Electricity Mumbai',
    category: 'LT-1 Domestic Residential',
    billingCycle: 'monthly',
    defaultSanctionedLoadKw: 2,
    fixedCharge: 105,
    fixedChargeUnit: 'per_month',
    meterCharge: 0,
    dutyType: 'percentage',
    dutyRate: 16,
    fuelAdjustmentChargePerUnit: 0.40,
    slabs: [
      { minUnits: 0, maxUnits: 100, ratePerUnit: 4.55, name: '0–100 Units' },
      { minUnits: 101, maxUnits: 300, ratePerUnit: 7.95, name: '101–300 Units' },
      { minUnits: 301, maxUnits: 500, ratePerUnit: 10.20, name: '301–500 Units' },
      { minUnits: 501, maxUnits: null, ratePerUnit: 12.45, name: 'Above 500 Units' },
    ],
    effectiveFrom: '2024-04-01',
    source: 'MERC Tariff Order',
    sourceUrl: 'https://www.adanielectricity.com',
    lastUpdated: 'FY 2024–25',
  },
  {
    id: 'maharashtra-best',
    state: 'Maharashtra',
    stateSlug: 'maharashtra',
    stateCode: 'MH',
    unionTerritory: false,
    discom: 'BEST Undertaking (Mumbai Island City)',
    discomShort: 'BEST Mumbai',
    category: 'Residential Domestic',
    billingCycle: 'monthly',
    defaultSanctionedLoadKw: 2,
    fixedCharge: 80,
    fixedChargeUnit: 'per_month',
    meterCharge: 0,
    dutyType: 'percentage',
    dutyRate: 16,
    slabs: [
      { minUnits: 0, maxUnits: 100, ratePerUnit: 3.80, name: '0–100 Units' },
      { minUnits: 101, maxUnits: 300, ratePerUnit: 6.80, name: '101–300 Units' },
      { minUnits: 301, maxUnits: 500, ratePerUnit: 9.50, name: '301–500 Units' },
      { minUnits: 501, maxUnits: null, ratePerUnit: 11.20, name: 'Above 500 Units' },
    ],
    effectiveFrom: '2024-04-01',
    source: 'MERC BEST Tariff Schedule',
    sourceUrl: 'https://www.bestundertaking.com',
    lastUpdated: 'FY 2024–25',
  },

  // ==========================================
  // 15. MANIPUR
  // ==========================================
  {
    id: 'manipur-domestic',
    state: 'Manipur',
    stateSlug: 'manipur',
    stateCode: 'MN',
    unionTerritory: false,
    discom: 'Manipur State Power Distribution Company Ltd (MSPDCL)',
    discomShort: 'MSPDCL',
    category: 'LT Domestic Residential',
    billingCycle: 'monthly',
    defaultSanctionedLoadKw: 1,
    fixedCharge: 30,
    fixedChargeUnit: 'per_kw_month',
    meterCharge: 10,
    dutyType: 'percentage',
    dutyRate: 5,
    slabs: [
      { minUnits: 0, maxUnits: 100, ratePerUnit: 4.70, name: '0–100 Units' },
      { minUnits: 101, maxUnits: 200, ratePerUnit: 5.60, name: '101–200 Units' },
      { minUnits: 201, maxUnits: null, ratePerUnit: 6.50, name: 'Above 200 Units' },
    ],
    effectiveFrom: '2024-04-01',
    source: 'Joint Electricity Regulatory Commission (JERC Manipur & Mizoram)',
    sourceUrl: 'https://jerc.mizoram.gov.in',
    lastUpdated: 'FY 2024–25',
  },

  // ==========================================
  // 16. MEGHALAYA
  // ==========================================
  {
    id: 'meghalaya-domestic',
    state: 'Meghalaya',
    stateSlug: 'meghalaya',
    stateCode: 'ML',
    unionTerritory: false,
    discom: 'Meghalaya Power Distribution Corporation Ltd (MePDCL)',
    discomShort: 'MePDCL',
    category: 'Domestic (DLT)',
    billingCycle: 'monthly',
    defaultSanctionedLoadKw: 2,
    fixedCharge: 60,
    fixedChargeUnit: 'per_kw_month',
    meterCharge: 15,
    dutyType: 'percentage',
    dutyRate: 5,
    slabs: [
      { minUnits: 0, maxUnits: 100, ratePerUnit: 4.10, name: '0–100 Units' },
      { minUnits: 101, maxUnits: 200, ratePerUnit: 4.80, name: '101–200 Units' },
      { minUnits: 201, maxUnits: null, ratePerUnit: 5.90, name: 'Above 200 Units' },
    ],
    effectiveFrom: '2024-04-01',
    source: 'Meghalaya State Electricity Regulatory Commission (MSERC)',
    sourceUrl: 'https://mserc.gov.in',
    lastUpdated: 'FY 2024–25',
  },

  // ==========================================
  // 17. MIZORAM
  // ==========================================
  {
    id: 'mizoram-domestic',
    state: 'Mizoram',
    stateSlug: 'mizoram',
    stateCode: 'MZ',
    unionTerritory: false,
    discom: 'Power & Electricity Department, Govt of Mizoram',
    discomShort: 'P&ED Mizoram',
    category: 'LT Domestic Residential',
    billingCycle: 'monthly',
    defaultSanctionedLoadKw: 1,
    fixedCharge: 45,
    fixedChargeUnit: 'per_kw_month',
    meterCharge: 10,
    dutyType: 'percentage',
    dutyRate: 5,
    slabs: [
      { minUnits: 0, maxUnits: 50, ratePerUnit: 3.20, name: '0–50 Units' },
      { minUnits: 51, maxUnits: 100, ratePerUnit: 4.50, name: '51–100 Units' },
      { minUnits: 101, maxUnits: 200, ratePerUnit: 5.60, name: '101–200 Units' },
      { minUnits: 201, maxUnits: null, ratePerUnit: 6.80, name: 'Above 200 Units' },
    ],
    effectiveFrom: '2024-04-01',
    source: 'JERC Manipur & Mizoram',
    sourceUrl: 'https://jerc.mizoram.gov.in',
    lastUpdated: 'FY 2024–25',
  },

  // ==========================================
  // 18. NAGALAND
  // ==========================================
  {
    id: 'nagaland-domestic',
    state: 'Nagaland',
    stateSlug: 'nagaland',
    stateCode: 'NL',
    unionTerritory: false,
    discom: 'Department of Power, Nagaland (DPN)',
    discomShort: 'DoP Nagaland',
    category: 'Domestic (Residential)',
    billingCycle: 'monthly',
    defaultSanctionedLoadKw: 1,
    fixedCharge: 40,
    fixedChargeUnit: 'per_kw_month',
    meterCharge: 10,
    dutyType: 'percentage',
    dutyRate: 5,
    slabs: [
      { minUnits: 0, maxUnits: 50, ratePerUnit: 4.10, name: '0–50 Units' },
      { minUnits: 51, maxUnits: 100, ratePerUnit: 5.20, name: '51–100 Units' },
      { minUnits: 101, maxUnits: 200, ratePerUnit: 6.10, name: '101–200 Units' },
      { minUnits: 201, maxUnits: null, ratePerUnit: 7.00, name: 'Above 200 Units' },
    ],
    effectiveFrom: '2024-04-01',
    source: 'Nagaland Electricity Regulatory Commission (NERC)',
    sourceUrl: 'https://nerc.org.in',
    lastUpdated: 'FY 2024–25',
  },

  // ==========================================
  // 19. ODISHA
  // ==========================================
  {
    id: 'odisha-discoms',
    state: 'Odisha',
    stateSlug: 'odisha',
    stateCode: 'OD',
    unionTerritory: false,
    discom: 'TPCODL / TPNODL / TPSODL / TPWODL (Tata Power Discoms)',
    discomShort: 'TP Central / North / South / West Odisha',
    category: 'Domestic (LT-1 Residential)',
    billingCycle: 'monthly',
    defaultSanctionedLoadKw: 2,
    fixedCharge: 20,
    fixedChargeUnit: 'per_kw_month',
    meterCharge: 0,
    dutyType: 'per_unit',
    dutyRate: 0.04,
    slabs: [
      { minUnits: 0, maxUnits: 50, ratePerUnit: 3.00, name: '0–50 Units' },
      { minUnits: 51, maxUnits: 200, ratePerUnit: 4.80, name: '51–200 Units' },
      { minUnits: 201, maxUnits: 400, ratePerUnit: 5.80, name: '201–400 Units' },
      { minUnits: 401, maxUnits: null, ratePerUnit: 6.20, name: 'Above 400 Units' },
    ],
    effectiveFrom: '2024-04-01',
    source: 'Odisha Electricity Regulatory Commission (OERC)',
    sourceUrl: 'https://www.orierc.org',
    lastUpdated: 'FY 2024–25 Retail Tariff Order',
  },

  // ==========================================
  // 20. PUNJAB
  // ==========================================
  {
    id: 'punjab-pspcl',
    state: 'Punjab',
    stateSlug: 'punjab',
    stateCode: 'PB',
    unionTerritory: false,
    discom: 'Punjab State Power Corporation Limited (PSPCL)',
    discomShort: 'PSPCL',
    category: 'Domestic Supply (DS)',
    billingCycle: 'monthly',
    defaultSanctionedLoadKw: 2,
    fixedCharge: 50,
    fixedChargeUnit: 'per_kw_month',
    meterCharge: 0,
    dutyType: 'percentage',
    dutyRate: 15,
    slabs: [
      { minUnits: 0, maxUnits: 100, ratePerUnit: 4.49, name: '0–100 Units' },
      { minUnits: 101, maxUnits: 300, ratePerUnit: 6.34, name: '101–300 Units' },
      { minUnits: 301, maxUnits: null, ratePerUnit: 7.30, name: 'Above 300 Units' },
    ],
    subsidy: {
      name: 'Punjab 300 Free Units Scheme',
      schemeName: 'PSPCL 300 Units Free Electricity Scheme',
      description: 'Zero electricity bill for all domestic consumers using up to 300 units/month (600 units bi-monthly).',
      type: 'free_units_threshold',
      qualifyingMaxUnits: 300,
      waiveFixedCharge: true,
      defaultOptIn: true,
    },
    effectiveFrom: '2024-04-01',
    source: 'Punjab State Electricity Regulatory Commission (PSERC)',
    sourceUrl: 'https://pserc.punjab.gov.in',
    lastUpdated: 'FY 2024–25 Tariff Order',
  },

  // ==========================================
  // 21. RAJASTHAN
  // ==========================================
  {
    id: 'rajasthan-discoms',
    state: 'Rajasthan',
    stateSlug: 'rajasthan',
    stateCode: 'RJ',
    unionTerritory: false,
    discom: 'JVVNL / AVVNL / JdVVNL (Jaipur / Ajmer / Jodhpur Discoms)',
    discomShort: 'JVVNL / AVVNL / JdVVNL',
    category: 'Domestic Service (LT Residential)',
    billingCycle: 'monthly',
    defaultSanctionedLoadKw: 2,
    fixedCharge: 115,
    fixedChargeUnit: 'per_month',
    meterCharge: 0,
    dutyType: 'per_unit',
    dutyRate: 0.40,
    fuelAdjustmentChargePerUnit: 0.45,
    slabs: [
      { minUnits: 0, maxUnits: 50, ratePerUnit: 4.75, name: '0–50 Units' },
      { minUnits: 51, maxUnits: 150, ratePerUnit: 6.50, name: '51–150 Units' },
      { minUnits: 151, maxUnits: 300, ratePerUnit: 7.35, name: '151–300 Units' },
      { minUnits: 301, maxUnits: 500, ratePerUnit: 7.65, name: '301–500 Units' },
      { minUnits: 501, maxUnits: null, ratePerUnit: 7.95, name: 'Above 500 Units' },
    ],
    subsidy: {
      name: 'Mukhyamantri Nishulk Bijli Yojana',
      schemeName: 'Rajasthan 100 Units Free Subsidy',
      description: 'First 100 units 100% free with slab subsidies for domestic households.',
      type: 'first_n_units_free',
      freeUnitsCount: 100,
      defaultOptIn: true,
    },
    effectiveFrom: '2024-04-01',
    source: 'Rajasthan Electricity Regulatory Commission (RERC)',
    sourceUrl: 'https://rerc.rajasthan.gov.in',
    lastUpdated: 'FY 2024–25 Tariff Schedule',
  },

  // ==========================================
  // 22. SIKKIM
  // ==========================================
  {
    id: 'sikkim-domestic',
    state: 'Sikkim',
    stateSlug: 'sikkim',
    stateCode: 'SK',
    unionTerritory: false,
    discom: 'Power Department, Government of Sikkim',
    discomShort: 'Power Dept Sikkim',
    category: 'Domestic (Residential)',
    billingCycle: 'monthly',
    defaultSanctionedLoadKw: 1,
    fixedCharge: 30,
    fixedChargeUnit: 'per_month',
    meterCharge: 10,
    dutyType: 'percentage',
    dutyRate: 5,
    slabs: [
      { minUnits: 0, maxUnits: 50, ratePerUnit: 1.50, name: '0–50 Units' },
      { minUnits: 51, maxUnits: 100, ratePerUnit: 2.20, name: '51–100 Units' },
      { minUnits: 101, maxUnits: 200, ratePerUnit: 3.00, name: '101–200 Units' },
      { minUnits: 201, maxUnits: null, ratePerUnit: 4.00, name: 'Above 200 Units' },
    ],
    effectiveFrom: '2024-04-01',
    source: 'Sikkim State Electricity Regulatory Commission (SSERC)',
    sourceUrl: 'https://sserc.in',
    lastUpdated: 'FY 2024–25 Tariff Order',
  },

  // ==========================================
  // 23. TAMIL NADU
  // ==========================================
  {
    id: 'tamilnadu-tangedco',
    state: 'Tamil Nadu',
    stateSlug: 'tamil-nadu',
    stateCode: 'TN',
    unionTerritory: false,
    discom: 'TANGEDCO (Tamil Nadu Generation & Distribution Corp)',
    discomShort: 'TANGEDCO',
    category: 'LT Tariff IA (Domestic)',
    billingCycle: 'monthly',
    defaultSanctionedLoadKw: 2,
    fixedCharge: 0,
    fixedChargeUnit: 'per_month',
    meterCharge: 0,
    dutyType: 'percentage',
    dutyRate: 5,
    slabs: [
      { minUnits: 0, maxUnits: 100, ratePerUnit: 0.00, name: '0–100 Units (Free for All)' },
      { minUnits: 101, maxUnits: 200, ratePerUnit: 2.25, name: '101–200 Units' },
      { minUnits: 201, maxUnits: 400, ratePerUnit: 4.50, name: '201–400 Units' },
      { minUnits: 401, maxUnits: 500, ratePerUnit: 6.00, name: '401–500 Units' },
      { minUnits: 501, maxUnits: null, ratePerUnit: 8.00, name: 'Above 500 Units' },
    ],
    subsidy: {
      name: 'TANGEDCO 100 Units Free Scheme',
      schemeName: 'Tamil Nadu Domestic Free Power Scheme',
      description: 'First 100 units completely free for all domestic consumers.',
      type: 'first_n_units_free',
      freeUnitsCount: 100,
      defaultOptIn: true,
    },
    effectiveFrom: '2024-07-01',
    source: 'Tamil Nadu Electricity Regulatory Commission (TNERC)',
    sourceUrl: 'https://www.tangedco.org',
    lastUpdated: 'July 2024 Revision Order',
  },

  // ==========================================
  // 24. TELANGANA
  // ==========================================
  {
    id: 'telangana-discoms',
    state: 'Telangana',
    stateSlug: 'telangana',
    stateCode: 'TG',
    unionTerritory: false,
    discom: 'TSSPDCL / TSNPDCL (Southern & Northern Discoms)',
    discomShort: 'TSSPDCL / TSNPDCL',
    category: 'LT-I Domestic (Residential)',
    billingCycle: 'monthly',
    defaultSanctionedLoadKw: 2,
    fixedCharge: 10,
    fixedChargeUnit: 'per_month',
    meterCharge: 0,
    dutyType: 'per_unit',
    dutyRate: 0.06,
    fuelAdjustmentChargePerUnit: 0.18,
    slabs: [
      { minUnits: 0, maxUnits: 50, ratePerUnit: 1.95, name: '0–50 Units' },
      { minUnits: 51, maxUnits: 100, ratePerUnit: 3.10, name: '51–100 Units' },
      { minUnits: 101, maxUnits: 200, ratePerUnit: 4.80, name: '101–200 Units' },
      { minUnits: 201, maxUnits: 300, ratePerUnit: 7.70, name: '201–300 Units' },
      { minUnits: 301, maxUnits: 400, ratePerUnit: 9.00, name: '301–400 Units' },
      { minUnits: 401, maxUnits: null, ratePerUnit: 9.50, name: 'Above 400 Units' },
    ],
    subsidy: {
      name: 'Gruha Jyothi Scheme Telangana',
      schemeName: 'Telangana Gruha Jyothi 200 Free Units',
      description: 'Zero bill for eligible domestic consumers consuming up to 200 units/month.',
      type: 'free_units_threshold',
      qualifyingMaxUnits: 200,
      defaultOptIn: true,
    },
    effectiveFrom: '2024-04-01',
    source: 'Telangana State Electricity Regulatory Commission (TSERC)',
    sourceUrl: 'https://tserc.gov.in',
    lastUpdated: 'FY 2024–25 Tariff Order',
  },

  // ==========================================
  // 25. TRIPURA
  // ==========================================
  {
    id: 'tripura-domestic',
    state: 'Tripura',
    stateSlug: 'tripura',
    stateCode: 'TR',
    unionTerritory: false,
    discom: 'Tripura State Electricity Corporation Ltd (TSECL)',
    discomShort: 'TSECL',
    category: 'Domestic (Residential LT)',
    billingCycle: 'monthly',
    defaultSanctionedLoadKw: 1,
    fixedCharge: 30,
    fixedChargeUnit: 'per_kw_month',
    meterCharge: 10,
    dutyType: 'percentage',
    dutyRate: 5,
    slabs: [
      { minUnits: 0, maxUnits: 50, ratePerUnit: 5.15, name: '0–50 Units' },
      { minUnits: 51, maxUnits: 150, ratePerUnit: 6.20, name: '51–150 Units' },
      { minUnits: 151, maxUnits: 300, ratePerUnit: 7.10, name: '151–300 Units' },
      { minUnits: 301, maxUnits: null, ratePerUnit: 7.75, name: 'Above 300 Units' },
    ],
    effectiveFrom: '2024-04-01',
    source: 'Tripura Electricity Regulatory Commission (TERC)',
    sourceUrl: 'https://terc.tripura.gov.in',
    lastUpdated: 'FY 2024–25 Tariff Order',
  },

  // ==========================================
  // 26. UTTAR PRADESH
  // ==========================================
  {
    id: 'uttarpradesh-urban',
    state: 'Uttar Pradesh',
    stateSlug: 'uttar-pradesh',
    stateCode: 'UP',
    unionTerritory: false,
    discom: 'UPPCL Urban (PVVNL, MVVNL, DVVNL, PuVVNL, KESCO)',
    discomShort: 'UPPCL Urban Discoms',
    category: 'LMV-1 Domestic (Urban Residential)',
    billingCycle: 'monthly',
    defaultSanctionedLoadKw: 2,
    fixedCharge: 110,
    fixedChargeUnit: 'per_kw_month',
    meterCharge: 0,
    dutyType: 'percentage',
    dutyRate: 5,
    slabs: [
      { minUnits: 0, maxUnits: 100, ratePerUnit: 5.50, name: '0–100 Units' },
      { minUnits: 101, maxUnits: 150, ratePerUnit: 5.50, name: '101–150 Units' },
      { minUnits: 151, maxUnits: 300, ratePerUnit: 6.00, name: '151–300 Units' },
      { minUnits: 301, maxUnits: 500, ratePerUnit: 6.50, name: '301–500 Units' },
      { minUnits: 501, maxUnits: null, ratePerUnit: 7.00, name: 'Above 500 Units' },
    ],
    effectiveFrom: '2024-04-01',
    source: 'Uttar Pradesh Electricity Regulatory Commission (UPERC)',
    sourceUrl: 'https://uperc.org',
    lastUpdated: 'FY 2024–25 Tariff Schedule',
  },
  {
    id: 'uttarpradesh-rural',
    state: 'Uttar Pradesh',
    stateSlug: 'uttar-pradesh',
    stateCode: 'UP',
    unionTerritory: false,
    discom: 'UPPCL Rural (PVVNL / MVVNL / DVVNL / PuVVNL Rural)',
    discomShort: 'UPPCL Rural',
    category: 'LMV-1 Domestic (Rural Unmetered/Metered)',
    billingCycle: 'monthly',
    defaultSanctionedLoadKw: 1,
    fixedCharge: 50,
    fixedChargeUnit: 'per_kw_month',
    meterCharge: 0,
    dutyType: 'percentage',
    dutyRate: 5,
    slabs: [
      { minUnits: 0, maxUnits: 100, ratePerUnit: 3.35, name: '0–100 Units' },
      { minUnits: 101, maxUnits: 150, ratePerUnit: 3.85, name: '101–150 Units' },
      { minUnits: 151, maxUnits: 300, ratePerUnit: 5.00, name: '151–300 Units' },
      { minUnits: 301, maxUnits: 500, ratePerUnit: 5.50, name: '301–500 Units' },
      { minUnits: 501, maxUnits: null, ratePerUnit: 6.00, name: 'Above 500 Units' },
    ],
    effectiveFrom: '2024-04-01',
    source: 'UPERC Tariff Order',
    sourceUrl: 'https://uperc.org',
    lastUpdated: 'FY 2024–25',
  },

  // ==========================================
  // 27. UTTARAKHAND
  // ==========================================
  {
    id: 'uttarakhand-upcl',
    state: 'Uttarakhand',
    stateSlug: 'uttarakhand',
    stateCode: 'UK',
    unionTerritory: false,
    discom: 'Uttarakhand Power Corporation Limited (UPCL)',
    discomShort: 'UPCL',
    category: 'RTS-1 Domestic (Residential)',
    billingCycle: 'monthly',
    defaultSanctionedLoadKw: 2,
    fixedCharge: 60,
    fixedChargeUnit: 'per_kw_month',
    meterCharge: 0,
    dutyType: 'per_unit',
    dutyRate: 0.15,
    slabs: [
      { minUnits: 0, maxUnits: 100, ratePerUnit: 3.15, name: '0–100 Units' },
      { minUnits: 101, maxUnits: 200, ratePerUnit: 4.40, name: '101–200 Units' },
      { minUnits: 201, maxUnits: 400, ratePerUnit: 6.10, name: '201–400 Units' },
      { minUnits: 401, maxUnits: null, ratePerUnit: 6.80, name: 'Above 400 Units' },
    ],
    effectiveFrom: '2024-04-01',
    source: 'Uttarakhand Electricity Regulatory Commission (UERC)',
    sourceUrl: 'https://uerc.gov.in',
    lastUpdated: 'FY 2024–25 Tariff Order',
  },

  // ==========================================
  // 28. WEST BENGAL
  // ==========================================
  {
    id: 'westbengal-wbsedcl',
    state: 'West Bengal',
    stateSlug: 'west-bengal',
    stateCode: 'WB',
    unionTerritory: false,
    discom: 'WBSEDCL (West Bengal State Electricity Distribution)',
    discomShort: 'WBSEDCL',
    category: 'Class A Domestic (Residential)',
    billingCycle: 'monthly',
    defaultSanctionedLoadKw: 2,
    fixedCharge: 15,
    fixedChargeUnit: 'per_month',
    meterCharge: 10,
    dutyType: 'percentage',
    dutyRate: 5,
    slabs: [
      { minUnits: 0, maxUnits: 102, ratePerUnit: 5.41, name: '0–102 Units' },
      { minUnits: 103, maxUnits: 180, ratePerUnit: 6.05, name: '103–180 Units' },
      { minUnits: 181, maxUnits: 300, ratePerUnit: 6.79, name: '181–300 Units' },
      { minUnits: 301, maxUnits: 600, ratePerUnit: 7.65, name: '301–600 Units' },
      { minUnits: 601, maxUnits: 900, ratePerUnit: 8.98, name: '601–900 Units' },
      { minUnits: 901, maxUnits: null, ratePerUnit: 9.23, name: 'Above 900 Units' },
    ],
    subsidy: {
      name: 'Hasir Rekha Scheme',
      schemeName: 'West Bengal Hasir Rekha (Free up to 75 Units Quarterly)',
      description: 'Lifeline free electricity for underprivileged households consuming <= 25 units/month.',
      type: 'free_units_threshold',
      qualifyingMaxUnits: 25,
      defaultOptIn: false,
    },
    effectiveFrom: '2024-04-01',
    source: 'West Bengal Electricity Regulatory Commission (WBERC)',
    sourceUrl: 'https://wberc.gov.in',
    lastUpdated: 'FY 2024–25 Tariff Order',
  },
  {
    id: 'westbengal-cesc',
    state: 'West Bengal',
    stateSlug: 'west-bengal',
    stateCode: 'WB',
    unionTerritory: false,
    discom: 'CESC Limited (Kolkata & Howrah)',
    discomShort: 'CESC Kolkata',
    category: 'Domestic (LT Residential)',
    billingCycle: 'monthly',
    defaultSanctionedLoadKw: 2,
    fixedCharge: 15,
    fixedChargeUnit: 'per_month',
    meterCharge: 10,
    dutyType: 'percentage',
    dutyRate: 5,
    slabs: [
      { minUnits: 0, maxUnits: 25, ratePerUnit: 4.89, name: '0–25 Units' },
      { minUnits: 26, maxUnits: 60, ratePerUnit: 5.40, name: '26–60 Units' },
      { minUnits: 61, maxUnits: 100, ratePerUnit: 6.41, name: '61–100 Units' },
      { minUnits: 101, maxUnits: 150, ratePerUnit: 7.16, name: '101–150 Units' },
      { minUnits: 151, maxUnits: 300, ratePerUnit: 7.33, name: '151–300 Units' },
      { minUnits: 301, maxUnits: null, ratePerUnit: 8.92, name: 'Above 300 Units' },
    ],
    effectiveFrom: '2024-04-01',
    source: 'WBERC CESC Tariff Schedule',
    sourceUrl: 'https://www.cesc.co.in',
    lastUpdated: 'FY 2024–25',
  },

  // ==========================================
  // 29. DELHI (NCT) [UT]
  // ==========================================
  {
    id: 'delhi-bses',
    state: 'Delhi (NCT)',
    stateSlug: 'delhi',
    stateCode: 'DL',
    unionTerritory: true,
    discom: 'BSES Rajdhani (BRPL) / BSES Yamuna (BYPL) / Tata Power DDL',
    discomShort: 'BSES & Tata Power DDL',
    category: 'Domestic (Residential Single Phase / 3 Phase)',
    billingCycle: 'monthly',
    defaultSanctionedLoadKw: 2,
    fixedCharge: 20,
    fixedChargeUnit: 'per_kw_month',
    meterCharge: 0,
    dutyType: 'percentage',
    dutyRate: 5,
    fuelAdjustmentChargePerUnit: 0.85,
    slabs: [
      { minUnits: 0, maxUnits: 200, ratePerUnit: 3.00, name: '0–200 Units' },
      { minUnits: 201, maxUnits: 400, ratePerUnit: 4.50, name: '201–400 Units' },
      { minUnits: 401, maxUnits: 800, ratePerUnit: 6.50, name: '401–800 Units' },
      { minUnits: 801, maxUnits: 1200, ratePerUnit: 7.00, name: '801–1200 Units' },
      { minUnits: 1201, maxUnits: null, ratePerUnit: 8.00, name: 'Above 1200 Units' },
    ],
    subsidy: {
      name: 'Delhi Zero-Bill & 50% Subsidy Scheme',
      schemeName: 'Delhi Govt DERC Domestic Power Subsidy',
      description: '100% free electricity (zero bill) if monthly consumption is <= 200 units. 50% subsidy (up to ₹800 discount) if consumption is between 201–400 units.',
      type: 'free_units_threshold',
      qualifyingMaxUnits: 200,
      percentageDiscount: 50,
      maxDiscountAmount: 800,
      waiveFixedCharge: true,
      defaultOptIn: true,
    },
    effectiveFrom: '2024-04-01',
    source: 'Delhi Electricity Regulatory Commission (DERC)',
    sourceUrl: 'http://www.derc.gov.in',
    lastUpdated: 'FY 2024–25 Tariff Order',
    notes: 'Power Purchase Adjustment Cost (PPAC) & Pension Trust Surcharge applied as per DERC orders.'
  },

  // ==========================================
  // 30. CHANDIGARH [UT]
  // ==========================================
  {
    id: 'chandigarh-ced',
    state: 'Chandigarh',
    stateSlug: 'chandigarh',
    stateCode: 'CH',
    unionTerritory: true,
    discom: 'Chandigarh Electricity Department (CED)',
    discomShort: 'CED Chandigarh',
    category: 'Domestic (Residential)',
    billingCycle: 'monthly',
    defaultSanctionedLoadKw: 2,
    fixedCharge: 30,
    fixedChargeUnit: 'per_kw_month',
    meterCharge: 0,
    dutyType: 'percentage',
    dutyRate: 9,
    slabs: [
      { minUnits: 0, maxUnits: 150, ratePerUnit: 2.75, name: '0–150 Units' },
      { minUnits: 151, maxUnits: 400, ratePerUnit: 4.25, name: '151–400 Units' },
      { minUnits: 401, maxUnits: null, ratePerUnit: 4.65, name: 'Above 400 Units' },
    ],
    effectiveFrom: '2024-04-01',
    source: 'Joint Electricity Regulatory Commission (JERC)',
    sourceUrl: 'https://jercuts.gov.in',
    lastUpdated: 'FY 2024–25 Tariff Order',
  },

  // ==========================================
  // 31. JAMMU AND KASHMIR [UT]
  // ==========================================
  {
    id: 'jammu-kashmir-discom',
    state: 'Jammu & Kashmir',
    stateSlug: 'jammu-and-kashmir',
    stateCode: 'JK',
    unionTerritory: true,
    discom: 'JPDCL (Jammu) / KPDCL (Kashmir)',
    discomShort: 'JPDCL / KPDCL',
    category: 'LT Domestic Metered',
    billingCycle: 'monthly',
    defaultSanctionedLoadKw: 2,
    fixedCharge: 40,
    fixedChargeUnit: 'per_kw_month',
    meterCharge: 0,
    dutyType: 'percentage',
    dutyRate: 10,
    slabs: [
      { minUnits: 0, maxUnits: 100, ratePerUnit: 1.60, name: '0–100 Units' },
      { minUnits: 101, maxUnits: 200, ratePerUnit: 2.20, name: '101–200 Units' },
      { minUnits: 201, maxUnits: 400, ratePerUnit: 3.40, name: '201–400 Units' },
      { minUnits: 401, maxUnits: null, ratePerUnit: 4.00, name: 'Above 400 Units' },
    ],
    effectiveFrom: '2024-04-01',
    source: 'Joint Electricity Regulatory Commission (J&K and Ladakh)',
    sourceUrl: 'https://jercjkl.nic.in',
    lastUpdated: 'FY 2024–25 Tariff Schedule',
  },

  // ==========================================
  // 32. LADAKH [UT]
  // ==========================================
  {
    id: 'ladakh-pdd',
    state: 'Ladakh',
    stateSlug: 'ladakh',
    stateCode: 'LA',
    unionTerritory: true,
    discom: 'Power Development Department, UT of Ladakh',
    discomShort: 'Ladakh PDD',
    category: 'Domestic (Residential)',
    billingCycle: 'monthly',
    defaultSanctionedLoadKw: 1,
    fixedCharge: 40,
    fixedChargeUnit: 'per_kw_month',
    meterCharge: 0,
    dutyType: 'percentage',
    dutyRate: 5,
    slabs: [
      { minUnits: 0, maxUnits: 100, ratePerUnit: 1.70, name: '0–100 Units' },
      { minUnits: 101, maxUnits: 200, ratePerUnit: 2.30, name: '101–200 Units' },
      { minUnits: 201, maxUnits: null, ratePerUnit: 3.50, name: 'Above 200 Units' },
    ],
    effectiveFrom: '2024-04-01',
    source: 'JERC for UT of J&K and UT of Ladakh',
    sourceUrl: 'https://jercjkl.nic.in',
    lastUpdated: 'FY 2024–25',
  },

  // ==========================================
  // 33. PUDUCHERRY [UT]
  // ==========================================
  {
    id: 'puducherry-ped',
    state: 'Puducherry',
    stateSlug: 'puducherry',
    stateCode: 'PY',
    unionTerritory: true,
    discom: 'Electricity Department, Government of Puducherry',
    discomShort: 'PED Puducherry',
    category: 'A1 Domestic (Residential)',
    billingCycle: 'monthly',
    defaultSanctionedLoadKw: 2,
    fixedCharge: 30,
    fixedChargeUnit: 'per_kw_month',
    meterCharge: 0,
    dutyType: 'percentage',
    dutyRate: 5,
    slabs: [
      { minUnits: 0, maxUnits: 100, ratePerUnit: 1.90, name: '0–100 Units' },
      { minUnits: 101, maxUnits: 200, ratePerUnit: 3.00, name: '101–200 Units' },
      { minUnits: 201, maxUnits: 300, ratePerUnit: 4.75, name: '201–300 Units' },
      { minUnits: 301, maxUnits: null, ratePerUnit: 6.20, name: 'Above 300 Units' },
    ],
    effectiveFrom: '2024-04-01',
    source: 'Joint Electricity Regulatory Commission (JERC Goa & UTs)',
    sourceUrl: 'https://jercuts.gov.in',
    lastUpdated: 'FY 2024–25',
  },

  // ==========================================
  // 34. DADRA & NAGAR HAVELI AND DAMAN & DIU [UT]
  // ==========================================
  {
    id: 'dnh-dd-power',
    state: 'Dadra and Nagar Haveli and Daman and Diu',
    stateSlug: 'dadra-and-nagar-haveli-and-daman-and-diu',
    stateCode: 'DN',
    unionTerritory: true,
    discom: 'DNH-PDCL / Daman & Diu Electricity Dept',
    discomShort: 'DNH & DD Power',
    category: 'Domestic (LTD-Residential)',
    billingCycle: 'monthly',
    defaultSanctionedLoadKw: 2,
    fixedCharge: 25,
    fixedChargeUnit: 'per_kw_month',
    meterCharge: 0,
    dutyType: 'percentage',
    dutyRate: 5,
    slabs: [
      { minUnits: 0, maxUnits: 50, ratePerUnit: 1.50, name: '0–50 Units' },
      { minUnits: 51, maxUnits: 200, ratePerUnit: 2.20, name: '51–200 Units' },
      { minUnits: 201, maxUnits: 400, ratePerUnit: 2.80, name: '201–400 Units' },
      { minUnits: 401, maxUnits: null, ratePerUnit: 3.50, name: 'Above 400 Units' },
    ],
    effectiveFrom: '2024-04-01',
    source: 'JERC Goa & UTs',
    sourceUrl: 'https://jercuts.gov.in',
    lastUpdated: 'FY 2024–25',
  },

  // ==========================================
  // 35. ANDAMAN AND NICOBAR ISLANDS [UT]
  // ==========================================
  {
    id: 'andaman-nicobar-power',
    state: 'Andaman and Nicobar Islands',
    stateSlug: 'andaman-and-nicobar-islands',
    stateCode: 'AN',
    unionTerritory: true,
    discom: 'Electricity Department, Andaman & Nicobar Administration',
    discomShort: 'A&N Electricity Dept',
    category: 'Domestic (Residential)',
    billingCycle: 'monthly',
    defaultSanctionedLoadKw: 1,
    fixedCharge: 30,
    fixedChargeUnit: 'per_kw_month',
    meterCharge: 10,
    dutyType: 'percentage',
    dutyRate: 5,
    slabs: [
      { minUnits: 0, maxUnits: 100, ratePerUnit: 2.50, name: '0–100 Units' },
      { minUnits: 101, maxUnits: 200, ratePerUnit: 4.20, name: '101–200 Units' },
      { minUnits: 201, maxUnits: null, ratePerUnit: 6.50, name: 'Above 200 Units' },
    ],
    effectiveFrom: '2024-04-01',
    source: 'JERC Goa & UTs',
    sourceUrl: 'https://jercuts.gov.in',
    lastUpdated: 'FY 2024–25',
  },

  // ==========================================
  // 36. LAKSHADWEEP [UT]
  // ==========================================
  {
    id: 'lakshadweep-power',
    state: 'Lakshadweep',
    stateSlug: 'lakshadweep',
    stateCode: 'LD',
    unionTerritory: true,
    discom: 'Department of Electricity, UT of Lakshadweep',
    discomShort: 'Lakshadweep Electricity Dept',
    category: 'Domestic Supply',
    billingCycle: 'monthly',
    defaultSanctionedLoadKw: 1,
    fixedCharge: 25,
    fixedChargeUnit: 'per_month',
    meterCharge: 5,
    dutyType: 'percentage',
    dutyRate: 5,
    slabs: [
      { minUnits: 0, maxUnits: 100, ratePerUnit: 2.25, name: '0–100 Units' },
      { minUnits: 101, maxUnits: 200, ratePerUnit: 3.50, name: '101–200 Units' },
      { minUnits: 201, maxUnits: null, ratePerUnit: 5.00, name: 'Above 200 Units' },
    ],
    effectiveFrom: '2024-04-01',
    source: 'JERC Goa & UTs',
    sourceUrl: 'https://jercuts.gov.in',
    lastUpdated: 'FY 2024–25',
  },

  // ==========================================
  // BENCHMARK: ALL-INDIA AVERAGE
  // ==========================================
  {
    id: 'india-average',
    state: 'All-India Average Benchmark',
    stateSlug: 'india-average',
    stateCode: 'IN',
    unionTerritory: false,
    discom: 'National Average Benchmark (CEA / CERC)',
    discomShort: 'All-India Benchmark',
    category: 'Standard Domestic Household',
    billingCycle: 'monthly',
    defaultSanctionedLoadKw: 2,
    fixedCharge: 100,
    fixedChargeUnit: 'per_month',
    meterCharge: 0,
    dutyType: 'percentage',
    dutyRate: 8,
    slabs: [
      { minUnits: 0, maxUnits: 100, ratePerUnit: 3.50, name: '0–100 Units' },
      { minUnits: 101, maxUnits: 200, ratePerUnit: 5.50, name: '101–200 Units' },
      { minUnits: 201, maxUnits: 400, ratePerUnit: 7.50, name: '201–400 Units' },
      { minUnits: 401, maxUnits: null, ratePerUnit: 9.00, name: 'Above 400 Units' },
    ],
    effectiveFrom: '2024-04-01',
    source: 'Central Electricity Authority (CEA) Consumer Survey',
    sourceUrl: 'https://cea.nic.in',
    lastUpdated: '2024 Benchmark Standard',
    notes: 'Weighted average residential tariff benchmark across Indian states.'
  }
];

// Helper: Group tariffs by State / UT
export function getStateDiscomGroups(): StateDiscomGroup[] {
  const groupsMap = new Map<string, StateDiscomGroup>();

  for (const tariff of ALL_ELECTRICITY_TARIFFS) {
    if (tariff.id === 'india-average') continue; // keep special benchmark separate or append at end

    if (!groupsMap.has(tariff.stateSlug)) {
      groupsMap.set(tariff.stateSlug, {
        stateName: tariff.state,
        stateSlug: tariff.stateSlug,
        stateCode: tariff.stateCode,
        isUnionTerritory: tariff.unionTerritory,
        tariffs: [tariff],
        defaultTariffId: tariff.id,
        overviewNotes: tariff.notes
      });
    } else {
      const existing = groupsMap.get(tariff.stateSlug)!;
      existing.tariffs.push(tariff);
    }
  }

  // Sort: States alphabetically, then Union Territories alphabetically
  const stateGroups = Array.from(groupsMap.values()).sort((a, b) => {
    if (a.isUnionTerritory === b.isUnionTerritory) {
      return a.stateName.localeCompare(b.stateName);
    }
    return a.isUnionTerritory ? 1 : -1;
  });

  return stateGroups;
}

export function getTariffById(tariffId: string): ElectricityTariff | undefined {
  return ALL_ELECTRICITY_TARIFFS.find(t => t.id === tariffId);
}

export function getDefaultTariffForState(stateSlug: string): ElectricityTariff {
  const matching = ALL_ELECTRICITY_TARIFFS.filter(t => t.stateSlug === stateSlug);
  return matching[0] || ALL_ELECTRICITY_TARIFFS[0];
}

export function getAllStatesList() {
  const groups = getStateDiscomGroups();
  return groups.map(g => ({
    name: g.stateName,
    slug: g.stateSlug,
    code: g.stateCode,
    isUT: g.isUnionTerritory,
    discomCount: g.tariffs.length
  }));
}
