import React from 'react';
import { Expense } from '../types';
import { X, ExternalLink, Calendar, Building, User, DollarSign, Tag, FileText } from 'lucide-react';

interface ReceiptViewerModalProps {
  expense: Expense | null;
  onClose: () => void;
}

export const ReceiptViewerModal: React.FC<ReceiptViewerModalProps> = ({
  expense,
  onClose,
}) => {
  if (!expense) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Receipt Inspection & Audit</h3>
              <p className="text-xs text-slate-500">Transaction ID: {expense.id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Receipt Image Preview */}
          <div className="space-y-3">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Scanned Receipt Document
            </label>
            <div className="rounded-xl border border-slate-200 bg-slate-100 overflow-hidden h-72 flex items-center justify-center relative group">
              <img 
                src={expense.receiptUrl || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=600'} 
                alt="Receipt" 
                className="w-full h-full object-cover"
              />
              <a
                href={expense.receiptUrl}
                target="_blank"
                rel="noreferrer"
                className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold space-x-1"
              >
                <span>Open Full Size</span>
                <ExternalLink className="w-4 h-4 ml-1" />
              </a>
            </div>
          </div>

          {/* Metadata & Details */}
          <div className="space-y-4">
            <div>
              <span className="text-xs text-slate-400 uppercase font-semibold">Merchant</span>
              <h4 className="text-lg font-bold text-slate-900">{expense.merchant}</h4>
            </div>

            <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
              <div>
                <span className="text-[11px] text-slate-500 uppercase font-medium">Amount</span>
                <p className="text-xl font-bold text-slate-900">${expense.amount.toFixed(2)}</p>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 uppercase font-medium">Status</span>
                <p className="text-sm font-semibold mt-1">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                    expense.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                    expense.status === 'Pending' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                    'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}>
                    {expense.status}
                  </span>
                </p>
              </div>
            </div>

            <div className="space-y-2.5 text-xs text-slate-600">
              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="flex items-center text-slate-400"><Calendar className="w-3.5 h-3.5 mr-2" /> Date</span>
                <span className="font-semibold text-slate-800">{expense.date}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="flex items-center text-slate-400"><Tag className="w-3.5 h-3.5 mr-2" /> Category</span>
                <span className="font-semibold text-slate-800">{expense.category}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="flex items-center text-slate-400"><User className="w-3.5 h-3.5 mr-2" /> Employee</span>
                <span className="font-semibold text-slate-800">{expense.employeeName} ({expense.department})</span>
              </div>
              {expense.tax !== undefined && (
                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                  <span className="flex items-center text-slate-400"><DollarSign className="w-3.5 h-3.5 mr-2" /> Est. Tax</span>
                  <span className="font-semibold text-slate-800">${expense.tax.toFixed(2)}</span>
                </div>
              )}
            </div>

            <div>
              <span className="text-xs text-slate-400 uppercase font-semibold">Notes / Purpose</span>
              <p className="text-xs text-slate-700 mt-1 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                {expense.notes || 'No description provided.'}
              </p>
            </div>

          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-medium hover:bg-slate-800 transition-colors"
          >
            Close Inspector
          </button>
        </div>

      </div>
    </div>
  );
};
