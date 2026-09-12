import React from 'react';
import { DollarSign, Clock, CheckCircle2, ShieldAlert } from 'lucide-react';
import { Expense } from '../types';
import { formatMoney, getCurrencyInfo } from '../utils/currencies';
import { getExpenseAmountInCurrency, convertBudget, getExchangeRate } from '../utils/currencyConverter';

interface MetricCardsProps {
  expenses: Expense[];
  currencyCode?: string;
  onOpenCurrencySelector?: () => void;
}

export const MetricCards: React.FC<MetricCardsProps> = ({ 
  expenses, 
  currencyCode = 'USD',
  onOpenCurrencySelector 
}) => {
  // Converted financial totals in real-time
  const totalAmount = expenses.reduce((sum, item) => sum + getExpenseAmountInCurrency(item, currencyCode), 0);
  
  const pendingExpenses = expenses.filter(item => item.status === 'Pending');
  const pendingAmount = pendingExpenses.reduce((sum, item) => sum + getExpenseAmountInCurrency(item, currencyCode), 0);

  const approvedExpenses = expenses.filter(item => item.status === 'Approved');
  const approvedAmount = approvedExpenses.reduce((sum, item) => sum + getExpenseAmountInCurrency(item, currencyCode), 0);

  const flaggedCount = expenses.filter(item => item.status === 'Flagged').length;

  const monthlyBudget = convertBudget(25000, currencyCode);
  const budgetUsedPercentage = monthlyBudget > 0 ? Math.round((totalAmount / monthlyBudget) * 100) : 0;
  
  const currencyInfo = getCurrencyInfo(currencyCode);
  const rateToUSD = getExchangeRate('USD', currencyCode);
  const isConverted = currencyCode.toUpperCase() !== 'USD';

  return (
    <div className="space-y-3">

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* 1. Total Expenses Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 hover:shadow-md hover:-translate-y-0.5 hover:scale-[1.015] transition-all duration-200 group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider group-hover:text-slate-700 transition-colors">Total Expenses</span>
            <div className="w-9 h-9 rounded-lg bg-slate-900 text-white flex items-center justify-center group-hover:scale-105 group-hover:bg-emerald-700 transition-all duration-200 shadow-2xs">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold tracking-tight text-slate-900 font-mono">
              {formatMoney(totalAmount, currencyCode)}
            </span>
            <span className="inline-flex items-center text-xs font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200 group-hover:border-slate-300 transition-colors">
              {expenses.length} record{expenses.length === 1 ? '' : 's'}
            </span>
          </div>
          <div className="mt-2.5 flex items-center justify-between text-xs text-slate-500">
            <span>Target cap: {formatMoney(monthlyBudget, currencyCode)}</span>
            <span className="font-semibold text-slate-800">{budgetUsedPercentage}% used</span>
          </div>
          <div className="mt-2 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div 
              className="h-full rounded-full bg-slate-900 transition-all duration-500 group-hover:bg-emerald-600" 
              style={{ width: `${Math.min(budgetUsedPercentage, 100)}%` }}
            />
          </div>
        </div>

        {/* 2. Pending Reimbursements */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 hover:shadow-md hover:-translate-y-0.5 hover:scale-[1.015] transition-all duration-200 group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider group-hover:text-slate-700 transition-colors">Pending Reimbursements</span>
            <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 flex items-center justify-center group-hover:scale-105 group-hover:bg-amber-100 group-hover:text-amber-800 group-hover:border-amber-300 transition-all duration-200">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold tracking-tight text-slate-900 font-mono">
              {formatMoney(pendingAmount, currencyCode)}
            </span>
            <span className="inline-flex items-center text-xs font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200 group-hover:border-slate-300 transition-colors">
              {pendingExpenses.length} pending
            </span>
          </div>
          <p className="mt-3 text-xs text-slate-500">
            {pendingExpenses.length === 0 
              ? 'No pending employee expense claims' 
              : 'Awaiting manager & accounting sign-off'}
          </p>
        </div>

        {/* 3. Approved Total */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 hover:shadow-md hover:-translate-y-0.5 hover:scale-[1.015] transition-all duration-200 group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider group-hover:text-slate-700 transition-colors">Approved Payouts</span>
            <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 flex items-center justify-center group-hover:scale-105 group-hover:bg-emerald-100 group-hover:text-emerald-800 group-hover:border-emerald-300 transition-all duration-200">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold tracking-tight text-slate-900 font-mono">
              {formatMoney(approvedAmount, currencyCode)}
            </span>
            <span className="inline-flex items-center text-xs font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200 group-hover:border-slate-300 transition-colors">
              {approvedExpenses.length} approved
            </span>
          </div>
          <p className="mt-3 text-xs text-slate-500">
            {approvedExpenses.length === 0 
              ? 'No approved disbursement batches' 
              : 'Validated for next ACH ledger batch'}
          </p>
        </div>

        {/* 4. Flagged / Audit Alerts */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 hover:shadow-md hover:-translate-y-0.5 hover:scale-[1.015] transition-all duration-200 group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider group-hover:text-slate-700 transition-colors">Audit Alerts</span>
            <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 flex items-center justify-center group-hover:scale-105 group-hover:bg-rose-100 group-hover:text-rose-800 group-hover:border-rose-300 transition-all duration-200">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold tracking-tight text-slate-900 font-mono">
              {flaggedCount} Item{flaggedCount === 1 ? '' : 's'}
            </span>
            <span className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-md border transition-colors ${
              flaggedCount > 0 
                ? 'text-slate-900 bg-slate-100 border-slate-300 font-semibold' 
                : 'text-slate-600 bg-slate-50 border-slate-200'
            }`}>
              {flaggedCount > 0 ? 'Requires Review' : '0 Policy Violations'}
            </span>
          </div>
          <p className="mt-3 text-xs text-slate-500">
            {flaggedCount > 0 
              ? 'Automated policy rule breaches detected' 
              : 'All recorded expenses pass policy validation'}
          </p>
        </div>

      </div>
    </div>
  );
};
