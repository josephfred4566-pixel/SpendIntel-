import React, { useState, useMemo } from 'react';
import { 
  Printer, 
  X, 
  ShieldCheck, 
  Calendar, 
  Building2, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Download,
  Filter
} from 'lucide-react';
import { Expense, Department, ExpenseCategory } from '../types';
import { formatMoney, getCurrencyInfo } from '../utils/currencies';
import { getExpenseAmountInCurrency, convertBudget } from '../utils/currencyConverter';
import { DEFAULT_DEPARTMENTS, DEFAULT_CATEGORIES } from '../data/initialExpenses';
import { SpendIntelIcon } from './SpendIntelLogo';

interface MonthlyReportPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  expenses: Expense[];
  currencyCode: string;
}

export const MonthlyReportPrintModal: React.FC<MonthlyReportPrintModalProps> = ({
  isOpen,
  onClose,
  expenses,
  currencyCode,
}) => {
  // Available months from expenses or current date
  const availableMonths = useMemo(() => {
    const monthsSet = new Set<string>();
    expenses.forEach(e => {
      if (e.date && e.date.length >= 7) {
        monthsSet.add(e.date.substring(0, 7)); // e.g. "2026-09"
      }
    });
    // Ensure current month is present
    const now = new Date();
    const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    monthsSet.add(currentMonthStr);
    
    return Array.from(monthsSet).sort().reverse();
  }, [expenses]);

  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [selectedDept, setSelectedDept] = useState<Department | 'All'>('All');
  const [entityName, setEntityName] = useState<string>('SpendIntel Global Technologies, Inc.');
  const [reportTitle, setReportTitle] = useState<string>('Corporate Monthly Spending & Compliance Audit Report');
  const [isEditingHeader, setIsEditingHeader] = useState<boolean>(false);

  // Filtered expenses for the printable report
  const reportExpenses = useMemo(() => {
    return expenses.filter(e => {
      const matchMonth = selectedMonth === 'all' || (e.date && e.date.startsWith(selectedMonth));
      const matchDept = selectedDept === 'All' || e.department === selectedDept;
      return matchMonth && matchDept;
    });
  }, [expenses, selectedMonth, selectedDept]);

  // Aggregate metrics converted in real-time
  const totalAmount = useMemo(() => {
    return reportExpenses.reduce((sum, e) => sum + getExpenseAmountInCurrency(e, currencyCode), 0);
  }, [reportExpenses, currencyCode]);

  const approvedAmount = useMemo(() => {
    return reportExpenses
      .filter(e => e.status === 'Approved')
      .reduce((sum, e) => sum + getExpenseAmountInCurrency(e, currencyCode), 0);
  }, [reportExpenses, currencyCode]);

  const pendingAmount = useMemo(() => {
    return reportExpenses
      .filter(e => e.status === 'Pending')
      .reduce((sum, e) => sum + getExpenseAmountInCurrency(e, currencyCode), 0);
  }, [reportExpenses, currencyCode]);

  const flaggedAmount = useMemo(() => {
    return reportExpenses
      .filter(e => e.status === 'Flagged' || (e.violations && e.violations.length > 0))
      .reduce((sum, e) => sum + getExpenseAmountInCurrency(e, currencyCode), 0);
  }, [reportExpenses, currencyCode]);

  const flaggedCount = useMemo(() => {
    return reportExpenses.filter(e => e.status === 'Flagged' || (e.violations && e.violations.length > 0)).length;
  }, [reportExpenses]);

  // Department Breakdown converted in real-time
  const deptBreakdown = useMemo(() => {
    const map = new Map<Department, { total: number; count: number; budget: number }>();
    DEFAULT_DEPARTMENTS.forEach(d => {
      map.set(d.department, { total: 0, count: 0, budget: convertBudget(d.budget, currencyCode) });
    });

    reportExpenses.forEach(e => {
      const defaultBudget = convertBudget(2000, currencyCode);
      const existing = map.get(e.department) || { total: 0, count: 0, budget: defaultBudget };
      map.set(e.department, {
        total: existing.total + getExpenseAmountInCurrency(e, currencyCode),
        count: existing.count + 1,
        budget: existing.budget,
      });
    });

    return Array.from(map.entries())
      .map(([dept, data]) => ({
        department: dept,
        total: data.total,
        count: data.count,
        budget: data.budget,
        utilization: data.budget > 0 ? (data.total / data.budget) * 100 : 0,
      }))
      .filter(d => selectedDept === 'All' ? true : d.department === selectedDept)
      .sort((a, b) => b.total - a.total);
  }, [reportExpenses, selectedDept, currencyCode]);

  // Category Breakdown converted in real-time
  const categoryBreakdown = useMemo(() => {
    const map = new Map<ExpenseCategory, { total: number; count: number }>();
    reportExpenses.forEach(e => {
      const existing = map.get(e.category) || { total: 0, count: 0 };
      map.set(e.category, {
        total: existing.total + getExpenseAmountInCurrency(e, currencyCode),
        count: existing.count + 1,
      });
    });

    return Array.from(map.entries())
      .map(([cat, data]) => ({
        category: cat,
        total: data.total,
        count: data.count,
        percentage: totalAmount > 0 ? (data.total / totalAmount) * 100 : 0,
      }))
      .sort((a, b) => b.total - a.total);
  }, [reportExpenses, totalAmount, currencyCode]);

  const currencyInfo = useMemo(() => getCurrencyInfo(currencyCode), [currencyCode]);

  const currentDateFormatted = useMemo(() => {
    const d = new Date();
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }, []);

  const reportPeriodLabel = useMemo(() => {
    if (selectedMonth === 'all') return 'All Recorded Accounting Periods';
    const [year, month] = selectedMonth.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
  }, [selectedMonth]);

  const reportReferenceId = useMemo(() => {
    const suffix = selectedMonth === 'all' ? 'ALL' : selectedMonth.replace('-', '');
    return `SPEND-INTEL-REP-${suffix}-${reportExpenses.length.toString().padStart(3, '0')}`;
  }, [selectedMonth, reportExpenses.length]);

  const handlePrint = () => {
    try {
      window.print();
    } catch (err) {
      console.warn('Print command prevented in framed context:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      
      {/* Container / Printable Card */}
      <div 
        id="printable-report-container"
        className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto flex flex-col max-h-[94vh] print:max-h-none print:shadow-none print:border-none print:rounded-none print:m-0 print:p-0 print:w-full"
      >
        
        {/* Interactive Top Control Bar (Hidden on actual physical print) */}
        <div className="bg-slate-900 text-white px-6 py-4 flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 print:hidden shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Printer className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                Monthly Spending Report • Physical Filing Print View
                <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                  GAAP / SOC2 Standard
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Print-ready single/multi-page formatted ledger for accounting review, corporate compliance, and physical archival.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              id="modal-print-execute-btn"
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center px-4 py-2 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4 mr-2" />
              Print / Save to PDF
            </button>
            
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              title="Close print preview"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Configuration Toolbar (Hidden on physical print) */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 flex flex-wrap items-center justify-between gap-3 print:hidden text-xs text-slate-700">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-slate-500" />
              <span className="font-semibold text-slate-700">Reporting Period:</span>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              >
                <option value="all">All Recorded Months</option>
                {availableMonths.map(m => {
                  const [y, mo] = m.split('-');
                  const d = new Date(parseInt(y), parseInt(mo) - 1, 1);
                  const label = d.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
                  return <option key={m} value={m}>{label} ({m})</option>;
                })}
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <Building2 className="w-4 h-4 text-slate-500" />
              <span className="font-semibold text-slate-700">Department:</span>
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value as Department | 'All')}
                className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              >
                <option value="All">All Departments</option>
                {DEFAULT_DEPARTMENTS.map(d => (
                  <option key={d.department} value={d.department}>{d.department}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setIsEditingHeader(!isEditingHeader)}
              className="text-xs text-emerald-700 hover:text-emerald-900 font-semibold underline cursor-pointer"
            >
              {isEditingHeader ? 'Save Entity Details' : 'Edit Organization Header'}
            </button>
          </div>
        </div>

        {/* Optional Entity Header Editor (Hidden on Print) */}
        {isEditingHeader && (
          <div className="bg-emerald-50/50 border-b border-emerald-200 px-6 py-3 print:hidden grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Company / Entity Name:</label>
              <input
                type="text"
                value={entityName}
                onChange={(e) => setEntityName(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-md px-2.5 py-1 text-slate-900"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Report Title / Subhead:</label>
              <input
                type="text"
                value={reportTitle}
                onChange={(e) => setReportTitle(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-md px-2.5 py-1 text-slate-900"
              />
            </div>
          </div>
        )}

        {/* Scrollable Printable Document Body (Becomes clean standard page on print) */}
        <div className="p-8 sm:p-10 overflow-y-auto space-y-8 print:p-0 print:overflow-visible print:space-y-6 text-slate-900 font-sans">
          
          {/* Document Header */}
          <div className="border-b-2 border-slate-900 pb-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start space-x-3">
                <SpendIntelIcon className="w-8 h-8 text-slate-900 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xl font-extrabold tracking-tight text-slate-900 uppercase">
                    {entityName}
                  </div>
                  <h1 className="text-sm font-bold text-slate-700 mt-0.5">
                    {reportTitle}
                  </h1>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Internal Accounting & Compliance Audit Record • Physical Filing Copy
                  </p>
                </div>
              </div>

              {/* Document Meta Box */}
              <div className="text-right text-xs space-y-1 bg-slate-50 print:bg-transparent p-3 rounded-lg border border-slate-200 print:border-none print:p-0">
                <div>
                  <span className="text-slate-500 font-medium">Document ID: </span>
                  <span className="font-mono font-bold text-slate-900">{reportReferenceId}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">Reporting Period: </span>
                  <span className="font-bold text-slate-900">{reportPeriodLabel}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">Generated Date: </span>
                  <span className="font-medium text-slate-900">{currentDateFormatted}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">Currency Standard: </span>
                  <span className="font-bold text-slate-900">{currencyInfo.name} ({currencyCode})</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 1: Executive Financial Summary */}
          <section className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 border-b border-slate-200 pb-1 flex items-center">
              <FileText className="w-3.5 h-3.5 mr-1.5 text-slate-600" />
              1. Executive Spending & Audit Summary
            </h2>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Gross Total Spend</div>
                <div className="text-lg font-bold text-slate-900 font-mono mt-1">
                  {formatMoney(totalAmount, currencyCode)}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">{reportExpenses.length} total entries</div>
              </div>

              <div className="p-3 bg-emerald-50/50 border border-emerald-200 rounded-lg">
                <div className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider">Approved & Reconciled</div>
                <div className="text-lg font-bold text-emerald-950 font-mono mt-1">
                  {formatMoney(approvedAmount, currencyCode)}
                </div>
                <div className="text-[10px] text-emerald-700 mt-0.5">
                  {totalAmount > 0 ? ((approvedAmount / totalAmount) * 100).toFixed(1) : 0}% of gross
                </div>
              </div>

              <div className="p-3 bg-amber-50/50 border border-amber-200 rounded-lg">
                <div className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider">Pending Review</div>
                <div className="text-lg font-bold text-amber-950 font-mono mt-1">
                  {formatMoney(pendingAmount, currencyCode)}
                </div>
                <div className="text-[10px] text-amber-700 mt-0.5">Awaiting manager sign-off</div>
              </div>

              <div className="p-3 bg-rose-50/50 border border-rose-200 rounded-lg">
                <div className="text-[11px] font-semibold text-rose-800 uppercase tracking-wider">Policy Exceptions</div>
                <div className="text-lg font-bold text-rose-950 font-mono mt-1">
                  {formatMoney(flaggedAmount, currencyCode)}
                </div>
                <div className="text-[10px] text-rose-700 mt-0.5">{flaggedCount} item(s) flagged</div>
              </div>
            </div>
          </section>

          {/* Section 2: Department Allocation & Category Distribution (2-column layout) */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6 print:gap-4 break-inside-avoid">
            {/* Department Breakdown */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 border-b border-slate-200 pb-1">
                2. Departmental Allocation
              </h3>
              <table className="w-full text-xs text-left border-collapse border border-slate-200">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-semibold">
                    <th className="py-2 px-3">Department</th>
                    <th className="py-2 px-3 text-right">Budget</th>
                    <th className="py-2 px-3 text-right">Actual</th>
                    <th className="py-2 px-3 text-right">Util. %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {deptBreakdown.map(d => (
                    <tr key={d.department} className="text-slate-800">
                      <td className="py-1.5 px-3 font-medium">{d.department}</td>
                      <td className="py-1.5 px-3 text-right font-mono text-slate-600">{formatMoney(d.budget, currencyCode)}</td>
                      <td className="py-1.5 px-3 text-right font-mono font-semibold">{formatMoney(d.total, currencyCode)}</td>
                      <td className="py-1.5 px-3 text-right font-mono text-slate-700">{d.utilization.toFixed(1)}%</td>
                    </tr>
                  ))}
                  {deptBreakdown.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-3 text-center text-slate-500 italic">No departmental expenses recorded</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Category Breakdown */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 border-b border-slate-200 pb-1">
                3. Expense Classification by Category
              </h3>
              <table className="w-full text-xs text-left border-collapse border border-slate-200">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-semibold">
                    <th className="py-2 px-3">Category</th>
                    <th className="py-2 px-3 text-right">Entries</th>
                    <th className="py-2 px-3 text-right">Total</th>
                    <th className="py-2 px-3 text-right">% of Spend</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {categoryBreakdown.map(c => (
                    <tr key={c.category} className="text-slate-800">
                      <td className="py-1.5 px-3 font-medium">{c.category}</td>
                      <td className="py-1.5 px-3 text-right text-slate-600">{c.count}</td>
                      <td className="py-1.5 px-3 text-right font-mono font-semibold">{formatMoney(c.total, currencyCode)}</td>
                      <td className="py-1.5 px-3 text-right font-mono text-slate-700">{c.percentage.toFixed(1)}%</td>
                    </tr>
                  ))}
                  {categoryBreakdown.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-3 text-center text-slate-500 italic">No category entries found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* Section 3: Itemized Physical Audit Ledger */}
          <section className="space-y-2 break-inside-avoid">
            <div className="flex items-center justify-between border-b border-slate-200 pb-1">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                4. Itemized Transaction & Compliance Audit Ledger ({reportExpenses.length} Records)
              </h3>
              <span className="text-[11px] text-slate-500 font-medium">Sorted chronologically</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse border border-slate-300">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-300 text-slate-800 font-semibold">
                    <th className="py-2 px-2.5">Date</th>
                    <th className="py-2 px-2.5">Ref ID</th>
                    <th className="py-2 px-2.5">Merchant / Vendor</th>
                    <th className="py-2 px-2.5">Category</th>
                    <th className="py-2 px-2.5">Dept</th>
                    <th className="py-2 px-2.5">Employee</th>
                    <th className="py-2 px-2.5">Status / Flags</th>
                    <th className="py-2 px-2.5 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {reportExpenses.map(item => {
                    const hasViolations = Boolean(item.violations && item.violations.length > 0);
                    return (
                      <tr key={item.id} className="text-slate-800 break-inside-avoid">
                        <td className="py-1.5 px-2.5 font-mono whitespace-nowrap text-slate-700">{item.date}</td>
                        <td className="py-1.5 px-2.5 font-mono text-slate-500">{item.id}</td>
                        <td className="py-1.5 px-2.5 font-semibold text-slate-900">{item.merchant}</td>
                        <td className="py-1.5 px-2.5 text-slate-700">{item.category}</td>
                        <td className="py-1.5 px-2.5 text-slate-700">{item.department}</td>
                        <td className="py-1.5 px-2.5 text-slate-700">{item.employeeName}</td>
                        <td className="py-1.5 px-2.5 whitespace-nowrap">
                          {hasViolations ? (
                            <span className="inline-flex items-center text-rose-800 font-semibold">
                              [FLAGGED: {item.violations?.map(v => v.code).join(', ')}]
                            </span>
                          ) : (
                            <span className={`font-semibold ${item.status === 'Approved' ? 'text-emerald-800' : 'text-slate-600'}`}>
                              {item.status}
                            </span>
                          )}
                        </td>
                        <td className="py-1.5 px-2.5 text-right font-mono font-bold text-slate-900 whitespace-nowrap">
                          {formatMoney(getExpenseAmountInCurrency(item, currencyCode), currencyCode)}
                        </td>
                      </tr>
                    );
                  })}
                  {reportExpenses.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-6 text-center text-slate-500 italic">
                        No transactions found matching the selected report filters.
                      </td>
                    </tr>
                  )}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-100 border-t-2 border-slate-900 font-bold text-slate-900">
                    <td colSpan={7} className="py-2 px-2.5 text-right uppercase tracking-wider text-xs">
                      Grand Total Disbursements:
                    </td>
                    <td className="py-2 px-2.5 text-right font-mono text-sm">
                      {formatMoney(totalAmount, currencyCode)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </section>

          {/* Section 4: Audit Certification & Formal Physical Sign-Off Boxes */}
          <section className="space-y-4 pt-4 border-t border-slate-300 break-inside-avoid">
            <div className="bg-slate-50 print:bg-transparent p-3 rounded-lg border border-slate-200 print:border-none print:p-0">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center">
                <ShieldCheck className="w-3.5 h-3.5 mr-1.5 text-emerald-700" />
                5. Internal Control Certification & GAAP Compliance Statement
              </h4>
              <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                I hereby certify that the expenditures and disbursements detailed in this ledger have been examined against institutional spending limits, travel policies, and standard corporate accounting principles. All substantiated expenses include approved verification documentation and conform to tax compliance regulations.
              </p>
            </div>

            {/* Formal Physical Signature Lines */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6">
              <div className="border-t-2 border-slate-800 pt-2 text-xs space-y-1">
                <div className="font-bold text-slate-900">Prepared By (Staff Accountant)</div>
                <div className="text-slate-500 text-[11px]">Signature: ______________________</div>
                <div className="text-slate-500 text-[11px]">Date: ____ / ____ / 2026</div>
              </div>

              <div className="border-t-2 border-slate-800 pt-2 text-xs space-y-1">
                <div className="font-bold text-slate-900">Reviewed By (Internal Auditor)</div>
                <div className="text-slate-500 text-[11px]">Signature: ______________________</div>
                <div className="text-slate-500 text-[11px]">Date: ____ / ____ / 2026</div>
              </div>

              <div className="border-t-2 border-slate-800 pt-2 text-xs space-y-1">
                <div className="font-bold text-slate-900">Authorized Officer / CFO Approval</div>
                <div className="text-slate-500 text-[11px]">Signature: ______________________</div>
                <div className="text-slate-500 text-[11px]">Date: ____ / ____ / 2026</div>
              </div>
            </div>

            {/* Report Footer */}
            <div className="pt-6 text-center text-[10px] text-slate-400 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between">
              <span>SpendIntel Autonomous Spend Intelligence • Official Corporate Record</span>
              <span>Page 1 of 1 • Archival Classification: Financial / Internal Audit</span>
            </div>
          </section>

        </div>

      </div>
    </div>
  );
};
