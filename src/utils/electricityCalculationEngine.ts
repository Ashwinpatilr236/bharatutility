import {
  ElectricityCalculationInput,
  ElectricityCalculationResult,
  SlabCalculationDetail
} from '../types/electricity';

/**
 * Pure calculation engine for Indian State & UT Electricity Tariffs.
 * Decoupled from specific state logic and UI rendering.
 */
export function calculateElectricityBill(
  input: ElectricityCalculationInput
): ElectricityCalculationResult {
  const {
    tariff,
    units,
    sanctionedLoadKw = tariff.defaultSanctionedLoadKw || 2,
    applySubsidy = true,
    billingCycleMonths = tariff.billingCycle === 'bimonthly' ? 2 : 1,
    customFixedChargeOverride,
    customDutyRateOverride
  } = input;

  const validUnits = Math.max(0, Math.round(units));

  // 1. Calculate Slab-Wise Energy Charges
  let totalEnergyCharges = 0;
  const slabBreakdown: SlabCalculationDetail[] = [];

  tariff.slabs.forEach((slab, index) => {
    // Determine slab boundary
    const slabStart = slab.minUnits > 0 ? slab.minUnits - 1 : 0;
    const slabEnd = slab.maxUnits !== null ? slab.maxUnits : Infinity;

    let unitsInThisSlab = 0;
    if (validUnits > slabStart) {
      unitsInThisSlab = Math.min(validUnits, slabEnd) - slabStart;
    }

    const costInThisSlab = unitsInThisSlab * slab.ratePerUnit;
    totalEnergyCharges += costInThisSlab;

    const isFilled = validUnits >= slabEnd;
    const isActive = validUnits > slabStart && (slab.maxUnits === null || validUnits <= slabEnd);

    const slabLabel = slab.name || (slab.maxUnits === null
      ? `Above ${slab.minUnits} Units`
      : `${slab.minUnits}–${slab.maxUnits} Units`);

    slabBreakdown.push({
      slabIndex: index,
      slabRangeLabel: slabLabel,
      minUnits: slab.minUnits,
      maxUnits: slab.maxUnits,
      ratePerUnit: slab.ratePerUnit,
      unitsInSlab: unitsInThisSlab,
      costInSlab: Number(costInThisSlab.toFixed(2)),
      isFilled,
      isActive,
      percentageOfTotal: 0 // Will compute below
    });
  });

  // Calculate percentages for visualization
  slabBreakdown.forEach(s => {
    s.percentageOfTotal = totalEnergyCharges > 0
      ? Number(((s.costInSlab / totalEnergyCharges) * 100).toFixed(1))
      : 0;
  });

  // 2. Fixed & Meter Charges
  let baseFixedCharge = customFixedChargeOverride !== undefined
    ? customFixedChargeOverride
    : tariff.fixedCharge;

  let fixedCharges = 0;
  if (tariff.fixedChargeUnit === 'per_kw_month') {
    fixedCharges = baseFixedCharge * Math.max(1, sanctionedLoadKw) * billingCycleMonths;
  } else {
    fixedCharges = baseFixedCharge * billingCycleMonths;
  }

  const meterCharges = (tariff.meterCharge || 0) * billingCycleMonths;

  // 3. Fuel Adjustment Charge (FAC / FPPCA / PPAC)
  const fuelAdjustmentCharges = (tariff.fuelAdjustmentChargePerUnit || 0) * validUnits;

  // 4. Other specific charges (e.g. Surcharges)
  let otherCharges = 0;
  if (tariff.additionalCharges && tariff.additionalCharges.length > 0) {
    tariff.additionalCharges.forEach(ch => {
      if (ch.type === 'percentage') {
        otherCharges += (totalEnergyCharges * ch.rate) / 100;
      } else if (ch.type === 'per_unit') {
        otherCharges += ch.rate * validUnits;
      } else {
        otherCharges += ch.rate;
      }
    });
  }

  // 5. Electricity Duty & Statutory Taxes
  const dutyRate = customDutyRateOverride !== undefined ? customDutyRateOverride : tariff.dutyRate;
  let dutyCharges = 0;

  if (tariff.dutyType === 'percentage') {
    // Duty applied on Energy Charges + Fixed Charges
    dutyCharges = ((totalEnergyCharges + fixedCharges) * dutyRate) / 100;
  } else if (tariff.dutyType === 'per_unit') {
    dutyCharges = dutyRate * validUnits;
  }

  // 6. Gross Total Bill before Subsidies
  const grossTotal = totalEnergyCharges + fixedCharges + meterCharges + fuelAdjustmentCharges + otherCharges + dutyCharges;

  // 7. Government Subsidy Engine
  let subsidyAmount = 0;
  let subsidyApplied = false;
  let subsidyName: string | undefined = undefined;
  let subsidyDescription: string | undefined = undefined;

  if (applySubsidy && tariff.subsidy) {
    const sub = tariff.subsidy;
    subsidyName = sub.name;
    subsidyDescription = sub.description;

    switch (sub.type) {
      case 'free_units_threshold': {
        // e.g. Delhi: <=200 units -> 100% free; 201-400 -> 50% discount up to max ₹800
        if (sub.qualifyingMaxUnits && validUnits <= sub.qualifyingMaxUnits) {
          subsidyAmount = totalEnergyCharges;
          if (sub.waiveFixedCharge) {
            subsidyAmount += fixedCharges + dutyCharges + fuelAdjustmentCharges;
          }
          subsidyApplied = true;
        } else if (sub.percentageDiscount && sub.percentageDiscount > 0 && validUnits <= 400) {
          // Tier 2 discount (e.g. Delhi 201-400 units)
          const discount = (totalEnergyCharges * sub.percentageDiscount) / 100;
          subsidyAmount = sub.maxDiscountAmount ? Math.min(discount, sub.maxDiscountAmount) : discount;
          subsidyApplied = true;
        }
        break;
      }

      case 'first_n_units_free': {
        // e.g. Rajasthan 100 units free, Tamil Nadu first 100 units
        // Calculate the energy charge of the first N units as the rebate
        const freeCount = sub.freeUnitsCount || 100;
        let rebate = 0;
        let counted = 0;
        for (const slab of tariff.slabs) {
          const slabSize = slab.maxUnits ? (slab.maxUnits - (slab.minUnits > 0 ? slab.minUnits - 1 : 0)) : Infinity;
          const unitsToDiscount = Math.min(validUnits - counted, Math.min(freeCount - counted, slabSize));
          if (unitsToDiscount > 0) {
            rebate += unitsToDiscount * slab.ratePerUnit;
            counted += unitsToDiscount;
          }
          if (counted >= freeCount || counted >= validUnits) break;
        }
        subsidyAmount = rebate;
        subsidyApplied = subsidyAmount > 0;
        break;
      }

      case 'percentage_discount': {
        // e.g. Chhattisgarh Half Electricity Scheme up to 400 units
        if (!sub.qualifyingMaxUnits || validUnits <= sub.qualifyingMaxUnits) {
          const discount = (totalEnergyCharges * (sub.percentageDiscount || 50)) / 100;
          subsidyAmount = sub.maxDiscountAmount ? Math.min(discount, sub.maxDiscountAmount) : discount;
          subsidyApplied = true;
        }
        break;
      }

      case 'flat_rebate': {
        if (!sub.qualifyingMaxUnits || validUnits <= sub.qualifyingMaxUnits) {
          subsidyAmount = Math.min(grossTotal, sub.flatAmount || 0);
          subsidyApplied = subsidyAmount > 0;
        }
        break;
      }
    }
  }

  // 8. Net Payable Calculation
  const netPayable = Math.max(0, Math.round(grossTotal - subsidyAmount));
  const effectiveCostPerUnit = validUnits > 0 ? Number((netPayable / validUnits).toFixed(2)) : 0;
  const estimatedAnnualBill = Math.round(netPayable * (12 / billingCycleMonths));

  return {
    units: validUnits,
    sanctionedLoadKw,
    energyCharges: Number(totalEnergyCharges.toFixed(2)),
    fixedCharges: Number(fixedCharges.toFixed(2)),
    meterCharges: Number(meterCharges.toFixed(2)),
    fuelAdjustmentCharges: Number(fuelAdjustmentCharges.toFixed(2)),
    otherCharges: Number(otherCharges.toFixed(2)),
    dutyCharges: Number(dutyCharges.toFixed(2)),
    grossTotal: Number(grossTotal.toFixed(2)),
    subsidyAmount: Number(subsidyAmount.toFixed(2)),
    subsidyApplied,
    subsidyName,
    subsidyDescription,
    netPayable,
    effectiveCostPerUnit,
    estimatedAnnualBill,
    slabBreakdown,
    billingCycleMonths,
    tariff
  };
}
