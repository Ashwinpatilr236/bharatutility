/**
 * Indian Land Unit Definitions and Regional Conversion Factors
 * Centralized land measurement data across universal, regional, and state-specific units
 */

export interface LandUnitDefinition {
  label: string;
  sqft: number;
  region: string;
}

export interface RegionalLandUnitConfig {
  region: string;
  bighaSqFt?: number;
  biswaSqFt?: number;
  gajSqFt?: number;
  gunthaSqFt?: number;
  kanalSqFt?: number;
  marlaSqFt?: number;
  groundSqFt?: number;
  centSqFt?: number;
  acreSqFt?: number;
}

/**
 * Standard Indian land units relative to 1 Square Foot
 */
export const LAND_UNITS: Record<string, LandUnitDefinition> = {
  sqft: { label: 'Square Feet (sq ft)', sqft: 1, region: 'Universal' },
  gaj: { label: 'Square Gaj / Yard (sq yd)', sqft: 9, region: 'North & Central India' },
  sqm: { label: 'Square Meter (sq m)', sqft: 10.7639, region: 'Metric / Universal' },
  guntha: { label: 'Guntha', sqft: 1089, region: 'Maharashtra, Gujarat, Karnataka' },
  cent: { label: 'Cent', sqft: 435.6, region: 'Kerala, Tamil Nadu, AP, Telangana' },
  ground: { label: 'Ground', sqft: 2400, region: 'Tamil Nadu (Chennai)' },
  biswa_up: { label: 'Biswa (UP / Haryana / Punjab)', sqft: 1350, region: 'North India (1/20 Bigha)' },
  bigha_pucca: { label: 'Bigha (Standard Pucca)', sqft: 27000, region: 'UP, Bihar, Rajasthan' },
  bigha_bengal: { label: 'Bigha (Bengal / Assam)', sqft: 14400, region: 'East India' },
  bigha_kaccha: { label: 'Bigha (Kaccha / MP)', sqft: 9000, region: 'Central India' },
  acre: { label: 'Acre', sqft: 43560, region: 'Universal (40 Gunthas / 100 Cents)' },
  hectare: { label: 'Hectare', sqft: 107639, region: 'Metric (2.471 Acres)' },
  marla: { label: 'Marla', sqft: 225, region: 'Punjab, Haryana' },
  kanal: { label: 'Kanal', sqft: 4500, region: 'Punjab, Haryana, HP (20 Marla)' },
};

/**
 * Multi-State Bigha and Land Unit Definitions (in Square Feet)
 * Preserves specific regional and state-level variations
 */
export const REGIONAL_LAND_UNITS: RegionalLandUnitConfig[] = [
  { region: 'Uttar Pradesh & Uttarakhand (Standard Pucca Bigha)', bighaSqFt: 27000, biswaSqFt: 1350, gajSqFt: 9 },
  { region: 'Madhya Pradesh (MP Bigha)', bighaSqFt: 12000, biswaSqFt: 600, gajSqFt: 9 },
  { region: 'Bihar (Standard Bigha)', bighaSqFt: 27220, biswaSqFt: 1361, gajSqFt: 9 },
  { region: 'Rajasthan (Pucca Bigha)', bighaSqFt: 27225, biswaSqFt: 1361.25, gajSqFt: 9 },
  { region: 'West Bengal (Bigha)', bighaSqFt: 14400, biswaSqFt: 720, gajSqFt: 9 },
  { region: 'Maharashtra & Karnataka (Guntha)', bighaSqFt: 43560, gunthaSqFt: 1089, gajSqFt: 9 },
  { region: 'Punjab & Haryana (Kanal & Marla)', bighaSqFt: 9000, kanalSqFt: 5445, marlaSqFt: 272.25 },
  { region: 'Tamil Nadu & Kerala (Ground & Cent)', groundSqFt: 2400, centSqFt: 435.6, acreSqFt: 43560 },
];

export interface ConvertedLandItem {
  key: string;
  label: string;
  region: string;
  value: string;
  raw: number;
}

/**
 * Converts any land unit to all standard units
 */
export function convertLandAreaToAll(
  landValue: number,
  fromUnit: string,
  unitsMap: Record<string, LandUnitDefinition> = LAND_UNITS
): ConvertedLandItem[] {
  const fromConfig = unitsMap[fromUnit] || unitsMap.sqft;
  const totalSqFt = (landValue || 0) * fromConfig.sqft;

  return Object.entries(unitsMap).map(([key, config]) => {
    const convertedVal = totalSqFt / config.sqft;
    let displayStr = '';
    if (convertedVal >= 1000) {
      displayStr = convertedVal.toLocaleString('en-IN', { maximumFractionDigits: 2 });
    } else if (convertedVal >= 1) {
      displayStr = convertedVal.toLocaleString('en-IN', { maximumFractionDigits: 4 });
    } else {
      displayStr = convertedVal.toFixed(6);
    }

    return {
      key,
      label: config.label,
      region: config.region,
      value: displayStr,
      raw: convertedVal,
    };
  });
}

export interface RegionalLandConversionResult {
  totalSqFt: number;
  inAcres: number;
  inBigha: number;
  inGaj: number;
  inGuntha: number;
  inSqMeters: number;
}

/**
 * Converts regional land units given state-specific parameters
 */
export function convertRegionalLand(
  inputLandValue: number,
  inputLandUnit: 'bigha' | 'acre' | 'gaj' | 'guntha',
  region: RegionalLandUnitConfig
): RegionalLandConversionResult {
  const bighaSize = region.bighaSqFt || 27000;
  let totalSqFt = 0;

  if (inputLandUnit === 'bigha') totalSqFt = inputLandValue * bighaSize;
  else if (inputLandUnit === 'acre') totalSqFt = inputLandValue * 43560;
  else if (inputLandUnit === 'gaj') totalSqFt = inputLandValue * 9;
  else if (inputLandUnit === 'guntha') totalSqFt = inputLandValue * 1089;

  const inAcres = Number((totalSqFt / 43560).toFixed(3));
  const inBigha = Number((totalSqFt / bighaSize).toFixed(2));
  const inGaj = Math.round(totalSqFt / 9);
  const inGuntha = Number((totalSqFt / 1089).toFixed(2));
  const inSqMeters = Math.round(totalSqFt * 0.092903);

  return { totalSqFt, inAcres, inBigha, inGaj, inGuntha, inSqMeters };
}
