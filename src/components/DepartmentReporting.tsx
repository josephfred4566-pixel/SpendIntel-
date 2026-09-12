import React, { useState, useMemo } from 'react';
import { Department, Expense } from '../types';
import { formatMoney } from '../utils/currencies';
import { getExpenseAmountInCurrency, convertBudget } from '../utils/currencyConverter';
import { 
  Building2, 
  BarChart2, 
  TrendingUp,
  AlertTriangle,
  RotateCcw,
  Edit2,
  Trash2,
  Check,
  X,
  Plus
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend, 
  LineChart, 
  Line 
} from 'recharts';

interface DepartmentReportingProps {
  expenses: Expense[];
  activeDepartment: Department | 'All';
  onSelectDepartment: (dept: Department | 'All') => void;
  currencyCode?: string;
  departments: { department: string; budget: number }[];
  onDepartmentsChange: (newDepts: { department: string; budget: number }[]) => void;
}

export const DepartmentReporting: React.FC<DepartmentReportingProps> = ({
  expenses,
  activeDepartment,
  onSelectDepartment,
  currencyCode = 'USD',
  departments,
  onDepartmentsChange,
}) => {
  const [chartView, setChartView] = useState<'budget' | 'trend'>('budget');

  // Inline editing state for departments
  const [editingDeptName, setEditingDeptName] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editBudget, setEditBudget] = useState('');

  // Adding new department state
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newDeptName, setNewDeptName] = useState('');
  const [newDeptBudget, setNewDeptBudget] = useState('5000');
  const [formError, setFormError] = useState('');

  // Compute dynamic department aggregations strictly from actual expenses converted in real-time
  const departmentStats = useMemo(() => {
    return departments.map(deptMeta => {
      const deptExpenses = expenses.filter(e => e.department === deptMeta.department);
      const totalSpent = deptExpenses.reduce((sum, e) => sum + getExpenseAmountInCurrency(e, currencyCode), 0);
      const flaggedCount = deptExpenses.filter(e => (e.violations && e.violations.length > 0) || e.status === 'Flagged').length;
      const convertedDeptBudget = convertBudget(deptMeta.budget, currencyCode);
      
      return {
        department: deptMeta.department,
        budget: convertedDeptBudget,
        originalBudget: deptMeta.budget, // Keep the uncoverted value for editing
        total: totalSpent,
        expenseCount: deptExpenses.length,
        flaggedCount,
        percentOfBudget: convertedDeptBudget > 0 ? Math.round((totalSpent / convertedDeptBudget) * 100) : 0,
      };
    });
  }, [expenses, currencyCode, departments]);

  const totalCompanySpend = departmentStats.reduce((sum, d) => sum + d.total, 0);

  // Compute dynamic monthly trend by department from real expenses in converted currency
  const dynamicTrendData = useMemo(() => {
    const monthNames = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'];
    const monthMap: { [key: string]: { month: string; [dept: string]: any } } = {};
    
    monthNames.forEach(m => {
      monthMap[m] = {
        month: m,
      };
      // Initialize each department key with $0
      departments.forEach(d => {
        monthMap[m][d.department] = 0;
      });
    });

    expenses.forEach(e => {
      const d = new Date(e.date);
      if (!isNaN(d.getTime())) {
        const monthShort = d.toLocaleString('en-US', { month: 'short' });
        if (monthMap[monthShort] && monthMap[monthShort][e.department] !== undefined) {
          monthMap[monthShort][e.department] += getExpenseAmountInCurrency(e, currencyCode);
        }
      }
    });

    return monthNames.map(m => monthMap[m]);
  }, [expenses, currencyCode, departments]);

  // Handler: Add a brand new Department
  const handleCreateDepartment = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = newDeptName.trim();
    if (!trimmedName) {
      setFormError('Department name is required.');
      return;
    }

    if (departments.some(d => d.department.toLowerCase() === trimmedName.toLowerCase())) {
      setFormError('A department with this name already exists.');
      return;
    }

    const budgetVal = parseFloat(newDeptBudget) || 1000;
    const newDept = {
      department: trimmedName,
      budget: budgetVal
    };

    onDepartmentsChange([...departments, newDept]);
    setIsAddingNew(false);
    setNewDeptName('');
    setNewDeptBudget('5000');
    setFormError('');
  };

  // Handler: Start editing
  const handleStartEdit = (dept: { department: string; originalBudget: number }, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingDeptName(dept.department);
    setEditName(dept.department);
    setEditBudget(String(dept.originalBudget));
  };

  // Handler: Save edit
  const handleSaveEdit = (originalName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const trimmedName = editName.trim();
    if (!trimmedName) return;

    const budgetVal = parseFloat(editBudget) || 1000;

    const updated = departments.map(d => {
      if (d.department === originalName) {
        return {
          department: trimmedName,
          budget: budgetVal
        };
      }
      return d;
    });

    onDepartmentsChange(updated);
    setEditingDeptName(null);
  };

  // Handler: Delete department
  const handleDeleteDepartment = (deptName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (departments.length <= 1) {
      alert('You must keep at least one department.');
      return;
    }
    const updated = departments.filter(d => d.department !== deptName);
    onDepartmentsChange(updated);
    if (activeDepartment === deptName) {
      onSelectDepartment('All');
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-800 border border-slate-200 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                Department Reports
              </h2>
              <p className="text-xs text-slate-500">
                Departmental budget allocation versus actual spend ({formatMoney(totalCompanySpend, currencyCode)} Total)
              </p>
            </div>
          </div>
        </div>

        {/* View Switchers & Controls */}
        <div className="flex items-center space-x-2">
          {activeDepartment !== 'All' && (
            <button
              onClick={() => onSelectDepartment('All')}
              className="px-2.5 py-1 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg flex items-center transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3 h-3 mr-1" /> Reset to All Depts
            </button>
          )}

          <button
            onClick={() => setIsAddingNew(!isAddingNew)}
            className="px-2.5 py-1 text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg flex items-center border border-emerald-200 transition-colors cursor-pointer"
          >
            <Plus className="w-3 h-3 mr-1" /> Add Dept
          </button>

          <div className="bg-slate-100 p-1 rounded-lg flex items-center space-x-1 border border-slate-200">
            <button
              onClick={() => setChartView('budget')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                chartView === 'budget'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Budget vs Actual
            </button>
            <button
              onClick={() => setChartView('trend')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                chartView === 'trend'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Monthly Trend
            </button>
          </div>
        </div>
      </div>

      {/* Adding a new Department Form block */}
      {isAddingNew && (
        <form onSubmit={handleCreateDepartment} className="mb-5 p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-2">
            <span className="font-bold text-slate-800">Add New Department Profile</span>
            <button type="button" onClick={() => setIsAddingNew(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {formError && (
            <div className="p-2 text-rose-700 bg-rose-50 border border-rose-200 rounded-lg flex items-center">
              <AlertTriangle className="w-3.5 h-3.5 mr-1" />
              {formError}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Department Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Legal & HR, Customer Success"
                value={newDeptName}
                onChange={(e) => setNewDeptName(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Budget Allotted Cap (USD)</label>
              <input
                type="number"
                required
                min="0"
                placeholder="5000"
                value={newDeptBudget}
                onChange={(e) => setNewDeptBudget(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAddingNew(false)}
              className="px-3 py-1.5 border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 font-semibold rounded-lg cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 py-1.5 bg-emerald-700 text-white hover:bg-emerald-800 font-semibold rounded-lg cursor-pointer flex items-center"
            >
              Create Department
            </button>
          </div>
        </form>
      )}

      {/* Grid: Department Selectors (Left) + Chart (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Department Cards List (5 cols) */}
        <div className="lg:col-span-5 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 pb-1 uppercase tracking-wider">
            <span>Department Unit</span>
            <span>Spend / Cap</span>
          </div>

          <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
            {departmentStats.map((dept) => {
              const isSelected = activeDepartment === dept.department;
              const isOverBudget = dept.percentOfBudget > 100;
              const isEditing = editingDeptName === dept.department;

              if (isEditing) {
                return (
                  <div
                    key={dept.department}
                    className="p-3 rounded-xl border border-emerald-500 bg-emerald-50/10 shadow-xs space-y-2 text-xs"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-700">Inline Edit Department</span>
                      <div className="flex space-x-1">
                        <button
                          type="button"
                          onClick={(e) => handleSaveEdit(dept.department, e)}
                          className="p-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                          title="Save Changes"
                        >
                          <Check className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setEditingDeptName(null); }}
                          className="p-1 rounded bg-slate-200 hover:bg-slate-300 text-slate-700 cursor-pointer"
                          title="Cancel"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] text-slate-500 font-semibold">Name</label>
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-slate-800"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-500 font-semibold">Budget (USD)</label>
                        <input
                          type="number"
                          value={editBudget}
                          onChange={(e) => setEditBudget(e.target.value)}
                          className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-slate-800"
                        />
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={dept.department}
                  onClick={() => onSelectDepartment(isSelected ? 'All' : dept.department)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer group/card ${
                    isSelected
                      ? 'border-slate-900 bg-slate-900/5 ring-1 ring-slate-900 shadow-2xs'
                      : 'border-slate-200/80 hover:border-slate-300 bg-slate-50/50 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <span className="w-2 h-2 rounded-full bg-slate-900 shrink-0" />
                        <span className="text-xs font-bold text-slate-900">
                          {dept.department}
                        </span>
                        {dept.flaggedCount > 0 && (
                          <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-bold bg-slate-200 text-slate-900 border border-slate-300">
                            {dept.flaggedCount} Flag{dept.flaggedCount === 1 ? '' : 's'}
                          </span>
                        )}

                        {/* Inline Actions Tooltip/Toolbar */}
                        <div className="opacity-0 group-hover/card:opacity-100 flex items-center space-x-1.5 transition-opacity ml-2">
                          <button
                            type="button"
                            onClick={(e) => handleStartEdit(dept, e)}
                            className="p-1 rounded hover:bg-slate-200 text-slate-500 hover:text-slate-800 cursor-pointer"
                            title="Edit department name & budget"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleDeleteDepartment(dept.department, e)}
                            className="p-1 rounded hover:bg-rose-100 text-slate-500 hover:text-rose-600 cursor-pointer"
                            title="Delete Department Profile"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      <span className="text-[11px] text-slate-500">
                        {dept.expenseCount} logged transaction{dept.expenseCount === 1 ? '' : 's'}
                      </span>
                    </div>

                    <div className="text-right font-mono">
                      <div className="text-xs font-bold text-slate-900">
                        {formatMoney(dept.total, currencyCode)}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Cap: {formatMoney(dept.budget, currencyCode)}
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                      <span>Budget Burn</span>
                      <span className={`font-semibold ${isOverBudget ? 'text-slate-900 font-bold' : 'text-slate-700'}`}>
                        {dept.percentOfBudget}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-1 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-slate-900 transition-all"
                        style={{ width: `${Math.min(dept.percentOfBudget, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2 flex items-center justify-between text-xs text-slate-500">
            <span>
              Active Filter: <strong className="text-slate-800">{activeDepartment === 'All' ? 'All Departments' : activeDepartment}</strong>
            </span>
            <span className="text-slate-700 hover:text-slate-900 font-medium cursor-pointer underline" onClick={() => onSelectDepartment('All')}>
              {activeDepartment === 'All' ? 'Showing all units' : 'Reset filter'}
            </span>
          </div>
        </div>

        {/* Secondary Department Chart (7 cols) */}
        <div className="lg:col-span-7 bg-slate-50/60 rounded-xl border border-slate-200 p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center">
                <BarChart2 className="w-3.5 h-3.5 mr-1.5 text-slate-900" />
                {chartView === 'budget' 
                  ? 'Departmental Budget Allocation vs Actual Spend' 
                  : `${activeDepartment === 'All' ? 'All Departments' : activeDepartment} Monthly Trajectory`}
              </h3>
              {activeDepartment !== 'All' && (
                <span className="text-[11px] font-semibold text-slate-900 bg-white border border-slate-200 px-2 py-0.5 rounded-md">
                  Filtered: {activeDepartment}
                </span>
              )}
            </div>

            <p className="text-xs text-slate-500 mb-4">
              {chartView === 'budget'
                ? 'Direct comparison of corporate department caps against verified expense entries.'
                : 'Month-over-month trajectory derived from verified receipt timestamps.'}
            </p>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                {chartView === 'budget' ? (
                  <BarChart data={departmentStats} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis 
                      dataKey="department" 
                      stroke="#64748b" 
                      fontSize={11} 
                      tickLine={false} 
                    />
                    <YAxis 
                      stroke="#64748b" 
                      fontSize={11} 
                      tickLine={false} 
                      tickFormatter={(val) => formatMoney(val, currencyCode)} 
                    />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                      formatter={(val: any, name: any) => [formatMoney(Number(val), currencyCode), name]}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }} />
                    <Bar dataKey="budget" name="Approved Budget" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                    <Bar 
                      dataKey="total" 
                      name="Actual Spent" 
                      fill="#0f172a" 
                      radius={[4, 4, 0, 0]} 
                    />
                  </BarChart>
                ) : (
                  <LineChart data={dynamicTrendData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={11} tickLine={false} tickFormatter={(val) => formatMoney(val, currencyCode)} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                      formatter={(val: any, name: any) => [formatMoney(Number(val), currencyCode), name]}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }} />
                    {activeDepartment === 'All' ? (
                      <>
                        {departments.map((d, idx) => {
                          const colors = ['#0f172a', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6'];
                          const color = colors[idx % colors.length];
                          return (
                            <Line 
                              key={d.department} 
                              type="monotone" 
                              dataKey={d.department} 
                              stroke={color} 
                              strokeWidth={1.5} 
                              dot={{ r: 2.5 }} 
                            />
                          );
                        })}
                      </>
                    ) : (
                      <Line 
                        type="monotone" 
                        dataKey={activeDepartment} 
                        stroke="#0f172a" 
                        strokeWidth={2.5} 
                        dot={{ r: 3.5, fill: '#0f172a' }} 
                      />
                    )}
                  </LineChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>

          {/* Department Breakdown Footer Summary */}
          <div className="mt-3 pt-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
            <span className="text-slate-700">
              {expenses.length === 0 
                ? `Total Departmental Spend: ${formatMoney(0, currencyCode)} (0 transactions logged)`
                : activeDepartment === 'All' 
                ? `Total Departmental Spend: ${formatMoney(totalCompanySpend, currencyCode)}`
                : `${activeDepartment} Spend: ${formatMoney(departmentStats.find(d => d.department === activeDepartment)?.total || 0, currencyCode)}`}
            </span>
            <span className="font-semibold text-slate-800">Accounting Ledger Verified</span>
          </div>
        </div>

      </div>

    </div>
  );
};
