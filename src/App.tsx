import React, { useState, useMemo, useEffect } from 'react';
import { 
  Expense, 
  ExpenseCategory, 
  ExpenseStatus, 
  Department, 
  ActiveNavTab, 
  ActivityLogEntry, 
  CompanyProfileData,
  AuthSession,
  AuthUser,
  CompanyType,
  CategoryDefinition
} from './types';
import { Header } from './components/Header';
import { MetricCards } from './components/MetricCards';
import { TopSearchBar } from './components/TopSearchBar';
import { ChartArea } from './components/ChartArea';
import { CategoryBreakdown } from './components/CategoryBreakdown';
import { DepartmentReporting } from './components/DepartmentReporting';
import { AuditAlertsCard } from './components/AuditAlertsCard';
import { DataTable } from './components/DataTable';
import { ExpenseModal } from './components/ExpenseModal';
import { ReceiptViewerModal } from './components/ReceiptViewerModal';
import { AuditInspectionModal } from './components/AuditInspectionModal';
import { SettingsIntegrations } from './components/SettingsIntegrations';
import { CurrencySelectorModal } from './components/CurrencySelectorModal';
import { MonthlyReportPrintModal } from './components/MonthlyReportPrintModal';
import { BottomNavBar } from './components/BottomNavBar';
import { AuthView } from './components/AuthView';
import { OnboardingModal } from './components/OnboardingModal';
import { ProfileEditModal } from './components/ProfileEditModal';
import { syncDataToServer, triggerAppSync } from './utils/syncService';
import { evaluatePolicyRules, auditAllExpenses } from './utils/policyEngine';
import { getCurrencyInfo, formatMoney } from './utils/currencies';
import { 
  getStoredAuthSession, 
  persistAuthSession, 
  clearAuthSession, 
  setHasOnboarded,
  updateUserProfileSession
} from './utils/auth';
import { 
  loadExpenses, 
  saveExpenses, 
  loadCurrency, 
  saveCurrency, 
  loadCategories,
  saveCategories,
  loadActivityLogs, 
  saveActivityLogs, 
  appendActivityLog, 
  loadCompanyProfile, 
  saveCompanyProfile, 
  loadThemeMode,
  saveThemeMode,
  applyThemeToDOM,
  resetAllDataToDefaults, 
  importStateFromJSON 
} from './utils/storage';
import { CheckCircle2, Sparkles, Building2, Layers, Globe, ShieldCheck } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveNavTab>('home');
  
  // Theme Mode State ('light' | 'dark')
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const initialTheme = loadThemeMode();
    applyThemeToDOM(initialTheme);
    return initialTheme;
  });

  // Authentication & Session State (localStorage Web Storage API)
  const [session, setSession] = useState<AuthSession | null>(() => getStoredAuthSession());
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(() => {
    const s = getStoredAuthSession();
    return s !== null && !s.hasOnboarded;
  });

  // Persistent State
  const [expenses, setExpenses] = useState<Expense[]>(() => loadExpenses());
  const [activeCurrencyCode, setActiveCurrencyCode] = useState<string>(() => loadCurrency());
  const [categories, setCategories] = useState<CategoryDefinition[]>(() => loadCategories());
  const [activityLogs, setActivityLogs] = useState<ActivityLogEntry[]>(() => loadActivityLogs());
  const [companyProfile, setCompanyProfile] = useState<CompanyProfileData>(() => loadCompanyProfile());

  // Synchronize theme to DOM
  useEffect(() => {
    applyThemeToDOM(theme);
  }, [theme]);

  // Handle Theme Toggle
  const handleToggleTheme = (specificTheme?: 'light' | 'dark') => {
    const nextTheme = specificTheme !== undefined ? specificTheme : (theme === 'dark' ? 'light' : 'dark');
    setTheme(nextTheme);
    saveThemeMode(nextTheme);
    applyThemeToDOM(nextTheme);

    recordUserAction({
      actionType: 'PREFERENCES_SAVED',
      actor: session?.user.name || 'User Preference',
      title: `Switched Theme to ${nextTheme === 'dark' ? 'Dark Mode' : 'Light Mode'}`,
      details: `Theme appearance changed across SpendIntel interface.`,
      severity: 'normal',
    });

    showToast(`Interface switched to ${nextTheme === 'dark' ? 'Dark Mode 🌙' : 'Light Mode ☀️'}`);
  };

  // UI Modals & Filtering State
  const [isCurrencyModalOpen, setIsCurrencyModalOpen] = useState<boolean>(false);
  const [isPrintReportOpen, setIsPrintReportOpen] = useState<boolean>(false);
  const [isProfileEditOpen, setIsProfileEditOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ExpenseCategory | 'All'>('All');
  const [selectedDepartment, setSelectedDepartment] = useState<Department | 'All'>('All');
  const [isNewExpenseOpen, setIsNewExpenseOpen] = useState(false);
  const [viewingReceiptExpense, setViewingReceiptExpense] = useState<Expense | null>(null);
  const [inspectingAuditExpense, setInspectingAuditExpense] = useState<Expense | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isAuditing, setIsAuditing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Synchronize expenses changes to durable storage and global window.mockTransactions
  useEffect(() => {
    saveExpenses(expenses);
    if (typeof window !== 'undefined') {
      window.mockTransactions = expenses;
    }
  }, [expenses]);

  // Synchronize company type to localStorage spendIntel_companyType
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const cType = companyProfile?.companyType || session?.user?.companyType || "Enterprise";
      localStorage.setItem("spendIntel_companyType", cType);
    }
  }, [companyProfile, session]);

  // Ensure window.syncDataToServer, window.triggerAppSync and window.mockTransactions are initialized globally
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.syncDataToServer = syncDataToServer;
      window.triggerAppSync = triggerAppSync;
      window.mockTransactions = expenses;
      if (!localStorage.getItem("spendIntel_companyType")) {
        const cType = companyProfile?.companyType || session?.user?.companyType || "Enterprise";
        localStorage.setItem("spendIntel_companyType", cType);
      }
    }
  }, []);

  // Synchronize currency changes to durable storage
  useEffect(() => {
    saveCurrency(activeCurrencyCode);
  }, [activeCurrencyCode]);

  // Synchronize categories changes to durable storage
  useEffect(() => {
    saveCategories(categories);
  }, [categories]);

  const activeCurrency = useMemo(() => {
    return getCurrencyInfo(activeCurrencyCode);
  }, [activeCurrencyCode]);

  // Global shortcut to focus top description search bar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (activeTab !== 'home') setActiveTab('home');
        setTimeout(() => {
          document.getElementById('home-search-input')?.focus();
          document.getElementById('home-top-search-section')?.scrollIntoView({ behavior: 'smooth' });
        }, 60);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab]);

  const handleHeaderSearchClick = () => {
    if (activeTab !== 'home') {
      setActiveTab('home');
    }
    setTimeout(() => {
      const input = document.getElementById('home-search-input');
      input?.focus();
      const section = document.getElementById('home-top-search-section');
      section?.scrollIntoView({ behavior: 'smooth' });
    }, 60);
  };

  const searchMatchCount = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return expenses.length;
    return expenses.filter(item => {
      const merchantMatch = item.merchant.toLowerCase().includes(q);
      const descMatch = (item.description || '').toLowerCase().includes(q) || (item.notes || '').toLowerCase().includes(q);
      const employeeMatch = item.employeeName.toLowerCase().includes(q);
      const deptMatch = item.department.toLowerCase().includes(q);
      const catMatch = item.category.toLowerCase().includes(q);
      const violationMatch = (item.violations || []).some(v =>
        v.ruleName.toLowerCase().includes(q) ||
        v.description.toLowerCase().includes(q) ||
        v.code.toLowerCase().includes(q)
      );
      return merchantMatch || descMatch || employeeMatch || deptMatch || catMatch || violationMatch;
    }).length;
  }, [expenses, searchQuery]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4500);
  };

  // Record user action into persistent activity log
  const recordUserAction = (logInput: Omit<ActivityLogEntry, 'id' | 'timestamp' | 'displayTime'>) => {
    const newLog = appendActivityLog(logInput);
    setActivityLogs(prev => [newLog, ...prev]);
  };

  // Auth & Session Handlers
  const handleAuthSuccess = (newSession: AuthSession, isNewRegistration: boolean) => {
    setSession(newSession);
    if (!newSession.hasOnboarded) {
      setIsOnboardingOpen(true);
    }

    recordUserAction({
      actionType: isNewRegistration ? 'AUTH_REGISTER' : 'AUTH_LOGIN',
      actor: newSession.user.name,
      title: isNewRegistration 
        ? `Registered Organization (${newSession.user.companyType} Edition)` 
        : `Signed In: ${newSession.user.name} (${newSession.user.companyType})`,
      details: `Authenticated user session with role ${newSession.user.role} at ${newSession.user.companyName}.`,
      severity: 'success',
    });
  };

  const handleOnboardingComplete = () => {
    setHasOnboarded(true);
    if (session) {
      const updatedSession: AuthSession = {
        ...session,
        hasOnboarded: true,
      };
      setSession(updatedSession);
      persistAuthSession(updatedSession);
    }
    setIsOnboardingOpen(false);

    recordUserAction({
      actionType: 'ONBOARDING_COMPLETED',
      actor: session?.user.name || 'User',
      title: 'Interactive Onboarding Tour Completed',
      details: `Workspace tour completed. Company tier: ${session?.user.companyType || 'Enterprise'}.`,
      severity: 'success',
    });

    showToast('Onboarding complete! Welcome to your SpendIntel financial governance dashboard.');
  };

  const handleOnboardingSkip = () => {
    setHasOnboarded(true);
    if (session) {
      const updatedSession: AuthSession = {
        ...session,
        hasOnboarded: true,
      };
      setSession(updatedSession);
      persistAuthSession(updatedSession);
    }
    setIsOnboardingOpen(false);
    showToast('Onboarding skipped. You can replay the tour anytime from your profile menu.');
  };

  const handleSignOut = () => {
    if (session) {
      recordUserAction({
        actionType: 'AUTH_LOGOUT',
        actor: session.user.name,
        title: `Signed Out Session: ${session.user.name}`,
        details: 'User closed session and cleared active client credentials.',
        severity: 'normal',
      });
    }
    clearAuthSession();
    setSession(null);
    setIsOnboardingOpen(false);
    showToast('You have been safely signed out of SpendIntel.');
  };

  const handleReplayTour = () => {
    setIsOnboardingOpen(true);
  };

  const handleSwitchAccount = () => {
    clearAuthSession();
    setSession(null);
    showToast('Select an account or register a new workspace.');
  };

  const handleSaveProfile = (updatedData: Partial<AuthUser>) => {
    const result = updateUserProfileSession(updatedData);
    if (result.success && result.session) {
      setSession(result.session);
      recordUserAction({
        actionType: 'PREFERENCES_SAVED',
        actor: result.session.user.name,
        title: `Updated User Profile: ${result.session.user.name}`,
        details: `Profile identity updated. Title: "${result.session.user.title || result.session.user.role}", Department: "${result.session.user.department || 'Finance'}".`,
        severity: 'success',
      });
      showToast('Profile and executive identity updated successfully!');
    } else {
      showToast(result.error || 'Failed to update user profile.');
    }
  };

  // Add new expense and automatically evaluate compliance rules
  const handleAddExpense = (rawExpense: Expense) => {
    const violations = evaluatePolicyRules(rawExpense);
    const newExpense: Expense = {
      ...rawExpense,
      currency: rawExpense.currency || activeCurrencyCode,
      violations,
      status: violations.length > 0 ? 'Flagged' : rawExpense.status,
    };

    const updated = [newExpense, ...expenses];
    setExpenses(updated);
    saveExpenses(updated);

    const formattedAmt = formatMoney(newExpense.amount, newExpense.currency || activeCurrencyCode);

    recordUserAction({
      actionType: 'EXPENSE_CREATED',
      actor: newExpense.employeeName || session?.user.name || 'Staff Member',
      title: `Logged Expense: ${newExpense.merchant} (${formattedAmt})`,
      details: violations.length > 0 
        ? `Categorized as ${newExpense.category} under ${newExpense.department}. Flagged with ${violations.length} policy exception(s).`
        : `Categorized as ${newExpense.category} under ${newExpense.department}. Passed all automated policy checks.`,
      severity: violations.length > 0 ? 'warning' : 'success',
      relatedExpenseId: newExpense.id,
    });

    if (violations.length > 0) {
      showToast(`Expense logged from ${newExpense.merchant} (${formattedAmt}), triggered ${violations.length} policy flag(s) requiring review.`);
    } else {
      showToast(`Successfully logged expense from ${newExpense.merchant} (${formattedAmt}). All policy checks passed.`);
    }
  };

  const handleUpdateStatus = (id: string, newStatus: ExpenseStatus) => {
    let targetExp: Expense | undefined;
    setExpenses(prev => 
      prev.map(item => {
        if (item.id === id) {
          targetExp = item;
          return { ...item, status: newStatus };
        }
        return item;
      })
    );

    recordUserAction({
      actionType: 'EXPENSE_STATUS_CHANGE',
      actor: session?.user.role || 'Finance Controller',
      title: `Updated Status to ${newStatus}: ${targetExp?.merchant || id}`,
      details: `Voucher #${id} status changed from ${targetExp?.status || 'Unknown'} to ${newStatus}.`,
      severity: newStatus === 'Approved' ? 'success' : newStatus === 'Flagged' ? 'alert' : 'normal',
      relatedExpenseId: id,
    });

    showToast(`Transaction ${id} status updated to ${newStatus}`);
  };

  // Bulk approve multiple compliant/non-flagged expenses in a single click
  const handleBulkApprove = (ids: string[]) => {
    let approvedItems: Expense[] = [];
    setExpenses(prev => 
      prev.map(item => {
        if (ids.includes(item.id)) {
          const isFlagged = Boolean(item.violations && item.violations.length > 0);
          if (!isFlagged && item.status !== 'Approved') {
            approvedItems.push(item);
            return { ...item, status: 'Approved' as ExpenseStatus };
          }
        }
        return item;
      })
    );

    recordUserAction({
      actionType: 'BULK_APPROVAL',
      actor: session?.user.role || 'Finance Controller',
      title: `1-Click Bulk Approved ${ids.length} Compliant Transactions`,
      details: `Executed 1-click batch approval for ${ids.length} compliant expense vouchers across general ledger.`,
      severity: 'success',
    });

    showToast(`Successfully bulk-approved ${ids.length} compliant transaction${ids.length === 1 ? '' : 's'} with 1-click execution.`);
  };

  // Run or re-run automated policy checks across all expenses
  const handleReaudit = () => {
    setIsAuditing(true);
    setTimeout(() => {
      const audited = auditAllExpenses(expenses);
      setExpenses(audited);
      saveExpenses(audited);
      setIsAuditing(false);
      const totalViolations = audited.reduce((sum, e) => sum + (e.violations?.length || 0), 0);
      
      recordUserAction({
        actionType: 'REAUDIT_EXECUTED',
        actor: 'Autonomous Compliance Engine',
        title: 'Complete Policy Audit Re-scan Executed',
        details: `Re-evaluated ${audited.length} corporate transactions; active policy flags: ${totalViolations}.`,
        severity: totalViolations > 0 ? 'warning' : 'success',
      });

      showToast(`Policy validation completed: evaluated ${audited.length} expenses, identified ${totalViolations} compliance flag(s).`);
    }, 600);
  };

  // Waive a specific violation
  const handleWaiveViolation = (expenseId: string, violationId: string) => {
    let waivedRuleName = '';
    setExpenses(prev => prev.map(item => {
      if (item.id === expenseId) {
        const violation = (item.violations || []).find(v => v.id === violationId);
        if (violation) waivedRuleName = violation.ruleName;
        const remainingViolations = (item.violations || []).filter(v => v.id !== violationId);
        return {
          ...item,
          violations: remainingViolations,
          status: remainingViolations.length === 0 && item.status === 'Flagged' ? 'Pending' : item.status,
        };
      }
      return item;
    }));

    recordUserAction({
      actionType: 'VIOLATION_WAIVED',
      actor: session?.user.name || 'Compliance Auditor',
      title: `Compliance Exception Waived: #${expenseId}`,
      details: `Waived policy rule: "${waivedRuleName || violationId}" with documented business justification.`,
      severity: 'warning',
      relatedExpenseId: expenseId,
    });

    showToast(`Compliance exception granted for transaction ${expenseId}.`);
  };

  // Approve expense with exception
  const handleApproveWithException = (id: string) => {
    let targetExp: Expense | undefined;
    setExpenses(prev => prev.map(item => {
      if (item.id === id) {
        targetExp = item;
        return { ...item, status: 'Approved', violations: [] };
      }
      return item;
    }));
    setInspectingAuditExpense(null);

    recordUserAction({
      actionType: 'EXCEPTION_APPROVED',
      actor: session?.user.name || 'VP of Finance / Manager',
      title: `Approved with Manager Exception: ${targetExp?.merchant || id}`,
      details: `Cleared all violations and approved voucher #${id} with manager compliance override.`,
      severity: 'success',
      relatedExpenseId: id,
    });

    showToast(`Expense ${id} approved with manager compliance override.`);
  };

  // Reject expense
  const handleRejectExpense = (id: string) => {
    let targetExp: Expense | undefined;
    setExpenses(prev => prev.map(item => {
      if (item.id === id) {
        targetExp = item;
        return { ...item, status: 'Flagged', notes: `${item.notes || ''} [REJECTED BY AUDITOR]` };
      }
      return item;
    }));
    setInspectingAuditExpense(null);

    recordUserAction({
      actionType: 'EXPENSE_REJECTED',
      actor: session?.user.name || 'Senior Internal Auditor',
      title: `Rejected Non-Reimbursable Expense: ${targetExp?.merchant || id}`,
      details: `Marked voucher #${id} as non-reimbursable policy rejection.`,
      severity: 'alert',
      relatedExpenseId: id,
    });

    showToast(`Expense ${id} marked as non-reimbursable policy rejection.`);
  };

  // Request receipt from employee
  const handleRequestReceipt = (id: string) => {
    setInspectingAuditExpense(null);

    recordUserAction({
      actionType: 'RECEIPT_REQUESTED',
      actor: 'Audit Policy Webhook',
      title: `Itemized Receipt Requested: #${id}`,
      details: `Sent automated receipt documentation request to employee for transaction #${id}.`,
      severity: 'normal',
      relatedExpenseId: id,
    });

    showToast(`Automated request sent to employee: Please upload itemized receipt for transaction #${id}.`);
  };

  const handleRefresh = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);

      recordUserAction({
        actionType: 'INTEGRATION_SYNC',
        actor: 'Live ERP Connector',
        title: 'ERP & Corporate Card Feeds Synchronized',
        details: 'Successfully pulled latest journal batches and card swipes from connected banking feeds.',
        severity: 'success',
      });

      showToast('Corporate card feeds synchronized. Ready for transaction entries.');
    }, 1000);
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Date', 'Merchant', 'Category', 'Employee', 'Department', 'Amount', 'Currency', 'Status', 'Violations'];
    const rows = expenses.map(e => [
      e.id,
      e.date,
      `"${e.merchant}"`,
      e.category,
      `"${e.employeeName}"`,
      e.department,
      e.amount,
      e.currency || activeCurrencyCode,
      e.status,
      `"${(e.violations || []).map(v => v.code).join('; ')}"`
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Expense_Report_Audit_${activeCurrencyCode}_${selectedDepartment}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    recordUserAction({
      actionType: 'CSV_EXPORTED',
      actor: session?.user.name || 'Finance Controller',
      title: `Exported Ledger CSV in ${activeCurrencyCode}`,
      details: `Generated and downloaded general ledger CSV report with ${expenses.length} transaction entries.`,
      severity: 'normal',
    });

    showToast(`Audit CSV exported in ${activeCurrencyCode}.`);
  };

  const handleCurrencySelect = (currencyCode: string) => {
    setActiveCurrencyCode(currencyCode);
    saveCurrency(currencyCode);
    const curInfo = getCurrencyInfo(currencyCode);

    recordUserAction({
      actionType: 'CURRENCY_CHANGED',
      actor: session?.user.name || 'User Preference',
      title: `Switched Dashboard Currency to ${currencyCode}`,
      details: `All dashboard metric totals, department spending, and charts recalculated in ${curInfo.name} (${curInfo.symbol}).`,
      severity: 'normal',
    });

    showToast(`Active reporting currency switched to ${currencyCode} (${curInfo.name})`);
  };

  const handleUpdateCompanyProfile = (profile: CompanyProfileData) => {
    setCompanyProfile(profile);
    saveCompanyProfile(profile);

    recordUserAction({
      actionType: 'PREFERENCES_SAVED',
      actor: session?.user.name || 'Corporate Administrator',
      title: `Updated Company Profile: ${profile.companyName}`,
      details: `Entity structure: ${profile.legalEntity}, Tax ID: ${profile.taxId}, Standard: ${profile.accountingStandard}.`,
      severity: 'normal',
    });
  };

  const handleCategoriesChange = (newCategories: CategoryDefinition[]) => {
    setCategories(newCategories);
    saveCategories(newCategories);

    recordUserAction({
      actionType: 'PREFERENCES_SAVED',
      actor: session?.user.name || 'Finance Administrator',
      title: 'Smart Categories & Labels Configured',
      details: `Updated ${newCategories.length} corporate categorization rules, tag labels, and descriptions.`,
      severity: 'normal',
    });
  };

  const handleResetAllData = () => {
    resetAllDataToDefaults();
    const freshExpenses = loadExpenses();
    const freshCurrency = loadCurrency();
    const freshCategories = loadCategories();
    const freshLogs = loadActivityLogs();
    const freshProfile = loadCompanyProfile();

    setExpenses(freshExpenses);
    setActiveCurrencyCode(freshCurrency);
    setCategories(freshCategories);
    setActivityLogs(freshLogs);
    setCompanyProfile(freshProfile);

    showToast('All transaction records, categories, currency, and audit logs have been reset to default state.');
  };

  const handleImportBackup = (jsonStr: string) => {
    const res = importStateFromJSON(jsonStr);
    if (res.success) {
      setExpenses(loadExpenses());
      setActiveCurrencyCode(loadCurrency());
      setCategories(loadCategories());
      setActivityLogs(loadActivityLogs());
      setCompanyProfile(loadCompanyProfile());

      recordUserAction({
        actionType: 'BACKUP_RESTORED',
        actor: session?.user.name || 'System Administrator',
        title: 'Restored Corporate State from JSON Backup',
        details: 'Successfully loaded complete ledger transactions, categories, currency baseline, and compliance logs from archive.',
        severity: 'success',
      });

      showToast(res.message);
    } else {
      showToast(res.message);
    }
  };

  // ROUTING: If no authenticated session exists in localStorage, render the Authentication UI
  if (!session) {
    return (
      <AuthView
        onAuthSuccess={handleAuthSuccess}
        onNotify={showToast}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-100/70 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans flex flex-col transition-colors duration-200 animate-in fade-in">
      
      {/* Top Header */}
      <Header
        onOpenNewExpense={() => setIsNewExpenseOpen(true)}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        flaggedCount={expenses.filter(e => e.status === 'Flagged').length}
        onSearchClick={handleHeaderSearchClick}
        onOpenPrintReport={() => setIsPrintReportOpen(true)}
        activeCurrencyCode={activeCurrencyCode}
        onOpenCurrencyModal={() => setIsCurrencyModalOpen(true)}
        user={session.user}
        onSignOut={handleSignOut}
        onReplayTour={handleReplayTour}
        onSwitchAccount={handleSwitchAccount}
        onOpenProfileEdit={() => setIsProfileEditOpen(true)}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      {/* Main Content Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 flex-1 w-full pb-24 md:pb-8">
        
        {/* Toast Notification */}
        {toastMessage && (
          <div className="bg-slate-900 dark:bg-slate-800 text-white px-4 py-3 rounded-xl shadow-lg flex items-center justify-between border border-transparent dark:border-slate-700 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span className="text-sm font-medium">{toastMessage}</span>
            </div>
            <button 
              onClick={() => setToastMessage(null)}
              className="text-slate-400 hover:text-white text-xs font-semibold uppercase tracking-wider ml-4 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Company Tier Active Session Banner */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 shadow-2xs flex flex-col md:flex-row md:items-center md:justify-between gap-3 transition-colors duration-200">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-200/80 dark:border-emerald-800">
              {session.user.companyType === 'Corporate' && <Globe className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />}
              {session.user.companyType === 'Enterprise' && <Layers className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
              {session.user.companyType === 'Small Business' && <Building2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-slate-900 dark:text-white">{session.user.companyName}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  {session.user.companyType} Edition
                </span>
                <span className="hidden sm:inline-block text-[11px] text-slate-500 dark:text-slate-400">
                  • Logged in as <strong className="text-slate-700 dark:text-slate-300">{session.user.name}</strong> ({session.user.role})
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {session.user.companyType === 'Small Business' && 'Optimized for receipt OCR, automated tax categories, and QuickBooks ledger synchronization.'}
                {session.user.companyType === 'Enterprise' && 'Multi-department budget controls, policy exception waivers, and ERP ledger feeds active.'}
                {session.user.companyType === 'Corporate' && 'Global sovereign currency consolidation, real-time Ramp card webhooks, and SOC2 verifiable audit trail.'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0 self-end md:self-auto">
            <button
              type="button"
              id="dashboard-replay-tour-btn"
              onClick={handleReplayTour}
              className="inline-flex items-center px-3 py-1.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 mr-1 text-emerald-600 dark:text-emerald-400" />
              <span>Tour</span>
            </button>
            <button
              type="button"
              onClick={handleSignOut}
              className="text-xs text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 font-medium px-2 py-1 transition-colors cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* View Switching: Home Dashboard vs Settings & Accounting Integrations */}
        {activeTab === 'home' ? (
          <div className="space-y-6 animate-in fade-in duration-150">
            {/* Top Search Bar with Description Search Button & Suggestions */}
            <TopSearchBar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              matchCount={searchMatchCount}
              totalCount={expenses.length}
            />

            {/* 1. Key Metric Summary Cards */}
            <MetricCards 
              expenses={expenses} 
              currencyCode={activeCurrencyCode}
              onOpenCurrencySelector={() => setIsCurrencyModalOpen(true)}
            />

            {/* 2. Audit Alerts Card & Category Breakdown Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7">
                <AuditAlertsCard
                  expenses={expenses}
                  currencyCode={activeCurrencyCode}
                  onFilterFlagged={() => {
                    setSelectedDepartment('All');
                    setSelectedCategory('All');
                    const tableEl = document.getElementById('transaction-feed');
                    if (tableEl) tableEl.scrollIntoView({ behavior: 'smooth' });
                  }}
                  onSelectExpenseForAudit={(exp) => setInspectingAuditExpense(exp)}
                  onWaiveViolation={handleWaiveViolation}
                  onReaudit={handleReaudit}
                  isAuditing={isAuditing}
                />
              </div>
              <div className="lg:col-span-5">
                <CategoryBreakdown
                  expenses={expenses}
                  categories={categories}
                  onCategoriesChange={handleCategoriesChange}
                  currencyCode={activeCurrencyCode}
                  selectedCategory={selectedCategory}
                  onSelectCategory={setSelectedCategory}
                />
              </div>
            </div>

            {/* 3. Drill-Down Department Reporting */}
            <DepartmentReporting
              expenses={expenses}
              currencyCode={activeCurrencyCode}
              activeDepartment={selectedDepartment}
              onSelectDepartment={setSelectedDepartment}
            />

            {/* 4. Monthly Spending Trend Chart */}
            <ChartArea 
              expenses={expenses} 
              currencyCode={activeCurrencyCode}
            />

            {/* 5. Transaction Feed & Audit Log Data Table */}
            <div id="transaction-feed">
              <DataTable
                expenses={expenses}
                currencyCode={activeCurrencyCode}
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
                selectedDepartment={selectedDepartment}
                onSelectDepartment={setSelectedDepartment}
                onUpdateStatus={handleUpdateStatus}
                onBulkApprove={handleBulkApprove}
                onViewReceipt={(exp) => setViewingReceiptExpense(exp)}
                onInspectAudit={(exp) => setInspectingAuditExpense(exp)}
                onWaiveViolation={handleWaiveViolation}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onLogExpenseClick={() => setIsNewExpenseOpen(true)}
                onOpenCurrencyModal={() => setIsCurrencyModalOpen(true)}
              />
            </div>
          </div>
        ) : (
          <SettingsIntegrations
            onNotify={showToast}
            onBackToDashboard={() => setActiveTab('home')}
            currencyCode={activeCurrencyCode}
            onOpenCurrencyModal={() => setIsCurrencyModalOpen(true)}
            onExportCSV={handleExportCSV}
            onRefresh={handleRefresh}
            isSyncing={isSyncing}
            activityLogs={activityLogs}
            companyProfile={companyProfile}
            onUpdateCompanyProfile={handleUpdateCompanyProfile}
            onResetAllData={handleResetAllData}
            onImportBackup={handleImportBackup}
            expensesCount={expenses.length}
            session={session}
            onReplayTour={handleReplayTour}
            onSignOut={handleSignOut}
            onSwitchAccount={handleSwitchAccount}
            onOpenProfileEdit={() => setIsProfileEditOpen(true)}
            theme={theme}
            onToggleTheme={handleToggleTheme}
          />
        )}

      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 mt-12 py-6 text-center text-xs text-slate-500 dark:text-slate-400 mb-16 md:mb-0 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 SpendIntel. Autonomous Financial Intelligence & Corporate Ledger Reporting Standard.</p>
          <div className="flex items-center space-x-4">
            <button 
              type="button" 
              onClick={() => setIsCurrencyModalOpen(true)}
              className="hover:text-slate-900 dark:hover:text-white cursor-pointer font-medium"
            >
              Currency: {activeCurrency.name} ({activeCurrency.code})
            </button>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="hover:text-slate-900 dark:hover:text-white cursor-pointer">Enterprise Compliance</span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="hover:text-slate-900 dark:hover:text-white cursor-pointer">GAAP Ledger Sync</span>
          </div>
        </div>
      </footer>

      {/* Mobile-Responsive Bottom Navigation Bar */}
      <BottomNavBar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenNewExpense={() => setIsNewExpenseOpen(true)}
        flaggedCount={expenses.filter(e => e.status === 'Flagged').length}
      />

      {/* Modals */}
      {/* 1. Interactive Multi-Step Onboarding Modal / Tour */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        user={session.user}
        onComplete={handleOnboardingComplete}
        onSkip={handleOnboardingSkip}
        activeCurrencyCode={activeCurrencyCode}
        onNavigateToSettings={() => {
          setActiveTab('integrations');
          handleOnboardingComplete();
        }}
      />

      {/* 2. Expense Modal */}
      <ExpenseModal
        isOpen={isNewExpenseOpen}
        onClose={() => setIsNewExpenseOpen(false)}
        onAddExpense={handleAddExpense}
        activeCurrencyCode={activeCurrencyCode}
        availableCategories={categories}
      />

      {/* 3. Real-Time Alphabetical Currency Modal */}
      <CurrencySelectorModal
        isOpen={isCurrencyModalOpen}
        onClose={() => setIsCurrencyModalOpen(false)}
        activeCurrencyCode={activeCurrencyCode}
        onSelectCurrency={(selected) => {
          const code = typeof selected === 'string' ? selected : selected?.code || 'USD';
          handleCurrencySelect(code);
        }}
      />

      {/* 4. Itemized Receipt Viewer */}
      <ReceiptViewerModal
        expense={viewingReceiptExpense}
        onClose={() => setViewingReceiptExpense(null)}
      />

      {/* 5. Policy & Audit Inspection Modal */}
      <AuditInspectionModal
        expense={inspectingAuditExpense}
        onClose={() => setInspectingAuditExpense(null)}
        onApproveWithException={handleApproveWithException}
        onRejectExpense={handleRejectExpense}
        onRequestReceipt={handleRequestReceipt}
        onViewReceipt={(exp) => {
          setInspectingAuditExpense(null);
          setViewingReceiptExpense(exp);
        }}
      />

      {/* 6. Simplified Print-Optimized Monthly Spending Report Modal for Physical Filing */}
      <MonthlyReportPrintModal
        isOpen={isPrintReportOpen}
        onClose={() => setIsPrintReportOpen(false)}
        expenses={expenses}
        currencyCode={activeCurrencyCode}
      />

      {/* 7. Profile & Executive Identity Customization Modal */}
      <ProfileEditModal
        isOpen={isProfileEditOpen}
        onClose={() => setIsProfileEditOpen(false)}
        user={session.user}
        onSaveProfile={handleSaveProfile}
        onNotify={showToast}
      />

    </div>
  );
}
