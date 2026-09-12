import React, { useState, useEffect } from 'react';
import { 
  Blocks,
  Building2, 
  CheckCircle2, 
  RefreshCw, 
  ArrowRight, 
  Layers, 
  ShieldCheck, 
  AlertCircle, 
  ExternalLink, 
  Zap, 
  Sliders, 
  Database, 
  History, 
  Check, 
  Power,
  Download,
  Upload,
  RotateCcw,
  Search,
  FileText,
  Lock,
  HardDrive,
  Sun,
  Moon,
  Monitor
} from 'lucide-react';
import { AccountingIntegration, ActivityLogEntry, CompanyProfileData, AppPreferences, AuthSession, CompanyType } from '../types';
import { AppLogo } from './AppLogos';
import { exportAllStateAsJSON, getLastSavedTimestamp } from '../utils/storage';
import { syncDataToServer, triggerAppSync, initiateOAuth } from '../utils/syncService';
import { User, Sparkles, LogOut, Globe, UserCog, Server } from 'lucide-react';

const INITIAL_INTEGRATIONS: AccountingIntegration[] = [
  {
    id: 'quickbooks',
    name: 'QuickBooks Online',
    tagline: 'Intuit Enterprise Ledger & Automated Journal Entries',
    category: 'General Ledger / ERP',
    status: 'connected',
    lastSynced: 'Today at 08:30 AM',
    syncInterval: 'Hourly',
    mappedLedger: '6100 - General Operating Expenses',
    features: [
      'Automatic bill and receipt attachment syncing',
      'Bi-directional Chart of Accounts (COA) mapping',
      'Instant policy compliance validation upon journal entry'
    ]
  },
  {
    id: 'xero',
    name: 'Xero Accounting',
    tagline: 'Cloud-based Small & Medium Business Accounting',
    category: 'Cloud Accounting',
    status: 'disconnected',
    lastSynced: null,
    syncInterval: 'Daily',
    mappedLedger: '400 - Operating Expenses (Unmapped)',
    features: [
      'Multi-currency exchange rate synchronization',
      'Bank reconciliation feed matching',
      'Automated batch payment file creation (ABA/SEPA)'
    ]
  }
];

interface SettingsIntegrationsProps {
  onNotify: (message: string) => void;
  onBackToDashboard: () => void;
  currencyCode?: string;
  onOpenCurrencyModal?: () => void;
  onExportCSV?: () => void;
  onRefresh?: () => void;
  isSyncing?: boolean;
  activityLogs?: ActivityLogEntry[];
  companyProfile?: CompanyProfileData;
  onUpdateCompanyProfile?: (profile: CompanyProfileData) => void;
  onResetAllData?: () => void;
  onImportBackup?: (jsonStr: string) => void;
  expensesCount?: number;
  session?: AuthSession | null;
  onReplayTour?: () => void;
  onSignOut?: () => void;
  onSwitchAccount?: () => void;
  onOpenProfileEdit?: () => void;
  theme?: 'light' | 'dark';
  onToggleTheme?: (newTheme?: 'light' | 'dark') => void;
}

export const SettingsIntegrations: React.FC<SettingsIntegrationsProps> = ({
  onNotify,
  onBackToDashboard,
  currencyCode = 'USD',
  onOpenCurrencyModal,
  onExportCSV,
  onRefresh,
  isSyncing = false,
  activityLogs = [],
  companyProfile = {
    companyName: 'SpendIntel Global Technologies, Inc.',
    legalEntity: 'SpendIntel Inc. (Delaware C-Corp)',
    taxId: 'US-EIN-88492019',
    fiscalYearEnd: 'December 31',
    defaultCurrency: 'USD',
    accountingStandard: 'US_GAAP',
  },
  onUpdateCompanyProfile,
  onResetAllData,
  onImportBackup,
  expensesCount = 0,
  session,
  onReplayTour,
  onSignOut,
  onSwitchAccount,
  onOpenProfileEdit,
  theme = 'light',
  onToggleTheme,
}) => {
  const [integrations, setIntegrations] = useState<AccountingIntegration[]>(INITIAL_INTEGRATIONS);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [connectingId, setConnectingId] = useState<string | null>(null);
  const [activeSettingsSubtab, setActiveSettingsSubtab] = useState<'integrations' | 'preferences' | 'logs_storage'>('integrations');

  // Activity Log Filter and Search
  const [logSearch, setLogSearch] = useState('');
  const [logActionFilter, setLogActionFilter] = useState('ALL');

  // Company Profile Edit State
  const [isEditingCompany, setIsEditingCompany] = useState(false);
  const [companyForm, setCompanyForm] = useState<CompanyProfileData>(companyProfile);

  // Preferences State
  const [autoReconcile, setAutoReconcile] = useState(true);
  const [receiptUploadRequirement, setReceiptUploadRequirement] = useState(50);
  const [strictPerDiem, setStrictPerDiem] = useState(true);
  const [confirmReset, setConfirmReset] = useState(false);

  const isDark = theme === 'dark';

  // Handle returning from OAuth flow with ?connected=platform
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const params = new URLSearchParams(window.location.search);
        const connectedPlatform = params.get('connected');
        if (connectedPlatform) {
          setIntegrations(prev => prev.map(item => {
            if (item.id === connectedPlatform || item.name.toLowerCase().includes(connectedPlatform.toLowerCase())) {
              return {
                ...item,
                status: 'connected',
                lastSynced: 'Just now'
              };
            }
            return item;
          }));
          onNotify(`Successfully connected and authenticated ${connectedPlatform.toUpperCase()}!`);
          const newUrl = window.location.pathname;
          window.history.replaceState({}, document.title, newUrl);
        }
      } catch (e) {
        console.warn('URL params parsing or history state update prevented:', e);
      }
    }
  }, []);

  // Last persisted time from local storage
  const lastSaved = getLastSavedTimestamp() ? new Date(getLastSavedTimestamp()!).toLocaleTimeString() : 'Active (Live)';

  // Toggle Connect / Disconnect
  const handleToggleConnection = (id: string) => {
    setConnectingId(id);
    const target = integrations.find(i => i.id === id);
    if (!target) return;

    const isCurrentlyConnected = target.status === 'connected';

    if (!isCurrentlyConnected) {
      initiateOAuth(id).catch(err => {
        console.error("OAuth initiation failed:", err);
        setConnectingId(null);
      });
      return;
    }

    setTimeout(() => {
      setConnectingId(null);
      setIntegrations(prev => prev.map(item => {
        if (item.id === id) {
          return {
            ...item,
            status: 'disconnected',
            lastSynced: null,
          };
        }
        return item;
      }));

      onNotify(`Disconnected ${target.name}. Synchronization suspended.`);
    }, 400);
  };

  // Trigger Manual Sync
  const handleManualSync = (id: string) => {
    setSyncingId(id);
    const target = integrations.find(i => i.id === id);
    if (!target) return;

    if (id === 'quickbooks' || id === 'xero') {
      triggerAppSync(id).finally(() => {
        setSyncingId(null);
        setIntegrations(prev => prev.map(item => {
          if (item.id === id) {
            return {
              ...item,
              lastSynced: 'Just now',
            };
          }
          return item;
        }));
      });
      return;
    }

    setTimeout(() => {
      setSyncingId(null);
      const currentTimeStr = 'Just now';

      setIntegrations(prev => prev.map(item => {
        if (item.id === id) {
          return {
            ...item,
            lastSynced: currentTimeStr,
          };
        }
        return item;
      }));

      onNotify(`Sync completed for ${target.name}. All records up to date.`);
    }, 1100);
  };

  // Filter activity logs
  const filteredLogs = activityLogs.filter(log => {
    if (logActionFilter !== 'ALL' && log.actionType !== logActionFilter) return false;
    if (logSearch.trim()) {
      const q = logSearch.toLowerCase();
      return (
        log.title.toLowerCase().includes(q) ||
        log.details.toLowerCase().includes(q) ||
        log.actor.toLowerCase().includes(q) ||
        log.actionType.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Handle Backup JSON Export
  const handleDownloadBackup = () => {
    const jsonStr = exportAllStateAsJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `SpendIntel_Backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onNotify('Complete SpendIntel data & logs backup downloaded as JSON.');
  };

  // Handle Backup JSON Import
  const handleFileUploadBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      if (onImportBackup) {
        onImportBackup(content);
      }
    };
    reader.readAsText(file);
  };

  const handleSaveCompany = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdateCompanyProfile) {
      onUpdateCompanyProfile(companyForm);
    }
    setIsEditingCompany(false);
    onNotify('Company corporate entity profile updated and persisted.');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 pb-20 md:pb-8">
      
      {/* Settings Breadcrumbs & Top Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors duration-200">
        <div>
          <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400 mb-1">
            <button 
              onClick={onBackToDashboard}
              className="hover:text-slate-900 dark:hover:text-white transition-colors font-medium cursor-pointer"
            >
              Dashboard
            </button>
            <span>/</span>
            <span className="text-slate-800 dark:text-slate-200 font-semibold">SpendIntel Apps & Settings</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center">
            <Blocks className="w-5 h-5 mr-2 text-slate-900 dark:text-slate-100" />
            SpendIntel Enterprise Accounting Apps & Settings
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Connect corporate ERPs, synchronize live card feeds, manage persistent data storage, theme mode, and review user action audit logs.
          </p>
        </div>

        {/* Action Buttons & Subtab Switcher */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2.5">
          {/* Action buttons: Product Tour, Sign Out, Sync Feeds & Export CSV */}
          <div className="flex flex-wrap items-center gap-2">
            {onReplayTour && (
              <button
                id="settings-top-tour-btn"
                type="button"
                onClick={onReplayTour}
                title="Start or replay the interactive product tour"
                className="inline-flex items-center px-3 py-1.5 border border-emerald-300 dark:border-emerald-700/80 rounded-lg text-xs font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-50/80 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900 transition-colors shadow-2xs cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 mr-1.5 text-emerald-600 dark:text-emerald-400" />
                <span>Product Tour</span>
              </button>
            )}

            {onSignOut && (
              <button
                id="settings-top-signout-btn"
                type="button"
                onClick={onSignOut}
                title="Sign out of your active SpendIntel session"
                className="inline-flex items-center px-3 py-1.5 border border-rose-200 dark:border-rose-800/80 rounded-lg text-xs font-semibold text-rose-700 dark:text-rose-300 bg-rose-50/80 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900 transition-colors shadow-2xs cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5 mr-1.5 text-rose-600 dark:text-rose-400" />
                <span>Sign Out</span>
              </button>
            )}

            {onRefresh && (
              <button
                id="settings-sync-feeds-btn"
                type="button"
                onClick={onRefresh}
                disabled={isSyncing}
                title="Synchronize corporate card feeds and ERP ledgers"
                className="inline-flex items-center px-3 py-1.5 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 mr-1.5 text-slate-600 dark:text-slate-400 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Syncing Feeds...' : 'Sync Feeds'}</span>
              </button>
            )}

            {onExportCSV && (
              <button
                id="settings-export-csv-btn"
                type="button"
                onClick={onExportCSV}
                title="Export all expense transactions and audit logs as CSV"
                className="inline-flex items-center px-3 py-1.5 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-2xs cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 mr-1.5 text-slate-600 dark:text-slate-400" />
                <span>Export CSV</span>
              </button>
            )}
          </div>

          {/* Subtab Switcher */}
          <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              id="settings-tab-integrations-btn"
              type="button"
              onClick={() => setActiveSettingsSubtab('integrations')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                activeSettingsSubtab === 'integrations'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Connected Apps ({integrations.filter(i => i.status === 'connected').length}/3)
            </button>
            <button
              id="settings-tab-preferences-btn"
              type="button"
              onClick={() => setActiveSettingsSubtab('preferences')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                activeSettingsSubtab === 'preferences'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Policy & General
            </button>
            <button
              id="settings-tab-logs-storage-btn"
              type="button"
              onClick={() => setActiveSettingsSubtab('logs_storage')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center space-x-1.5 ${
                activeSettingsSubtab === 'logs_storage'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Database className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Data & Audit Logs</span>
              <span className="bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold px-1.5 py-0.2 rounded-full border border-emerald-200 dark:border-emerald-800">
                {activityLogs.length}
              </span>
            </button>
          </div>
        </div>
      </div>

      {activeSettingsSubtab === 'integrations' && (
        <>
          {/* Integration Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {integrations.map((item) => {
              const isConnected = item.status === 'connected';
              const isConnecting = connectingId === item.id;
              const isSyncing = syncingId === item.id;

              return (
                <div 
                  key={item.id}
                  id={`integration-card-${item.id}`}
                  className={`bg-white dark:bg-slate-900 rounded-2xl border transition-all duration-200 flex flex-col justify-between overflow-hidden shadow-xs hover:shadow-md ${
                    isConnected ? 'border-slate-300 dark:border-slate-700' : 'border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/50'
                  }`}
                >
                  {/* Top Bar Accent */}
                  <div className="h-1.5 w-full bg-emerald-600 dark:bg-emerald-500" />

                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Logo, Status Badge, and Toggle Switch */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden shadow-xs shrink-0">
                            <AppLogo id={item.id} className="w-12 h-12" />
                          </div>
                          <div>
                            <h3 className="text-base font-bold text-slate-900 dark:text-white">{item.name}</h3>
                            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">{item.category}</span>
                          </div>
                        </div>

                        {/* Connection Toggle Switch */}
                        <button
                          type="button"
                          id={`toggle-${item.id}`}
                          onClick={() => handleToggleConnection(item.id)}
                          disabled={isConnecting}
                          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${
                            isConnected ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'
                          }`}
                          role="switch"
                          aria-checked={isConnected}
                          title={isConnected ? 'Click to disconnect' : 'Click to connect'}
                        >
                          <span
                            aria-hidden="true"
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                              isConnected ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>

                      {/* Tagline */}
                      <p className="text-xs text-slate-600 dark:text-slate-300 mb-4 leading-relaxed">
                        {item.tagline}
                      </p>

                      {/* Status Banner */}
                      <div className={`p-3 rounded-xl mb-4 border ${
                        isConnected 
                          ? 'bg-emerald-50/60 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300' 
                          : 'bg-slate-100/80 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                      }`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-1.5">
                            {isConnected ? (
                              <>
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-xs font-semibold">Connected</span>
                              </>
                            ) : (
                              <>
                                <span className="w-2 h-2 rounded-full bg-slate-400" />
                                <span className="text-xs font-semibold">Disconnected</span>
                              </>
                            )}
                          </div>
                          {item.lastSynced && (
                            <span className="text-[11px] text-slate-500 dark:text-slate-400">
                              Synced: {item.lastSynced}
                            </span>
                          )}
                        </div>

                        {isConnected && (
                          <div className="mt-2 text-[11px] text-emerald-700/80 dark:text-emerald-400 flex items-center justify-between pt-1.5 border-t border-emerald-100 dark:border-emerald-800/60">
                            <span>Interval: <strong>{item.syncInterval}</strong></span>
                            <span>Mapping: <strong className="font-mono">{item.mappedLedger.split(' - ')[0]}</strong></span>
                          </div>
                        )}
                      </div>

                      {/* Feature Bullet Points */}
                      <div className="space-y-2 mb-6">
                        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                          Capabilities & Sync Rules
                        </span>
                        {item.features.map((feature, idx) => (
                          <div key={idx} className="flex items-start space-x-2 text-xs text-slate-600 dark:text-slate-300">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Action Area */}
                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      {isConnected ? (
                        <>
                          <button
                            type="button"
                            onClick={() => handleManualSync(item.id)}
                            disabled={isSyncing}
                            className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer disabled:opacity-50"
                          >
                            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 text-slate-600 dark:text-slate-400 ${isSyncing ? 'animate-spin' : ''}`} />
                            {isSyncing ? 'Syncing...' : 'Sync Now'}
                          </button>
                          
                          <span className="text-[11px] text-slate-600 dark:text-slate-300 flex items-center">
                            <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-600 dark:text-emerald-400" />
                            Active Feed
                          </span>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleToggleConnection(item.id)}
                          disabled={isConnecting}
                          className="w-full inline-flex items-center justify-center px-4 py-2 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                        >
                          {isConnecting ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                              Establishing OAuth Handshake...
                            </>
                          ) : (
                            <>
                              <Zap className="w-3.5 h-3.5 mr-1.5" />
                              Connect {item.name}
                            </>
                          )}
                        </button>
                      )}
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {activeSettingsSubtab === 'preferences' && (
        /* Preferences & Enterprise Policy Rules Settings */
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-6 transition-colors duration-200">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center">
              <Sliders className="w-4 h-4 mr-2 text-slate-900 dark:text-slate-100" />
              Automated Accounting, Appearance & Compliance Preferences
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Configure system color theme, corporate spend policy tolerances, data export feeds, and sovereign reporting baselines.
            </p>
          </div>

          {/* System Appearance & Theme Mode Section */}
          <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <label className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center">
                  {isDark ? <Moon className="w-4 h-4 mr-2 text-emerald-400" /> : <Sun className="w-4 h-4 mr-2 text-emerald-600" />}
                  Application Appearance & Color Theme
                </label>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Toggle between high-contrast daylight theme and dark mode across the entire SpendIntel platform.
                </p>
              </div>

              {/* Direct Quick Toggle Switch */}
              <div className="flex items-center space-x-3">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {isDark ? 'Dark Mode Active' : 'Light Mode Active'}
                </span>
                <button
                  id="settings-theme-toggle-btn"
                  type="button"
                  onClick={() => onToggleTheme && onToggleTheme()}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${
                    isDark ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                  role="switch"
                  aria-checked={isDark}
                  title="Toggle Light / Dark Theme"
                >
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                      isDark ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Visual Theme Selection Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              {/* Light Theme Option Card */}
              <button
                type="button"
                onClick={() => onToggleTheme && onToggleTheme('light')}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex items-start space-x-3.5 ${
                  !isDark 
                    ? 'bg-white border-emerald-500 ring-2 ring-emerald-500/20 shadow-sm' 
                    : 'bg-slate-900/60 border-slate-700/80 hover:border-slate-600'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0">
                  <Sun className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">Light Theme</h4>
                    {!isDark && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">Active</span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    Crisp white background, high-contrast dark slate typography, optimal for daytime analysis.
                  </p>
                </div>
              </button>

              {/* Dark Theme Option Card */}
              <button
                type="button"
                onClick={() => onToggleTheme && onToggleTheme('dark')}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex items-start space-x-3.5 ${
                  isDark 
                    ? 'bg-slate-900 border-emerald-500 ring-2 ring-emerald-500/20 shadow-sm' 
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0">
                  <Moon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">Dark Theme</h4>
                    {isDark && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">Active</span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    Deep slate-950 canvas with emerald accents, reduced glare for low-light financial auditing.
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Active Session & Account Classification Card */}
          {session && (
            <div className="p-4.5 rounded-2xl border border-emerald-200 dark:border-emerald-800/80 bg-emerald-50/50 dark:bg-emerald-950/30 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex items-center space-x-3.5">
                {session.user.avatarUrl ? (
                  <img 
                    src={session.user.avatarUrl} 
                    alt={session.user.name} 
                    referrerPolicy="no-referrer"
                    className="w-12 h-12 rounded-2xl object-cover border-2 border-emerald-500 shadow-2xs shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold text-base shadow-2xs shrink-0">
                    {session.user.name.charAt(0)}
                  </div>
                )}
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">{session.user.name}</h4>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                      {session.user.companyType} Edition
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      {session.user.role}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 mt-0.5">
                    {session.user.title || session.user.role} • {session.user.department ? `${session.user.department} Dept` : 'Finance'}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {session.user.email} • {session.user.companyName} {session.user.location ? `• ${session.user.location}` : ''}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                {onOpenProfileEdit && (
                  <button
                    type="button"
                    id="settings-edit-profile-btn"
                    onClick={onOpenProfileEdit}
                    className="inline-flex items-center px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer"
                  >
                    <UserCog className="w-3.5 h-3.5 mr-1.5 stroke-[2.5]" />
                    <span>Edit Profile</span>
                  </button>
                )}

                {onReplayTour && (
                  <button
                    type="button"
                    onClick={onReplayTour}
                    className="inline-flex items-center px-3 py-2 bg-white dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-slate-700 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 rounded-xl text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 mr-1.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Replay Tour</span>
                  </button>
                )}

                {onSignOut && (
                  <button
                    type="button"
                    onClick={onSignOut}
                    className="inline-flex items-center px-3 py-2 bg-white dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 rounded-xl text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5 mr-1.5 text-rose-500 dark:text-rose-400" />
                    <span>Sign Out</span>
                  </button>
                )}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            
            {/* CSV Data Export Card */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-3">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider block">
                General Ledger Data Export (CSV)
              </label>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Download the complete transaction ledger, audit compliance flags, and department expenses in your active currency ({currencyCode}).
              </p>
              {onExportCSV && (
                <button
                  id="settings-preferences-export-csv-btn"
                  type="button"
                  onClick={onExportCSV}
                  className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg text-xs font-semibold text-slate-900 dark:text-white transition-colors shadow-2xs cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 mr-2 text-slate-600 dark:text-slate-400" />
                  <span>Download Ledger CSV ({currencyCode})</span>
                </button>
              )}
            </div>

            {/* Live Feed Synchronization Card */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-3">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider block">
                Card & ERP Feed Synchronization
              </label>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Trigger an on-demand synchronization cycle across all connected corporate cards and accounting general ledgers.
              </p>
              {onRefresh && (
                <button
                  id="settings-preferences-sync-btn"
                  type="button"
                  onClick={onRefresh}
                  disabled={isSyncing}
                  className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg text-xs font-semibold text-slate-900 dark:text-white transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 mr-2 text-slate-600 dark:text-slate-400 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>{isSyncing ? 'Syncing Feeds...' : 'Synchronize All Feeds'}</span>
                </button>
              )}
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-3">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider block">
                Receipt Verification Threshold
              </label>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Any expense exceeding this amount without an itemized receipt will automatically be flagged by the Policy Engine.
              </p>
              <div className="flex items-center space-x-3">
                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">$</span>
                <input
                  type="number"
                  value={receiptUploadRequirement}
                  onChange={(e) => setReceiptUploadRequirement(Number(e.target.value))}
                  className="w-28 px-3 py-1.5 border border-slate-300 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-800 font-semibold text-slate-900 dark:text-white"
                />
                <span className="text-xs text-slate-500 dark:text-slate-400">Threshold limit</span>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-3">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider block">
                Primary Reporting Sovereign Currency
              </label>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                All foreign transactions will automatically convert to this baseline currency for GAAP consolidation.
              </p>
              <button
                type="button"
                onClick={onOpenCurrencyModal}
                className="w-full flex items-center justify-between px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 rounded-lg text-xs font-semibold text-slate-900 dark:text-white transition-colors shadow-2xs cursor-pointer"
              >
                <span>Active Currency: <strong className="font-mono text-slate-900 dark:text-emerald-400">{currencyCode}</strong></span>
                <span className="text-slate-600 dark:text-slate-300 font-normal">Switch Country Currency &rarr;</span>
              </button>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                  Automatic Ledger Posting
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Instantly post approved expenses to QuickBooks/Xero without requiring manual accountant export.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAutoReconcile(!autoReconcile)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  autoReconcile ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    autoReconcile ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                  Strict Per-Diem Enforcement
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Enforce strict GSA hotel ($250/night) and meal ($75/day) limits across sales and engineering travel.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setStrictPerDiem(!strictPerDiem)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  strictPerDiem ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    strictPerDiem ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

          </div>

          <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              onClick={() => onNotify('SpendIntel corporate policy preferences saved successfully.')}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer ring-1 ring-emerald-700/20"
            >
              Save Policy Rules
            </button>
          </div>
        </div>
      )}

      {activeSettingsSubtab === 'logs_storage' && (
        /* Data Persistence & User Activity Logs View */
        <div className="space-y-6">
          
          {/* Storage & Company Profile Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs transition-colors duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
              <div>
                <div className="flex items-center space-x-2">
                  <HardDrive className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Persistent Data Engine & Corporate Ledger Profile
                  </h3>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    <ShieldCheck className="w-3 h-3 mr-1" /> Safe Restart Enabled
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  All expenses, approvals, receipts, currency settings, theme state, and user logs are automatically persisted locally. No data is lost upon browser refreshes or app restarts.
                </p>
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                <button
                  type="button"
                  onClick={handleDownloadBackup}
                  className="inline-flex items-center px-3.5 py-1.5 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer border border-transparent dark:border-slate-700"
                >
                  <Download className="w-3.5 h-3.5 mr-1.5" />
                  Backup (JSON)
                </button>

                <label className="inline-flex items-center px-3.5 py-1.5 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors shadow-2xs cursor-pointer bg-white dark:bg-slate-900">
                  <Upload className="w-3.5 h-3.5 mr-1.5 text-slate-600 dark:text-slate-400" />
                  <span>Restore</span>
                  <input
                    type="file"
                    accept=".json,application/json"
                    onChange={handleFileUploadBackup}
                    className="hidden"
                  />
                </label>

                {onResetAllData && (
                  confirmReset ? (
                    <div className="flex items-center space-x-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          onResetAllData();
                          setConfirmReset(false);
                        }}
                        className="inline-flex items-center px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer shadow-xs"
                      >
                        Confirm Reset?
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmReset(false)}
                        className="inline-flex items-center px-2 py-1.5 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 text-xs font-medium"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmReset(true)}
                      title="Reset all ledger and log state to initial defaults"
                      className="inline-flex items-center px-3 py-1.5 border border-rose-200 dark:border-rose-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-700 dark:text-rose-400 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5 mr-1" />
                      Reset
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Persistence Stats Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Stored Transactions</span>
                <span className="text-base font-bold text-slate-900 dark:text-white font-mono">{expensesCount} Records</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Audit Activity Logs</span>
                <span className="text-base font-bold text-slate-900 dark:text-white font-mono">{activityLogs.length} Events</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Active Currency</span>
                <span className="text-base font-bold text-slate-900 dark:text-white font-mono">{currencyCode}</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Last State Persisted</span>
                <span className="text-base font-bold text-emerald-700 dark:text-emerald-400 font-mono">{lastSaved}</span>
              </div>
            </div>

            {/* Corporate Profile Card */}
            <div className="mt-2 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Building2 className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Company Entity & Accounting Profile
                  </h4>
                </div>
                {!isEditingCompany && (
                  <button
                    type="button"
                    onClick={() => setIsEditingCompany(true)}
                    className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 cursor-pointer"
                  >
                    Edit Profile
                  </button>
                )}
              </div>

              {isEditingCompany ? (
                <form onSubmit={handleSaveCompany} className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">Company Entity Name</label>
                    <input
                      type="text"
                      required
                      value={companyForm.companyName}
                      onChange={(e) => setCompanyForm({ ...companyForm, companyName: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">Legal Entity Structure</label>
                    <input
                      type="text"
                      required
                      value={companyForm.legalEntity}
                      onChange={(e) => setCompanyForm({ ...companyForm, legalEntity: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">Tax ID / EIN</label>
                    <input
                      type="text"
                      required
                      value={companyForm.taxId}
                      onChange={(e) => setCompanyForm({ ...companyForm, taxId: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">Accounting Standard</label>
                    <select
                      value={companyForm.accountingStandard}
                      onChange={(e) => setCompanyForm({ ...companyForm, accountingStandard: e.target.value as any })}
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white"
                    >
                      <option value="US_GAAP">US GAAP (FASB ASC 606)</option>
                      <option value="IFRS">IFRS (International Financial Reporting)</option>
                      <option value="UK_GAAP">UK GAAP (FRS 102)</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2 flex justify-end space-x-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsEditingCompany(false)}
                      className="px-3 py-1 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-slate-900 dark:bg-slate-700 text-white rounded-lg text-xs font-semibold"
                    >
                      Save Profile
                    </button>
                  </div>
                </form>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 bg-slate-50/70 dark:bg-slate-800/40 rounded-xl border border-slate-200/70 dark:border-slate-700/70">
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase block">Company</span>
                    <strong className="text-slate-900 dark:text-white">{companyProfile.companyName}</strong>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">{companyProfile.legalEntity}</div>
                  </div>
                  <div className="p-3 bg-slate-50/70 dark:bg-slate-800/40 rounded-xl border border-slate-200/70 dark:border-slate-700/70">
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase block">Tax ID / Standard</span>
                    <strong className="text-slate-900 dark:text-white">{companyProfile.taxId}</strong>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">{companyProfile.accountingStandard.replace('_', ' ')}</div>
                  </div>
                  <div className="p-3 bg-slate-50/70 dark:bg-slate-800/40 rounded-xl border border-slate-200/70 dark:border-slate-700/70">
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase block">Fiscal Year End</span>
                    <strong className="text-slate-900 dark:text-white">{companyProfile.fiscalYearEnd}</strong>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">Base Currency: {companyProfile.defaultCurrency}</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* User Activity & Compliance Audit Log History */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-4 transition-colors duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center">
                  <History className="w-4 h-4 mr-2 text-emerald-600 dark:text-emerald-400" />
                  Live User Actions & Compliance Audit Trail
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Verifiable chronological record of all expense logs, 1-click approvals, policy waivers, scans, and system events.
                </p>
              </div>

              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shrink-0">
                <Lock className="w-3.5 h-3.5 mr-1" /> GAAP & SOC2 Audit Trail
              </span>
            </div>

            {/* Search & Filter Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter logs by title, user, details, or action type..."
                  value={logSearch}
                  onChange={(e) => setLogSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400 text-slate-900 dark:text-white"
                />
              </div>

              <select
                value={logActionFilter}
                onChange={(e) => setLogActionFilter(e.target.value)}
                className="px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 shrink-0"
              >
                <option value="ALL">All Event Types ({activityLogs.length})</option>
                <option value="EXPENSE_CREATED">Expense Created</option>
                <option value="BULK_APPROVAL">Bulk Approval</option>
                <option value="EXPENSE_STATUS_CHANGE">Status Change</option>
                <option value="VIOLATION_WAIVED">Violation Waived</option>
                <option value="CURRENCY_CHANGED">Currency Changed</option>
                <option value="REAUDIT_EXECUTED">Policy Audit Scans</option>
                <option value="INTEGRATION_SYNC">Integration Sync</option>
                <option value="CSV_EXPORTED">CSV Exports</option>
              </select>
            </div>

            {/* Log Feed */}
            {filteredLogs.length === 0 ? (
              <div className="py-12 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-800/40 p-6">
                <History className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-900 dark:text-white">No matching audit logs found</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 max-w-sm mx-auto">
                  Audit events record automatically whenever you add expenses, approve items, waive flags, or export data.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[500px] overflow-y-auto pr-1">
                {filteredLogs.map((log) => {
                  const isSuccess = log.severity === 'success' || log.actionType === 'BULK_APPROVAL' || log.actionType === 'EXPENSE_STATUS_CHANGE';
                  const isAlert = log.severity === 'alert' || log.actionType === 'EXPENSE_REJECTED';
                  const isWarning = log.severity === 'warning' || log.actionType === 'VIOLATION_WAIVED';

                  return (
                    <div key={log.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-50/60 dark:hover:bg-slate-800/60 p-2 rounded-xl transition-colors">
                      <div className="flex items-start space-x-3">
                        <div className={`shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold mt-0.5 ${
                          isAlert ? 'bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300' :
                          isWarning ? 'bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300' :
                          isSuccess ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300' :
                          'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}>
                          {log.actionType === 'BULK_APPROVAL' ? '✓✓' :
                           log.actionType === 'EXPENSE_CREATED' ? '+' :
                           log.actionType === 'VIOLATION_WAIVED' ? '⚠' :
                           log.actionType === 'CURRENCY_CHANGED' ? '🌐' :
                           log.actionType === 'REAUDIT_EXECUTED' ? '🔍' :
                           '•'}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-bold text-slate-900 dark:text-white">{log.title}</span>
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                              {log.actionType}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">{log.details}</p>
                          <div className="flex items-center space-x-2 text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                            <span>Actor: <strong className="text-slate-600 dark:text-slate-300 font-medium">{log.actor}</strong></span>
                            <span>•</span>
                            <span>{new Date(log.timestamp).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right sm:pl-4 shrink-0">
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono block">
                          {log.displayTime}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
};
