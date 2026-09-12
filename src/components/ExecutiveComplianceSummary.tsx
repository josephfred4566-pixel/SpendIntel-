import React, { useState } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  ArrowRight,
  Info,
  DollarSign,
  CheckCircle2,
  AlertOctagon
} from 'lucide-react';
import { Expense } from '../types';
import { formatMoney } from '../utils/currencies';
import { getExpenseAmountInCurrency } from '../utils/currencyConverter';

interface ExecutiveComplianceSummaryProps {
  expenses: Expense[];
  currencyCode: string;
  onFilterFlaggedOnly?: () => void;
  onInspectHighRisk?: () => void;
}

export const ExecutiveComplianceSummary: React.FC<ExecutiveComplianceSummaryProps> = ({
  expenses,
  currencyCode,
  onFilterFlaggedOnly,
  onInspectHighRisk
}) => {
  const [showExplanation, setShowExplanation] = useState(false);

  // Total transactions
  const totalCount = expenses.length;

  if (totalCount === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6 text-center text-slate-500 shadow-xs">
        <ShieldCheck className="w-8 h-8 text-slate-300 mx-auto mb-2" />
        <p className="text-sm">No transactions logged to calculate executive compliance summary.</p>
      </div>
    );
  }

  // Calculate flagged transactions
  const flaggedCount = expenses.filter(
    item => item.status === 'Flagged' || (item.violations && item.violations.length > 0) || item.patternRisk === 'High'
  ).length;

  // Compliant transactions
  const compliantCount = totalCount - flaggedCount;
  
  // High pattern risk counts
  const highRiskCount = expenses.filter(item => item.patternRisk === 'High').length;

  // Active policy violation count
  const totalViolationsCount = expenses.reduce((sum, item) => sum + (item.violations?.length || 0), 0);

  // Compliance percentage
  const compliancePercentage = Math.round((compliantCount / totalCount) * 100);

  // Total amount in compliance vs flagged
  const totalValue = expenses.reduce((sum, item) => sum + getExpenseAmountInCurrency(item, currencyCode), 0);
  
  const flaggedValue = expenses
    .filter(item => item.status === 'Flagged' || (item.violations && item.violations.length > 0) || item.patternRisk === 'High')
    .reduce((sum, item) => sum + getExpenseAmountInCurrency(item, currencyCode), 0);

  const compliantValue = totalValue - flaggedValue;

  // Determine health level
  let healthLabel = 'Excellent';
  let healthColor = 'text-emerald-700 bg-emerald-50 border-emerald-200';
  let healthIndicator = 'bg-emerald-500';
  let adviceText = 'Your corporate expense ledger is in exceptional health. Automated policies are maintaining high spend guardrails.';

  if (compliancePercentage < 70) {
    healthLabel = 'Critical Warning';
    healthColor = 'text-rose-700 bg-rose-50 border-rose-200';
    healthIndicator = 'bg-rose-500';
    adviceText = 'Multiple transaction violations and anomalous patterns detected. Prioritize immediate department-wide compliance training.';
  } else if (compliancePercentage < 90) {
    healthLabel = 'Needs Attention';
    healthColor = 'text-amber-700 bg-amber-50 border-amber-200';
    healthIndicator = 'bg-amber-500';
    adviceText = 'Moderate levels of policy violations present. Conduct audits on recent Travel and Software renewals.';
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden" id="executive-compliance-summary-card">
      {/* Card Header */}
      <div className="border-b border-slate-100 px-5 py-4 flex items-center justify-between bg-slate-50/55">
        <div>
          <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider font-mono block">
            Executive Ledger Health
          </span>
          <h3 className="text-base font-bold text-slate-900 mt-0.5">
            Executive Compliance Summary
          </h3>
        </div>
        <button
          onClick={() => setShowExplanation(!showExplanation)}
          className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer p-1 rounded-md hover:bg-slate-100"
          title="Show Calculation Explanation"
        >
          <Info className="w-4 h-4" />
        </button>
      </div>

      {showExplanation && (
        <div className="p-4 bg-slate-50 border-b border-slate-200 text-xs text-slate-600 space-y-1.5 animate-in fade-in duration-200">
          <p className="font-semibold text-slate-800">How is this compliance score calculated?</p>
          <p>
            The metric measures the proportion of corporate expenses that adhere strictly to current expense guardrails.
          </p>
          <ul className="list-disc pl-4 space-y-1">
            <li><strong>Compliant (100% Pass)</strong>: Transactions with zero policy violations, no active AI flagged anomalies, and approved statuses.</li>
            <li><strong>Flagged/Warning</strong>: Transactions containing automatic policy violations (e.g. missing receipts, spending cap breaches) or high risk flags by our anomalous pattern engine.</li>
          </ul>
        </div>
      )}

      {/* Grid Layout containing Gauge and Details */}
      <div className="p-5 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        
        {/* Left: The Circular Gauge */}
        <div className="md:col-span-4 flex flex-col items-center justify-center text-center">
          <div className="relative w-32 h-32 flex items-center justify-center">
            {/* SVG Arc Progress */}
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                className="stroke-slate-100"
                strokeWidth="10"
                fill="transparent"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                className={`transition-all duration-1000 ease-out ${
                  compliancePercentage >= 90 ? 'stroke-emerald-500' :
                  compliancePercentage >= 70 ? 'stroke-amber-500' : 'stroke-rose-500'
                }`}
                strokeWidth="10"
                strokeDasharray={`${2 * Math.PI * 40}`}
                strokeDashoffset={`${2 * Math.PI * 40 * (1 - compliancePercentage / 100)}`}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            {/* Value in Center */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-extrabold text-slate-900 font-mono tracking-tighter">
                {compliancePercentage}%
              </span>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                Compliant
              </span>
            </div>
          </div>
          
          <div className={`mt-3.5 px-2.5 py-0.5 rounded text-xs font-bold border ${healthColor}`}>
            {healthLabel}
          </div>
        </div>

        {/* Right: Key Breakdown & Stats */}
        <div className="md:col-span-8 space-y-4">
          
          {/* Progress bar visual split */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-semibold text-slate-700">
              <span>Financial Allocation Profile</span>
              <span className="font-mono">
                {compliantCount} of {totalCount} transactions
              </span>
            </div>
            <div className="w-full h-3.5 bg-slate-100 rounded-lg overflow-hidden flex border border-slate-200">
              <div 
                className="h-full bg-emerald-500 transition-all duration-500" 
                style={{ width: `${compliancePercentage}%` }}
                title={`${compliancePercentage}% Compliant Spend`}
              />
              <div 
                className="h-full bg-rose-500 transition-all duration-500" 
                style={{ width: `${100 - compliancePercentage}%` }}
                title={`${100 - compliancePercentage}% Flagged Spend`}
              />
            </div>
          </div>

          {/* Core breakdown table row metrics */}
          <div className="grid grid-cols-2 gap-4">
            
            {/* Compliant Stats Block */}
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
              <div className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Compliant Pool</span>
              </div>
              <div className="text-lg font-extrabold text-slate-900 font-mono leading-none pt-0.5">
                {formatMoney(compliantValue, currencyCode)}
              </div>
              <p className="text-[10px] text-slate-500">
                {compliantCount} clean ledger line items
              </p>
            </div>

            {/* Flagged Stats Block */}
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
              <div className="flex items-center space-x-1.5">
                <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Flagged/Warning</span>
              </div>
              <div className="text-lg font-extrabold text-slate-900 font-mono leading-none pt-0.5">
                {formatMoney(flaggedValue, currencyCode)}
              </div>
              <p className="text-[10px] text-slate-500">
                {flaggedCount} lines flagged with violations
              </p>
            </div>

          </div>

          {/* Action recommendation bar */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start gap-2.5">
            <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${healthIndicator}`} />
            <div className="space-y-1">
              <p className="font-semibold text-slate-800">Executive Guidance Advisory</p>
              <p className="leading-relaxed text-slate-500">{adviceText}</p>
            </div>
          </div>

        </div>

      </div>

      {/* Footer controls */}
      <div className="border-t border-slate-100 px-5 py-3 flex items-center justify-between bg-slate-50/30">
        <div className="flex items-center text-xs text-slate-500 gap-1.5">
          <span className="font-semibold text-slate-700 font-mono">{totalViolationsCount}</span> total policy triggers detected
        </div>
        <div className="flex items-center space-x-3">
          {onFilterFlaggedOnly && flaggedCount > 0 && (
            <button
              onClick={onFilterFlaggedOnly}
              className="text-xs font-bold text-rose-600 hover:text-rose-800 transition-colors flex items-center cursor-pointer"
            >
              Filter Flagged
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </button>
          )}
          {onInspectHighRisk && highRiskCount > 0 && (
            <button
              onClick={onInspectHighRisk}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-900 transition-colors flex items-center cursor-pointer"
            >
              Audit Anomalies
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
