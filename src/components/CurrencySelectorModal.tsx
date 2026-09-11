import React, { useState, useMemo } from 'react';
import { 
  WORLD_CURRENCIES, 
  WORLD_CURRENCIES_BY_CODE, 
  WORLD_CURRENCIES_BY_COUNTRY,
  WORLD_CURRENCIES_BY_NAME,
  POPULAR_CURRENCY_CODES, 
  CurrencyInfo 
} from '../utils/currencies';
import { Search, X, Check, Globe, ArrowDownAZ, ArrowUpDown } from 'lucide-react';

interface CurrencySelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeCurrencyCode: string;
  onSelectCurrency: (currency: CurrencyInfo) => void;
}

type SortOption = 'name' | 'code' | 'country';

export const CurrencySelectorModal: React.FC<CurrencySelectorModalProps> = ({
  isOpen,
  onClose,
  activeCurrencyCode,
  onSelectCurrency,
}) => {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('name');
  const [selectedLetter, setSelectedLetter] = useState<string>('ALL');

  // Base list sorted by selected mode
  const baseSortedList = useMemo(() => {
    if (sortBy === 'code') return WORLD_CURRENCIES_BY_CODE;
    if (sortBy === 'country') return WORLD_CURRENCIES_BY_COUNTRY;
    return WORLD_CURRENCIES_BY_NAME;
  }, [sortBy]);

  // Available initial letters for alphabetical quick-jump
  const availableLetters = useMemo(() => {
    const letters = new Set<string>();
    baseSortedList.forEach(c => {
      const char = sortBy === 'code' 
        ? c.code[0].toUpperCase()
        : sortBy === 'country'
          ? c.country[0].toUpperCase()
          : c.name[0].toUpperCase();
      if (char >= 'A' && char <= 'Z') {
        letters.add(char);
      }
    });
    return Array.from(letters).sort();
  }, [baseSortedList, sortBy]);

  // Filtered and alphabetically ordered list
  const filteredCurrencies = useMemo(() => {
    let list = baseSortedList;

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        c =>
          c.code.toLowerCase().includes(q) ||
          c.name.toLowerCase().includes(q) ||
          c.country.toLowerCase().includes(q) ||
          c.symbol.toLowerCase().includes(q)
      );
    } else if (selectedLetter !== 'ALL') {
      list = list.filter(c => {
        const char = sortBy === 'code' 
          ? c.code[0].toUpperCase()
          : sortBy === 'country'
            ? c.country[0].toUpperCase()
            : c.name[0].toUpperCase();
        return char === selectedLetter;
      });
    }

    return list;
  }, [baseSortedList, search, selectedLetter, sortBy]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-slate-900">Select Global Currency</h2>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Alphabetical Order (A–Z)
                </span>
              </div>
              <p className="text-xs text-slate-500">
                All dashboard totals, department budgets, and ledger items automatically convert in real time.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
            aria-label="Close currency modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Sort Controls Bar */}
        <div className="p-4 border-b border-slate-200 bg-white space-y-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="currency-search-input"
                type="text"
                placeholder="Search by country, currency name, or ISO code (e.g. Euro, Yen, Dollar, India, GBP, NGN)..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  if (e.target.value) setSelectedLetter('ALL');
                }}
                autoFocus
                className="w-full pl-10 pr-10 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white text-slate-900 placeholder-slate-400 shadow-2xs transition-all"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Alphabetical Sort Mode Switcher */}
            <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 hidden md:inline">
                Sort A–Z By:
              </span>
              <button
                type="button"
                id="currency-sort-name-btn"
                onClick={() => setSortBy('name')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  sortBy === 'name'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Sort Alphabetically by Currency Name (e.g. Afghan Afghani, US Dollar)"
              >
                Name A–Z
              </button>
              <button
                type="button"
                id="currency-sort-code-btn"
                onClick={() => setSortBy('code')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  sortBy === 'code'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Sort Alphabetically by 3-Letter ISO Code (e.g. AED, AFN, ALL, USD)"
              >
                Code A–Z
              </button>
              <button
                type="button"
                id="currency-sort-country-btn"
                onClick={() => setSortBy('country')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  sortBy === 'country'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Sort Alphabetically by Sovereign Country"
              >
                Country A–Z
              </button>
            </div>
          </div>

          {/* Quick Alphabet Jump Bar (when not actively searching) */}
          {!search && (
            <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[11px] scrollbar-none pt-1">
              <button
                type="button"
                onClick={() => setSelectedLetter('ALL')}
                className={`px-2 py-0.5 rounded-md font-bold transition-colors cursor-pointer shrink-0 ${
                  selectedLetter === 'ALL'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                ALL ({WORLD_CURRENCIES.length})
              </button>
              {availableLetters.map(letter => (
                <button
                  key={letter}
                  type="button"
                  onClick={() => setSelectedLetter(letter)}
                  className={`w-6 h-6 rounded-md font-bold flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                    selectedLetter === letter
                      ? 'bg-slate-900 text-white shadow-2xs'
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-200 border border-slate-200'
                  }`}
                >
                  {letter}
                </button>
              ))}
            </div>
          )}

          {/* Popular Currencies Bar */}
          <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-slate-100">
            <span className="text-[11px] font-bold text-slate-500 mr-1 uppercase tracking-wider">
              Popular:
            </span>
            {POPULAR_CURRENCY_CODES.map((code) => {
              const cur = WORLD_CURRENCIES.find(c => c.code === code);
              if (!cur) return null;
              const isSelected = cur.code === activeCurrencyCode;
              return (
                <button
                  key={code}
                  type="button"
                  id={`popular-currency-${code}`}
                  onClick={() => {
                    onSelectCurrency(cur);
                    onClose();
                  }}
                  className={`px-2 py-0.8 rounded-lg text-xs font-semibold flex items-center space-x-1 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-900 text-white shadow-2xs ring-1 ring-slate-900'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900'
                  }`}
                >
                  <span>{cur.flag}</span>
                  <span className="font-mono font-bold">{cur.code}</span>
                  <span className="text-[11px] opacity-75 font-mono">({cur.symbol})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Alphabetically Ordered Currency Cards Grid */}
        <div className="overflow-y-auto flex-1 p-4 bg-slate-50/50">
          {filteredCurrencies.length === 0 ? (
            <div className="py-12 text-center text-slate-500 bg-white rounded-xl border border-dashed border-slate-200 p-8">
              <Globe className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              <p className="text-sm font-semibold text-slate-700">No matching sovereign currencies found</p>
              <p className="text-xs text-slate-400 mt-0.5">Try searching with a country name, currency name, or ISO code</p>
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="mt-3 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg"
                >
                  Clear Search Filter
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {filteredCurrencies.map((cur) => {
                const isSelected = cur.code === activeCurrencyCode;
                return (
                  <div
                    key={cur.code}
                    id={`currency-item-${cur.code}`}
                    onClick={() => {
                      onSelectCurrency(cur);
                      onClose();
                    }}
                    className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/80 ring-1 ring-emerald-600 shadow-xs'
                        : 'border-slate-200/90 hover:border-slate-400 bg-white hover:bg-slate-50 shadow-2xs'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <span className="text-2xl shrink-0 select-none drop-shadow-2xs" role="img" aria-label={cur.country}>
                        {cur.flag}
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center space-x-1.5">
                          <span className="font-bold text-xs text-slate-900 font-mono tracking-tight">
                            {cur.code}
                          </span>
                          <span className="font-bold text-xs text-slate-600 font-mono">
                            ({cur.symbol})
                          </span>
                          {isSelected && (
                            <span className="bg-emerald-700 text-white text-[9px] font-bold px-1.5 py-0.2 rounded">
                              ACTIVE
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-semibold text-slate-900 truncate" title={cur.name}>
                          {cur.name}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate" title={cur.country}>
                          {cur.country}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0 ml-2">
                      {isSelected ? (
                        <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-2xs">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full border border-slate-300 text-transparent flex items-center justify-center group-hover:border-slate-400">
                          •
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 sm:px-6 py-3 border-t border-slate-200 bg-slate-50 text-xs text-slate-500 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ArrowDownAZ className="w-4 h-4 text-slate-400" />
            <span>Showing <strong>{filteredCurrencies.length}</strong> of <strong>{WORLD_CURRENCIES.length}</strong> sovereign currencies</span>
          </div>
          <span className="font-semibold text-slate-700">ISO 4217 Standard</span>
        </div>
      </div>
    </div>
  );
};
