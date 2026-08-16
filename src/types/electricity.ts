export type StateType = 'state' | 'union_territory';

export type TariffStatus =
  | 'draft'
  | 'pending_review'
  | 'approved'
  | 'published'
  | 'archived'
  | 'rejected'
  | 'active';

export interface StateEntity {
  id: string;
  name: string;
  code: string;
  slug: string;
  type: StateType;
  active: boolean;
  regulatoryCommission: string;
  regulatoryWebsite?: string;
}

export interface DiscomEntity {
  id: string;
  stateId: string;
  name: string;
  code: string;
  shortName: string;
  website: string;
  active: boolean;
  coverageArea?: string;
  defaultCategory?: string;
}

export interface TariffSlab {
  id?: string;
  minUnits: number; // e.g. 0, 101, 201
  maxUnits: number | null; // e.g. 100, 200, or null for unlimited/above
  ratePerUnit: number; // in INR (₹)
  label?: string;
  name?: string;
}

export type SubsidyType =
  | 'free_units_threshold' // e.g. 100% free if total units <= 200 (Delhi) or <= 300 (Punjab)
  | 'first_n_units_free' // e.g. first 100 units free for all (Tamil Nadu, Rajasthan)
  | 'percentage_discount' // e.g. 50% discount on energy charges up to a cap
  | 'flat_rebate' // e.g. flat ₹X deduction
  | 'slab_rebate';

export interface TariffSubsidy {
  name: string;
  schemeName: string;
  description: string;
  type: SubsidyType;
  qualifyingMaxUnits?: number; // e.g. 200 in Delhi (100% free), 400 (50% discount up to ₹800)
  freeUnitsCount?: number; // e.g. 100 in TN, 300 in Punjab
  percentageDiscount?: number; // e.g. 50%
  maxDiscountAmount?: number; // e.g. ₹800
  flatAmount?: number;
  waiveFixedCharge?: boolean;
  conditions?: string;
  defaultOptIn?: boolean;
}

export interface AdditionalCharge {
  name: string;
  rate: number;
  type: 'percentage' | 'per_unit' | 'fixed';
}

export interface ElectricityTariff {
  id: string; // Unique identifier: e.g. 'mh-msedcl-res'
  stateId?: string;
  state: string; // Full state name: 'Maharashtra'
  stateSlug: string; // 'maharashtra'
  stateCode: string; // 'MH'
  unionTerritory: boolean;
  discomId?: string;
  discom: string; // 'MSEDCL (Mahavitaran)'
  discomShort: string; // 'MSEDCL'
  category: string; // 'Domestic (LT-1 Residential)'
  categoryGroup?: 'domestic' | 'bpl' | 'commercial';
  billingCycle: 'monthly' | 'bimonthly';
  defaultSanctionedLoadKw: number; // default 1 or 2 kW
  fixedCharge: number; // Fixed monthly charge
  fixedChargeUnit: 'per_month' | 'per_kw_month' | 'per_connection';
  meterCharge: number; // Meter rent/service charge per month
  dutyType: 'percentage' | 'per_unit' | 'none';
  dutyRate: number; // e.g. 16 for 16% or 0.15 for ₹0.15/unit
  fuelAdjustmentChargePerUnit?: number; // FAC / FPPCA / PPAC in ₹/unit
  minimumMonthlyCharge?: number;
  additionalCharges?: AdditionalCharge[];
  slabs: TariffSlab[];
  subsidy?: TariffSubsidy | null;
  effectiveFrom: string; // 'YYYY-MM-DD'
  effectiveTo?: string | null;
  status?: TariffStatus;
  versionNumber?: number;
  source: string; // 'MERC (Maharashtra Electricity Regulatory Commission)'
  sourceUrl: string; // Official website/tariff order URL
  sourceDocument?: string; // PDF / Order Title
  lastChecked?: string;
  lastUpdated: string; // e.g. 'April 2024 / FY 2024-25'
  notes?: string;
  verifiedByAdmin?: boolean;
}

export interface StateDiscomGroup {
  stateName: string;
  stateSlug: string;
  stateCode: string;
  isUnionTerritory: boolean;
  tariffs: ElectricityTariff[];
  defaultTariffId: string;
  overviewNotes?: string;
  regulatoryCommission?: string;
  regulatoryWebsite?: string;
}

export interface ElectricityCalculationInput {
  tariff: ElectricityTariff;
  units: number;
  sanctionedLoadKw?: number;
  applySubsidy?: boolean;
  billingCycleMonths?: number; // 1 for monthly, 2 for bimonthly
  customFixedChargeOverride?: number;
  customDutyRateOverride?: number;
}

export interface SlabCalculationDetail {
  slabIndex: number;
  slabRangeLabel: string;
  minUnits: number;
  maxUnits: number | null;
  ratePerUnit: number;
  unitsInSlab: number;
  costInSlab: number;
  isFilled: boolean;
  isActive: boolean;
  percentageOfTotal: number;
}

export interface ElectricityCalculationResult {
  units: number;
  sanctionedLoadKw: number;
  energyCharges: number;
  fixedCharges: number;
  meterCharges: number;
  fuelAdjustmentCharges: number;
  otherCharges: number;
  dutyCharges: number;
  grossTotal: number;
  subsidyAmount: number;
  subsidyApplied: boolean;
  subsidyName?: string;
  subsidyDescription?: string;
  netPayable: number;
  effectiveCostPerUnit: number;
  estimatedAnnualBill: number;
  slabBreakdown: SlabCalculationDetail[];
  billingCycleMonths: number;
  tariff: ElectricityTariff;
}

// ── AUDIT & AI UPDATE SCHEMAS ──

export interface TariffAuditLog {
  id: string;
  date: string;
  stateName: string;
  discomName: string;
  oldTariffSummary: string;
  newTariffSummary: string;
  source: string;
  sourceUrl?: string;
  aiStatus: 'verified_by_ai' | 'manual_entry' | 'ai_extracted' | 'no_change';
  aiConfidence?: string;
  approvedBy: string;
  publishedDate: string;
  notes?: string;
}

export interface ProposedTariffRevision {
  discomId: string;
  discomName: string;
  stateName: string;
  orderNumber?: string;
  orderDate?: string;
  effectiveFrom: string;
  consumerCategory: string;
  fixedCharge: number;
  fixedChargeUnit: 'per_month' | 'per_kw_month' | 'per_connection';
  dutyRate: number;
  dutyType: 'percentage' | 'per_unit' | 'none';
  fuelAdjustmentRate: number;
  slabs: TariffSlab[];
  subsidyRule?: TariffSubsidy | null;
  sourceName: string;
  sourceUrl: string;
  sourceDocument?: string;
  confidence: 'High' | 'Moderate' | 'Review Required';
  reviewWarnings: string[];
  notes?: string;
  status: TariffStatus;
}

export interface TariffComparisonField {
  label: string;
  currentValue: string;
  proposedValue: string;
  hasChanged: boolean;
}
