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
  Globe,
  GripHorizontal,
  Sparkles
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
  statusFilter?: ExpenseStatus | 'All' | 'Violations';
  onStatusFilterChange?: (filter: ExpenseStatus | 'All' | 'Violations') => void;
  onAutoCategorize?: () => boolean;
  onInjectUncategorizedDemo?: () => void;
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
  onOpenCurrencyModal,
  statusFilter: propsStatusFilter,
  onStatusFilterChange,
  onAutoCategorize,
  onInjectUncategorizedDemo,
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

  const [internalStatusFilter, setInternalStatusFilter] = useState<ExpenseStatus | 'All' | 'Violations'>('All');
  const statusFilter = propsStatusFilter !== undefined ? propsStatusFilter : internalStatusFilter;

  const setStatusFilter = (val: ExpenseStatus | 'All' | 'Violations') => {
    if (onStatusFilterChange) {
      onStatusFilterChange(val);
    } else {
      setInternalStatusFilter(val);
    }
  };

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedViolationId, setExpandedViolationId] = useState<string | null>(null);
  const itemsPerPage = 8;

  // AI Auto-Categorize UI states
  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);
  const [showAiNoUncategorizedModal, setShowAiNoUncategorizedModal] = useState(false);
  const [aiAnalysisResults, setAiAnalysisResults] = useState<{ merchant: string; category: string }[] | null>(null);

  const handleAutoCategorizeTrigger = () => {
    if (!onAutoCategorize) return;

    const otherExpenses = expenses.filter(e => e.category === 'Other');
    if (otherExpenses.length === 0) {
      setShowAiNoUncategorizedModal(true);
      return;
    }

    setIsAiAnalyzing(true);
    setAiAnalysisResults(null);

    setTimeout(() => {
      const success = onAutoCategorize();
      setIsAiAnalyzing(false);

      if (success) {
        const results = otherExpenses.map(e => {
          let suggestion = 'Other';
          const norm = e.merchant.toLowerCase();
          const mappings: Record<string, string> = {
            'aws': 'Cloud & Hosting', 'google cloud': 'Cloud & Hosting', 'azure': 'Cloud & Hosting', 'heroku': 'Cloud & Hosting',
            'github': 'Software', 'slack': 'Software', 'zoom': 'Software', 'figma': 'Software', 'notion': 'Software', 'microsoft': 'Software', 'salesforce': 'Software', 'openai': 'Software',
            'delta': 'Travel', 'united': 'Travel', 'uber': 'Travel', 'lyft': 'Travel', 'hilton': 'Travel', 'marriott': 'Travel', 'airbnb': 'Travel',
            'facebook': 'Marketing', 'google ads': 'Marketing', 'linkedin': 'Marketing', 'mailchimp': 'Marketing', 'hubspot': 'Marketing',
            'starbucks': 'Meals', 'mcdonald': 'Meals', 'sweetgreen': 'Meals', 'uber eats': 'Meals', 'bistro': 'Meals', 'french laundry': 'Meals',
            'amazon': 'Office Supplies', 'staples': 'Office Supplies', 'target': 'Office Supplies', 'fedex': 'Office Supplies',
          };
          for (const [key, cat] of Object.entries(mappings)) {
            if (norm.includes(key)) {
              suggestion = cat;
              break;
            }
          }
          return {
            merchant: e.merchant,
            category: suggestion !== 'Other' ? suggestion : 'Kept under Other'
          };
        });
        setAiAnalysisResults(results);
      }
    }, 1200);
  };

  // Column reordering state
  const [columnsOrder, setColumnsOrder] = useState<string[]>([
    'date',
    'merchant',
    'category',
    'department',
    'amount',
    'receipt',
    'status',
    'actions'
  ]);
  const [draggedColIdx, setDraggedColIdx] = useState<number | null>(null);
  const [dragOverColIdx, setDragOverColIdx] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedColIdx(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedColIdx !== null && draggedColIdx !== index) {
      setDragOverColIdx(index);
    }
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedColIdx === null || draggedColIdx === targetIndex) return;

    const reordered = [...columnsOrder];
    const [draggedCol] = reordered.splice(draggedColIdx, 1);
    reordered.splice(targetIndex, 0, draggedCol);
    setColumnsOrder(reordered);
    
    setDraggedColIdx(null);
    setDragOverColIdx(null);
  };

  const handleDragEnd = () => {
    setDraggedColIdx(null);
    setDragOverColIdx(null);
  };

  const resetColumns = () => {
    setColumnsOrder([
      'date',
      'merchant',
      'category',
      'department',
      'amount',
      'receipt',
      'status',
      'actions'
    ]);
  };

  const getHeaderElement = (colId: string) => {
    switch (colId) {
      case 'date':
        return { label: 'Date', className: 'text-left' };
      case 'merchant':
        return { label: 'Merchant & Policy Status', className: 'text-left' };
      case 'category':
        return { label: 'Category', className: 'text-left' };
      case 'department':
        return { label: 'Department & Employee', className: 'text-left' };
      case 'amount':
        return { label: 'Amount', className: 'text-right' };
      case 'receipt':
        return { label: 'Receipt', className: 'text-center' };
      case 'status':
        return { label: 'Approval Status', className: 'text-center' };
      case 'actions':
        return { label: 'Actions', className: 'text-center' };
      default:
        return { label: '', className: '' };
    }
  };

  const renderCellElement = (colId: string, item: Expense) => {
    const isExpanded = expandedViolationId === item.id;
    const hasViolations = item.violations && item.violations.length > 0;
    const criticalViolation = item.violations?.find(v => v.severity === 'critical');
    const hasReceipt = item.hasReceipt !== false && Boolean(item.receiptUrl && item.receiptUrl.trim().length > 0);

    switch (colId) {
      case 'date':
        return (
          <td key={colId} className="py-3.5 px-4 text-xs font-medium text-slate-600 whitespace-nowrap">
            {item.date}
          </td>
        );
      case 'merchant':
        return (
          <td key={colId} className="py-3.5 px-4">
            <div className="flex flex-wrap items-center gap-2">
              {item.patternRisk === 'High' && (
                <span 
                  className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-rose-600 text-white animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.7)]" 
                  title={`AI High Pattern Risk Alert: ${item.patternRiskExplanation || ''}`}
                >
                  <ShieldAlert className="w-3 h-3" />
                </span>
              )}
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

              {/* AI Anomalous Spend Detector Risk Badge */}
              {item.patternRisk && (
                <span 
                  className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold border transition-all ${
                    item.patternRisk === 'High'
                      ? 'bg-rose-50 text-rose-700 border-rose-200 shadow-2xs'
                      : item.patternRisk === 'Medium'
                      ? 'bg-amber-50 text-amber-700 border-amber-200 shadow-2xs'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-2xs'
                  }`}
                  title={`AI Pattern Risk: ${item.patternRisk} - ${item.patternRiskExplanation}`}
                >
                  <AlertOctagon className={`w-3 h-3 mr-1 shrink-0 ${item.patternRisk === 'High' ? 'animate-pulse text-rose-500' : item.patternRisk === 'Medium' ? 'text-amber-500' : 'text-emerald-500'}`} />
                  AI: {item.patternRisk} Risk
                </span>
              )}
            </div>
            <div className="text-xs text-slate-500 truncate max-w-sm mt-0.5">
              {item.description || item.notes || 'No description provided'}
            </div>
          </td>
        );
      case 'category':
        return (
          <td key={colId} className="py-3.5 px-4">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-800">
              {item.category}
            </span>
          </td>
        );
      case 'department':
        return (
          <td key={colId} className="py-3.5 px-4">
            <div className="text-xs font-medium text-slate-900">{item.employeeName}</div>
            <button 
              onClick={() => onSelectDepartment(item.department)}
              className="text-[11px] text-emerald-700 hover:underline font-semibold flex items-center cursor-pointer"
              title="Filter table by this department"
            >
              <Building2 className="w-3.5 h-3.5 mr-0.5" />
              {item.department}
            </button>
          </td>
        );
      case 'amount':
        return (
          <td key={colId} className="py-3.5 px-4 text-right font-bold text-slate-900 font-mono whitespace-nowrap">
            <div>
              {formatMoney(getExpenseAmountInCurrency(item, currencyCode), currencyCode)}
            </div>
            {item.currency && item.currency.toUpperCase() !== currencyCode.toUpperCase() && (
              <div className="text-[10px] text-slate-400 font-normal font-sans tracking-tight" title={`Originally logged as ${formatMoney(item.amount, item.currency)}`}>
                Orig: {formatMoney(item.amount, item.currency)}
              </div>
            )}
          </td>
        );
      case 'receipt':
        return (
          <td key={colId} className="py-3.5 px-4 text-center">
            {hasReceipt ? (
              <button
                onClick={() => onViewReceipt(item)}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors cursor-pointer"
                title="View uploaded receipt"
              >
                <Receipt className="w-3 h-3 mr-1" />
                Attached
              </button>
            ) : (
              <span 
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200"
                title={item.amount > 50 ? 'Missing receipt (Mandatory for > $50)' : 'No receipt required'}
              >
                <FileQuestion className="w-3 h-3 mr-1" />
                Missing
              </span>
            )}
          </td>
        );
      case 'status':
        return (
          <td key={colId} className="py-3.5 px-4 text-center">
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
        );
      case 'actions':
        return (
          <td key={colId} className="py-3.5 px-4 text-center">
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
                  className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                </button>
              )}

              {item.status !== 'Flagged' && (
                <button
                  onClick={() => onUpdateStatus(item.id, 'Flagged')}
                  title="Flag for audit"
                  className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                >
                  <AlertTriangle className="w-4 h-4" />
                </button>
              )}
            </div>
          </td>
        );
      default:
        return <td key={colId} className="py-3.5 px-4" />;
    }
  };

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
              Audit Logs
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

          <button
            type="button"
            onClick={handleAutoCategorizeTrigger}
            disabled={isAiAnalyzing}
            className="px-4 py-2.5 text-xs font-bold bg-slate-900 text-white rounded-xl shadow-xs transition-all hover:bg-slate-800 disabled:opacity-50 cursor-pointer flex items-center shrink-0 space-x-1.5"
            title="Automatically categorize 'Other' expenses using neural classification"
          >
            <Sparkles className={`w-3.5 h-3.5 text-emerald-400 ${isAiAnalyzing ? 'animate-spin' : ''}`} />
            <span>{isAiAnalyzing ? 'AI Analyzing...' : 'Auto-Categorize'}</span>
          </button>

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

      {/* Drag and Drop instructions */}
      <div className="bg-slate-50 border-b border-slate-200 px-5 py-3.5 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-2 text-xs text-slate-500">
            <GripHorizontal className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>💡 <strong>Custom Layout:</strong> Rearrange table columns based on accounting priorities using the visual buttons below.</span>
          </div>
          <button
            type="button"
            onClick={resetColumns}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 transition-colors hover:underline cursor-pointer"
          >
            Reset Layout
          </button>
        </div>

        {/* Dynamic Column Reordering Toolbar */}
        <div className="flex flex-wrap items-center gap-1.5 bg-white border border-slate-200 p-2.5 rounded-xl">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mr-1.5 select-none">
            Column Order:
          </span>
          {columnsOrder.map((colId, index) => {
            const label = getHeaderElement(colId).label;
            return (
              <div 
                key={colId} 
                className="inline-flex items-center bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-700 font-medium hover:bg-slate-100/50 transition-colors"
              >
                <span>{label}</span>
                <div className="flex items-center ml-2 border-l border-slate-200 pl-1.5 space-x-1">
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => {
                      const newOrder = [...columnsOrder];
                      const temp = newOrder[index];
                      newOrder[index] = newOrder[index - 1];
                      newOrder[index - 1] = temp;
                      setColumnsOrder(newOrder);
                    }}
                    className="text-[11px] text-slate-400 hover:text-emerald-700 hover:font-bold disabled:opacity-20 cursor-pointer w-4 h-4 flex items-center justify-center rounded-md hover:bg-slate-200/50 transition-colors"
                    title="Move Left"
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    disabled={index === columnsOrder.length - 1}
                    onClick={() => {
                      const newOrder = [...columnsOrder];
                      const temp = newOrder[index];
                      newOrder[index] = newOrder[index + 1];
                      newOrder[index + 1] = temp;
                      setColumnsOrder(newOrder);
                    }}
                    className="text-[11px] text-slate-400 hover:text-emerald-700 hover:font-bold disabled:opacity-20 cursor-pointer w-4 h-4 flex items-center justify-center rounded-md hover:bg-slate-200/50 transition-colors"
                    title="Move Right"
                  >
                    →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/70 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider select-none">
              <th className="py-3 px-4 w-10">
                <input
                  type="checkbox"
                  checked={isAllNonFlaggedOnPageSelected}
                  onChange={toggleSelectAllNonFlaggedOnPage}
                  title={isAllNonFlaggedOnPageSelected ? 'Deselect all non-flagged expenses on this page' : 'Select all non-flagged (compliant) expenses on this page'}
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                />
              </th>
              {columnsOrder.map((colId, index) => {
                const header = getHeaderElement(colId);
                const isOver = dragOverColIdx === index;
                const isDragging = draggedColIdx === index;
                return (
                  <th
                    key={colId}
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragLeave={() => setDragOverColIdx(null)}
                    onDrop={(e) => handleDrop(e, index)}
                    onDragEnd={handleDragEnd}
                    className={`py-3 px-4 cursor-grab active:cursor-grabbing hover:bg-slate-100 dark:hover:bg-slate-800 transition-all ${header.className} ${
                      isOver ? 'border-r-2 border-dashed border-emerald-500 bg-emerald-50/20' : ''
                    } ${isDragging ? 'opacity-40 scale-95 bg-slate-100/50' : ''}`}
                    title="Drag header to reorder columns"
                  >
                    <div className="inline-flex items-center gap-1">
                      <span>{header.label}</span>
                      <GripHorizontal className="w-3 h-3 text-slate-400 opacity-50 hover:opacity-100" />
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {paginatedExpenses.length === 0 ? (
              <tr>
                <td colSpan={columnsOrder.length + 1} className="py-14 text-center text-slate-400">
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
                const isExpanded = expandedViolationId === item.id;

                return (
                  <React.Fragment key={item.id}>
                    <tr 
                      className={`transition-all duration-200 hover:scale-[1.003] hover:shadow-sm hover:z-10 relative group/row ${
                        isSelected 
                          ? 'bg-emerald-50/40 hover:bg-emerald-50/70 border-l-2 border-emerald-500' 
                          : item.patternRisk === 'High'
                          ? 'bg-rose-50/50 hover:bg-rose-50/80 border-l-4 border-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.15)]'
                          : hasViolations 
                          ? 'bg-rose-50/30 hover:bg-rose-50/60 border-l-2 border-rose-400' 
                          : 'hover:bg-slate-50/90'
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
                      {columnsOrder.map((colId) => renderCellElement(colId, item))}
                    </tr>

                    {/* Expandable Policy Violation Detail Drawer */}
                    {isExpanded && hasViolations && (
                      <tr className="bg-rose-50/40 border-b border-rose-100">
                        <td colSpan={columnsOrder.length + 1} className="py-3 px-6">
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

      {/* AI Analyzing Overlay */}
      {isAiAnalyzing && (
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs flex flex-col items-center justify-center z-50 rounded-2xl animate-fade-in">
          <div className="bg-white p-6 rounded-2xl shadow-xl max-w-sm w-full mx-4 text-center border border-slate-100 flex flex-col items-center">
            <div className="relative mb-4">
              <div className="w-12 h-12 rounded-full border-4 border-emerald-100 border-t-emerald-600 animate-spin"></div>
              <Sparkles className="w-5 h-5 text-emerald-500 absolute inset-0 m-auto animate-pulse" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm mb-1">AI Classification Engine Active</h3>
            <p className="text-slate-500 text-xs px-2 leading-relaxed">
              Analyzing merchant text tokens, matching with industry compliance indexes, and auto-correcting categories...
            </p>
          </div>
        </div>
      )}

      {/* AI Results Report Modal */}
      {aiAnalysisResults && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-emerald-50/50">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Neural Categorization Complete</h3>
                  <p className="text-[10px] text-emerald-700 font-semibold uppercase tracking-wider">Classification Report</p>
                </div>
              </div>
              <button 
                onClick={() => setAiAnalysisResults(null)}
                className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 max-h-[300px] overflow-y-auto space-y-2.5">
              <p className="text-xs text-slate-500 leading-relaxed font-normal">
                SpendIntel AI has scanned your transaction history and successfully re-categorized the following items using NLP token maps:
              </p>
              <div className="space-y-2 mt-2">
                {aiAnalysisResults.map((res, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 bg-slate-50/50 text-xs">
                    <div className="font-medium text-slate-800 truncate pr-2 max-w-[200px]">{res.merchant}</div>
                    <div className="flex items-center space-x-1.5 shrink-0">
                      <span className="text-[10px] text-slate-400 line-through">Other</span>
                      <span className="text-[10px] text-slate-400">→</span>
                      <span className="px-2 py-0.5 rounded-md font-semibold bg-emerald-100 text-emerald-800 text-[10px]">
                        {res.category}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-100 text-right">
              <button
                type="button"
                onClick={() => setAiAnalysisResults(null)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                Confirm & Accept Classifications
              </button>
            </div>
          </div>
        </div>
      )}

      {/* No Uncategorized Expenses Offer Modal */}
      {showAiNoUncategorizedModal && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full mx-4 border border-slate-200 overflow-hidden">
            <div className="p-5 text-center flex flex-col items-center">
              <div className="p-3 rounded-full bg-slate-100 text-slate-600 mb-4 animate-bounce">
                <Sparkles className="w-6 h-6 text-emerald-500" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm mb-1.5 font-sans">All Items Categorized!</h3>
              <p className="text-slate-500 text-xs px-2 leading-relaxed mb-4">
                Excellent! All transactions are currently assigned to compliant accounts. Would you like to inject 3 draft expenses with uncategorized/Other categories to test the AI's classification and rule-resolution accuracy?
              </p>
              
              <div className="flex flex-col gap-2 w-full">
                {onInjectUncategorizedDemo && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowAiNoUncategorizedModal(false);
                      onInjectUncategorizedDemo();
                    }}
                    className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center space-x-1.5"
                  >
                    <Plus className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Generate Uncategorized Demo</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowAiNoUncategorizedModal(false)}
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Close & Back to Ledger
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
