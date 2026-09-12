import React, { useState, useRef, useEffect } from 'react';
import { Plus, ShieldCheck, LayoutDashboard, Blocks, Search, Printer, Globe, User, LogOut, Sparkles, Building2, Layers, ChevronDown, Sun, Moon, UserCog, RefreshCw, Server } from 'lucide-react';
import { ActiveNavTab, AuthUser } from '../types';
import { SpendIntelLogo } from './SpendIntelLogo';
import { getCurrencyInfo } from '../utils/currencies';
import { syncDataToServer } from '../utils/syncService';

interface HeaderProps {
  onOpenNewExpense: () => void;
  activeTab: ActiveNavTab;
  onTabChange: (tab: ActiveNavTab) => void;
  flaggedCount?: number;
  onSearchClick?: () => void;
  onOpenPrintReport?: () => void;
  activeCurrencyCode?: string;
  onOpenCurrencyModal?: () => void;
  user?: AuthUser | null;
  onSignOut?: () => void;
  onReplayTour?: () => void;
  onSwitchAccount?: () => void;
  onOpenProfileEdit?: () => void;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
  onOpenDailySummary?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenNewExpense,
  activeTab,
  onTabChange,
  flaggedCount = 0,
  onSearchClick,
  onOpenPrintReport,
  activeCurrencyCode = 'USD',
  onOpenCurrencyModal,
  user,
  onSignOut,
  onReplayTour,
  onSwitchAccount,
  onOpenProfileEdit,
  theme = 'light',
  onToggleTheme,
  onOpenDailySummary,
}) => {
  const currencyInfo = getCurrencyInfo(activeCurrencyCode);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const isDark = theme === 'dark';

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="bg-white/95 dark:bg-slate-900/95 border-b border-slate-200/90 dark:border-slate-800 sticky top-0 z-30 shadow-2xs backdrop-blur-md transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          {/* SpendIntel Custom Geometric SVG Logo & Brand Title */}
          <div className="flex items-center space-x-3.5">
            <SpendIntelLogo size="md" showWordmark={true} />
            <div className="hidden lg:flex items-center space-x-2 pl-3 border-l border-slate-200 dark:border-slate-800">
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                <ShieldCheck className="w-3 h-3 mr-1 text-slate-600 dark:text-emerald-400" /> SOC2 / GAAP Verified
              </span>
              {user && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  {user.companyType === 'Corporate' && <Globe className="w-3 h-3 mr-1 text-emerald-600 dark:text-emerald-400" />}
                  {user.companyType === 'Enterprise' && <Layers className="w-3 h-3 mr-1 text-emerald-600 dark:text-emerald-400" />}
                  {user.companyType === 'Small Business' && <Building2 className="w-3 h-3 mr-1 text-emerald-600 dark:text-emerald-400" />}
                  {user.companyType}
                </span>
              )}
            </div>
          </div>

          {/* Center Navigation Tabs (Desktop / Tablet) */}
          <div className="hidden md:flex items-center bg-slate-100/90 dark:bg-slate-800/90 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              id="desktop-nav-home-btn"
              type="button"
              onClick={() => onTabChange('home')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'home'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <LayoutDashboard className={`w-4 h-4 ${activeTab === 'home' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'}`} />
              <span>Dashboard</span>
              {flaggedCount > 0 && (
                <span className="ml-1.5 px-1.5 py-0.2 rounded-md text-[10px] font-bold bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                  {flaggedCount}
                </span>
              )}
            </button>

            <button
              id="desktop-nav-settings-btn"
              type="button"
              onClick={() => onTabChange('settings')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'settings'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Blocks className={`w-4 h-4 ${activeTab === 'settings' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'}`} />
              <span>Connected Apps & Settings</span>
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            {/* Dark / Light Mode Toggle in Header */}
            {onToggleTheme && (
              <button
                id="header-theme-toggle-btn"
                type="button"
                onClick={onToggleTheme}
                title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
                className="inline-flex items-center justify-center p-2 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-2xs cursor-pointer"
                aria-label={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
              >
                {isDark ? (
                  <Sun className="w-4 h-4 text-emerald-400 hover:rotate-45 transition-transform" />
                ) : (
                  <Moon className="w-4 h-4 text-slate-600 dark:text-slate-300 hover:-rotate-12 transition-transform" />
                )}
              </button>
            )}

            {/* Daily Spending Briefing Toast Replay Button */}
            {onOpenDailySummary && (
              <button
                id="header-daily-summary-toast-btn"
                type="button"
                onClick={onOpenDailySummary}
                title="View Daily Spending Summary Toast Alert"
                className="inline-flex items-center px-2.5 py-1.5 border border-emerald-300 dark:border-emerald-700/80 rounded-lg text-xs font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-50/80 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/80 transition-all shadow-2xs cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 sm:mr-1.5 text-emerald-600 dark:text-emerald-400" />
                <span className="hidden sm:inline">Daily Brief</span>
                <span className="sm:hidden">Brief</span>
              </button>
            )}

            {/* Real-time Currency Switcher Button */}
            {onOpenCurrencyModal && (
              <button
                id="header-currency-selector-btn"
                type="button"
                onClick={onOpenCurrencyModal}
                title={`Current Currency: ${currencyInfo.name} (${activeCurrencyCode}) - Click to convert rates in real-time`}
                className="inline-flex items-center px-2.5 py-1.5 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-400 dark:hover:border-slate-600 transition-all shadow-2xs cursor-pointer"
              >
                <span className="mr-1.5 text-sm">{currencyInfo.flag}</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">{activeCurrencyCode}</span>
                <span className="text-slate-400 dark:text-slate-500 ml-1">({currencyInfo.symbol})</span>
              </button>
            )}

            {onSearchClick && (
              <button
                id="header-search-descriptions-btn"
                type="button"
                onClick={onSearchClick}
                title="Search expense descriptions (Ctrl+K)"
                className="inline-flex items-center px-3 py-1.5 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-2xs cursor-pointer"
              >
                <Search className="w-3.5 h-3.5 sm:mr-1.5 text-slate-500 dark:text-slate-400" />
                <span className="hidden sm:inline">Search</span>
              </button>
            )}

            {onOpenPrintReport && (
              <button
                id="header-print-report-btn"
                type="button"
                onClick={onOpenPrintReport}
                title="Print simplified monthly spending report for physical filing"
                className="inline-flex items-center px-3 py-1.5 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-colors shadow-2xs cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5 sm:mr-1.5 text-slate-600 dark:text-slate-400" />
                <span className="hidden sm:inline">Print Report</span>
                <span className="sm:hidden">Print</span>
              </button>
            )}

            <button
              id="header-sync-server-btn"
              type="button"
              onClick={() => syncDataToServer()}
              title="Sync transaction data to backend server"
              className="inline-flex items-center px-3 py-1.5 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-2xs cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 sm:mr-1.5 text-emerald-600 dark:text-emerald-400" />
              <span className="hidden sm:inline">Sync Server</span>
              <span className="sm:hidden">Sync</span>
            </button>

            <button
              id="header-log-expense-btn"
              type="button"
              onClick={onOpenNewExpense}
              className="inline-flex items-center px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 mr-1.5 stroke-[2.5]" />
              Log Expense
            </button>

            {/* User Session Profile & Actions Dropdown */}
            {user && (
              <div className="relative pl-1" ref={profileRef}>
                <button
                  type="button"
                  id="header-user-profile-btn"
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center space-x-2 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                  title={`${user.name} (${user.title || user.role}) - ${user.companyType}`}
                >
                  {user.avatarUrl ? (
                    <img 
                      src={user.avatarUrl} 
                      alt={user.name} 
                      referrerPolicy="no-referrer"
                      className="w-7 h-7 rounded-lg object-cover border border-emerald-500/80 shadow-2xs"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shadow-2xs">
                      {user.name.charAt(0)}
                    </div>
                  )}
                  <div className="hidden xl:block text-left pr-1">
                    <span className="text-xs font-bold text-slate-900 dark:text-white block leading-tight max-w-[100px] truncate">
                      {user.name}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block leading-none">
                      {user.companyType}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* Dropdown Menu */}
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800">
                      <div className="flex items-center space-x-3 mb-2">
                        {user.avatarUrl ? (
                          <img 
                            src={user.avatarUrl} 
                            alt={user.name} 
                            referrerPolicy="no-referrer"
                            className="w-10 h-10 rounded-xl object-cover border border-emerald-500 shadow-2xs shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-sm font-bold shadow-2xs shrink-0">
                            {user.name.charAt(0)}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{user.name}</p>
                          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium truncate">
                            {user.title || user.role}
                          </p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                          {user.role}
                        </span>
                        <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-1.5 py-0.5 rounded">
                          {user.companyType}
                        </span>
                      </div>
                    </div>

                    <div className="p-1 space-y-0.5">
                      {onOpenProfileEdit && (
                        <button
                          type="button"
                          id="menu-edit-profile-btn"
                          onClick={() => {
                            setIsProfileOpen(false);
                            onOpenProfileEdit();
                          }}
                          className="w-full flex items-center space-x-2 px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 hover:text-emerald-700 dark:hover:text-emerald-400 rounded-lg transition-colors cursor-pointer"
                        >
                          <UserCog className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          <span>Edit Profile & Identity</span>
                        </button>
                      )}

                      {onToggleTheme && (
                        <button
                          type="button"
                          id="menu-theme-toggle-btn"
                          onClick={() => {
                            setIsProfileOpen(false);
                            onToggleTheme();
                          }}
                          className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                        >
                          <div className="flex items-center space-x-2">
                            {isDark ? (
                              <Sun className="w-4 h-4 text-emerald-400" />
                            ) : (
                              <Moon className="w-4 h-4 text-slate-500" />
                            )}
                            <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
                          </div>
                          <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase">
                            {theme}
                          </span>
                        </button>
                      )}

                      <button
                        type="button"
                        id="menu-settings-btn"
                        onClick={() => {
                          setIsProfileOpen(false);
                          onTabChange('settings');
                        }}
                        className="w-full flex items-center space-x-2 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-emerald-700 dark:hover:text-emerald-400 rounded-lg transition-colors cursor-pointer"
                      >
                        <Blocks className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <span>Settings, Tour & Sign Out</span>
                      </button>

                      {onSwitchAccount && (
                        <button
                          type="button"
                          id="menu-switch-account-btn"
                          onClick={() => {
                            setIsProfileOpen(false);
                            onSwitchAccount();
                          }}
                          className="w-full flex items-center space-x-2 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                        >
                          <User className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                          <span>Switch User / Account</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};


