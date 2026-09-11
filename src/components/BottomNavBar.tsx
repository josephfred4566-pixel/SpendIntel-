import React from 'react';
import { Blocks, Plus } from 'lucide-react';
import { ActiveNavTab } from '../types';
import { SpendIntelIcon } from './SpendIntelLogo';

interface BottomNavBarProps {
  activeTab: ActiveNavTab;
  onTabChange: (tab: ActiveNavTab) => void;
  onOpenNewExpense: () => void;
  flaggedCount?: number;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  activeTab,
  onTabChange,
  onOpenNewExpense,
  flaggedCount = 0,
}) => {
  return (
    <nav
      id="bottom-navigation-bar"
      aria-label="Mobile Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-6 py-2 shadow-2xl md:hidden transition-transform duration-200 ease-in-out"
    >
      <div className="max-w-md mx-auto flex items-center justify-between relative">
        
        {/* Home / SpendIntel Dashboard Tab with App Icon */}
        <button
          id="mobile-nav-home-btn"
          type="button"
          onClick={() => onTabChange('home')}
          className={`flex flex-col items-center justify-center flex-1 py-1 px-2 rounded-xl transition-all duration-150 cursor-pointer ${
            activeTab === 'home'
              ? 'text-slate-900 font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div className="relative flex items-center justify-center">
            <SpendIntelIcon className={`w-5 h-5 transition-transform ${activeTab === 'home' ? 'scale-110' : 'opacity-80'}`} />
            {flaggedCount > 0 && (
              <span className="absolute -top-1 -right-2 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white animate-pulse" />
            )}
          </div>
          <span className={`text-[11px] mt-1 tracking-tight ${activeTab === 'home' ? 'text-emerald-600 font-bold' : ''}`}>
            SpendIntel
          </span>
        </button>

        {/* Primary Center Action Button ("+") with Emerald Theme */}
        <div className="flex-1 flex justify-center -translate-y-4">
          <button
            id="mobile-nav-add-expense-btn"
            type="button"
            onClick={onOpenNewExpense}
            className="w-13 h-13 rounded-full bg-emerald-600 text-white shadow-xl hover:bg-emerald-500 active:scale-95 flex items-center justify-center border-4 border-white transition-all focus:outline-none focus:ring-4 focus:ring-emerald-500/30 cursor-pointer"
            title="Log New Expense"
            aria-label="Log New Expense"
          >
            <Plus className="w-6 h-6 stroke-[2.8]" />
          </button>
        </div>

        {/* Settings / Integrations Tab */}
        <button
          id="mobile-nav-settings-btn"
          type="button"
          onClick={() => onTabChange('settings')}
          className={`flex flex-col items-center justify-center flex-1 py-1 px-2 rounded-xl transition-all duration-150 cursor-pointer ${
            activeTab === 'settings'
              ? 'text-slate-900 font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Blocks className={`w-5 h-5 transition-transform ${activeTab === 'settings' ? 'scale-110 text-emerald-600' : ''}`} />
          <span className={`text-[11px] mt-1 tracking-tight ${activeTab === 'settings' ? 'text-emerald-600 font-bold' : ''}`}>
            Settings
          </span>
        </button>

      </div>
    </nav>
  );
};

