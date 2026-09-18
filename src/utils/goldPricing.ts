/**
 * Indian Bullion & Jewellery Pricing Engine
 * Shared calculation utilities for Gold/Silver rates, purity conversions, making charges, and GST
 */

export type GoldKarat = '24K' | '22K' | '18K' | '14K' | number;

export interface CityBullionRate {
  name: string;
  gold24k: number; // per 10g
  silver1kg: number;
}

export const CITY_BULLION_RATES: Record<string, CityBullionRate> = {
  mumbai: { name: 'Mumbai', gold24k: 88450, silver1kg: 98500 },
  delhi: { name: 'Delhi NCR', gold24k: 88600, silver1kg: 98500 },
  bengaluru: { name: 'Bengaluru', gold24k: 88450, silver1kg: 97500 },
  chennai: { name: 'Chennai', gold24k: 88900, silver1kg: 104000 },
  kolkata: { name: 'Kolkata', gold24k: 88450, silver1kg: 98500 },
  hyderabad: { name: 'Hyderabad', gold24k: 88450, silver1kg: 104000 },
  ahmedabad: { name: 'Ahmedabad', gold24k: 88500, silver1kg: 98500 },
  pune: { name: 'Pune', gold24k: 88450, silver1kg: 98500 },
  jaipur: { name: 'Jaipur', gold24k: 88600, silver1kg: 98500 },
  lucknow: { name: 'Lucknow', gold24k: 88600, silver1kg: 98500 },
};

/**
 * Returns purity multiplier relative to 24K pure gold (24 Karats)
 */
export function getGoldPurityMultiplier(karat: GoldKarat): number {
  if (typeof karat === 'string') {
    switch (karat) {
      case '24K': return 1.0;
      case '22K': return 22 / 24;
      case '18K': return 18 / 24;
      case '14K': return 14 / 24;
      default: return 1.0;
    }
  }
  if (karat === 24) return 1.0;
  if (karat === 22) return 22 / 24;
  if (karat === 18) return 18 / 24;
  if (karat === 14) return 14 / 24;
  return karat / 24;
}

/**
 * Calculates effective gold rate per gram for a specific Karat purity
 */
export function getEffectiveGoldRatePerGram(base24kRatePerGram: number, karat: GoldKarat): number {
  return base24kRatePerGram * getGoldPurityMultiplier(karat);
}

export interface JewelleryPriceParams {
  weightGrams: number;
  base24kRatePerGram: number;
  karat?: GoldKarat;
  makingChargeValue: number;
  makingChargeType?: 'percentage' | 'perGram';
  hallmarkingFee?: number;
  gstRatePercent?: number;
}

export interface JewelleryPriceResult {
  effectiveRatePerGram: number;
  rawGoldValue: number;
  makingCharges: number;
  taxableSubtotal: number;
  hallmarkingFee: number;
  gstAmount: number;
  finalJewelleryPrice: number;
  costPerGramAllInclusive: number;
}

/**
 * Standard Indian retail jewellery billing calculation
 * Formula: [Raw Gold Value (Weight × Purity Rate) + Making Charges + Hallmark Fee] + 3% GST
 */
export function calculateJewelleryPrice({
  weightGrams,
  base24kRatePerGram,
  karat = '22K',
  makingChargeValue,
  makingChargeType = 'percentage',
  hallmarkingFee = 0,
  gstRatePercent = 3,
}: JewelleryPriceParams): JewelleryPriceResult {
  const effectiveRatePerGram = getEffectiveGoldRatePerGram(base24kRatePerGram, karat);
  const rawGoldValue = effectiveRatePerGram * weightGrams;

  const makingCharges =
    makingChargeType === 'percentage'
      ? (rawGoldValue * makingChargeValue) / 100
      : makingChargeValue * weightGrams;

  const taxableSubtotal = rawGoldValue + makingCharges + hallmarkingFee;
  const gstAmount = (taxableSubtotal * gstRatePercent) / 100;
  const finalJewelleryPrice = taxableSubtotal + gstAmount;

  return {
    effectiveRatePerGram,
    rawGoldValue,
    makingCharges,
    taxableSubtotal,
    hallmarkingFee,
    gstAmount,
    finalJewelleryPrice,
    costPerGramAllInclusive: weightGrams > 0 ? finalJewelleryPrice / weightGrams : 0,
  };
}

export interface OldGoldExchangeParams {
  oldWeightGrams: number;
  base24kRatePerGram: number;
  karat: '22K' | '18K' | '14K' | number;
  meltingDeductionPercent: number;
}

export interface OldGoldExchangeResult {
  grossValue: number;
  deductionAmount: number;
  netExchangeValue: number;
}

/**
 * Calculates old gold exchange / scrap valuation after melting & purity deduction
 */
export function calculateOldGoldExchange({
  oldWeightGrams,
  base24kRatePerGram,
  karat,
  meltingDeductionPercent,
}: OldGoldExchangeParams): OldGoldExchangeResult {
  const netPurityRate = getEffectiveGoldRatePerGram(base24kRatePerGram, karat);
  const grossValue = netPurityRate * oldWeightGrams;
  const deductionAmount = (grossValue * meltingDeductionPercent) / 100;
  const netExchangeValue = grossValue - deductionAmount;

  return {
    grossValue,
    deductionAmount,
    netExchangeValue,
  };
}
