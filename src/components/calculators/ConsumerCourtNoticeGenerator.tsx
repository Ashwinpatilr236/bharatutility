import React from 'react';
import { Tool } from '../../types';
import { FileText, ShieldAlert, PhoneCall, Scale, ArrowRight, Gavel } from 'lucide-react';

interface Props {
  tool?: Tool;
  onResultChange?: (result: string) => void;
}

export const ConsumerCourtNoticeGenerator: React.FC<Props> = () => {
  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-sm">
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold mb-4">
          <Gavel className="w-3.5 h-3.5" />
          <span>Consumer Protection Act 2019 & NCH 1915</span>
        </div>
        <h2 className="text-2xl font-black text-neutral-900 dark:text-white flex items-center gap-2">
          <FileText className="w-6 h-6 text-rose-500" />
          Consumer Court Legal Notice Guide
        </h2>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2">
          Learn how to file a consumer complaint for e-commerce fraud, builder flat delay, defective products, and wrongful insurance claim rejection in India.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700">
                <div className="flex items-center gap-2 mb-4 text-neutral-900 dark:text-white">
                    <ShieldAlert className="w-5 h-5 text-rose-500" />
                    <h3 className="font-black text-lg">Dispute Resolution Steps</h3>
                </div>
                
                <div className="space-y-5 relative">
                    <div className="absolute top-2 left-[15px] bottom-6 w-0.5 bg-neutral-200 dark:bg-neutral-700"></div>
                    
                    <div className="relative pl-10">
                        <div className="absolute left-0 top-1 w-8 h-8 rounded-full bg-white dark:bg-neutral-800 border-2 border-rose-500 flex items-center justify-center text-xs font-black text-rose-500 z-10">1</div>
                        <h4 className="font-bold text-neutral-900 dark:text-white text-sm mb-1">Send Written Notice</h4>
                        <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                            Send a 15-day formal legal notice via Registered Post / Email giving the company a final chance to resolve the dispute before litigation.
                        </p>
                    </div>

                    <div className="relative pl-10">
                        <div className="absolute left-0 top-1 w-8 h-8 rounded-full bg-white dark:bg-neutral-800 border-2 border-rose-500 flex items-center justify-center text-xs font-black text-rose-500 z-10">2</div>
                        <h4 className="font-bold text-neutral-900 dark:text-white text-sm mb-1">Call NCH Toll-Free</h4>
                        <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                            Dial <strong className="text-rose-600 dark:text-rose-400">1915</strong> or register your grievance online at the National Consumer Helpline (NCH) portal.
                        </p>
                    </div>

                    <div className="relative pl-10">
                        <div className="absolute left-0 top-1 w-8 h-8 rounded-full bg-white dark:bg-neutral-800 border-2 border-rose-500 flex items-center justify-center text-xs font-black text-rose-500 z-10">3</div>
                        <h4 className="font-bold text-neutral-900 dark:text-white text-sm mb-1">File on e-Daakhil</h4>
                        <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                            If unresolved within 15 days, file a case at the District Consumer Commission via <code className="bg-neutral-100 dark:bg-neutral-700 px-1 py-0.5 rounded text-rose-600 dark:text-rose-400">edaakhil.nic.in</code> (For claims up to ₹50 Lakhs).
                        </p>
                    </div>
                </div>
            </div>
        </div>

        <div className="space-y-4">
            <a 
                href="https://consumerhelpline.gov.in/" 
                target="_blank" 
                rel="noreferrer"
                className="group block p-5 rounded-2xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/30 dark:hover:bg-rose-900/40 border border-rose-200 dark:border-rose-800/50 transition-colors"
            >
                <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                        <PhoneCall className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                        <span className="font-bold text-rose-900 dark:text-rose-100">National Consumer Helpline</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-rose-500 group-hover:translate-x-1 transition-transform" />
                </div>
                <div className="text-sm font-black text-rose-600 dark:text-rose-400 mt-1">1915</div>
                <div className="text-xs text-rose-700/70 dark:text-rose-300/70 mt-1">Visit consumerhelpline.gov.in →</div>
            </a>

            <a 
                href="https://edaakhil.nic.in/" 
                target="_blank" 
                rel="noreferrer"
                className="group block p-5 rounded-2xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/30 dark:hover:bg-indigo-900/40 border border-indigo-200 dark:border-indigo-800/50 transition-colors"
            >
                <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                        <Scale className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        <span className="font-bold text-indigo-900 dark:text-indigo-100">e-Daakhil Portal</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-indigo-500 group-hover:translate-x-1 transition-transform" />
                </div>
                <div className="text-xs text-indigo-700/80 dark:text-indigo-300/80 mt-1 leading-relaxed">
                    File consumer complaints online directly from home. No need to visit the court premises physically for initial filing.
                </div>
                <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mt-2">Visit edaakhil.nic.in →</div>
            </a>
        </div>
      </div>
    </div>
  );
};
