import React from 'react';
import { Expense } from '../types';
import { 
  ShieldAlert, 
  X, 
  AlertOctagon, 
  AlertTriangle, 
  FileText, 
  User, 
  Building2, 
  Calendar, 
  DollarSign, 
  Check, 
  Eye,
  FileQuestion,
  Receipt
} from 'lucide-react';

interface AuditInspectionModalProps {
  expense: Expense | null;
  onClose: () => void;
  onApproveWithException: (id: string) => void;
  onRejectExpense: (id: string) => void;
  onRequestReceipt: (id: string) => void;
  onViewReceipt: (expense: Expense) => void;
}

export const AuditInspectionModal: React.FC<AuditInspectionModalProps> = ({
  expense,
  onClose,
  onApproveWithException,
  onRejectExpense,
  onRequestReceipt,
  onViewReceipt,
}) => {
  if (!expense) return null;

  const hasReceipt = expense.hasReceipt !== false && Boolean(expense.receiptUrl && expense.receiptUrl.trim().length > 0);
  const violations = expense.violations || [];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-rose-50 border-b border-rose-100 p-5 flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-bold text-slate-900">
                  Compliance Audit Review
                </h3>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-200 text-rose-900">
                  {violations.length} Violation{violations.length > 1 ? 's' : ''}
                </span>
              </div>
              <p className="text-xs text-rose-700 mt-0.5 font-medium">
                Automated accounting rule flags for Transaction #{expense.id}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          
          {/* Transaction Summary Grid */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-slate-400 block mb-0.5">Merchant</span>
              <span className="font-bold text-slate-900 text-sm">{expense.merchant}</span>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">Amount</span>
              <span className="font-bold text-slate-900 text-sm">
                ${expense.amount.toFixed(2)}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">Employee</span>
              <span className="font-semibold text-slate-800">{expense.employeeName}</span>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">Department</span>
              <span className="font-semibold text-slate-800">{expense.department}</span>
            </div>
          </div>

          {/* Pattern Risk Field */}
          {expense.patternRisk && (
            <div className={`p-4 rounded-xl border flex items-start space-x-3 text-xs ${
              expense.patternRisk === 'High' 
                ? 'bg-rose-50/50 border-rose-200 text-rose-950' 
                : expense.patternRisk === 'Medium'
                ? 'bg-amber-50/50 border-amber-200 text-amber-950'
                : 'bg-emerald-50/40 border-emerald-200 text-emerald-950'
            }`}>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 border ${
                expense.patternRisk === 'High' 
                  ? 'bg-rose-100/80 text-rose-700 border-rose-200' 
                  : expense.patternRisk === 'Medium'
                  ? 'bg-amber-100/80 text-amber-700 border-amber-200'
                  : 'bg-emerald-100/80 text-emerald-700 border-emerald-200'
              }`}>
                <AlertOctagon className="w-4 h-4 animate-pulse" />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold uppercase tracking-wider text-[10px]">
                    AI Anomalous Spend Pattern Risk:
                  </span>
                  <span className={`px-2 py-0.5 rounded-full font-extrabold text-[10px] ${
                    expense.patternRisk === 'High' 
                      ? 'bg-rose-100 text-rose-800 animate-pulse' 
                      : expense.patternRisk === 'Medium'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {expense.patternRisk} Risk Flag
                  </span>
                </div>
                <p className="font-medium text-slate-700 leading-relaxed">
                  {expense.patternRiskExplanation || 'No historical departmental deviation detected for this expense pattern.'}
                </p>
              </div>
            </div>
          )}

          {/* Notes & Justification */}
          <div>
            <span className="text-xs font-semibold text-slate-500 block mb-1">
              SUBMITTED BUSINESS PURPOSE & MEMO:
            </span>
            <div className="p-3 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 italic">
              "{expense.notes || 'No description or business justification provided by employee.'}"
            </div>
          </div>

          {/* Flagged Violations List */}
          <div>
            <span className="text-xs font-semibold text-slate-500 block mb-2">
              TRIGGERED CORPORATE POLICY RULES:
            </span>
            <div className="space-y-3">
              {violations.map(v => (
                <div 
                  key={v.id} 
                  className={`p-3.5 rounded-xl border ${
                    v.severity === 'critical'
                      ? 'bg-rose-50/60 border-rose-200'
                      : v.severity === 'warning'
                      ? 'bg-amber-50/60 border-amber-200'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center space-x-2">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        v.severity === 'critical' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {v.code}
                      </span>
                      <span className="font-bold text-sm text-slate-900">{v.ruleName}</span>
                    </div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-rose-700">
                      {v.severity}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 font-medium mb-2">
                    {v.description}
                  </p>
                  <div className="bg-white/80 p-2 rounded-lg border border-slate-200/60 text-xs text-slate-600">
                    <strong className="text-slate-800">Compliance Action Required: </strong>
                    {v.suggestedAction}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Receipt Status */}
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center space-x-2">
              {hasReceipt ? (
                <>
                  <Receipt className="w-5 h-5 text-emerald-600" />
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">Itemized Receipt Attached</span>
                    <span className="text-[11px] text-slate-500">Verified digital scan</span>
                  </div>
                </>
              ) : (
                <>
                  <FileQuestion className="w-5 h-5 text-rose-600" />
                  <div>
                    <span className="text-xs font-bold text-rose-900 block">No Receipt Provided</span>
                    <span className="text-[11px] text-rose-600">Required for amounts over $50.00</span>
                  </div>
                </>
              )}
            </div>

            {hasReceipt && (
              <button
                onClick={() => onViewReceipt(expense)}
                className="px-3 py-1 bg-white border border-slate-300 hover:bg-slate-50 text-xs font-semibold rounded-lg text-slate-700 flex items-center shadow-2xs"
              >
                <Eye className="w-3.5 h-3.5 mr-1 text-slate-500" />
                View Receipt Image
              </button>
            )}
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={() => onRequestReceipt(expense.id)}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-xl shadow-2xs transition-colors"
          >
            Request Employee Clarification
          </button>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => onRejectExpense(expense.id)}
              className="px-4 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100 bg-rose-50 border border-rose-200 rounded-xl transition-colors"
            >
              Reject / Deduct
            </button>
            <button
              onClick={() => onApproveWithException(expense.id)}
              className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors flex items-center"
            >
              <Check className="w-4 h-4 mr-1" />
              Approve with Exception
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
