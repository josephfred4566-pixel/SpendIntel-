import React, { useState } from 'react';
import { Expense, ExpenseCategory, Department, CategoryDefinition } from '../types';
import { X, Upload, Sparkles, Check, Loader2 } from 'lucide-react';
import { WORLD_CURRENCIES, getCurrencyInfo } from '../utils/currencies';
import { SpendIntelIcon } from './SpendIntelLogo';

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddExpense: (expense: Expense) => void;
  activeCurrencyCode?: string;
  availableCategories?: CategoryDefinition[];
}

export const ExpenseModal: React.FC<ExpenseModalProps> = ({
  isOpen,
  onClose,
  onAddExpense,
  activeCurrencyCode = 'USD',
  availableCategories,
}) => {
  const [merchant, setMerchant] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState(activeCurrencyCode);
  const [category, setCategory] = useState<ExpenseCategory>('Travel');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [employeeName, setEmployeeName] = useState('Alex Rivera');
  const [department, setDepartment] = useState<Department>('Engineering');
  const [notes, setNotes] = useState('');
  const [receiptUrl, setReceiptUrl] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanSuccessMessage, setScanSuccessMessage] = useState('');

  if (!isOpen) return null;

  const currentCurrencyInfo = getCurrencyInfo(currency);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Convert file to base64 for Gemini OCR endpoint
    const reader = new FileReader();
    reader.onload = async () => {
      const base64String = reader.result as string;
      setReceiptUrl(base64String);

      // Trigger AI scan
      setIsScanning(true);
      setScanSuccessMessage('');
      try {
        const res = await fetch('/api/scan-receipt', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: base64String,
            mimeType: file.type
          })
        });
        const data = await res.json();
        if (data.success) {
          if (data.merchant) setMerchant(data.merchant);
          if (data.amount) setAmount(data.amount.toString());
          if (data.date) setDate(data.date);
          if (data.category && ['Travel', 'Software', 'Meals', 'Office Supplies', 'Cloud & Hosting', 'Marketing', 'Other'].includes(data.category)) {
            setCategory(data.category as ExpenseCategory);
          }
          if (data.notes) setNotes(data.notes);
          setScanSuccessMessage('Receipt successfully scanned & auto-filled via AI engine!');
        }
      } catch (err) {
        console.error("Scan error:", err);
        setScanSuccessMessage('Receipt uploaded successfully.');
      } finally {
        setIsScanning(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!merchant || !amount) return;

    const parsedAmount = parseFloat(amount) || 0;

    const newExpense: Expense = {
      id: `exp-${Date.now()}`,
      date,
      merchant,
      category,
      amount: parsedAmount,
      currency,
      status: 'Pending',
      employeeName,
      department,
      tax: Math.round(parsedAmount * 0.08 * 100) / 100,
      hasReceipt: Boolean(receiptUrl && receiptUrl.length > 0),
      receiptUrl: receiptUrl || undefined,
      notes,
      description: notes || `${category} expense for ${employeeName}`,
    };

    onAddExpense(newExpense);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center p-1">
              <SpendIntelIcon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Log New Expense</h3>
              <p className="text-xs text-slate-500">Record transaction voucher for SpendIntel corporate compliance</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Drag & Drop Receipt Upload Zone */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Receipt Attachment / Invoice (Optional)
            </label>
            <div className="border-2 border-dashed border-slate-300 hover:border-slate-500 rounded-xl p-4 text-center bg-slate-50 hover:bg-slate-100/50 transition-all cursor-pointer relative group">
              <input
                type="file"
                accept="image/*,application/pdf"
                onChange={handleFileUpload}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <div className="flex flex-col items-center justify-center space-y-2">
                {isScanning ? (
                  <>
                    <Loader2 className="w-7 h-7 text-slate-900 animate-spin" />
                    <p className="text-xs font-medium text-slate-700">AI scanning receipt details...</p>
                  </>
                ) : receiptUrl ? (
                  <>
                    <div className="w-10 h-10 rounded-lg bg-slate-900 text-white flex items-center justify-center">
                      <Check className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-semibold text-slate-900">Receipt attached successfully!</p>
                    <span className="text-[11px] text-slate-400">Click or drag another file to replace</span>
                  </>
                ) : (
                  <>
                    <div className="w-9 h-9 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Upload className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-slate-900">Click to upload receipt</span>
                      <span className="text-xs text-slate-500"> or drag and drop</span>
                    </div>
                    <p className="text-[11px] text-slate-400">PNG, JPG, or PDF (OCR automated extraction)</p>
                  </>
                )}
              </div>
            </div>
            {scanSuccessMessage && (
              <p className="mt-1.5 text-xs font-medium text-slate-700 flex items-center">
                <Sparkles className="w-3.5 h-3.5 mr-1 text-slate-900" /> {scanSuccessMessage}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Merchant */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Merchant / Vendor *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. AWS, Delta Air, Hilton, Figma"
                value={merchant}
                onChange={(e) => setMerchant(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            {/* Currency & Amount */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Amount ({currentCurrencyInfo.symbol} {currentCurrencyInfo.code}) *
              </label>
              <div className="flex space-x-1.5">
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-28 px-2 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 bg-slate-50 font-mono focus:outline-none focus:ring-2 focus:ring-slate-900 shrink-0"
                >
                  {WORLD_CURRENCIES.map(c => (
                    <option key={c.code} value={c.code}>
                      {c.code} ({c.symbol})
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Category */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
              >
                {availableCategories && availableCategories.length > 0 ? (
                  availableCategories.map((c) => (
                    <option key={c.id || c.category} value={c.category}>
                      {c.category}
                    </option>
                  ))
                ) : (
                  <>
                    <option value="Travel">Travel</option>
                    <option value="Software">Software</option>
                    <option value="Meals">Meals</option>
                    <option value="Office Supplies">Office Supplies</option>
                    <option value="Cloud & Hosting">Cloud & Hosting</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Other">Other</option>
                  </>
                )}
              </select>
            </div>

            {/* Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Date
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Employee Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Employee Name
              </label>
              <input
                type="text"
                value={employeeName}
                onChange={(e) => setEmployeeName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            {/* Department */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Department
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value as Department)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
              >
                <option value="Engineering">Engineering</option>
                <option value="Sales">Sales</option>
                <option value="Marketing">Marketing</option>
                <option value="Operations">Operations</option>
                <option value="Executive">Executive</option>
                <option value="Design">Design</option>
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Business Purpose / Notes
            </label>
            <textarea
              rows={2}
              placeholder="Provide business justification for accounting verification..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          {/* Footer Buttons */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-xs transition-all cursor-pointer ring-1 ring-emerald-700/20"
            >
              Save & Record Transaction
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
