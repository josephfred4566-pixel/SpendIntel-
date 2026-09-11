import React, { useState } from 'react';
import { Expense, PolicyViolation, ViolationSeverity } from '../types';
import { formatMoney } from '../utils/currencies';
import { getExpenseAmountInCurrency } from '../utils/currencyConverter';
import { 
  ShieldAlert, 
  CheckCircle2, 
  ChevronRight, 
  Filter, 
  RefreshCw, 
  Clock, 
  AlertCircle 
} from 'lucide-react';

interface AuditAlertsCardProps {
  expenses: Expense[];
  onFilterFlagged: () => void;
  onSelectExpenseForAudit: (expense: Expense) => void;
  onWaiveViolation: (expenseId: string, violationId: string) => void;
  onReaudit: () => void;
  isAuditing: boolean;
  currencyCode?: string;
}

export const AuditAlertsCard: React.FC<AuditAlertsCardProps> = ({
  expenses,
  onFilterFlagged,
  onSelectExpenseForAudit,
  onWaiveViolation,
  onReaudit,
  isAuditing,
  currencyCode = 'USD',
}) => {
  const [selectedSeverity, setSelectedSeverity] = useState<ViolationSeverity | 'all'>('all');

  // Collect all violations across all expenses in real-time
  const allViolations: { violation: PolicyViolation; expense: Expense }[] = [];
  expenses.forEach(expense => {
    (expense.violations || []).forEach(v => {
      allViolations.push({ violation: v, expense });
    });
  });

  const criticalCount = allViolations.filter(v => v.violation.severity === 'critical').length;
  const warningCount = allViolations.filter(v => v.violation.severity === 'warning').length;
  const infoCount = allViolations.filter(v => v.violation.severity === 'info').length;

  const filteredViolations = selectedSeverity === 'all'
    ? allViolations
    : allViolations.filter(v => v.violation.severity === selectedSeverity);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-800 border border-slate-200 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                  Audit Alerts & Policy Governance
                </h2>
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold bg-slate-100 text-slate-800 border border-slate-200">
                  {allViolations.length} Flagged
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Rule engine evaluation across merchant thresholds and missing receipts
              </p>
            </div>
          </div>

          <button
            onClick={onReaudit}
            disabled={isAuditing}
            className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg flex items-center space-x-1 transition-colors cursor-pointer disabled:opacity-50"
            title="Re-run compliance evaluation"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isAuditing ? 'animate-spin' : ''}`} />
            <span>{isAuditing ? 'Evaluating...' : 'Re-audit'}</span>
          </button>
        </div>

        {/* Severity Tabs in refined financial styling */}
        <div className="grid grid-cols-4 gap-2 mb-3.5">
          <button
            onClick={() => setSelectedSeverity('all')}
            className={`p-2 rounded-lg border text-left transition-all cursor-pointer ${
              selectedSeverity === 'all'
                ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold">All Flags</span>
              <span className="text-xs font-bold font-mono">{allViolations.length}</span>
            </div>
          </button>

          <button
            onClick={() => setSelectedSeverity('critical')}
            className={`p-2 rounded-lg border text-left transition-all cursor-pointer ${
              selectedSeverity === 'critical'
                ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold">Critical</span>
              <span className="text-xs font-bold font-mono">{criticalCount}</span>
            </div>
          </button>

          <button
            onClick={() => setSelectedSeverity('warning')}
            className={`p-2 rounded-lg border text-left transition-all cursor-pointer ${
              selectedSeverity === 'warning'
                ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold">Warning</span>
              <span className="text-xs font-bold font-mono">{warningCount}</span>
            </div>
          </button>

          <button
            onClick={() => setSelectedSeverity('info')}
            className={`p-2 rounded-lg border text-left transition-all cursor-pointer ${
              selectedSeverity === 'info'
                ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold">Notice</span>
              <span className="text-xs font-bold font-mono">{infoCount}</span>
            </div>
          </button>
        </div>

        {/* Violations Itemized Feed */}
        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
          {filteredViolations.length === 0 ? (
            <div className="text-center py-8 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
              <CheckCircle2 className="w-8 h-8 text-slate-700 mx-auto mb-1.5" />
              <p className="text-xs font-semibold text-slate-900">0 Active Policy Violations</p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {expenses.length === 0
                  ? 'No expenses logged yet. When transactions violate compliance rules, they will trigger alerts here.'
                  : 'All recorded expenses meet enterprise compliance thresholds.'}
              </p>
            </div>
          ) : (
            filteredViolations.map(({ violation, expense }) => {
              return (
                <div
                  key={violation.id}
                  className="p-3 rounded-lg border border-slate-200 bg-slate-50/70 hover:bg-slate-50 transition-all"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5 flex-1 min-w-0">
                      <div className="flex items-center space-x-1.5">
                        <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-200 text-slate-800 font-mono">
                          {violation.code}
                        </span>
                        <span className="text-xs font-bold text-slate-900 truncate">
                          {violation.ruleName}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 line-clamp-2">
                        {violation.description}
                      </p>
                      <div className="flex items-center space-x-2 pt-1 text-[11px] text-slate-500">
                        <span className="font-semibold text-slate-800">{expense.merchant}</span>
                        <span>•</span>
                        <span className="font-bold text-slate-900 font-mono">
                          {formatMoney(getExpenseAmountInCurrency(expense, currencyCode), currencyCode)}
                        </span>
                        <span>•</span>
                        <span>{expense.employeeName} ({expense.department})</span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end space-y-1 shrink-0">
                      <button
                        onClick={() => onSelectExpenseForAudit(expense)}
                        className="text-xs font-medium text-slate-800 hover:text-slate-950 bg-white border border-slate-200 px-2.5 py-1 rounded-md shadow-2xs hover:border-slate-300 flex items-center transition-colors cursor-pointer"
                      >
                        Inspect
                        <ChevronRight className="w-3 h-3 ml-0.5" />
                      </button>
                      <button
                        onClick={() => onWaiveViolation(expense.id, violation.id)}
                        className="text-[11px] text-slate-500 hover:text-slate-900 hover:underline transition-colors cursor-pointer"
                        title="Manager exception waiver"
                      >
                        Waive Rule
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Footer Controls */}
      <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between">
        <button
          onClick={onFilterFlagged}
          className="text-xs font-semibold text-slate-800 hover:text-slate-950 flex items-center transition-colors cursor-pointer"
        >
          <Filter className="w-3.5 h-3.5 mr-1 text-slate-600" />
          Filter Feed to Flagged ({allViolations.length})
        </button>

        <span className="text-[11px] text-slate-500">
          SOC-2 Type II Rule Engine Active
        </span>
      </div>
    </div>
  );
};
