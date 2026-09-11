import React, { useState, useMemo } from 'react';
import { Department, Expense } from '../types';
import { DEFAULT_DEPARTMENTS } from '../data/initialExpenses';
import { formatMoney } from '../utils/currencies';
import { getExpenseAmountInCurrency, convertBudget } from '../utils/currencyConverter';
import { 
  Building2, 
  BarChart2, 
  TrendingUp,
  AlertTriangle,
  RotateCcw
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
}

export const DepartmentReporting: React.FC<DepartmentReportingProps> = ({
  expenses,
  activeDepartment,
  onSelectDepartment,
  currencyCode = 'USD',
}) => {
  const [chartView, setChartView] = useState<'budget' | 'trend'>('budget');

  // Compute dynamic department aggregations strictly from actual expenses converted in real-time
  const departmentStats = useMemo(() => {
    return DEFAULT_DEPARTMENTS.map(deptMeta => {
      const deptExpenses = expenses.filter(e => e.department === deptMeta.department);
      const totalSpent = deptExpenses.reduce((sum, e) => sum + getExpenseAmountInCurrency(e, currencyCode), 0);
      const flaggedCount = deptExpenses.filter(e => (e.violations && e.violations.length > 0) || e.status === 'Flagged').length;
      const convertedDeptBudget = convertBudget(deptMeta.budget, currencyCode);
      
      return {
        department: deptMeta.department,
        budget: convertedDeptBudget,
        total: totalSpent,
        expenseCount: deptExpenses.length,
        flaggedCount,
        percentOfBudget: convertedDeptBudget > 0 ? Math.round((totalSpent / convertedDeptBudget) * 100) : 0,
      };
    });
  }, [expenses, currencyCode]);

  const totalCompanySpend = departmentStats.reduce((sum, d) => sum + d.total, 0);

  // Compute dynamic monthly trend by department from real expenses in converted currency
  const dynamicTrendData = useMemo(() => {
    const monthNames = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'];
    const monthMap: { [key: string]: { month: string; [dept: string]: any } } = {};
    
    monthNames.forEach(m => {
      monthMap[m] = {
        month: m,
        Engineering: 0,
        Sales: 0,
        Marketing: 0,
        Executive: 0,
        Operations: 0,
        Design: 0,
      };
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
  }, [expenses, currencyCode]);

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
                Drill-Down Department Reporting
              </h2>
              <p className="text-xs text-slate-500">
                Departmental budget allocation versus actual spend ({formatMoney(totalCompanySpend, currencyCode)} Total)
              </p>
            </div>
          </div>
        </div>

        {/* View Switchers */}
        <div className="flex items-center space-x-2">
          {activeDepartment !== 'All' && (
            <button
              onClick={() => onSelectDepartment('All')}
              className="px-2.5 py-1 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg flex items-center transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3 h-3 mr-1" /> Reset to All Depts
            </button>
          )}

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

      {/* Grid: Department Selectors (Left) + Chart (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Department Cards List (5 cols) */}
        <div className="lg:col-span-5 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 pb-1 uppercase tracking-wider">
            <span>Department Unit</span>
            <span>Spend / Cap</span>
          </div>

          <div className="space-y-2">
            {departmentStats.map((dept) => {
              const isSelected = activeDepartment === dept.department;
              const isOverBudget = dept.percentOfBudget > 100;

              return (
                <div
                  key={dept.department}
                  onClick={() => onSelectDepartment(isSelected ? 'All' : dept.department)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
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
                        <Line type="monotone" dataKey="Engineering" stroke="#0f172a" strokeWidth={2} dot={{ r: 2.5 }} />
                        <Line type="monotone" dataKey="Sales" stroke="#334155" strokeWidth={2} dot={{ r: 2.5 }} />
                        <Line type="monotone" dataKey="Marketing" stroke="#475569" strokeWidth={2} dot={{ r: 2.5 }} />
                        <Line type="monotone" dataKey="Operations" stroke="#64748b" strokeWidth={1.5} dot={{ r: 2.5 }} />
                        <Line type="monotone" dataKey="Executive" stroke="#94a3b8" strokeWidth={1.5} dot={{ r: 2.5 }} />
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
