import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { FileText, Copy, Check, Printer, Download, Sparkles, Send } from 'lucide-react';

interface LetterGeneratorProps {
  onResultChange?: (summary: string, params: Record<string, any>) => void;
}

type LetterType = 'resignation' | 'resignation-waiver' | 'sick-leave' | 'casual-leave' | 'wfh';

export const LetterGenerator: React.FC<LetterGeneratorProps> = ({ onResultChange }) => {
  const { currentToolParams } = useApp();

  const [letterType, setLetterType] = useState<LetterType>('resignation');

  // Common Fields
  const [employeeName, setEmployeeName] = useState<string>('Rahul Sharma');
  const [designation, setDesignation] = useState<string>('Senior Software Engineer');
  const [companyName, setCompanyName] = useState<string>('Infosys Technologies Ltd');
  const [managerName, setManagerName] = useState<string>('Amit Verma');
  const [department, setDepartment] = useState<string>('Digital Engineering');
  
  // Specific Dates & Reasons
  const todayFormatted = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  const [lastWorkingDate, setLastWorkingDate] = useState<string>(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
  );
  const [leaveStartDate, setLeaveStartDate] = useState<string>(
    new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
  );
  const [leaveEndDate, setLeaveEndDate] = useState<string>(
    new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
  );
  const [reason, setReason] = useState<string>('career growth and personal aspirations');
  const [colleagueCover, setColleagueCover] = useState<string>('Pooja Patel');

  const [copied, setCopied] = useState<boolean>(false);

  // Generate Letter Text
  const generateLetterContent = (): string => {
    if (letterType === 'resignation') {
      return `Date: ${todayFormatted}

To,
${managerName}
Reporting Manager / Department Head
${companyName}

Subject: Resignation Letter - ${employeeName} (${designation})

Dear ${managerName},

Please accept this letter as formal notification that I am resigning from my position as ${designation} at ${companyName}. As per the company policy and employment agreement terms, my last working day with the organization will be ${lastWorkingDate}.

I would like to express my sincere gratitude for the opportunities and professional growth I have experienced during my tenure here. Working alongside such a talented team in the ${department} department has been a truly rewarding experience.

During my remaining notice period, I am fully committed to ensuring a smooth transition of my duties, active projects, and responsibilities. I will complete all pending documentation and assist in handing over tasks to ${colleagueCover} or any designated team member.

I wish ${companyName} and the entire team continued success in all future endeavors. Please let me know the formalities required for the exit clearance process.

Sincerely,

${employeeName}
${designation}
Employee ID: [Your Employee ID]
Contact: [Your Mobile Number]`;
    }

    if (letterType === 'resignation-waiver') {
      return `Date: ${todayFormatted}

To,
${managerName}
${companyName}

Subject: Resignation and Request for Notice Period Buyout / Early Release

Dear ${managerName},

I am writing to formally tender my resignation from my position as ${designation} at ${companyName}.

Due to unavoidable personal circumstances and upcoming commitments, I kindly request an early release from my notice period, with my proposed last working day on ${lastWorkingDate}. I am willing to adjust any accumulated leave balance or facilitate notice period buyout as per company policy.

I will ensure that all my current deliverables and handovers are completed diligently before my departure. Thank you for your support and understanding.

Warm regards,

${employeeName}
${designation}`;
    }

    if (letterType === 'sick-leave') {
      return `Date: ${todayFormatted}

To,
${managerName}
${companyName}

Subject: Sick Leave Application - ${employeeName} (${designation})

Dear ${managerName},

I am writing to formally request medical / sick leave from ${leaveStartDate} to ${leaveEndDate} (inclusive) due to acute viral fever and physician-advised rest.

I have informed ${colleagueCover}, who has kindly agreed to cover urgent client queries and ongoing tasks in my absence. I will also be reachable on email and phone for any urgent escalation.

I will submit the doctor's prescription / medical fitness certificate upon resuming office. Thank you for your understanding.

Yours sincerely,

${employeeName}
${designation}
${department}`;
    }

    if (letterType === 'casual-leave') {
      return `Date: ${todayFormatted}

To,
${managerName}
${companyName}

Subject: Application for Casual Leave from ${leaveStartDate} to ${leaveEndDate}

Dear ${managerName},

I would like to request casual leave for [Number of Days] days starting from ${leaveStartDate} to ${leaveEndDate} on account of ${reason}.

I have scheduled my tasks to ensure that all critical milestones are met prior to my leave. ${colleagueCover} will be handling critical updates during this period.

I request you to kindly approve my leave application.

Regards,

${employeeName}
${designation}`;
    }

    // WFH template
    return `Date: ${todayFormatted}

To,
${managerName}
${companyName}

Subject: Request for Work from Home (WFH) on ${leaveStartDate} to ${leaveEndDate}

Dear ${managerName},

I am writing to request permission to Work From Home from ${leaveStartDate} to ${leaveEndDate} due to ${reason}.

I will be fully available on Slack, Microsoft Teams, and email during official working hours, and I will attend all scheduled team syncs and deliver my milestones on schedule.

I appreciate your consideration and approval.

Warm regards,

${employeeName}
${designation}
${department}`;
  };

  const letterText = generateLetterContent();

  const handleCopy = () => {
    navigator.clipboard.writeText(letterText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>${letterType} - ${employeeName}</title>
            <style>
              body { font-family: Georgia, serif; line-height: 1.6; padding: 40px; white-space: pre-wrap; font-size: 14px; }
            </style>
          </head>
          <body>${letterText}</body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  useEffect(() => {
    if (onResultChange) {
      const summary = `Generated ${letterType.replace('-', ' ')} letter for ${employeeName} (${companyName})`;
      onResultChange(summary, { letterType, employeeName, companyName, managerName });
    }
  }, [letterType, employeeName, companyName, managerName, lastWorkingDate, leaveStartDate, leaveEndDate, reason]);

  return (
    <div className="space-y-8">
      {/* Template Selector */}
      <div className="flex flex-wrap gap-2 p-1.5 rounded-2xl bg-neutral-100 dark:bg-neutral-800/80 max-w-2xl">
        {[
          { id: 'resignation', label: 'Standard Resignation' },
          { id: 'resignation-waiver', label: 'Notice Period Waiver' },
          { id: 'sick-leave', label: 'Sick / Medical Leave' },
          { id: 'casual-leave', label: 'Casual Leave' },
          { id: 'wfh', label: 'Work From Home' }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setLetterType(t.id as any)}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all text-center ${
              letterType === t.id
                ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form Inputs */}
        <div className="lg:col-span-6 bg-white dark:bg-neutral-900 rounded-3xl p-6 sm:p-7 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-neutral-900 dark:text-white font-display border-b border-neutral-100 dark:border-neutral-800 pb-3">
            Employee & Company Details
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Your Full Name
              </label>
              <input
                type="text"
                value={employeeName}
                onChange={e => setEmployeeName(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 text-xs font-medium text-neutral-900 dark:text-white outline-none focus:border-accent"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Designation / Role
              </label>
              <input
                type="text"
                value={designation}
                onChange={e => setDesignation(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 text-xs font-medium text-neutral-900 dark:text-white outline-none focus:border-accent"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Company Name
              </label>
              <input
                type="text"
                value={companyName}
                onChange={e => setCompanyName(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 text-xs font-medium text-neutral-900 dark:text-white outline-none focus:border-accent"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Manager's Name
              </label>
              <input
                type="text"
                value={managerName}
                onChange={e => setManagerName(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 text-xs font-medium text-neutral-900 dark:text-white outline-none focus:border-accent"
              />
            </div>
          </div>

          {letterType.startsWith('resignation') ? (
            <div className="space-y-1 pt-2 border-t border-neutral-100 dark:border-neutral-800">
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Requested Last Working Day
              </label>
              <input
                type="text"
                value={lastWorkingDate}
                onChange={e => setLastWorkingDate(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 text-xs font-medium text-neutral-900 dark:text-white outline-none focus:border-accent"
              />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-neutral-100 dark:border-neutral-800">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  Leave Start Date
                </label>
                <input
                  type="text"
                  value={leaveStartDate}
                  onChange={e => setLeaveStartDate(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 text-xs font-medium text-neutral-900 dark:text-white outline-none focus:border-accent"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  Leave End Date
                </label>
                <input
                  type="text"
                  value={leaveEndDate}
                  onChange={e => setLeaveEndDate(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 text-xs font-medium text-neutral-900 dark:text-white outline-none focus:border-accent"
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              Handover Colleague / Buddy
            </label>
            <input
              type="text"
              value={colleagueCover}
              onChange={e => setColleagueCover(e.target.value)}
              className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 text-xs font-medium text-neutral-900 dark:text-white outline-none focus:border-accent"
            />
          </div>
        </div>

        {/* Live Preview & Actions */}
        <div className="lg:col-span-6 space-y-4">
          <div className="p-6 rounded-3xl bg-neutral-900 text-white border border-neutral-800 shadow-xl space-y-4">
            <div className="flex justify-between items-center border-b border-neutral-800 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-accent">
                Ready-to-Send Formatted Text
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied!' : 'Copy Letter'}
                </button>
                <button
                  onClick={handlePrint}
                  className="p-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors"
                  title="Print letter"
                >
                  <Printer className="w-4 h-4" />
                </button>
              </div>
            </div>

            <pre className="text-xs font-sans text-neutral-200 whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto p-4 rounded-2xl bg-neutral-950/80 border border-neutral-800 selection:bg-accent selection:text-white">
              {letterText}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
