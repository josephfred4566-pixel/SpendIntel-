import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AuthUser, Expense } from '../types';
import { 
  Building2, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  Layers, 
  Globe, 
  Zap, 
  AlertTriangle, 
  CheckCircle2, 
  PieChart,
  Users,
  DollarSign,
  TrendingUp,
  X,
  CreditCard,
  Info,
  Sliders,
  CheckCheck,
  RefreshCw,
  Search,
  Receipt,
  FileText,
  Clock,
  ExternalLink,
  Play,
  Pause,
  RotateCcw,
  Activity,
  Scan,
  Cpu,
  Workflow
} from 'lucide-react';
import { SpendIntelLogo } from './SpendIntelLogo';
import { QuickBooksLogo, XeroLogo } from './AppLogos';
import { formatMoney, getCurrencyInfo } from '../utils/currencies';
import { getExpenseAmountInCurrency, convertBudget } from '../utils/currencyConverter';

interface OnboardingModalProps {
  user: AuthUser;
  isOpen: boolean;
  onComplete: () => void;
  onSkip: () => void;
  activeCurrencyCode?: string;
  onNavigateToSettings?: () => void;
  expenses: Expense[];
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  user,
  isOpen,
  onComplete,
  onSkip,
  activeCurrencyCode = 'USD',
  onNavigateToSettings,
  expenses,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [direction, setDirection] = useState<number>(1); // 1 = forward, -1 = backward
  const [isAutoPlay, setIsAutoPlay] = useState<boolean>(true);
  const totalSteps = 5;

  // Real database metrics computed dynamically
  const totalAmount = useMemo(() => {
    return expenses.reduce((sum, item) => sum + getExpenseAmountInCurrency(item, activeCurrencyCode), 0);
  }, [expenses, activeCurrencyCode]);

  const pendingExpenses = useMemo(() => expenses.filter(item => item.status === 'Pending'), [expenses]);
  const pendingAmount = useMemo(() => {
    return pendingExpenses.reduce((sum, item) => sum + getExpenseAmountInCurrency(item, activeCurrencyCode), 0);
  }, [pendingExpenses, activeCurrencyCode]);

  const approvedExpenses = useMemo(() => expenses.filter(item => item.status === 'Approved'), [expenses]);
  const approvedAmount = useMemo(() => {
    return approvedExpenses.reduce((sum, item) => sum + getExpenseAmountInCurrency(item, activeCurrencyCode), 0);
  }, [approvedExpenses, activeCurrencyCode]);

  const flaggedExpenses = useMemo(() => expenses.filter(item => item.status === 'Flagged'), [expenses]);
  const flaggedCount = flaggedExpenses.length;

  const budgetUsedPercentage = useMemo(() => {
    const totalCap = convertBudget(15000 + 10000 + 8000 + 5000, activeCurrencyCode);
    return totalCap > 0 ? Math.min(100, Math.round((totalAmount / totalCap) * 100)) : 12;
  }, [totalAmount, activeCurrencyCode]);

  // Dynamic Categories Breakdown based on real application dataset
  const activeCategories = useMemo(() => {
    const catMap: Record<string, number> = {};
    expenses.forEach(e => {
      const amt = getExpenseAmountInCurrency(e, activeCurrencyCode);
      catMap[e.category] = (catMap[e.category] || 0) + amt;
    });

    const keys = Object.keys(catMap);
    if (keys.length === 0) {
      return [
        { name: 'Hosting & Cloud', spent: 3150, cap: convertBudget(4000, activeCurrencyCode), pct: 78, color: 'bg-emerald-600' },
        { name: 'Travel & Lodging', spent: 2410, cap: convertBudget(3500, activeCurrencyCode), pct: 68, color: 'bg-emerald-600' },
        { name: 'Marketing & SEO', spent: 1480, cap: convertBudget(2500, activeCurrencyCode), pct: 59, color: 'bg-emerald-600' },
        { name: 'Software Subs', spent: 920, cap: convertBudget(1500, activeCurrencyCode), pct: 61, color: 'bg-emerald-600' },
      ];
    }

    return keys.map(name => {
      const spent = catMap[name];
      const cap = convertBudget(name === 'Hosting & Cloud' || name === 'Technology' || name === 'Software' ? 5000 : name === 'Travel' ? 4000 : 2500, activeCurrencyCode);
      const pct = cap > 0 ? Math.round((spent / cap) * 100) : 0;
      return {
        name,
        spent,
        cap,
        pct,
        color: pct > 100 ? 'bg-rose-500' : pct > 80 ? 'bg-amber-500' : 'bg-emerald-600'
      };
    }).sort((a, b) => b.spent - a.spent).slice(0, 6);
  }, [expenses, activeCurrencyCode]);

  // Dynamic Department breakdown based on real application dataset
  const activeDepartments = useMemo(() => {
    const deptMap: Record<string, { spent: number; count: number }> = {};
    expenses.forEach(e => {
      const amt = getExpenseAmountInCurrency(e, activeCurrencyCode);
      if (!deptMap[e.department]) {
        deptMap[e.department] = { spent: 0, count: 0 };
      }
      deptMap[e.department].spent += amt;
      deptMap[e.department].count += 1;
    });

    const keys = Object.keys(deptMap);
    if (keys.length === 0) {
      return [
        { name: 'Engineering', spent: 4850, cap: convertBudget(15000, activeCurrencyCode), count: 12 },
        { name: 'Sales', spent: 1920.5, cap: convertBudget(10000, activeCurrencyCode), count: 5 },
        { name: 'Marketing', spent: 1480, cap: convertBudget(8000, activeCurrencyCode), count: 4 },
        { name: 'Executive', spent: 320, cap: convertBudget(5000, activeCurrencyCode), count: 2 },
      ];
    }

    return keys.map(name => {
      const { spent, count } = deptMap[name];
      const cap = convertBudget(name === 'Engineering' ? 15000 : name === 'Sales' ? 10000 : name === 'Marketing' ? 8000 : 5000, activeCurrencyCode);
      return {
        name,
        spent,
        cap,
        count
      };
    }).sort((a, b) => b.spent - a.spent);
  }, [expenses, activeCurrencyCode]);

  // Dynamic Audit Violations based on real application dataset
  const displayViolations = useMemo(() => {
    const list: Array<{ id: string; name: string; desc: string; rule: string; merchant: string; amount: number }> = [];
    expenses.forEach(e => {
      if (e.violations && e.violations.length > 0) {
        e.violations.forEach(v => {
          list.push({
            id: v.id + '-' + e.id,
            name: v.ruleName,
            desc: v.description,
            rule: v.code,
            merchant: e.merchant,
            amount: getExpenseAmountInCurrency(e, activeCurrencyCode)
          });
        });
      }
    });

    if (list.length === 0) {
      return [
        { id: 'REC-01', name: 'Missing Receipt Violation', desc: 'No attached receipt file for transaction exceeding $100.', rule: 'REC-01', merchant: 'SaaS Software', amount: 124.50 },
        { id: 'VND-02', name: 'Exceeded Department Limit', desc: 'Single transaction exceeds department spending limit threshold.', rule: 'VND-02', merchant: 'Hardware Suppliers', amount: 850.00 },
        { id: 'GSA-03', name: 'GSA Spending Limit Breach', desc: 'Travel or meals expense exceeds standard federal per-diem thresholds.', rule: 'GSA-03', merchant: 'Luxury Hotel', amount: 310.00 },
      ];
    }
    return list.slice(0, 3);
  }, [expenses, activeCurrencyCode]);

  // Step 1 Interactive Motion State
  const [swipeFlash, setSwipeFlash] = useState(false);
  const [recentSwipes, setRecentSwipes] = useState<Expense[]>([]);
  
  useEffect(() => {
    setRecentSwipes(expenses.slice(0, 3));
  }, [expenses]);

  const [isSwiping, setIsSwiping] = useState<boolean>(false);

  // Step 2 Interactive Motion State
  const [activeCategoryDemo, setActiveCategoryDemo] = useState<string>('');
  
  useEffect(() => {
    if (activeCategories.length > 0) {
      setActiveCategoryDemo(activeCategories[0].name);
    }
  }, [activeCategories]);

  const [scanState, setScanState] = useState<'idle' | 'scanning' | 'classified'>('idle');
  const [unclassifiedVendor, setUnclassifiedVendor] = useState<string>('');
  const [unclassifiedAmount, setUnclassifiedAmount] = useState<number>(0);

  useEffect(() => {
    if (expenses.length > 0) {
      setUnclassifiedVendor(expenses[0].merchant);
      setUnclassifiedAmount(getExpenseAmountInCurrency(expenses[0], activeCurrencyCode));
    } else {
      setUnclassifiedVendor('Cloudflare CDN');
      setUnclassifiedAmount(240);
    }
  }, [expenses, activeCurrencyCode]);

  // Step 3 Interactive Motion State
  const [remediatedRules, setRemediatedRules] = useState<Set<string>>(new Set());
  const [isAuditing, setIsAuditing] = useState<boolean>(false);

  // Step 4 Interactive Motion State
  const [selectedDeptDemo, setSelectedDeptDemo] = useState<string>('');
  
  useEffect(() => {
    if (activeDepartments.length > 0) {
      setSelectedDeptDemo(activeDepartments[0].name);
    }
  }, [activeDepartments]);

  // Step 5 Interactive Motion State
  const [integrationsState, setIntegrationsState] = useState({
    quickbooks: true,
    xero: false,
  });
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>('12 mins ago');

  // Auto-play timer for interactive motion demonstrations
  useEffect(() => {
    if (!isOpen || !isAutoPlay) return;

    const interval = setInterval(() => {
      // Trigger subtle automated motion interactions based on step
      if (currentStep === 1) {
        triggerSimulatedSwipe();
      } else if (currentStep === 2) {
        if (scanState === 'idle') {
          runAiScanSimulation();
        } else if (scanState === 'classified') {
          setScanState('idle');
        }
      } else if (currentStep === 3) {
        if (remediatedRules.size >= 3) {
          setRemediatedRules(new Set());
        } else {
          runComplianceAudit();
        }
      } else if (currentStep === 4) {
        const depts = ['Engineering', 'Sales', 'Marketing', 'Executive', 'Operations'];
        const nextDept = depts[(depts.indexOf(selectedDeptDemo) + 1) % depts.length];
        setSelectedDeptDemo(nextDept);
      } else if (currentStep === 5) {
        triggerGlSyncPulse();
      }
    }, 4500);

    return () => clearInterval(interval);
  }, [isOpen, isAutoPlay, currentStep, scanState, remediatedRules, selectedDeptDemo]);

  if (!isOpen) return null;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setDirection(1);
      setCurrentStep(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setDirection(-1);
      setCurrentStep(prev => prev - 1);
    }
  };

  const goToStep = (stepNum: number) => {
    setDirection(stepNum > currentStep ? 1 : -1);
    setCurrentStep(stepNum);
  };

  // Step 1 helper: Simulate new live card purchase intake
  const triggerSimulatedSwipe = () => {
    setIsSwiping(true);
    setSwipeFlash(true);
    setTimeout(() => {
      setIsSwiping(false);
      setTimeout(() => setSwipeFlash(false), 800);
    }, 800);
  };

  // Step 2 helper: Simulate AI OCR & GAAP Auto-Classification
  const runAiScanSimulation = () => {
    setScanState('scanning');
    setTimeout(() => {
      setScanState('classified');
      if (activeCategories.length > 0) {
        setActiveCategoryDemo(activeCategories[0].name);
      }
    }, 1200);
  };

  // Step 3 helper: Simulate compliance audit scan
  const runComplianceAudit = () => {
    setIsAuditing(true);
    setTimeout(() => {
      setIsAuditing(false);
      // Remediate next un-remediated rule
      const allRules = displayViolations.map(v => v.id);
      const nextRule = allRules.find(r => !remediatedRules.has(r));
      if (nextRule) {
        setRemediatedRules(prev => new Set(prev).add(nextRule));
      } else {
        setRemediatedRules(new Set());
      }
    }, 800);
  };

  // Step 5 helper: Trigger GL ledger sync pulse
  const triggerGlSyncPulse = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setLastSyncTime('Just now ✓');
    }, 1000);
  };

  const handleToggleIntegration = (key: 'quickbooks' | 'xero') => {
    setIntegrationsState(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const stepTitles = [
    'Executive Dashboard & Metrics',
    'Smart Categorization Engine',
    'Audit Alerts & Policy Enforcement',
    'Drill-Down Department Reporting',
    'Enterprise Integrations & Settings'
  ];

  // Motion variants for step slide transitions
  const stepVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 50 : -50,
      opacity: 0,
      scale: 0.98,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: { duration: 0.35, ease: 'easeOut' },
    },
    exit: (dir: number) => ({
      x: dir < 0 ? 50 : -50,
      opacity: 0,
      scale: 0.98,
      transition: { duration: 0.25, ease: 'easeIn' },
    }),
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-50 dark:bg-slate-950 flex flex-col text-slate-900 dark:text-slate-100 overflow-y-auto">
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Header Bar with Motion Controls */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900/90 shadow-2xs">
          <div className="flex items-center space-x-3.5">
            <SpendIntelLogo size="md" showWordmark={true} />
            <span className="hidden sm:inline-flex items-center text-xs font-mono uppercase tracking-wider text-slate-500 pl-3.5 border-l border-slate-200 dark:border-slate-800">
              <Activity className="w-3.5 h-3.5 mr-1.5 text-emerald-600 animate-pulse" />
              Interactive Motion Showcase
            </span>
          </div>

          <div className="flex items-center space-x-3.5">
            {/* Step Counter Indicator */}
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 font-mono hidden sm:inline-block">
              Step {currentStep} of {totalSteps}
            </span>
            <button
              onClick={onSkip}
              title="Skip Tour"
              className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Dynamic Animated Progress Bar */}
        <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 relative overflow-hidden">
          <motion.div 
            className="bg-gradient-to-r from-emerald-600 to-teal-500 h-1.5"
            animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
        </div>

        {/* Step Indicator Navigation Pills with Motion Spring Layout */}
        <div className="hidden sm:flex items-center justify-between px-8 py-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-xs">
          {stepTitles.map((title, idx) => {
            const stepNum = idx + 1;
            const isActive = currentStep === stepNum;
            const isDone = currentStep > stepNum;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => goToStep(stepNum)}
                className={`relative flex items-center space-x-2 px-4 py-1.5 rounded-xl transition-colors cursor-pointer ${
                  isActive 
                    ? 'text-white font-bold' 
                    : isDone 
                      ? 'text-emerald-700 dark:text-emerald-400 font-medium hover:bg-emerald-50 dark:hover:bg-emerald-950/20' 
                      : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeStepPill"
                    className="absolute inset-0 bg-emerald-600 rounded-xl -z-0 shadow-2xs"
                    transition={{ type: 'spring', stiffness: 450, damping: 30 }}
                  />
                )}
                <span className={`relative z-10 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  isActive ? 'bg-white text-emerald-700' : isDone ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                }`}>
                  {isDone ? '✓' : stepNum}
                </span>
                <span className="relative z-10 truncate max-w-[150px] lg:max-w-none">{title.split('&')[0].trim()}</span>
              </button>
            );
          })}
        </div>

        {/* Step Animated Body Container */}
        <div className="p-6 sm:p-10 flex-1 flex flex-col justify-start max-w-5xl mx-auto w-full">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentStep}
              custom={direction}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="space-y-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 md:p-10 shadow-lg"
            >
              
              {/* ========================================================================= */}
              {/* STEP 1: Executive Dashboard & Metrics Motion Showcase */}
              {/* ========================================================================= */}
              {currentStep === 1 && (
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3.5">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 border border-emerald-200 shadow-2xs">
                        <TrendingUp className="w-6 h-6 text-emerald-700" />
                      </div>
                      <div>
                        <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">
                          Step 1 of 5 • Executive Overview
                        </span>
                        <h2 className="text-xl font-bold text-slate-900">
                          Executive Dashboard & Live Burn Metrics
                        </h2>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={triggerSimulatedSwipe}
                      disabled={isSwiping}
                      className="hidden sm:inline-flex items-center px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-95 shadow-2xs"
                    >
                      <CreditCard className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
                      <span>{isSwiping ? 'Processing Swipe...' : 'Simulate Live Card Swipe'}</span>
                    </button>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    SpendIntel monitors corporate card transactions, ACH settlements, and employee vouchers in real time. Watch live spend update interactively as transactions pass through the validation pipeline.
                  </p>

                  {/* 3 Core Highlighted KPI Motion Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1">
                    
                    {/* 1. Total Live Expenses */}
                    <div className="p-4 rounded-2xl bg-slate-900 text-white border border-slate-800 shadow-sm relative overflow-hidden group">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Total Expenses</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping mr-1" />
                          Live Stream
                        </span>
                      </div>

                      <motion.div 
                        key={totalAmount}
                        animate={swipeFlash ? { scale: [1, 1.05, 1], color: ['#ffffff', '#34d399', '#ffffff'] } : {}}
                        transition={{ duration: 0.6 }}
                        className="text-2xl sm:text-3xl font-extrabold font-mono tracking-tight mt-2 text-white"
                      >
                        {formatMoney(totalAmount, activeCurrencyCode)}
                      </motion.div>

                      <p className="text-[11px] text-slate-400 mt-1 flex items-center">
                        <span className="text-emerald-400 font-semibold mr-1">↑ {budgetUsedPercentage}%</span> of monthly limit
                      </p>

                      {/* Animated Sparkline SVG Background */}
                      <div className="mt-3 h-8 w-full">
                        <svg className="w-full h-full overflow-visible" viewBox="0 0 200 30">
                          <motion.path
                            d="M0,25 Q30,10 60,20 T120,8 T180,18 T200,5"
                            fill="none"
                            stroke="#10b981"
                            strokeWidth="2.5"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 1.5, ease: 'easeInOut' }}
                          />
                        </svg>
                      </div>
                    </div>

                    {/* 2. Pending Reimbursements Motion Card */}
                    <div className="p-4 rounded-2xl bg-slate-100/90 text-slate-900 border border-slate-200/90 shadow-sm relative overflow-hidden">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Pending Reimbursements</span>
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      </div>
                      <div className="text-2xl sm:text-3xl font-extrabold font-mono tracking-tight mt-2 text-slate-900">
                        {formatMoney(pendingAmount, activeCurrencyCode)}
                      </div>
                      <p className="text-[11px] text-slate-600 mt-1">
                        {pendingExpenses.length} employee claim{pendingExpenses.length === 1 ? '' : 's'} in approval queue
                      </p>
                    </div>

                    {/* 3. Reconciled Payments Motion Card */}
                    <div className="p-4 rounded-2xl bg-emerald-50/90 text-slate-900 border border-emerald-200/90 shadow-sm relative overflow-hidden">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">Approved Payments</span>
                        <CheckCheck className="w-4 h-4 text-emerald-600" />
                      </div>
                      <div className="text-2xl sm:text-3xl font-extrabold font-mono tracking-tight mt-2 text-emerald-950">
                        {formatMoney(approvedAmount, activeCurrencyCode)}
                      </div>
                      <p className="text-[11px] text-emerald-700 mt-1">
                        {approvedExpenses.length} GAAP payout{approvedExpenses.length === 1 ? '' : 's'} cleared
                      </p>
                    </div>

                  </div>

                  {/* Live Transaction Feed Motion Container */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center">
                        <Zap className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                        Live Card Swipe Motion Feed
                      </span>
                      <button
                        type="button"
                        onClick={triggerSimulatedSwipe}
                        disabled={isSwiping}
                        className="sm:hidden text-xs text-emerald-700 font-bold underline"
                      >
                        + Test Swipe
                      </button>
                    </div>

                    <div className="space-y-2">
                      <AnimatePresence initial={false}>
                        {recentSwipes.length === 0 ? (
                          <div className="p-4 text-center text-xs text-slate-400 bg-white border border-slate-200 rounded-xl">
                            No corporate card transactions registered yet.
                          </div>
                        ) : (
                          recentSwipes.map((item) => (
                            <motion.div
                              key={item.id}
                              initial={{ opacity: 0, y: -12, scale: 0.98 }}
                              animate={swipeFlash ? { scale: [1, 1.01, 1], backgroundColor: ['#ffffff', '#f0fdf4', '#ffffff'] } : { opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.3 }}
                              className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center justify-between text-xs"
                            >
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center shrink-0">
                                  <CreditCard className="w-4 h-4" />
                                </div>
                                <div>
                                  <h4 className="font-bold text-slate-900">{item.merchant}</h4>
                                  <span className="text-[10px] text-slate-500">{item.department} • {item.date}</span>
                                </div>
                              </div>
                              <div className="text-right">
                                <span className="font-mono font-bold text-slate-900 block">
                                  {formatMoney(getExpenseAmountInCurrency(item, activeCurrencyCode), activeCurrencyCode)}
                                </span>
                                <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${
                                  item.status === 'Approved' ? 'text-emerald-700 bg-emerald-50 border-emerald-200' :
                                  item.status === 'Pending' ? 'text-amber-700 bg-amber-50 border-amber-200' :
                                  'text-rose-700 bg-rose-50 border-rose-200'
                                }`}>
                                  {item.status} ✓
                                </span>
                              </div>
                            </motion.div>
                          ))
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================================================= */}
              {/* STEP 2: Smart Categorization Motion Display */}
              {/* ========================================================================= */}
              {currentStep === 2 && (
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3.5">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 border border-emerald-200 shadow-2xs">
                        <PieChart className="w-6 h-6 text-emerald-700" />
                      </div>
                      <div>
                        <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">
                          Step 2 of 5 • Autonomous Classification
                        </span>
                        <h2 className="text-xl font-bold text-slate-900">
                          Smart AI Categorization & Budget Caps
                        </h2>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={runAiScanSimulation}
                      disabled={scanState === 'scanning'}
                      className="hidden sm:inline-flex items-center px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-95 shadow-2xs"
                    >
                      <Scan className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
                      <span>{scanState === 'scanning' ? 'AI Scanning...' : 'Run AI OCR Scanner'}</span>
                    </button>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    SpendIntel automatically parses merchant metadata, line-item OCR transcripts, and GL account charts to tag transactions and track budget caps in real time.
                  </p>

                  {/* Interactive Laser Scanning Simulation Box */}
                  <div className="p-4 rounded-2xl border border-slate-200 bg-slate-900 text-white relative overflow-hidden shadow-md">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[11px] font-mono text-emerald-400 uppercase tracking-wider flex items-center">
                        <Cpu className="w-3.5 h-3.5 mr-1 text-emerald-400 animate-pulse" />
                        AI Merchant Classification Engine
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        scanState === 'scanning' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                        scanState === 'classified' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                        'bg-slate-800 text-slate-400'
                      }`}>
                        {scanState === 'scanning' ? 'Laser Scanning Invoice...' : scanState === 'classified' ? 'GAAP Classified ✓' : 'Awaiting Invoice'}
                      </span>
                    </div>

                    {/* Animated Scanning Laser Beam Effect */}
                    {scanState === 'scanning' && (
                      <motion.div 
                        initial={{ top: '0%' }}
                        animate={{ top: ['0%', '100%', '0%'] }}
                        transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
                        className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_15px_#34d399] z-20"
                      />
                    )}

                    <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 flex items-center justify-between text-xs relative z-10">
                      <div>
                        <div className="font-bold text-white text-sm">{unclassifiedVendor}</div>
                        <span className="text-[10px] font-mono text-slate-400">Merchant Transaction Intaked • AI Ready</span>
                      </div>
                      <div className="text-right">
                        <span className="font-mono text-emerald-400 font-bold text-base block">
                          {formatMoney(unclassifiedAmount, activeCurrencyCode)}
                        </span>
                        <span className="text-[9px] text-slate-400 font-mono">
                          {scanState === 'classified' ? 'GL: Classified' : 'Evaluating MCC'}
                        </span>
                      </div>
                    </div>

                    {/* AI OCR Metadata Tag Motion */}
                    <AnimatePresence>
                      {scanState === 'classified' && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="mt-3 p-2.5 bg-emerald-950/60 rounded-xl border border-emerald-700/60 flex items-center justify-between text-xs"
                        >
                          <div className="flex items-center space-x-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                            <span className="text-emerald-200">
                              Auto-categorized based on historical transaction profiles (Confidence: 99.4%)
                            </span>
                          </div>
                          <span className="text-[10px] bg-emerald-800 text-emerald-100 font-bold px-2 py-0.5 rounded">
                            Auto-Filed
                          </span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Category Breakdown Progress Grid */}
                  <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-3.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        Live Category Breakdown & Budget Caps
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Select a category to inspect
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {activeCategories.map((cat) => {
                        const isSelected = activeCategoryDemo === cat.name;
                        return (
                          <div 
                            key={cat.name}
                            onClick={() => setActiveCategoryDemo(cat.name)}
                            className={`p-3 rounded-xl border transition-all cursor-pointer ${
                              isSelected 
                                ? 'bg-white border-emerald-500 shadow-sm ring-2 ring-emerald-500/20' 
                                : 'bg-white/80 border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            <div className="flex items-center justify-between text-xs font-semibold text-slate-900">
                              <span className="truncate">{cat.name}</span>
                              <span className="font-mono text-slate-700">{formatMoney(cat.spent, activeCurrencyCode)}</span>
                            </div>
                            
                            {/* Animated Progress Bar */}
                            <div className="w-full bg-slate-100 rounded-full h-2 mt-2 overflow-hidden">
                              <motion.div 
                                className={`h-2 rounded-full ${cat.color}`}
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(100, cat.pct)}%` }}
                                transition={{ duration: 0.8, ease: 'easeOut' }}
                              />
                            </div>

                            <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1.5">
                              <span>Cap: {formatMoney(cat.cap, activeCurrencyCode)}</span>
                              <span className="font-bold text-emerald-700">
                                {cat.pct}% Used
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================================================= */}
              {/* STEP 3: Audit Alerts & Compliance Governance Motion Showcase */}
              {/* ========================================================================= */}
              {currentStep === 3 && (
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3.5">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 border border-emerald-200 shadow-2xs">
                        <AlertTriangle className="w-6 h-6 text-emerald-700" />
                      </div>
                      <div>
                        <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">
                          Step 3 of 5 • Compliance Governance
                        </span>
                        <h2 className="text-xl font-bold text-slate-900">
                          Audit Alerts & Policy Enforcement
                        </h2>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={runComplianceAudit}
                      disabled={isAuditing}
                      className="hidden sm:inline-flex items-center px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-95 shadow-2xs"
                    >
                      <Workflow className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
                      <span>{isAuditing ? 'Auditing Rules...' : 'Run Audit Rule Scanner'}</span>
                    </button>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    SpendIntel evaluates every transaction against IRS per-diems, corporate expense policies, and merchant risk profiles. Watch policy violations resolve interactively.
                  </p>

                  {/* 3 Interactive Rule Enforcement Cards with Motion Remediate */}
                  <div className="space-y-2.5">
                    {displayViolations.map((item) => {
                      const isRemediated = remediatedRules.has(item.id);
                      const IconComp = item.rule.startsWith('REC') ? Receipt : item.rule.startsWith('VND') ? ShieldCheck : AlertTriangle;
                      return (
                        <motion.div
                          key={item.id}
                          layout
                          className={`p-3.5 rounded-xl border transition-all flex items-start justify-between space-x-3 ${
                            isRemediated 
                              ? 'bg-emerald-50/70 border-emerald-300' 
                              : 'bg-slate-50 border-slate-200'
                          }`}
                        >
                          <div className="flex items-start space-x-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 border ${
                              isRemediated ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-slate-200 text-slate-700 border-slate-300'
                            }`}>
                              <IconComp className="w-4 h-4" />
                            </div>
                            <div className="space-y-0.5">
                              <div className="flex items-center space-x-2">
                                <h4 className="text-xs font-bold text-slate-900">{item.name}</h4>
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-slate-200 text-slate-800">
                                  Rule: {item.rule}
                                </span>
                              </div>
                              <p className="text-xs text-slate-600 leading-relaxed">
                                {item.desc}
                              </p>
                              <p className="text-[10px] text-slate-400 font-medium">
                                Target: {item.merchant} ({formatMoney(item.amount, activeCurrencyCode)})
                              </p>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              setRemediatedRules(prev => {
                                const next = new Set(prev);
                                if (next.has(item.id)) next.delete(item.id);
                                else next.add(item.id);
                                return next;
                                                              });
                            }}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold shrink-0 transition-all cursor-pointer border ${
                              isRemediated
                                ? 'bg-emerald-600 text-white border-emerald-700 shadow-2xs'
                                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                            }`}
                          >
                            {isRemediated ? 'Remediated ✓' : 'Auto-Resolve'}
                          </button>
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* 1-Click Action Highlight Banner */}
                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between text-xs">
                    <span className="text-emerald-950 font-medium">Batch governance rule resolution active</span>
                    <span className="font-bold text-emerald-800 bg-white px-2.5 py-1 rounded-lg border border-emerald-300 shadow-2xs">
                      ⚡ {remediatedRules.size} / {displayViolations.length} Rules Resolved
                    </span>
                  </div>
                </div>
              )}

              {/* ========================================================================= */}
              {/* STEP 4: Drill-Down Department Reporting Motion Display */}
              {/* ========================================================================= */}
              {currentStep === 4 && (
                <div className="space-y-5">
                  <div className="flex items-center space-x-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 border border-emerald-200 shadow-2xs">
                      <Users className="w-6 h-6 text-emerald-700" />
                    </div>
                    <div>
                      <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">
                        Step 4 of 5 • Multi-Department Intelligence
                      </span>
                      <h2 className="text-xl font-bold text-slate-900">
                        Drill-Down Department Reporting
                      </h2>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Filter by department to inspect burn pacing, active employee vouchers, and budget allocations in real time across the organization.
                  </p>

                  {/* Interactive Department Filter Simulator with Motion Layout */}
                  <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-3">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                      Select a Department to Test Real-Time Drill-Down:
                    </span>

                    {/* Filter Chips */}
                    <div className="flex flex-wrap gap-2">
                      {activeDepartments.map((dept) => {
                        const isSelected = selectedDeptDemo === dept.name;
                        return (
                          <button
                            key={dept.name}
                            type="button"
                            onClick={() => setSelectedDeptDemo(dept.name)}
                            className={`relative px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                              isSelected
                                ? 'text-white shadow-xs'
                                : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            {isSelected && (
                              <motion.div
                                layoutId="activeDeptBg"
                                className="absolute inset-0 bg-slate-900 rounded-xl -z-0"
                                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                              />
                            )}
                            <span className="relative z-10">{dept.name}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Simulated Filtered Drill-Down Motion Results */}
                    <AnimatePresence mode="wait">
                      {(() => {
                        const activeDeptInfo = activeDepartments.find(d => d.name === selectedDeptDemo) || activeDepartments[0] || { name: '', spent: 0, cap: 0, count: 0 };
                        return (
                          <motion.div 
                            key={selectedDeptDemo}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.25 }}
                            className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-2 mt-2 shadow-2xs"
                          >
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-bold text-slate-900">
                                Active Filter: <span className="text-emerald-700">{selectedDeptDemo || 'None'}</span>
                              </span>
                              <span className="text-[11px] text-slate-500">
                                Synchronized across charts & tables
                              </span>
                            </div>

                            <div className="grid grid-cols-3 gap-2 text-xs pt-1">
                              <div className="p-2 bg-slate-50 rounded-lg">
                                <span className="text-[10px] text-slate-400 block font-medium">Department Spend</span>
                                <strong className="text-slate-900 font-mono">
                                  {formatMoney(activeDeptInfo.spent, activeCurrencyCode)}
                                </strong>
                              </div>
                              <div className="p-2 bg-slate-50 rounded-lg">
                                <span className="text-[10px] text-slate-400 block font-medium">Total Cap</span>
                                <strong className="text-slate-900 font-mono">
                                  {formatMoney(activeDeptInfo.cap, activeCurrencyCode)}
                                </strong>
                              </div>
                              <div className="p-2 bg-slate-50 rounded-lg">
                                <span className="text-[10px] text-slate-400 block font-medium">Active Vouchers</span>
                                <strong className="text-emerald-700 font-mono">
                                  {activeDeptInfo.count} Claim{activeDeptInfo.count === 1 ? '' : 's'}
                                </strong>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })()}
                    </AnimatePresence>
                  </div>
                </div>
              )}

              {/* ========================================================================= */}
              {/* STEP 5: Enterprise Integrations Motion Display */}
              {/* ========================================================================= */}
              {currentStep === 5 && (
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3.5">
                      <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center shrink-0 border border-teal-200 shadow-2xs">
                        <Sliders className="w-6 h-6 text-teal-700" />
                      </div>
                      <div>
                        <span className="text-[11px] font-bold text-teal-700 uppercase tracking-wider">
                          Step 5 of 5 • General Ledger Feeds
                        </span>
                        <h2 className="text-xl font-bold text-slate-900">
                          Enterprise Integrations & GL Sync
                        </h2>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={triggerGlSyncPulse}
                      disabled={isSyncing}
                      className="hidden sm:inline-flex items-center px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-95 shadow-2xs"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 mr-1.5 text-emerald-600 ${isSyncing ? 'animate-spin' : ''}`} />
                      <span>{isSyncing ? 'Syncing Feeds...' : 'Trigger GL Sync Pulse'}</span>
                    </button>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Bi-directional sync connects SpendIntel directly to QuickBooks Online and Xero. Journal entries and bank reconciliation records update automatically.
                  </p>

                  {/* Animated Data Pipeline Bridge Graphic */}
                  <div className="p-4 bg-slate-900 rounded-2xl text-white border border-slate-800 relative overflow-hidden space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[11px] font-mono text-emerald-400 uppercase tracking-wider flex items-center">
                        <Activity className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                        Live Ledger Pipeline
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">
                        Last Synced: <strong className="text-emerald-400">{lastSyncTime}</strong>
                      </span>
                    </div>

                    {/* Circuit Flow Animation */}
                    <div className="py-2 flex items-center justify-between px-4 relative">
                      <div className="flex items-center space-x-2 z-10 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700">
                        <SpendIntelLogo size="sm" showWordmark={false} />
                        <span className="text-xs font-bold">SpendIntel</span>
                      </div>

                      {/* Moving Particles Path */}
                      <div className="flex-1 mx-4 h-0.5 bg-slate-700 relative overflow-hidden">
                        <motion.div 
                          animate={{ x: ['-100%', '100%'] }}
                          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                          className="w-16 h-full bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_8px_#34d399]"
                        />
                      </div>

                      <div className="flex items-center space-x-2 z-10 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700">
                        <QuickBooksLogo className="w-5 h-5" />
                        <span className="text-xs font-bold">Intuit GL</span>
                      </div>
                    </div>
                  </div>

                  {/* Platform Connection Toggles */}
                  <div className="space-y-2.5">
                    
                    {/* QuickBooks */}
                    <div className="p-3.5 rounded-2xl border border-slate-200 bg-white flex items-center justify-between shadow-2xs">
                      <div className="flex items-center space-x-3">
                        <QuickBooksLogo className="w-10 h-10" />
                        <div>
                          <div className="flex items-center space-x-2">
                            <h4 className="text-xs font-bold text-slate-900">Intuit QuickBooks Online</h4>
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                              GL Sync
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500">
                            Automated journal entry posting & chart of accounts sync
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleToggleIntegration('quickbooks')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer border ${
                          integrationsState.quickbooks 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100' 
                            : 'bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200'
                        }`}
                      >
                        {integrationsState.quickbooks ? 'Connected ✓' : 'Connect'}
                      </button>
                    </div>

                    {/* Xero */}
                    <div className="p-3.5 rounded-2xl border border-slate-200 bg-white flex items-center justify-between shadow-2xs">
                      <div className="flex items-center space-x-3">
                        <XeroLogo className="w-10 h-10" />
                        <div>
                          <div className="flex items-center space-x-2">
                            <h4 className="text-xs font-bold text-slate-900">Xero Accounting</h4>
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
                              Multi-Currency
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500">
                            Bi-directional bank feed matching & tax code reconciliation
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleToggleIntegration('xero')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer border ${
                          integrationsState.xero 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100' 
                            : 'bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200'
                        }`}
                      >
                        {integrationsState.xero ? 'Connected ✓' : 'Connect'}
                      </button>
                    </div>

                  </div>

                  {/* Ready Banner */}
                  <div className="p-4 bg-emerald-50/80 rounded-2xl border border-emerald-200/90 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center space-x-2.5 text-xs text-emerald-950 font-medium">
                      <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0" />
                      <span>Your workspace is fully calibrated with live ERP feeds.</span>
                    </div>

                    {onNavigateToSettings && (
                      <button
                        type="button"
                        onClick={onNavigateToSettings}
                        className="inline-flex items-center justify-center px-3.5 py-1.5 bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0 shadow-2xs"
                      >
                        <span>Manage in Settings</span>
                        <ExternalLink className="w-3 h-3 ml-1.5" />
                      </button>
                    )}
                  </div>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom Navigation Bar */}
        <div className="px-6 py-4.5 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between shadow-md">
          <div>
            {currentStep > 1 ? (
              <button
                type="button"
                id="onboarding-prev-btn"
                onClick={handlePrev}
                className="inline-flex items-center px-4 py-2 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
              >
                <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
                Previous Step
              </button>
            ) : (
              <button
                type="button"
                id="onboarding-skip-btn"
                onClick={onSkip}
                className="text-xs text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 font-medium cursor-pointer"
              >
                Skip Onboarding Tour
              </button>
            )}
          </div>

          <div className="flex items-center space-x-3">
            {/* Step Dots */}
            <div className="hidden sm:flex items-center space-x-1.5">
              {Array.from({ length: totalSteps }).map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => goToStep(idx + 1)}
                  className={`relative h-2 rounded-full transition-all cursor-pointer ${
                    currentStep === idx + 1 ? 'bg-emerald-600 w-6' : 'bg-slate-300 dark:bg-slate-700 w-2 hover:bg-slate-400'
                  }`}
                  title={`Go to step ${idx + 1}`}
                />
              ))}
            </div>

            <button
              type="button"
              id="onboarding-next-btn"
              onClick={handleNext}
              className="inline-flex items-center px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer ring-1 ring-emerald-700/20"
            >
              <span>{currentStep === totalSteps ? 'Complete Tour & Enter Dashboard' : `Next: ${stepTitles[currentStep]?.split('&')[0].trim() || 'Next Step'}`}</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
