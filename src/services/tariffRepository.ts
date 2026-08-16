import { getSupabase, isSupabaseConfigured } from './supabaseClient';
import {
  ElectricityTariff,
  TariffStatus,
  TariffAuditLog,
  ProposedTariffRevision,
  TariffComparisonField,
  StateDiscomGroup,
  TariffSlab,
  TariffSubsidy
} from '../types/electricity';
import { ALL_ELECTRICITY_TARIFFS } from '../data/electricityTariffs';

const STORAGE_KEYS = {
  PROPOSALS: 'bu_tariff_proposals',
};

export interface TariffValidationResult {
  isValid: boolean;
  errors: string[];
  parsedProposal?: ProposedTariffRevision;
}

// Initial Seed Audit Logs
const DEFAULT_AUDIT_LOGS: TariffAuditLog[] = [
  {
    id: 'audit-001',
    date: '2026-04-02',
    stateName: 'Gujarat',
    discomName: 'MGVCL / GUVNL',
    oldTariffSummary: 'FY 2024–25 GERC Multi-Year Tariff Schedule',
    newTariffSummary: 'FY 2026–27 Annual Performance Review & Tariff Order',
    source: 'Gujarat Electricity Regulatory Commission (GERC)',
    sourceUrl: 'https://gercin.org',
    aiStatus: 'verified_by_ai',
    aiConfidence: 'High',
    approvedBy: 'Super Admin',
    publishedDate: '2026-04-02 11:30 AM',
    notes: 'Verified against GERC Order No. 2280/2026. Fixed charge ₹25/mo, 0-100 units @ ₹3.05/unit.'
  },
  {
    id: 'audit-002',
    date: '2026-04-01',
    stateName: 'Delhi',
    discomName: 'BSES Rajdhani (BRPL)',
    oldTariffSummary: 'DERC Retail Tariff Schedule FY 2024-25',
    newTariffSummary: 'DERC Domestic Tariff with Delhi Govt Subsidy (200 Free Units)',
    source: 'Delhi Electricity Regulatory Commission (DERC)',
    sourceUrl: 'http://www.derc.gov.in',
    aiStatus: 'manual_entry',
    approvedBy: 'Super Admin',
    publishedDate: '2026-04-01 09:15 AM',
    notes: 'Verified zero-bill 100% subsidy for usage <= 200 kWh/month.'
  },
  {
    id: 'audit-003',
    date: '2026-03-28',
    stateName: 'Maharashtra',
    discomName: 'MSEDCL (Mahavitaran)',
    oldTariffSummary: 'MERC Mid-Term Review Order Case No. 226 of 2022',
    newTariffSummary: 'MERC FY 2025–26 Retail Supply Tariff Schedule',
    source: 'Maharashtra Electricity Regulatory Commission (MERC)',
    sourceUrl: 'https://www.mahadiscom.in',
    aiStatus: 'verified_by_ai',
    aiConfidence: 'High',
    approvedBy: 'Super Admin',
    publishedDate: '2026-03-28 04:45 PM',
    notes: '0-100 units @ ₹4.71, 101-300 @ ₹10.29. Fixed charge ₹128/mo single phase.'
  }
];

class TariffRepository {
  private tariffs: ElectricityTariff[] = [];
  private auditLogs: TariffAuditLog[] = [];
  private activeProposals: Record<string, ProposedTariffRevision> = {};
  private listeners: Array<() => void> = [];
  private isUsingFallback: boolean = false;
  private isInitialized: boolean = false;

  constructor() {
    this.initializeData();
  }

  private async initializeData() {
    // 1. Load verified seed fallback dataset as default baseline
    this.tariffs = ALL_ELECTRICITY_TARIFFS.map(t => ({
      ...t,
      status: t.status || 'published',
      versionNumber: t.versionNumber || 1,
      lastChecked: t.lastChecked || '2026-08-15'
    }));
    this.auditLogs = [...DEFAULT_AUDIT_LOGS];

    // 2. Load active in-flight proposals from local workspace
    try {
      const storedProposals = localStorage.getItem(STORAGE_KEYS.PROPOSALS);
      if (storedProposals) {
        this.activeProposals = JSON.parse(storedProposals);
      }
    } catch (e) {
      console.warn('Could not load proposals from storage:', e);
    }

    // 3. Fetch authoritative tariffs from Supabase
    await this.fetchPublishedTariffs();
    this.isInitialized = true;
  }

  /**
   * Maps a database row from Supabase tariff_versions to an application ElectricityTariff object
   */
  private mapRowToTariff(row: any): ElectricityTariff {
    const seedMatch = ALL_ELECTRICITY_TARIFFS.find(t => t.id === row.id);

    return {
      id: row.id,
      state: row.state,
      stateSlug: seedMatch?.stateSlug || row.state.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      stateCode: seedMatch?.stateCode || row.state.substring(0, 2).toUpperCase(),
      unionTerritory: seedMatch?.unionTerritory ?? false,
      discom: row.discom,
      discomShort: seedMatch?.discomShort || row.discom.split(' ')[0],
      category: row.category,
      billingCycle: seedMatch?.billingCycle || 'monthly',
      defaultSanctionedLoadKw: seedMatch?.defaultSanctionedLoadKw || 2,
      fixedCharge: Number(row.fixed_charge ?? seedMatch?.fixedCharge ?? 50),
      fixedChargeUnit: seedMatch?.fixedChargeUnit || 'per_month',
      meterCharge: seedMatch?.meterCharge || 0,
      dutyType: seedMatch?.dutyType || 'percentage',
      dutyRate: Number(row.duty_rate ?? seedMatch?.dutyRate ?? 10),
      fuelAdjustmentChargePerUnit: seedMatch?.fuelAdjustmentChargePerUnit || 0,
      slabs: Array.isArray(row.slabs) && row.slabs.length > 0 ? row.slabs : seedMatch?.slabs || [],
      subsidy: seedMatch?.subsidy || null,
      effectiveFrom: row.effective_from || seedMatch?.effectiveFrom || '2025-04-01',
      effectiveTo: null,
      status: (row.status as TariffStatus) || 'published',
      versionNumber: Number(row.version ?? seedMatch?.versionNumber ?? 1),
      source: row.source || seedMatch?.source || 'State Electricity Regulatory Commission',
      sourceUrl: row.source_url || seedMatch?.sourceUrl || '',
      sourceDocument: seedMatch?.sourceDocument,
      lastChecked: row.updated_at ? new Date(row.updated_at).toISOString().split('T')[0] : '2026-08-15',
      lastUpdated: `Updated ${new Date(row.updated_at || Date.now()).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })} (v${row.version || 1})`,
      notes: seedMatch?.notes,
      verifiedByAdmin: true,
    };
  }

  /**
   * Fetch primary authoritative published tariffs from Supabase (status IN ('published', 'active'))
   */
  public async fetchPublishedTariffs(): Promise<ElectricityTariff[]> {
    const supabase = getSupabase();
    if (!supabase || !isSupabaseConfigured()) {
      this.isUsingFallback = true;
      return this.getPublishedTariffs();
    }

    try {
      const { data, error } = await supabase
        .from('tariff_versions')
        .select('*')
        .in('status', ['published', 'active'])
        .order('state', { ascending: true });

      if (!error && data && data.length > 0) {
        const remoteTariffs = data.map(r => this.mapRowToTariff(r));
        
        // Merge Supabase published records over baseline
        const mergedMap: Record<string, ElectricityTariff> = {};
        for (const t of this.tariffs) {
          mergedMap[t.id] = t;
        }
        for (const rt of remoteTariffs) {
          mergedMap[rt.id] = rt;
        }

        this.tariffs = Object.values(mergedMap);
        this.isUsingFallback = false;
        this.notifyListeners();
        return this.getPublishedTariffs();
      }
    } catch (err) {
      console.warn('Supabase remote tariffs fetch fallback notice:', err);
      this.isUsingFallback = true;
    }

    return this.getPublishedTariffs();
  }

  /**
   * Admin: Fetch all tariff records and audit logs from Supabase
   */
  public async fetchAdminTariffData(): Promise<{ tariffs: ElectricityTariff[]; auditLogs: TariffAuditLog[] }> {
    const supabase = getSupabase();
    if (supabase && isSupabaseConfigured()) {
      try {
        // 1. Fetch all versions
        const { data: tariffRows, error: tariffErr } = await supabase
          .from('tariff_versions')
          .select('*')
          .order('state', { ascending: true });

        if (!tariffErr && tariffRows && tariffRows.length > 0) {
          const fetchedTariffs = tariffRows.map(r => this.mapRowToTariff(r));
          const existingMap: Record<string, ElectricityTariff> = {};
          for (const t of this.tariffs) existingMap[t.id] = t;
          for (const ft of fetchedTariffs) existingMap[ft.id] = ft;
          this.tariffs = Object.values(existingMap);
        }

        // 2. Fetch all audit logs
        const { data: auditRows, error: auditErr } = await supabase
          .from('tariff_audit_logs')
          .select('*')
          .order('created_at', { ascending: false });

        if (!auditErr && auditRows && auditRows.length > 0) {
          this.auditLogs = auditRows.map(r => ({
            id: r.id,
            date: r.created_at ? new Date(r.created_at).toISOString().split('T')[0] : r.published_date,
            stateName: r.state_name,
            discomName: r.discom_name,
            oldTariffSummary: r.old_summary,
            newTariffSummary: r.new_summary,
            source: r.source || 'State Regulatory Commission',
            sourceUrl: r.source_url,
            aiStatus: 'manual_entry',
            approvedBy: r.approved_by,
            publishedDate: r.published_date,
            notes: r.notes,
          }));
        }

        this.notifyListeners();
      } catch (err) {
        console.warn('Could not fetch admin data from Supabase:', err);
      }
    }

    return {
      tariffs: this.getAllTariffVersions(),
      auditLogs: this.getAuditLogs(),
    };
  }

  public isFallbackActive(): boolean {
    return this.isUsingFallback;
  }

  public getPublishedTariffs(): ElectricityTariff[] {
    return this.tariffs.filter(t => t.status === 'published' || t.status === 'active' || !t.status);
  }

  public getTariffById(id: string): ElectricityTariff | undefined {
    return this.tariffs.find(t => t.id === id);
  }

  // ── GET STATE GROUPS FOR PUBLIC CALCULATOR ──
  public getStateGroups(): StateDiscomGroup[] {
    const published = this.getPublishedTariffs();
    const map: Record<string, StateDiscomGroup> = {};

    for (const tariff of published) {
      if (tariff.id === 'india-average' || tariff.stateSlug === 'india-average') {
        continue;
      }
      const slug = tariff.stateSlug;
      if (!map[slug]) {
        map[slug] = {
          stateName: tariff.state,
          stateSlug: tariff.stateSlug,
          stateCode: tariff.stateCode,
          isUnionTerritory: tariff.unionTerritory,
          tariffs: [],
          defaultTariffId: tariff.id,
          overviewNotes: tariff.notes,
          regulatoryCommission: tariff.source,
          regulatoryWebsite: tariff.sourceUrl
        };
      }
      map[slug].tariffs.push(tariff);
    }

    return Object.values(map).sort((a, b) => {
      if (a.isUnionTerritory !== b.isUnionTerritory) {
        return a.isUnionTerritory ? 1 : -1;
      }
      return a.stateName.localeCompare(b.stateName);
    });
  }

  // ── GET ALL DISCOMS & VERSIONS (Admin Panel) ──
  public getAllTariffVersions(): ElectricityTariff[] {
    return this.tariffs;
  }

  public getTariffsForDiscom(discomShortOrId: string): ElectricityTariff[] {
    return this.tariffs.filter(
      t => t.discomShort === discomShortOrId || t.id === discomShortOrId || t.id.startsWith(discomShortOrId)
    );
  }

  public getAuditLogs(): TariffAuditLog[] {
    return this.auditLogs;
  }

  public getActiveProposal(tariffId: string): ProposedTariffRevision | null {
    return this.activeProposals[tariffId] || null;
  }

  public saveProposal(tariffId: string, proposal: ProposedTariffRevision): void {
    this.activeProposals[tariffId] = proposal;
    this.saveProposalsToLocal();
    this.notifyListeners();
  }

  private saveProposalsToLocal() {
    try {
      localStorage.setItem(STORAGE_KEYS.PROPOSALS, JSON.stringify(this.activeProposals));
    } catch (e) {
      console.warn('Could not save proposals to storage:', e);
    }
  }

  // ── MANUAL TARIFF JSON VALIDATION ENGINE ──
  public validateManualTariffJson(
    jsonString: string,
    defaultState?: string,
    defaultDiscom?: string,
    defaultCategory?: string
  ): TariffValidationResult {
    const errors: string[] = [];

    if (!jsonString || !jsonString.trim()) {
      return { isValid: false, errors: ['Please paste or upload JSON tariff data.'] };
    }

    let parsed: any;
    try {
      parsed = JSON.parse(jsonString.trim());
    } catch (err: any) {
      return { isValid: false, errors: [`Invalid JSON format: ${err.message || 'Syntax error in JSON string.'}`] };
    }

    const stateName = (parsed.state || parsed.stateName || defaultState || '').trim();
    if (!stateName) {
      errors.push('Missing required field: "state" (e.g., "Gujarat", "Maharashtra").');
    }

    const discomName = (parsed.discom || parsed.discomName || defaultDiscom || '').trim();
    if (!discomName) {
      errors.push('Missing required field: "discom" (e.g., "MGVCL", "MSEDCL").');
    }

    const consumerCategory = (parsed.category || parsed.consumerCategory || defaultCategory || 'Domestic (LT-1 Residential)').trim();

    // Slabs validation
    const rawSlabs = parsed.slabs || parsed.tariffSlabs || [];
    if (!Array.isArray(rawSlabs) || rawSlabs.length === 0) {
      errors.push('Missing required field: "slabs" (must be an array with at least 1 consumption tier).');
    } else {
      rawSlabs.forEach((s: any, idx: number) => {
        const minU = Number(s.minUnits ?? s.min ?? 0);
        const maxU = s.maxUnits !== undefined && s.maxUnits !== null ? Number(s.maxUnits) : null;
        const rate = Number(s.ratePerUnit ?? s.rate ?? -1);

        if (isNaN(minU) || minU < 0) {
          errors.push(`Slab #${idx + 1}: "minUnits" must be a non-negative number.`);
        }
        if (isNaN(rate) || rate < 0) {
          errors.push(`Slab #${idx + 1}: "ratePerUnit" must be a non-negative number (got ${rate}).`);
        }
        if (maxU !== null && (isNaN(maxU) || maxU <= minU)) {
          errors.push(`Slab #${idx + 1}: "maxUnits" (${maxU}) must be greater than "minUnits" (${minU}).`);
        }
      });
    }

    const fixedCharge = Number(parsed.fixedCharge ?? parsed.fixed_charge ?? 0);
    if (isNaN(fixedCharge) || fixedCharge < 0) {
      errors.push('"fixedCharge" must be a non-negative number.');
    }

    const dutyRate = Number(parsed.dutyRate ?? parsed.duty_rate ?? 0);
    if (isNaN(dutyRate) || dutyRate < 0) {
      errors.push('"dutyRate" must be a non-negative number.');
    }

    const effectiveFrom = (parsed.effectiveFrom ?? parsed.effective_from ?? new Date().toISOString().split('T')[0]).trim();
    if (!effectiveFrom) {
      errors.push('Missing required field: "effectiveFrom" (date in YYYY-MM-DD format).');
    }

    const sourceName = (parsed.source ?? parsed.sourceName ?? 'State Electricity Regulatory Commission').trim();

    if (errors.length > 0) {
      return { isValid: false, errors };
    }

    // Cleaned slabs
    const cleanedSlabs: TariffSlab[] = rawSlabs.map((s: any, idx: number) => ({
      id: s.id || `slab_${idx + 1}`,
      minUnits: Number(s.minUnits ?? s.min ?? 0),
      maxUnits: s.maxUnits !== undefined && s.maxUnits !== null ? Number(s.maxUnits) : null,
      ratePerUnit: Number(s.ratePerUnit ?? s.rate ?? 0),
      label: s.label || s.name || `${s.minUnits ?? 0}–${s.maxUnits || 'Above'} Units`,
      name: s.name || s.label || `${s.minUnits ?? 0}–${s.maxUnits || 'Above'} Units`,
    }));

    const discomId = `${stateName.toLowerCase().replace(/[^a-z0-9]/g, '')}-${discomName.toLowerCase().replace(/[^a-z0-9]/g, '')}`;

    const parsedProposal: ProposedTariffRevision = {
      discomId,
      discomName,
      stateName,
      orderNumber: parsed.orderNumber || `SERC Tariff Schedule ${effectiveFrom.split('-')[0] || '2026'}`,
      orderDate: parsed.orderDate || new Date().toISOString().split('T')[0],
      effectiveFrom,
      consumerCategory,
      fixedCharge,
      fixedChargeUnit: parsed.fixedChargeUnit || parsed.fixed_charge_unit || 'per_month',
      dutyRate,
      dutyType: parsed.dutyType || parsed.duty_type || 'percentage',
      fuelAdjustmentRate: Number(parsed.fuelAdjustmentRate ?? parsed.fuelAdjustmentChargePerUnit ?? parsed.fac ?? 0),
      slabs: cleanedSlabs,
      subsidyRule: parsed.subsidy || parsed.subsidyRule || null,
      sourceName,
      sourceUrl: (parsed.sourceUrl ?? parsed.source_url ?? '').trim(),
      sourceDocument: parsed.sourceDocument || parsed.orderNumber || 'Official SERC Schedule',
      confidence: 'High',
      reviewWarnings: [],
      notes: parsed.notes || 'Manually entered and verified tariff schedule.',
      status: 'pending_review'
    };

    return {
      isValid: true,
      errors: [],
      parsedProposal
    };
  }

  // ── SAMPLE TEMPLATE GENERATOR ──
  public getSampleTariffJson(stateName = 'Gujarat', discomName = 'MGVCL'): string {
    return JSON.stringify(
      {
        state: stateName,
        discom: discomName,
        category: 'Domestic (LT-1 Residential)',
        effectiveFrom: '2026-04-01',
        fixedCharge: 25,
        fixedChargeUnit: 'per_month',
        dutyRate: 15,
        dutyType: 'percentage',
        fuelAdjustmentRate: 0.35,
        slabs: [
          { minUnits: 0, maxUnits: 50, ratePerUnit: 3.05, label: '0–50 Units' },
          { minUnits: 51, maxUnits: 100, ratePerUnit: 3.50, label: '51–100 Units' },
          { minUnits: 101, maxUnits: 250, ratePerUnit: 4.15, label: '101–250 Units' },
          { minUnits: 251, maxUnits: null, ratePerUnit: 5.20, label: 'Above 250 Units' }
        ],
        subsidy: null,
        source: 'Gujarat Electricity Regulatory Commission (GERC)',
        sourceUrl: 'https://gercin.org',
        notes: 'Verified against GERC FY 2026-27 Retail Supply Schedule.'
      },
      null,
      2
    );
  }

  // ── COMPARE OLD VS NEW TARIFF ──
  public getComparisonFields(
    current: ElectricityTariff,
    proposed: ProposedTariffRevision
  ): TariffComparisonField[] {
    const fields: TariffComparisonField[] = [];

    // Effective Date
    fields.push({
      label: 'Effective From Date',
      currentValue: current.effectiveFrom,
      proposedValue: proposed.effectiveFrom,
      hasChanged: current.effectiveFrom !== proposed.effectiveFrom
    });

    // Fixed Charge
    const curFixedStr = `₹${current.fixedCharge} (${current.fixedChargeUnit})`;
    const propFixedStr = `₹${proposed.fixedCharge} (${proposed.fixedChargeUnit})`;
    fields.push({
      label: 'Fixed Monthly / Demand Charge',
      currentValue: curFixedStr,
      proposedValue: propFixedStr,
      hasChanged: current.fixedCharge !== proposed.fixedCharge || current.fixedChargeUnit !== proposed.fixedChargeUnit
    });

    // Duty Rate
    const curDutyStr = `${current.dutyRate}${current.dutyType === 'percentage' ? '%' : ' ₹/unit'}`;
    const propDutyStr = `${proposed.dutyRate}${proposed.dutyType === 'percentage' ? '%' : ' ₹/unit'}`;
    fields.push({
      label: 'Statutory Electricity Duty',
      currentValue: curDutyStr,
      proposedValue: propDutyStr,
      hasChanged: curDutyStr !== propDutyStr
    });

    // Fuel Surcharge (FAC / PPAC)
    const curFac = current.fuelAdjustmentChargePerUnit ? `₹${current.fuelAdjustmentChargePerUnit}/unit` : 'None';
    const propFac = proposed.fuelAdjustmentRate ? `₹${proposed.fuelAdjustmentRate}/unit` : 'None';
    fields.push({
      label: 'Fuel Adjustment (FAC/PPAC)',
      currentValue: curFac,
      proposedValue: propFac,
      hasChanged: curFac !== propFac
    });

    // Slabs count and first slab
    const curSlab0 = current.slabs[0] ? `0–${current.slabs[0].maxUnits || '∞'}: ₹${current.slabs[0].ratePerUnit}/unit` : 'None';
    const propSlab0 = proposed.slabs[0] ? `0–${proposed.slabs[0].maxUnits || '∞'}: ₹${proposed.slabs[0].ratePerUnit}/unit` : 'None';
    fields.push({
      label: 'First Tariff Slab (0-100 Units)',
      currentValue: curSlab0,
      proposedValue: propSlab0,
      hasChanged: curSlab0 !== propSlab0
    });

    // Subsidies
    const curSub = current.subsidy ? current.subsidy.name : 'No state subsidy scheme';
    const propSub = proposed.subsidyRule ? proposed.subsidyRule.name : 'No state subsidy scheme';
    fields.push({
      label: 'Government Subsidy Scheme',
      currentValue: curSub,
      proposedValue: propSub,
      hasChanged: curSub !== propSub
    });

    return fields;
  }

  // ── HUMAN APPROVAL & PUBLISH (Writes to Supabase tariff_versions & tariff_audit_logs) ──
  public async approveAndPublish(
    tariffId: string,
    customizedProposal: ProposedTariffRevision,
    approvedBy: string = 'Super Admin',
    approvalNotes: string = 'Manually reviewed, verified, and published.'
  ): Promise<ElectricityTariff> {
    const existingTariff = this.tariffs.find(t => t.id === tariffId || t.discom.toLowerCase() === customizedProposal.discomName.toLowerCase());

    const currentVersionNumber = existingTariff?.versionNumber || 1;
    const newVersionNumber = currentVersionNumber + 1;

    // 1. Archive previous version if it exists
    if (existingTariff) {
      const archivedVersion: ElectricityTariff = {
        ...existingTariff,
        id: `${existingTariff.id}-v${currentVersionNumber}`,
        status: 'archived',
        effectiveTo: customizedProposal.effectiveFrom || new Date().toISOString().split('T')[0]
      };
      this.tariffs.push(archivedVersion);
    }

    const stateMatch = ALL_ELECTRICITY_TARIFFS.find(
      t => t.state.toLowerCase() === customizedProposal.stateName.toLowerCase() || t.stateSlug === customizedProposal.stateName.toLowerCase()
    );

    // 2. Create the newly published version
    const newPublishedTariff: ElectricityTariff = {
      id: existingTariff ? existingTariff.id : customizedProposal.discomId,
      state: customizedProposal.stateName || existingTariff?.state || 'Indian State',
      stateSlug: existingTariff?.stateSlug || stateMatch?.stateSlug || customizedProposal.stateName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      stateCode: existingTariff?.stateCode || stateMatch?.stateCode || customizedProposal.stateName.substring(0, 2).toUpperCase(),
      unionTerritory: existingTariff?.unionTerritory ?? stateMatch?.unionTerritory ?? false,
      discom: customizedProposal.discomName || existingTariff?.discom || 'DISCOM',
      discomShort: existingTariff?.discomShort || customizedProposal.discomName.split(' ')[0],
      category: customizedProposal.consumerCategory || existingTariff?.category || 'Domestic (LT-1 Residential)',
      billingCycle: existingTariff?.billingCycle || 'monthly',
      defaultSanctionedLoadKw: existingTariff?.defaultSanctionedLoadKw || 2,
      fixedCharge: customizedProposal.fixedCharge,
      fixedChargeUnit: customizedProposal.fixedChargeUnit || 'per_month',
      meterCharge: existingTariff?.meterCharge || 0,
      dutyType: customizedProposal.dutyType || 'percentage',
      dutyRate: customizedProposal.dutyRate,
      fuelAdjustmentChargePerUnit: customizedProposal.fuelAdjustmentRate || 0,
      slabs: customizedProposal.slabs,
      subsidy: customizedProposal.subsidyRule !== undefined ? customizedProposal.subsidyRule : existingTariff?.subsidy,
      effectiveFrom: customizedProposal.effectiveFrom || new Date().toISOString().split('T')[0],
      effectiveTo: null,
      status: 'published',
      versionNumber: newVersionNumber,
      source: customizedProposal.sourceName || existingTariff?.source || 'State Electricity Regulatory Commission',
      sourceUrl: customizedProposal.sourceUrl || existingTariff?.sourceUrl || '',
      sourceDocument: customizedProposal.sourceDocument || `Tariff Order ${customizedProposal.orderNumber || 'Schedule'}`,
      lastChecked: new Date().toISOString().split('T')[0],
      lastUpdated: `Updated ${new Date().toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })} (v${newVersionNumber})`,
      notes: approvalNotes || customizedProposal.notes,
      verifiedByAdmin: true
    };

    // Replace in live list
    this.tariffs = this.tariffs.filter(t => t.id !== newPublishedTariff.id).concat(newPublishedTariff);

    // 3. Record Audit Trail Log
    const auditRecord: TariffAuditLog = {
      id: `audit-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      stateName: newPublishedTariff.state,
      discomName: newPublishedTariff.discom,
      oldTariffSummary: existingTariff ? `v${currentVersionNumber} (${existingTariff.lastUpdated})` : 'Initial Baseline',
      newTariffSummary: `v${newPublishedTariff.versionNumber} (${newPublishedTariff.lastUpdated})`,
      source: newPublishedTariff.source,
      sourceUrl: newPublishedTariff.sourceUrl,
      aiStatus: 'manual_entry',
      approvedBy,
      publishedDate: new Date().toLocaleString('en-IN'),
      notes: approvalNotes
    };

    this.auditLogs.unshift(auditRecord);

    // Remove active proposal
    delete this.activeProposals[tariffId];
    delete this.activeProposals[newPublishedTariff.id];
    this.saveProposalsToLocal();

    // 4. Primary Persistence: Sync to Supabase
    await this.syncToSupabase(newPublishedTariff, auditRecord);

    this.notifyListeners();
    return newPublishedTariff;
  }

  // ── REJECT PROPOSAL ──
  public async rejectProposal(tariffId: string, reason: string, rejectedBy: string = 'Super Admin'): Promise<void> {
    const proposal = this.activeProposals[tariffId];
    if (proposal) {
      const auditRecord: TariffAuditLog = {
        id: `audit-rej-${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        stateName: proposal.stateName,
        discomName: proposal.discomName,
        oldTariffSummary: 'Proposed Revision Rejected',
        newTariffSummary: 'No Change — Published Tariff Retained',
        source: proposal.sourceName,
        sourceUrl: proposal.sourceUrl,
        aiStatus: 'manual_entry',
        approvedBy: `${rejectedBy} (Rejected)`,
        publishedDate: new Date().toLocaleString('en-IN'),
        notes: `Proposal rejected: ${reason}`
      };
      this.auditLogs.unshift(auditRecord);

      delete this.activeProposals[tariffId];
      this.saveProposalsToLocal();

      // Write rejection log to Supabase
      const supabase = getSupabase();
      if (supabase && isSupabaseConfigured()) {
        try {
          await supabase.from('tariff_audit_logs').insert({
            id: auditRecord.id,
            state_name: auditRecord.stateName,
            discom_name: auditRecord.discomName,
            old_summary: auditRecord.oldTariffSummary,
            new_summary: auditRecord.newTariffSummary,
            approved_by: auditRecord.approvedBy,
            published_date: auditRecord.publishedDate,
            notes: auditRecord.notes
          });
        } catch (err) {
          console.warn('Could not write rejection audit log to Supabase:', err);
        }
      }

      this.notifyListeners();
    }
  }

  // ── SUPABASE SYNC (Authoritative persistence) ──
  private async syncToSupabase(tariff: ElectricityTariff, audit: TariffAuditLog) {
    const supabase = getSupabase();
    if (!supabase || !isSupabaseConfigured()) return;

    try {
      // 1. Upsert newly published tariff version
      await supabase.from('tariff_versions').upsert({
        id: tariff.id,
        state: tariff.state,
        discom: tariff.discom,
        category: tariff.category,
        fixed_charge: tariff.fixedCharge,
        duty_rate: tariff.dutyRate,
        slabs: tariff.slabs,
        status: tariff.status,
        version: tariff.versionNumber,
        effective_from: tariff.effectiveFrom,
        source: tariff.source,
        source_url: tariff.sourceUrl,
        updated_at: new Date().toISOString()
      });

      // 2. Insert audit log
      await supabase.from('tariff_audit_logs').insert({
        id: audit.id,
        state_name: audit.stateName,
        discom_name: audit.discomName,
        old_summary: audit.oldTariffSummary,
        new_summary: audit.newTariffSummary,
        approved_by: audit.approvedBy,
        published_date: audit.publishedDate,
        notes: audit.notes
      });
    } catch (err) {
      console.warn('Supabase remote tariff sync warning:', err);
    }
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(fn => fn());
  }

  // ── RESET TO DEFAULTS ──
  public resetToDefaults(): void {
    localStorage.removeItem(STORAGE_KEYS.PROPOSALS);
    this.initializeData();
    this.notifyListeners();
  }
}

export const tariffRepository = new TariffRepository();
