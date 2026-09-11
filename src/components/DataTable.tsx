import React, { useState, useMemo } from 'react';
import { Expense, ExpenseCategory, ExpenseStatus, Department, PolicyViolation } from '../types';
import { formatMoney, getCurrencyInfo } from '../utils/currencies';
import { getExpenseAmountInCurrency, getExchangeRate } from '../utils/currencyConverter';
import { 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Eye, 
  Check, 
  CheckCheck,
  ShieldCheck,
  X, 
  ChevronLeft, 
  ChevronRight, 
  Receipt, 
  FileQuestion, 
  ShieldAlert, 
  AlertOctagon, 
  Building2, 
  Plus,
  ChevronDown,
  Globe 
} from 'lucide-react';
import { SpendIntelIcon } from './SpendIntelLogo';

interface DataTableProps {
  expenses: Expense[];
  selectedCategory: ExpenseCategory | 'All';
  onSelectCategory: (cat: ExpenseCategory | 'All') => void;
  selectedDepartment: Department | 'All';
  onSelectDepartment: (dept: Department | 'All') => void;
  onUpdateStatus: (id: string, newStatus: ExpenseStatus) => void;
  onBulkApprove?: (ids: string[]) => void;
  onViewReceipt: (expense: Expense) => void;
  onInspectAudit?: (expense: Expense) => void;
  onWaiveViolation?: (expenseId: string, violationId: string) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  currencyCode?: string;
  onLogExpenseClick?: () => void;
  onOpenCurrencyModal?: () => void;
}

export const DataTable: React.FC<DataTableProps> = ({
  expenses,
  selectedCategory,
  onSelectCategory,
  selectedDepartment,
  onSelectDepartment,
  onUpdateStatus,
  onBulkApprove,
  onViewReceipt,
  onInspectAudit,
  onWaiveViolation,
  searchQuery: propsSearchQuery,
  onSearchChange,
  currencyCode = 'USD',
  onLogExpenseClick,
}) => {
  const [internalSearchQuery, setInternalSearchQuery] = useState('');
  const searchQuery = propsSearchQuery !== undefined ? propsSearchQuery : internalSearchQuery;

  const handleUpdateSearch = (query: string) => {
    if (onSearchChange) {
      onSearchChange(query);
    } else {
      setInternalSearchQuery(query);
    }
    setCurrentPage(1);
  };

  const [statusFilter, setStatusFilter] = useState<ExpenseStatus | 'All' | 'Violations'>('All');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedViolationId, setExpandedViolationId] = useState<string | null>(null);
  const itemsPerPage = 8;

  // Filter expenses with department and policy checks
  const filteredExpenses = useMemo(() => {
    return expenses.filter(item => {
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
      const matchesDepartment = selectedDepartment === 'All' || item.department === selectedDepartment;
      
      let matchesStatus = true;
      if (statusFilter === 'Violations') {
        matchesStatus = Boolean(item.violations && item.violations.length > 0);
      } else if (statusFilter !== 'All') {
        matchesStatus = item.status === statusFilter;
      }

      let matchesSearch = true;
      const query = searchQuery.trim().toLowerCase();
      if (query) {
        const merchantMatch = item.merchant.toLowerCase().includes(query);
        const descriptionMatch = 
          (item.description || '').toLowerCase().includes(query) ||
          (item.notes || '').toLowerCase().includes(query);
        const employeeMatch = item.employeeName.toLowerCase().includes(query);
        const departmentMatch = item.department.toLowerCase().includes(query);
        const categoryMatch = item.category.toLowerCase().includes(query);
        const violationMatch = (item.violations || []).some(v => 
          v.ruleName.toLowerCase().includes(query) || 
          v.description.toLowerCase().includes(query) || 
          v.code.toLowerCase().includes(query)
        );

        matchesSearch = merchantMatch || descriptionMatch || employeeMatch || departmentMatch || categoryMatch || violationMatch;
      }
      
      return matchesCategory && matchesDepartment && matchesStatus && matchesSearch;
    });
  }, [expenses, selectedCategory, selectedDepartment, statusFilter, searchQuery]);

  const totalPages = Math.ceil(filteredExpenses.length / itemsPerPage) || 1;
  const paginatedExpenses = filteredExpenses.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Non-flagged (compliant) expenses on the current page that can be approved
  const nonFlaggedOnPage = useMemo(() => {
    return paginatedExpenses.filter(item => (!item.violations || item.violations.length === 0) && item.status !== 'Approved');
  }, [paginatedExpenses]);

  // All non-flagged (compliant) expenses across current filtered view
  const nonFlaggedAllFiltered = useMemo(() => {
    return filteredExpenses.filter(item => (!item.violations || item.violations.length === 0) && item.status !== 'Approved');
  }, [filteredExpenses]);

  // Selected non-flagged items
  const selectedNonFlagged = useMemo(() => {
    return expenses.filter(e => selectedIds.includes(e.id) && (!e.violations || e.violations.length === 0) && e.status !== 'Approved');
  }, [expenses, selectedIds]);

  // Selected flagged items
  const selectedFlagged = useMemo(() => {
    return expenses.filter(e => selectedIds.includes(e.id) && e.violations && e.violations.length > 0);
  }, [expenses, selectedIds]);

  const selectedNonFlaggedAmount = useMemo(() => {
    return selectedNonFlagged.reduce((sum, e) => sum + getExpenseAmountInCurrency(e, currencyCode), 0);
  }, [selectedNonFlagged, currencyCode]);

  const isAllNonFlaggedOnPageSelected = nonFlaggedOnPage.length > 0 && nonFlaggedOnPage.every(item => selectedIds.includes(item.id));

  // Toggle selection for all non-flagged on the current page
  const toggleSelectAllNonFlaggedOnPage = () => {
    if (isAllNonFlaggedOnPageSelected) {
      // Deselect page items
      const pageIds = new Set(nonFlaggedOnPage.map(i => i.id));
      setSelectedIds(prev => prev.filter(id => !pageIds.has(id)));
    } else {
      // Select all non-flagged on this page
      const pageIds = nonFlaggedOnPage.map(i => i.id);
      setSelectedIds(prev => Array.from(new Set([...prev, ...pageIds])));
    }
  };

  // Select all non-flagged items across the entire filtered dataset
  const selectAllNonFlaggedInFilter = () => {
    const allIds = nonFlaggedAllFiltered.map(i => i.id);
    setSelectedIds(allIds);
  };

  const toggleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  // Single-click bulk approval for selected compliant / non-flagged expenses
  const handleBulkApproveNonFlagged = () => {
    const idsToApprove = selectedNonFlagged.map(e => e.id);
    if (idsToApprove.length === 0) return;

    if (onBulkApprove) {
      onBulkApprove(idsToApprove);
    } else {
      idsToApprove.forEach(id => onUpdateStatus(id, 'Approved'));
    }
    setSelectedIds([]);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
      
      {/* Table Header Controls */}
      <div className="p-5 border-b border-slate-200 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <SpendIntelIcon className="w-5 h-5 shrink-0" />
            <h2 className="text-base font-bold text-slate-900">
              SpendIntel Transaction Feed & Audit Log
            </h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
              {filteredExpenses.length} entries
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time feed with automated rule checks, receipts, and department mapping
          </p>
        </div>

        {/* Status Filters & Quick Bulk Selection */}
        <div className="flex flex-wrap items-center gap-2">
          {nonFlaggedOnPage.length > 0 && (
            <button
              id="select-non-flagged-page-btn"
              onClick={toggleSelectAllNonFlaggedOnPage}
              className={`px-3 py-1 text-xs font-semibold rounded-lg border transition-all cursor-pointer flex items-center shadow-2xs ${
                isAllNonFlaggedOnPageSelected
                  ? 'bg-emerald-700 text-white border-emerald-700'
                  : 'bg-white hover:bg-emerald-50 text-emerald-700 border-emerald-300 hover:border-emerald-400'
              }`}
              title="Select multiple non-flagged expenses on this page for single-click approval"
            >
              <CheckCheck className="w-3.5 h-3.5 mr-1" />
              {isAllNonFlaggedOnPageSelected ? 'Deselect Page' : `Select Non-Flagged (${nonFlaggedOnPage.length})`}
            </button>
          )}

          <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg">
            {(['All', 'Pending', 'Approved', 'Violations'] as const).map((status) => (
              <button
                key={status}
                onClick={() => {
                  setStatusFilter(status);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                  statusFilter === status
                    ? status === 'Violations'
                      ? 'bg-rose-600 text-white shadow-xs font-semibold'
                      : 'bg-white text-slate-900 shadow-xs font-semibold'
                    : status === 'Violations'
                    ? 'text-rose-700 hover:text-rose-900 hover:bg-rose-50'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {status === 'Violations' ? 'Policy Flags' : status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Prominent Top Search Bar for Merchant & Description Filtering */}
      <div className="p-4 bg-slate-50/75 border-b border-slate-200">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Search className="w-4 h-4 text-slate-400" />
            </div>
            <input
              id="transaction-search-input"
              type="text"
              placeholder="Search by merchant name or description (e.g. AWS, Delta Air Lines, client lunch, team dinner)..."
              value={searchQuery}
              onChange={(e) => {
                handleUpdateSearch(e.target.value);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  handleUpdateSearch('');
                }
              }}
              className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-2xs transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  handleUpdateSearch('');
                }}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                title="Clear search query"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {searchQuery && (
            <div className="flex items-center text-xs text-slate-600 bg-white px-3 py-2 rounded-xl border border-slate-200 shrink-0">
              <span className="font-semibold text-slate-900 mr-1">{filteredExpenses.length}</span> 
              <span>match{filteredExpenses.length === 1 ? '' : 'es'} found</span>
              <button
                type="button"
                onClick={() => {
                  handleUpdateSearch('');
                }}
                className="ml-2.5 text-emerald-600 hover:text-emerald-700 font-semibold cursor-pointer"
              >
                Clear
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Active Filter Indicators Bar */}
      {(selectedCategory !== 'All' || selectedDepartment !== 'All' || statusFilter !== 'All' || searchQuery) && (
        <div className="bg-slate-50 px-5 py-2 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-slate-500 font-medium">Active filters:</span>
            
            {selectedCategory !== 'All' && (
              <span className="inline-flex items-center bg-slate-200 text-slate-800 px-2 py-0.5 rounded-md font-semibold">
                Category: {selectedCategory}
                <button onClick={() => onSelectCategory('All')} className="ml-1 hover:text-slate-950 cursor-pointer">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {selectedDepartment !== 'All' && (
              <span className="inline-flex items-center bg-slate-200 text-slate-800 px-2 py-0.5 rounded-md font-semibold">
                <Building2 className="w-3 h-3 mr-1" />
                Dept: {selectedDepartment}
                <button onClick={() => onSelectDepartment('All')} className="ml-1 hover:text-slate-950 cursor-pointer">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {statusFilter !== 'All' && (
              <span className="inline-flex items-center bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md font-semibold">
                Status: {statusFilter}
                <button onClick={() => setStatusFilter('All')} className="ml-1 hover:text-amber-950 cursor-pointer">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {searchQuery && (
              <span className="inline-flex items-center bg-emerald-50 border border-emerald-200 text-emerald-800 px-2 py-0.5 rounded-md font-semibold">
                Merchant / Description: "{searchQuery}"
                <button 
                  onClick={() => { handleUpdateSearch(''); }} 
                  className="ml-1.5 hover:text-emerald-950 cursor-pointer"
                  aria-label="Clear search filter"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>

          <button
            onClick={() => {
              onSelectCategory('All');
              onSelectDepartment('All');
              setStatusFilter('All');
              handleUpdateSearch('');
            }}
            className="text-slate-500 hover:text-slate-800 underline font-medium"
          >
            Clear all filters
          </button>
        </div>
      )}

      {/* Bulk Action Banner with Single-Click Approval for Non-Flagged Expenses */}
      {selectedIds.length > 0 && (
        <div className="bg-emerald-50/95 px-5 py-3 border-b border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-emerald-700 text-white text-xs font-bold shadow-2xs">
              <ShieldCheck className="w-3.5 h-3.5 mr-1.5" />
              {selectedNonFlagged.length} Non-Flagged Expense{selectedNonFlagged.length === 1 ? '' : 's'} Selected
            </span>

            {selectedNonFlagged.length > 0 && (
              <span className="text-xs font-semibold text-emerald-950 font-mono">
                Total: {formatMoney(selectedNonFlaggedAmount, currencyCode)}
              </span>
            )}

            {nonFlaggedAllFiltered.length > selectedNonFlagged.length && (
              <button
                onClick={selectAllNonFlaggedInFilter}
                className="text-xs text-emerald-800 hover:text-emerald-950 underline font-semibold cursor-pointer ml-1"
              >
                Select all {nonFlaggedAllFiltered.length} non-flagged in filter
              </button>
            )}

            {selectedFlagged.length > 0 && (
              <span className="inline-flex items-center text-xs font-medium text-amber-800 bg-amber-100/90 px-2 py-0.5 rounded border border-amber-300">
                <AlertTriangle className="w-3 h-3 mr-1 text-amber-600 shrink-0" />
                {selectedFlagged.length} flagged item{selectedFlagged.length > 1 ? 's' : ''} require audit review
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              id="bulk-approve-non-flagged-btn"
              onClick={handleBulkApproveNonFlagged}
              disabled={selectedNonFlagged.length === 0}
              className={`px-4 py-2 rounded-lg text-xs font-bold shadow-xs transition-all flex items-center cursor-pointer ${
                selectedNonFlagged.length > 0
                  ? 'bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white ring-1 ring-emerald-700/20 active:scale-[0.98]'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
              title="Single-click approve all selected non-flagged expenses"
            >
              <CheckCheck className="w-4 h-4 mr-1.5 stroke-[2.5]" />
              Approve {selectedNonFlagged.length > 0 ? selectedNonFlagged.length : ''} Non-Flagged {selectedNonFlagged.length > 0 ? `(${formatMoney(selectedNonFlaggedAmount, currencyCode)})` : ''}
            </button>
            <button
              onClick={() => setSelectedIds([])}
              className="px-3 py-2 bg-white border border-slate-300 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50 cursor-pointer shadow-2xs"
            >
              Deselect
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/70 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <th className="py-3 px-4 w-10">
                <input
                  type="checkbox"
                  checked={isAllNonFlaggedOnPageSelected}
                  onChange={toggleSelectAllNonFlaggedOnPage}
                  title={isAllNonFlaggedOnPageSelected ? 'Deselect all non-flagged expenses on this page' : 'Select all non-flagged (compliant) expenses on this page'}
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                />
              </th>
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4">Merchant & Policy Status</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Department & Employee</th>
              <th className="py-3 px-4 text-right">Amount</th>
              <th className="py-3 px-4 text-center">Receipt</th>
              <th className="py-3 px-4 text-center">Approval Status</th>
              <th className="py-3 px-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {paginatedExpenses.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-14 text-center text-slate-400">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-700 mx-auto mb-3 flex items-center justify-center border border-slate-200">
                    <Receipt className="w-6 h-6" />
                  </div>
                  {searchQuery ? (
                    <div className="max-w-md mx-auto px-4">
                      <p className="text-sm font-bold text-slate-900">
                        No transactions found matching "{searchQuery}"
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        We couldn't find any expenses with matching merchant name, description, or policy tags.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          handleUpdateSearch('');
                        }}
                        className="mt-3.5 inline-flex items-center px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5 mr-1" /> Clear Search
                      </button>
                    </div>
                  ) : expenses.length === 0 ? (
                    <div className="max-w-md mx-auto px-4">
                      <p className="text-sm font-bold text-slate-900">
                        No transactions recorded ({formatMoney(0, currencyCode)} total spend)
                      </p>
                      <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                        All transaction feeds, categorized reporting, and audit logs will automatically populate when you record an expense or upload a receipt.
                      </p>
                      {onLogExpenseClick && (
                        <button
                          type="button"
                          onClick={onLogExpenseClick}
                          className="mt-4 inline-flex items-center px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                        >
                          <Plus className="w-4 h-4 mr-1.5" /> Log First Expense
                        </button>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500">
                      No transactions match the selected filters or department scope.
                    </p>
                  )}
                </td>
              </tr>
            ) : (
              paginatedExpenses.map((item) => {
                const isSelected = selectedIds.includes(item.id);
                const hasViolations = item.violations && item.violations.length > 0;
                const criticalViolation = item.violations?.find(v => v.severity === 'critical');
                const warningViolation = item.violations?.find(v => v.severity === 'warning');
                const hasReceipt = item.hasReceipt !== false && Boolean(item.receiptUrl && item.receiptUrl.trim().length > 0);
                const isExpanded = expandedViolationId === item.id;

                return (
                  <React.Fragment key={item.id}>
                    <tr 
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isSelected 
                          ? 'bg-emerald-50/30' 
                          : hasViolations 
                          ? 'bg-rose-50/20' 
                          : ''
                      }`}
                    >
                      <td className="py-3.5 px-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectOne(item.id)}
                          title={
                            hasViolations 
                              ? 'Flagged for audit: Requires policy exception before approval' 
                              : item.status === 'Approved'
                              ? 'Already approved'
                              : 'Select non-flagged expense for bulk approval'
                          }
                          className={`rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer ${
                            hasViolations ? 'accent-amber-600 border-amber-400' : ''
                          }`}
                        />
                      </td>
                      <td className="py-3.5 px-4 text-xs font-medium text-slate-600 whitespace-nowrap">
                        {item.date}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-slate-900">{item.merchant}</span>
                          
                          {/* Automated Policy Warning Badge */}
                          {hasViolations && (
                            <button
                              onClick={() => setExpandedViolationId(isExpanded ? null : item.id)}
                              className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold border transition-all ${
                                criticalViolation
                                  ? 'bg-rose-100 text-rose-800 border-rose-300 hover:bg-rose-200'
                                  : 'bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200'
                              }`}
                              title="Click to view policy violation details"
                            >
                              {criticalViolation ? (
                                <AlertOctagon className="w-3 h-3 mr-1 text-rose-600 shrink-0" />
                              ) : (
                                <AlertTriangle className="w-3 h-3 mr-1 text-amber-600 shrink-0" />
                              )}
                              {item.violations!.length} Policy Flag{item.violations!.length > 1 ? 's' : ''}
                              <ChevronDown className={`w-3 h-3 ml-0.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                            </button>
                          )}
                        </div>
                        <div className="text-xs text-slate-500 truncate max-w-sm mt-0.5">
                          {item.description || item.notes || 'No description provided'}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-800">
                          {item.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="text-xs font-medium text-slate-900">{item.employeeName}</div>
                        <button 
                          onClick={() => onSelectDepartment(item.department)}
                          className="text-[11px] text-emerald-700 hover:underline font-semibold flex items-center cursor-pointer"
                          title="Filter table by this department"
                        >
                          <Building2 className="w-3 h-3 mr-0.5" />
                          {item.department}
                        </button>
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-slate-900 font-mono whitespace-nowrap">
                        <div>
                          {formatMoney(getExpenseAmountInCurrency(item, currencyCode), currencyCode)}
                        </div>
                        {item.currency && item.currency.toUpperCase() !== currencyCode.toUpperCase() && (
                          <div className="text-[10px] text-slate-400 font-normal font-sans tracking-tight" title={`Originally logged as ${formatMoney(item.amount, item.currency)}`}>
                            Orig: {formatMoney(item.amount, item.currency)}
                          </div>
                        )}
                      </td>
                      
                      {/* Receipt Status Indicator */}
                      <td className="py-3.5 px-4 text-center">
                        {hasReceipt ? (
                          <button
                            onClick={() => onViewReceipt(item)}
                            className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors"
                            title="View uploaded receipt"
                          >
                            <Receipt className="w-3 h-3 mr-1" />
                            Attached
                          </button>
                        ) : (
                          <span 
                            className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200"
                            title={item.amount > 50 ? 'Missing receipt (Mandatory for > $50)' : 'No receipt required'}
                          >
                            <FileQuestion className="w-3 h-3 mr-1" />
                            Missing
                          </span>
                        )}
                      </td>

                      {/* Approval Status */}
                      <td className="py-3.5 px-4 text-center">
                        {item.status === 'Approved' && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 mr-1" /> Approved
                          </span>
                        )}
                        {item.status === 'Pending' && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                            <Clock className="w-3 h-3 mr-1" /> Pending
                          </span>
                        )}
                        {item.status === 'Flagged' && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                            <ShieldAlert className="w-3 h-3 mr-1" /> Under Audit
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center space-x-1">
                          {hasReceipt && (
                            <button
                              onClick={() => onViewReceipt(item)}
                              title="View Receipt"
                              className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          )}
                          
                          {onInspectAudit && hasViolations && (
                            <button
                              onClick={() => onInspectAudit(item)}
                              title="Inspect Audit Rules"
                              className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-md transition-colors"
                            >
                              <ShieldAlert className="w-4 h-4" />
                            </button>
                          )}

                          {item.status !== 'Approved' && (
                            <button
                              onClick={() => onUpdateStatus(item.id, 'Approved')}
                              title="Approve Expense (Override)"
                              className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          )}

                          {item.status !== 'Flagged' && (
                            <button
                              onClick={() => onUpdateStatus(item.id, 'Flagged')}
                              title="Flag for audit"
                              className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                            >
                              <AlertTriangle className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>

                    {/* Expandable Policy Violation Detail Drawer */}
                    {isExpanded && hasViolations && (
                      <tr className="bg-rose-50/40 border-b border-rose-100">
                        <td colSpan={9} className="py-3 px-6">
                          <div className="bg-white border border-rose-200 rounded-lg p-3 space-y-2 text-xs">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                              <span className="font-bold text-rose-900 flex items-center">
                                <ShieldAlert className="w-4 h-4 mr-1.5 text-rose-600" />
                                Automated Policy Rule Violations Detected ({item.violations!.length})
                              </span>
                              <span className="text-[11px] text-slate-500">
                                Rule Engine Evaluation: Real-time
                              </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                              {item.violations!.map(v => (
                                <div key={v.id} className="p-2.5 rounded border border-rose-100 bg-rose-50/30 flex flex-col justify-between">
                                  <div>
                                    <div className="flex items-center justify-between mb-1">
                                      <span className="font-bold text-slate-900 flex items-center">
                                        <span className="bg-rose-100 text-rose-800 text-[10px] px-1.5 py-0.5 rounded mr-1.5 font-bold">
                                          {v.code}
                                        </span>
                                        {v.ruleName}
                                      </span>
                                      <span className="text-[10px] uppercase font-bold text-rose-600">
                                        {v.severity}
                                      </span>
                                    </div>
                                    <p className="text-slate-600 text-xs mb-1.5">
                                      {v.description}
                                    </p>
                                    <div className="text-[11px] text-slate-500 bg-white p-1.5 rounded border border-slate-100">
                                      <strong className="text-slate-700">Remediation:</strong> {v.suggestedAction}
                                    </div>
                                  </div>

                                  {onWaiveViolation && (
                                    <div className="mt-2 text-right">
                                      <button
                                        onClick={() => onWaiveViolation(item.id, v.id)}
                                        className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-900 underline cursor-pointer"
                                      >
                                        Waive this rule & clear flag
                                      </button>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
        <div>
          Showing page <span className="font-semibold text-slate-700">{currentPage}</span> of <span className="font-semibold text-slate-700">{totalPages}</span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="p-2 border border-slate-300 rounded-lg bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="p-2 border border-slate-300 rounded-lg bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

    </div>
  );
};
