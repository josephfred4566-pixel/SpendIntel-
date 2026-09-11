import React, { useState } from 'react';
import { AuthUser } from '../types';
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
  ExternalLink
} from 'lucide-react';
import { SpendIntelLogo } from './SpendIntelLogo';
import { QuickBooksLogo, XeroLogo, RampLogo } from './AppLogos';

interface OnboardingModalProps {
  user: AuthUser;
  isOpen: boolean;
  onComplete: () => void;
  onSkip: () => void;
  activeCurrencyCode?: string;
  onNavigateToSettings?: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  user,
  isOpen,
  onComplete,
  onSkip,
  activeCurrencyCode = 'USD',
  onNavigateToSettings,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;

  // Step 2 Interactive state
  const [activeCategoryDemo, setActiveCategoryDemo] = useState<string>('Cloud & Hosting');

  // Step 4 Interactive state
  const [selectedDeptDemo, setSelectedDeptDemo] = useState<string>('Engineering');

  // Step 5 Interactive integration toggles
  const [integrationsState, setIntegrationsState] = useState({
    quickbooks: true,
    xero: false,
    ramp: true,
  });

  if (!isOpen) return null;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleToggleIntegration = (key: 'quickbooks' | 'xero' | 'ramp') => {
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="bg-white border border-slate-200 rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[94vh] animate-in zoom-in-95 duration-200 text-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar with Step Counter & Quick Navigation */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/90">
          <div className="flex items-center space-x-3">
            <SpendIntelLogo size="sm" showWordmark={true} />
            <span className="hidden sm:inline-block text-[11px] font-mono uppercase tracking-wider text-slate-400 pl-3 border-l border-slate-200">
              Interactive Tour
            </span>
          </div>

          <div className="flex items-center space-x-3">
            {/* Step Counter Indicator */}
            <span className="text-xs font-medium text-slate-500 font-mono">
              Step {currentStep} of {totalSteps}
            </span>
            <button
              onClick={onSkip}
              title="Skip Tour"
              className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-200/50 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Dynamic Progress Bar */}
        <div className="w-full bg-slate-100 h-1.5">
          <div 
            className="bg-gradient-to-r from-emerald-600 to-teal-500 h-1.5 transition-all duration-300"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>

        {/* Step Indicator Navigation Pills */}
        <div className="hidden sm:flex items-center justify-between px-6 py-2.5 bg-slate-50/50 border-b border-slate-100 text-[11px]">
          {stepTitles.map((title, idx) => {
            const stepNum = idx + 1;
            const isActive = currentStep === stepNum;
            const isDone = currentStep > stepNum;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentStep(stepNum)}
                className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  isActive 
                    ? 'bg-emerald-600 text-white font-bold shadow-2xs' 
                    : isDone 
                      ? 'text-emerald-700 font-medium hover:bg-emerald-50' 
                      : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  isActive ? 'bg-white text-emerald-700' : isDone ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                }`}>
                  {isDone ? '✓' : stepNum}
                </span>
                <span className="truncate max-w-[100px] lg:max-w-none">{title.split('&')[0].trim()}</span>
              </button>
            );
          })}
        </div>

        {/* Step Carousel Body */}
        <div className="p-5 sm:p-7 overflow-y-auto flex-1 space-y-5">
          
          {/* ========================================================================= */}
          {/* STEP 1: Executive Dashboard & Metrics */}
          {/* ========================================================================= */}
          {currentStep === 1 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-right-3 duration-200">
              <div className="flex items-center space-x-3.5">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 border border-emerald-200 shadow-2xs">
                  <TrendingUp className="w-6 h-6 text-emerald-700" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">
                    Step 1 of 5 • Executive Overview
                  </span>
                  <h2 className="text-xl font-bold text-slate-900">
                    Executive Dashboard & Real-Time Metrics
                  </h2>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                SpendIntel gives executive leadership instant visibility into live corporate burn. Every dollar spent across corporate cards, ACH transfers, and reimbursements is monitored in real time.
              </p>

              {/* 3 Core Highlighted KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1">
                
                {/* 1. Total Expenses */}
                <div className="p-4 rounded-2xl bg-slate-900 text-white border border-slate-800 shadow-sm relative overflow-hidden group">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Total Expenses</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      Live
                    </span>
                  </div>
                  <div className="text-2xl sm:text-3xl font-extrabold font-mono tracking-tight mt-2 text-white">
                    $8,722.25
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 flex items-center">
                    <span className="text-emerald-400 font-semibold mr-1">↑ 12.4%</span> vs prior cycle
                  </p>
                </div>

                {/* 2. Pending Reimbursements */}
                <div className="p-4 rounded-2xl bg-amber-50/90 text-slate-900 border border-amber-200/90 shadow-sm relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">Pending Reimbursements</span>
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-extrabold font-mono tracking-tight mt-2 text-amber-950">
                    $2,162.80
                  </div>
                  <p className="text-[11px] text-amber-700 mt-1">
                    6 employee vouchers in approval queue
                  </p>
                </div>

                {/* 3. Approved Payments */}
                <div className="p-4 rounded-2xl bg-emerald-50/90 text-slate-900 border border-emerald-200/90 shadow-sm relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">Approved Payments</span>
                    <CheckCheck className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-extrabold font-mono tracking-tight mt-2 text-emerald-950">
                    $5,719.45
                  </div>
                  <p className="text-[11px] text-emerald-700 mt-1">
                    14 reconciled GAAP payouts cleared
                  </p>
                </div>

              </div>

              {/* Visual Tooltip Feature Callout */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 flex items-start space-x-3">
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5 border border-blue-200">
                  <Info className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <h4 className="text-xs font-bold text-slate-900">Real-Time Cash Flow Tracking Tooltip</h4>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-100 text-blue-800">
                      Automated
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Continuously tracks settled vs queued corporate liabilities across bank feeds and company cards to ensure accurate GAAP ledger reconciliation and prevent unexpected liquidity deficits.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 2: Smart Categorization Engine */}
          {/* ========================================================================= */}
          {currentStep === 2 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-right-3 duration-200">
              <div className="flex items-center space-x-3.5">
                <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-800 flex items-center justify-center shrink-0 border border-indigo-200 shadow-2xs">
                  <PieChart className="w-6 h-6 text-indigo-700" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider">
                    Step 2 of 5 • Autonomous Classification
                  </span>
                  <h2 className="text-xl font-bold text-slate-900">
                    Smart Categorization & Budget Cap Tracking
                  </h2>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                SpendIntel’s auto-categorization engine inspects merchant metadata, line-item OCR transcripts, and GL account charts to tag transactions automatically and track budget cap percentages in real time.
              </p>

              {/* Interactive Category Breakdown Showcase */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Live Category Breakdown & Budget Caps
                  </span>
                  <span className="text-[11px] font-medium text-slate-500">
                    Click a category to inspect status
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {[
                    { name: 'Cloud & Hosting', spent: '$3,150.00', cap: '$4,000.00', pct: 78.8, color: 'bg-indigo-600', status: 'Approaching Cap' },
                    { name: 'Travel', spent: '$2,410.50', cap: '$3,500.00', pct: 68.9, color: 'bg-emerald-600', status: 'Healthy' },
                    { name: 'Marketing', spent: '$1,480.00', cap: '$2,500.00', pct: 59.2, color: 'bg-blue-600', status: 'Healthy' },
                    { name: 'Software', spent: '$920.00', cap: '$1,500.00', pct: 61.3, color: 'bg-purple-600', status: 'Healthy' },
                    { name: 'Meals', spent: '$485.75', cap: '$800.00', pct: 60.7, color: 'bg-amber-600', status: 'Healthy' },
                    { name: 'Office Supplies', spent: '$276.00', cap: '$500.00', pct: 55.2, color: 'bg-teal-600', status: 'Healthy' },
                  ].map((cat) => {
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
                          <span className="font-mono text-slate-700">{cat.spent}</span>
                        </div>
                        
                        {/* Progress Bar with Cap Percentage */}
                        <div className="w-full bg-slate-100 rounded-full h-2 mt-2 overflow-hidden">
                          <div 
                            className={`h-2 rounded-full ${cat.color} transition-all duration-500`}
                            style={{ width: `${cat.pct}%` }}
                          />
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1.5">
                          <span>Cap: {cat.cap}</span>
                          <span className={`font-bold ${cat.pct > 75 ? 'text-amber-600' : 'text-emerald-700'}`}>
                            {cat.pct}% Used
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Auto-categorization Explainer Box */}
              <div className="p-3 bg-indigo-50/70 rounded-xl border border-indigo-200/80 text-xs text-indigo-950 flex items-center space-x-2.5">
                <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>
                  <strong>Selected Category: {activeCategoryDemo}</strong> — Automatically maps Amazon AWS, Google Cloud, and GitHub invoices directly to GAAP standard chart of accounts without human entry.
                </span>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 3: Audit Alerts & Policy Enforcement */}
          {/* ========================================================================= */}
          {currentStep === 3 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-right-3 duration-200">
              <div className="flex items-center space-x-3.5">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 border border-amber-200 shadow-2xs">
                  <AlertTriangle className="w-6 h-6 text-amber-700" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">
                    Step 3 of 5 • Compliance Governance
                  </span>
                  <h2 className="text-xl font-bold text-slate-900">
                    Audit Alerts & Policy Enforcement
                  </h2>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                SpendIntel includes an autonomous compliance rule engine that evaluates every transaction against corporate guidelines, IRS per-diems, and vendor risk profiles.
              </p>

              {/* 3 Core Rule Enforcement Mechanisms */}
              <div className="space-y-2.5">
                
                {/* 1. Missing Receipts */}
                <div className="p-3.5 rounded-xl border border-rose-200 bg-rose-50/70 flex items-start space-x-3">
                  <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center shrink-0 mt-0.5">
                    <Receipt className="w-4 h-4" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-2">
                      <h4 className="text-xs font-bold text-slate-900">Missing Receipt Violations</h4>
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-rose-200 text-rose-900">
                        Rule: REC-01
                      </span>
                    </div>
                    <p className="text-xs text-slate-600">
                      Transactions exceeding $100 without an attached itemized receipt are immediately quarantined and flagged for auditor review.
                    </p>
                  </div>
                </div>

                {/* 2. Unauthorized Vendors */}
                <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/70 flex items-start space-x-3">
                  <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-2">
                      <h4 className="text-xs font-bold text-slate-900">Unauthorized Vendor & Merchant Flags</h4>
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-200 text-amber-900">
                        Rule: VND-02
                      </span>
                    </div>
                    <p className="text-xs text-slate-600">
                      Detects purchases with suspicious MCC codes, gambling domains, cryptocurrency services, or unapproved software vendors.
                    </p>
                  </div>
                </div>

                {/* 3. Spending Limit Breaches */}
                <div className="p-3.5 rounded-xl border border-indigo-200 bg-indigo-50/70 flex items-start space-x-3">
                  <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 mt-0.5">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-2">
                      <h4 className="text-xs font-bold text-slate-900">Spending Limit & Per-Diem Breaches</h4>
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-indigo-200 text-indigo-900">
                        Rule: GSA-03
                      </span>
                    </div>
                    <p className="text-xs text-slate-600">
                      Enforces GSA travel thresholds ($250/night hotel limits and $75/day meal ceilings) across engineering and sales itineraries.
                    </p>
                  </div>
                </div>

              </div>

              {/* 1-Click Action Highlight */}
              <div className="p-3 bg-slate-100 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                <span className="text-slate-600">Need to batch clear compliant items?</span>
                <span className="font-bold text-emerald-700 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs">
                  ⚡ 1-Click Bulk Approve
                </span>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 4: Drill-Down Department Reporting */}
          {/* ========================================================================= */}
          {currentStep === 4 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-right-3 duration-200">
              <div className="flex items-center space-x-3.5">
                <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center shrink-0 border border-blue-200 shadow-2xs">
                  <Users className="w-6 h-6 text-blue-700" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">
                    Step 4 of 5 • Multi-Department Intelligence
                  </span>
                  <h2 className="text-xl font-bold text-slate-900">
                    Drill-Down Department Reporting
                  </h2>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Filter your organization by department to inspect burn rate pacing, employee vouchers, and budget allocations. Selecting a department updates both the visual charts and transaction data tables simultaneously.
              </p>

              {/* Interactive Department Filter Simulator */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-3">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Click a Department to Test Real-Time Filtering:
                </span>

                {/* Filter Chips */}
                <div className="flex flex-wrap gap-2">
                  {[
                    { name: 'Engineering', budget: '$32.4k', spent: '$4,850.00', vouchers: 12 },
                    { name: 'Sales', budget: '$24.0k', spent: '$1,920.50', vouchers: 5 },
                    { name: 'Marketing', budget: '$18.5k', spent: '$1,480.00', vouchers: 4 },
                    { name: 'Executive', budget: '$15.0k', spent: '$320.00', vouchers: 2 },
                    { name: 'Operations', budget: '$12.0k', spent: '$112.50', vouchers: 1 },
                    { name: 'Design', budget: '$10.0k', spent: '$39.25', vouchers: 1 },
                  ].map((dept) => {
                    const isSelected = selectedDeptDemo === dept.name;
                    return (
                      <button
                        key={dept.name}
                        type="button"
                        onClick={() => setSelectedDeptDemo(dept.name)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-slate-900 text-white shadow-xs scale-105'
                            : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        {dept.name}
                      </button>
                    );
                  })}
                </div>

                {/* Simulated Filtered Drill-Down Results */}
                <div className="p-3.5 bg-white rounded-xl border border-slate-200/90 space-y-2 mt-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900">
                      Active Filter: <span className="text-emerald-700">{selectedDeptDemo}</span>
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Synchronized across all charts & tables
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs pt-1">
                    <div className="p-2 bg-slate-50 rounded-lg">
                      <span className="text-[10px] text-slate-400 block font-medium">Department Spend</span>
                      <strong className="text-slate-900 font-mono">
                        {selectedDeptDemo === 'Engineering' ? '$4,850.00' : selectedDeptDemo === 'Sales' ? '$1,920.50' : '$1,480.00'}
                      </strong>
                    </div>
                    <div className="p-2 bg-slate-50 rounded-lg">
                      <span className="text-[10px] text-slate-400 block font-medium">Total Cap</span>
                      <strong className="text-slate-900 font-mono">
                        {selectedDeptDemo === 'Engineering' ? '$32,400.00' : selectedDeptDemo === 'Sales' ? '$24,000.00' : '$18,500.00'}
                      </strong>
                    </div>
                    <div className="p-2 bg-slate-50 rounded-lg">
                      <span className="text-[10px] text-slate-400 block font-medium">Active Vouchers</span>
                      <strong className="text-emerald-700 font-mono">
                        {selectedDeptDemo === 'Engineering' ? '12 Vouchers' : selectedDeptDemo === 'Sales' ? '5 Vouchers' : '4 Vouchers'}
                      </strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 5: Enterprise Integrations & Settings */}
          {/* ========================================================================= */}
          {currentStep === 5 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-right-3 duration-200">
              <div className="flex items-center space-x-3.5">
                <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center shrink-0 border border-teal-200 shadow-2xs">
                  <Sliders className="w-6 h-6 text-teal-700" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-teal-700 uppercase tracking-wider">
                    Step 5 of 5 • General Ledger & Connected Feeds
                  </span>
                  <h2 className="text-xl font-bold text-slate-900">
                    Enterprise Integrations & Settings
                  </h2>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Connect your accounting ledger and corporate card feeds. SpendIntel supports bi-directional sync with QuickBooks Online, Xero, and Ramp Corporate Cards.
              </p>

              {/* 3 Third-Party Platform Connection Toggles */}
              <div className="space-y-2.5">
                
                {/* 1. QuickBooks Online */}
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

                {/* 2. Xero Accounting */}
                <div className="p-3.5 rounded-2xl border border-slate-200 bg-white flex items-center justify-between shadow-2xs">
                  <div className="flex items-center space-x-3">
                    <XeroLogo className="w-10 h-10" />
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="text-xs font-bold text-slate-900">Xero Accounting</h4>
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
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

                {/* 3. Ramp Corporate Cards */}
                <div className="p-3.5 rounded-2xl border border-slate-200 bg-white flex items-center justify-between shadow-2xs">
                  <div className="flex items-center space-x-3">
                    <RampLogo className="w-10 h-10" />
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="text-xs font-bold text-slate-900">Ramp Corporate Cards</h4>
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-slate-900 text-white">
                          Live Webhooks
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Instant card swipe push triggers & SMS receipt extraction
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleIntegration('ramp')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer border ${
                      integrationsState.ramp 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100' 
                        : 'bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    {integrationsState.ramp ? 'Connected ✓' : 'Connect'}
                  </button>
                </div>

              </div>

              {/* Ready to go banner & Settings link */}
              <div className="p-4 bg-emerald-50/80 rounded-2xl border border-emerald-200/90 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center space-x-2.5 text-xs text-emerald-950 font-medium">
                  <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0" />
                  <span>Your workspace is fully calibrated with zero-loss storage persistence and live ERP feeds.</span>
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

        </div>

        {/* Bottom Navigation Bar */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div>
            {currentStep > 1 ? (
              <button
                type="button"
                id="onboarding-prev-btn"
                onClick={handlePrev}
                className="inline-flex items-center px-4 py-2 border border-slate-300 hover:bg-white text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
              >
                <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
                Previous Step
              </button>
            ) : (
              <button
                type="button"
                id="onboarding-skip-btn"
                onClick={onSkip}
                className="text-xs text-slate-500 hover:text-slate-900 font-medium cursor-pointer"
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
                  onClick={() => setCurrentStep(idx + 1)}
                  className={`h-2 rounded-full transition-all cursor-pointer ${
                    currentStep === idx + 1 ? 'bg-emerald-600 w-6' : 'bg-slate-300 w-2 hover:bg-slate-400'
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
