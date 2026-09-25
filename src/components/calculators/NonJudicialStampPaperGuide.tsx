import React from 'react';
import { Tool } from '../../types';
import { ScrollText, FileSignature, CheckCircle2, ShieldCheck, Scale } from 'lucide-react';

interface Props {
  tool?: Tool;
  onResultChange?: (result: string) => void;
}

const STAMP_PAPER_RULES = [
  { purpose: 'Residential Rent Agreement (Up to 11 Months)', stampValue: '₹100 to ₹500 (Maharashtra: 0.25% of annual rent)', validity: '11 Months', eStampAvailable: true },
  { purpose: 'General Affidavit / Name Change / Address Proof', stampValue: '₹10, ₹20, ₹50 or ₹100 Non-Judicial Stamp', validity: 'Permanent until superseded', eStampAvailable: true },
  { purpose: 'General Power of Attorney (GPA - Family Member)', stampValue: '₹100 to ₹500 (Non-family: 2% to 5% of property value)', validity: 'As specified or life of principal', eStampAvailable: true },
  { purpose: 'Indemnity Bond / Bank Account Deceased Claim', stampValue: '₹100 to ₹500', validity: 'Permanent', eStampAvailable: true },
  { purpose: 'Partnership Deed Formation', stampValue: '₹500 to ₹2,000 depending on capital contribution', validity: 'Duration of partnership', eStampAvailable: true },
  { purpose: 'Will & Testament (Vasiyat)', stampValue: 'Zero (No stamp paper required; can be on plain paper)', validity: 'Takes effect after testator passing', eStampAvailable: false },
];

export const NonJudicialStampPaperGuide: React.FC<Props> = () => {
  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-sm">
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 text-xs font-semibold mb-4">
          <Scale className="w-3.5 h-3.5" />
          <span>Indian Stamp Act & SHCIL e-Stamping Directory</span>
        </div>
        <h2 className="text-2xl font-black text-neutral-900 dark:text-white flex items-center gap-2">
          <ScrollText className="w-6 h-6 text-amber-500" />
          Non-Judicial Stamp Paper Value Guide
        </h2>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2">
          Check mandatory stamp paper denominations for common legal documents like Rent Agreements, Affidavits, GPA, Indemnity Bonds, and Partnership Deeds.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {STAMP_PAPER_RULES.map((rule, idx) => (
          <div
            key={idx}
            className="p-5 rounded-2xl bg-neutral-50 hover:bg-neutral-100 dark:bg-neutral-800/50 dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 transition-colors flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-start gap-2 mb-2">
                <FileSignature className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <h4 className="text-base font-bold text-neutral-900 dark:text-white">
                  {rule.purpose}
                </h4>
              </div>
              <div className="pl-7">
                <div className="text-sm font-black text-amber-600 dark:text-amber-400 mb-1">
                  Stamp Value: {rule.stampValue}
                </div>
                <div className="text-xs text-neutral-500 dark:text-neutral-400">
                  Validity: {rule.validity}
                </div>
              </div>
            </div>
            
            {rule.eStampAvailable ? (
              <div className="pl-7 mt-2 flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
                e-Stamp Available Online (SHCIL)
              </div>
            ) : (
              <div className="pl-7 mt-2 flex items-center gap-1.5 text-xs font-bold text-neutral-500 dark:text-neutral-500">
                <CheckCircle2 className="w-4 h-4" />
                No Stamp Required / Plain Paper Valid
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="mt-8 p-4 bg-neutral-50 dark:bg-neutral-800/30 border border-neutral-200 dark:border-neutral-800 rounded-2xl text-xs text-neutral-600 dark:text-neutral-400">
        <strong className="font-bold text-neutral-900 dark:text-white">Legal Disclaimer:</strong> Stamp duties vary significantly by state (especially Maharashtra, Karnataka, and Delhi). The values listed here are general guidelines. Always verify the exact stamp duty for your specific state and transaction amount on the SHCIL e-Stamping portal or with a local notary/advocate.
      </div>
    </div>
  );
};
