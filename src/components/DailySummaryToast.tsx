import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Expense } from '../types';
import { formatMoney, getCurrencyInfo } from '../utils/currencies';
import { getExpenseAmountInCurrency, convertBudget } from '../utils/currencyConverter';
import { 
  Sun, 
  Moon, 
  Sunset,
  DollarSign, 
  Clock, 
  ShieldAlert, 
  CheckCircle2, 
  X, 
  ArrowRight, 
  TrendingUp,
  Bell,
  Sparkles,
  PieChart,
  RefreshCw
} from 'lucide-react';

interface DailySummaryToastProps {
  isOpen: boolean;
  onClose: () => void;
  expenses: Expense[];
  currencyCode?: string;
  userName?: string;
  companyName?: string;
  onViewPending?: () => void;
  onViewFlagged?: () => void;
  onReplayToast?: () => void;
}

export const DailySummaryToast: React.FC<DailySummaryToastProps> = ({
  isOpen,
  onClose,
  expenses,
  currencyCode = 'USD',
  userName = 'Executive',
  companyName = 'SpendIntel Workspace',
  onViewPending,
  onViewFlagged,
  onReplayToast,
}) => {
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(100);
  const DURATION_MS = 10000; // 10 seconds auto-dismiss timer

  // Determine time-of-day greeting
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return { text: 'Good Morning', icon: Sun, color: 'text-amber-500' };
    if (hour < 17) return { text: 'Good Afternoon', icon: Sun, color: 'text-amber-600' };
    return { text: 'Good Evening', icon: Sunset, color: 'text-indigo-400' };
  }, []);

  // Calculate Today / Daily Spending Summary
  const summaryMetrics = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0]; // e.g. "2026-09-11"
    
    // Expenses matching today's date (or recent fallback if date string formats vary)
    const todayExpenses = expenses.filter(e => {
      if (!e.date) return false;
      return e.date.startsWith(todayStr) || e.date.includes(new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
    });

    // Fallback: If no expenses match exact today string in mock data, use top 3 latest expenses as today's batch
    const displayTodayExpenses = todayExpenses.length > 0 ? todayExpenses : expenses.slice(0, 3);

    const todayTotalConverted = displayTodayExpenses.reduce(
      (sum, item) => sum + getExpenseAmountInCurrency(item, currencyCode), 
      0
    );

    const pendingExpenses = expenses.filter(item => item.status === 'Pending');
    const pendingTotalConverted = pendingExpenses.reduce(
      (sum, item) => sum + getExpenseAmountInCurrency(item, currencyCode), 
      0
    );

    const flaggedExpenses = expenses.filter(item => item.status === 'Flagged');

    // Daily budget pacing target (~$25,000 monthly / 30 = $833 daily target)
    const monthlyCap = convertBudget(25000, currencyCode);
    const dailyCapTarget = monthlyCap / 30;

    let burnStatus: 'under' | 'on-track' | 'high' = 'on-track';
    if (todayTotalConverted < dailyCapTarget * 0.8) {
      burnStatus = 'under';
    } else if (todayTotalConverted > dailyCapTarget * 1.3) {
      burnStatus = 'high';
    }

    return {
      todayCount: displayTodayExpenses.length,
      todayTotalConverted,
      pendingCount: pendingExpenses.length,
      pendingTotalConverted,
      flaggedCount: flaggedExpenses.length,
      dailyCapTarget,
      burnStatus,
    };
  }, [expenses, currencyCode]);

  // Auto-dismiss timer progress effect
  useEffect(() => {
    if (!isOpen || isPaused) return;

    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remainingPct = Math.max(0, 100 - (elapsed / DURATION_MS) * 100);
      setProgress(remainingPct);

      if (remainingPct <= 0) {
        clearInterval(interval);
        onClose();
      }
    }, 100);

    return () => clearInterval(interval);
  }, [isOpen, isPaused, onClose]);

  if (!isOpen) return null;

  const GreetingIcon = greeting.icon;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        className="fixed top-20 right-4 sm:right-6 z-50 w-full max-w-md bg-white text-slate-800 rounded-2xl border border-slate-200 shadow-2xl overflow-hidden"
        id="daily-spending-toast"
      >
        {/* Progress bar line for auto-dismiss timer */}
        <div className="w-full bg-slate-100 h-1 relative">
          <motion.div 
            className="h-1 bg-gradient-to-r from-emerald-500 to-teal-400"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="p-4 sm:p-5 space-y-3.5">
          {/* Toast Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
                <GreetingIcon className={`w-5 h-5 ${greeting.color}`} />
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider font-mono">
                    Daily Financial Briefing
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 leading-tight">
                  {greeting.text}, {userName.split(' ')[0]}!
                </h3>
              </div>
            </div>

            <button
              onClick={onClose}
              title="Dismiss Toast"
              className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            Here is your daily corporate expense summary for <strong className="text-slate-900 font-semibold">{companyName}</strong> calculated in <strong className="text-slate-900 font-semibold">{currencyCode}</strong>:
          </p>

          {/* 3 Key Metrics Cards Row */}
          <div className="grid grid-cols-3 gap-2">
            
            {/* 1. Today's Total Spend */}
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
                Today's Spend
              </span>
              <div className="text-sm sm:text-base font-extrabold font-mono text-emerald-600">
                {formatMoney(summaryMetrics.todayTotalConverted, currencyCode)}
              </div>
              <span className="text-[9px] text-slate-500 block font-mono">
                {summaryMetrics.todayCount} purchase{summaryMetrics.todayCount === 1 ? '' : 's'}
              </span>
            </div>

            {/* 2. Pending Claims */}
            <div 
              onClick={onViewPending}
              className={`p-2.5 rounded-xl border space-y-1 transition-all cursor-pointer ${
                summaryMetrics.pendingCount > 0 
                  ? 'bg-amber-50 border-amber-200 hover:bg-amber-100/60' 
                  : 'bg-slate-50 border-slate-200'
              }`}
              title="Click to view pending reimbursements"
            >
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
                Pending Claims
              </span>
              <div className="text-sm sm:text-base font-extrabold font-mono text-amber-700">
                {summaryMetrics.pendingCount}
              </div>
              <span className="text-[9px] text-slate-500 block font-mono truncate">
                {formatMoney(summaryMetrics.pendingTotalConverted, currencyCode)}
              </span>
            </div>

            {/* 3. Audit Flags */}
            <div 
              onClick={onViewFlagged}
              className={`p-2.5 rounded-xl border space-y-1 transition-all cursor-pointer ${
                summaryMetrics.flaggedCount > 0 
                  ? 'bg-rose-50 border-rose-200 hover:bg-rose-100/60' 
                  : 'bg-slate-50 border-slate-200'
              }`}
              title="Click to inspect policy audit alerts"
            >
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
                Audit Flags
              </span>
              <div className={`text-sm sm:text-base font-extrabold font-mono ${
                summaryMetrics.flaggedCount > 0 ? 'text-rose-600' : 'text-emerald-600'
              }`}>
                {summaryMetrics.flaggedCount}
              </div>
              <span className="text-[9px] text-slate-500 block font-mono">
                {summaryMetrics.flaggedCount === 0 ? '100% Pass ✓' : 'Review needed'}
              </span>
            </div>

          </div>

          {/* Daily Pace Insights Banner */}
          <div className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2 text-slate-600">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>
                Daily Cap Target: <strong className="text-slate-900 font-semibold font-mono">{formatMoney(summaryMetrics.dailyCapTarget, currencyCode)}</strong>
              </span>
            </div>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
              summaryMetrics.burnStatus === 'under' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
              summaryMetrics.burnStatus === 'high' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
              'bg-teal-50 text-teal-700 border border-teal-200'
            }`}>
              {summaryMetrics.burnStatus === 'under' ? 'Under Target' : summaryMetrics.burnStatus === 'high' ? 'High Pace' : 'On Target'}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center space-x-2">
              {summaryMetrics.pendingCount > 0 && onViewPending && (
                <button
                  type="button"
                  onClick={() => {
                    onViewPending();
                    onClose();
                  }}
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center shadow-xs"
                >
                  <Clock className="w-3.5 h-3.5 mr-1" />
                  Review {summaryMetrics.pendingCount} Pending
                </button>
              )}

              {summaryMetrics.flaggedCount > 0 && onViewFlagged && (
                <button
                  type="button"
                  onClick={() => {
                    onViewFlagged();
                    onClose();
                  }}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center shadow-xs"
                >
                  <ShieldAlert className="w-3.5 h-3.5 mr-1" />
                  View {summaryMetrics.flaggedCount} Flags
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={onClose}
              className="text-xs text-slate-500 hover:text-slate-700 underline font-semibold cursor-pointer ml-auto"
            >
              Dismiss
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
