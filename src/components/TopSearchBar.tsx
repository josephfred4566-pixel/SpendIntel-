import React, { useRef } from 'react';
import { Search, X, ArrowDown, Tag } from 'lucide-react';

interface TopSearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  matchCount?: number;
  totalCount?: number;
}

const POPULAR_DESCRIPTIONS = [
  'Client Lunch',
  'AWS Cloud Hosting',
  'Delta Air Lines',
  'Team Dinner',
  'Software License',
  'Hotel Lodging',
  'Hardware Monitor',
];

export const TopSearchBar: React.FC<TopSearchBarProps> = ({
  searchQuery,
  onSearchChange,
  matchCount,
  totalCount,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    scrollToTransactions();
  };

  const scrollToTransactions = () => {
    const el = document.getElementById('transaction-feed');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleSelectSuggestion = (desc: string) => {
    onSearchChange(desc);
    setTimeout(() => {
      scrollToTransactions();
    }, 100);
  };

  return (
    <div
      id="home-top-search-section"
      className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs"
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-3">
        <div>
          <h2 className="text-sm font-bold text-slate-900 flex items-center tracking-tight uppercase tracking-wide">
            <Search className="w-4 h-4 mr-2 text-slate-900" />
            Search Expenses by Description & Merchant
          </h2>
          <p className="text-xs text-slate-500">
            Query corporate expenses by description keywords, merchant name, employee, or policy tags
          </p>
        </div>

        {searchQuery && matchCount !== undefined && (
          <div className="flex items-center space-x-2 text-xs">
            <span className="px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 text-slate-900 font-semibold font-mono">
              {matchCount} of {totalCount} matching
            </span>
            <button
              type="button"
              onClick={scrollToTransactions}
              className="inline-flex items-center text-slate-700 hover:text-slate-950 font-semibold cursor-pointer py-1 px-2 hover:bg-slate-100 rounded-md transition-colors"
            >
              Jump to Table <ArrowDown className="w-3.5 h-3.5 ml-1" />
            </button>
          </div>
        )}
      </div>

      {/* Main Search Input & Action Button */}
      <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-stretch gap-2.5">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Search className="w-4 h-4 text-slate-400" />
          </div>
          <input
            ref={inputRef}
            id="home-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                onSearchChange('');
              }
            }}
            placeholder="Search description (e.g. client lunch, AWS server, flight to Chicago, hotel stay, monitors)..."
            className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white transition-all shadow-2xs"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                onSearchChange('');
                inputRef.current?.focus();
              }}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer transition-colors"
              title="Clear search"
              aria-label="Clear description search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Explicit Search Button */}
        <button
          id="home-search-button"
          type="submit"
          className="inline-flex items-center justify-center px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-all cursor-pointer shrink-0"
        >
          <Search className="w-4 h-4 mr-1.5" />
          Search
        </button>

        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            className="inline-flex items-center justify-center px-3.5 py-2.5 border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-medium transition-colors cursor-pointer shrink-0"
          >
            Clear
          </button>
        )}
      </form>

      {/* Suggested Description Chips */}
      <div className="mt-3 pt-3 border-t border-slate-200 flex flex-wrap items-center gap-1.5">
        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center mr-1">
          <Tag className="w-3 h-3 mr-1" /> Quick suggestions:
        </span>
        {POPULAR_DESCRIPTIONS.map((desc) => {
          const isSelected = searchQuery.toLowerCase() === desc.toLowerCase();
          return (
            <button
              key={desc}
              type="button"
              onClick={() => handleSelectSuggestion(desc)}
              className={`text-[11px] px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                isSelected
                  ? 'bg-slate-900 text-white font-semibold shadow-2xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              {desc}
            </button>
          );
        })}
      </div>
    </div>
  );
};
