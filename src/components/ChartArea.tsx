import React, { useState, useMemo } from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import { Expense } from '../types';
import { formatMoney } from '../utils/currencies';
import { getExpenseAmountInCurrency } from '../utils/currencyConverter';
import { BarChart3 } from 'lucide-react';

interface ChartAreaProps {
  expenses: Expense[];
  currencyCode?: string;
}

export const ChartArea: React.FC<ChartAreaProps> = ({ expenses, currencyCode = 'USD' }) => {
  const [chartType, setChartType] = useState<'area' | 'bar'>('area');

  // Dynamically compute monthly spend across 6 months from actual expenses converted in real-time
  const monthlyData = useMemo(() => {
    const monthNames = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'];
    const dataMap: { [key: string]: any } = {};

    monthNames.forEach(m => {
      dataMap[m] = {
        month: m,
        'Cloud & Hosting': 0,
        'Travel': 0,
        'Marketing': 0,
        'Software': 0,
        'Meals': 0,
        'Office Supplies': 0,
        'Other': 0,
        total: 0,
      };
    });

    expenses.forEach(e => {
      const d = new Date(e.date);
      if (!isNaN(d.getTime())) {
        const monthShort = d.toLocaleString('en-US', { month: 'short' });
        if (dataMap[monthShort]) {
          const convertedAmt = getExpenseAmountInCurrency(e, currencyCode);
          const cat = e.category || 'Other';
          if (dataMap[monthShort][cat] !== undefined) {
            dataMap[monthShort][cat] += convertedAmt;
          } else {
            dataMap[monthShort]['Other'] += convertedAmt;
          }
          dataMap[monthShort].total += convertedAmt;
        }
      }
    });

    return monthNames.map(m => dataMap[m]);
  }, [expenses, currencyCode]);

  const totalSpend = monthlyData.reduce((sum, m) => sum + m.total, 0);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
        <div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-800 border border-slate-200 flex items-center justify-center">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                Monthly Spending & Category Analytics
              </h2>
              <p className="text-xs text-slate-500">
                Tracking enterprise expenditure velocity ({formatMoney(totalSpend, currencyCode)} Total Period Spend)
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className="bg-slate-100 p-1 rounded-lg flex items-center space-x-1 border border-slate-200">
            <button
              onClick={() => setChartType('area')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                chartType === 'area'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Trend Area
            </button>
            <button
              onClick={() => setChartType('bar')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                chartType === 'bar'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Category Stack
            </button>
          </div>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'area' ? (
            <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <defs>
                <linearGradient id="colorTotalFinancial" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0f172a" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="#0f172a" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis 
                stroke="#64748b" 
                fontSize={11} 
                tickLine={false} 
                tickFormatter={(val) => formatMoney(val, currencyCode)} 
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                formatter={(value: any) => [formatMoney(Number(value), currencyCode), 'Total Spend']}
              />
              <Area 
                type="monotone" 
                dataKey="total" 
                stroke="#0f172a" 
                strokeWidth={2} 
                fillOpacity={1} 
                fill="url(#colorTotalFinancial)" 
              />
            </AreaChart>
          ) : (
            <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} tickFormatter={(val) => formatMoney(val, currencyCode)} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                formatter={(value: any, name: any) => [formatMoney(Number(value), currencyCode), name]}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
              <Bar dataKey="Cloud & Hosting" stackId="a" fill="#0f172a" radius={[0, 0, 0, 0]} />
              <Bar dataKey="Travel" stackId="a" fill="#334155" />
              <Bar dataKey="Marketing" stackId="a" fill="#475569" />
              <Bar dataKey="Software" stackId="a" fill="#64748b" />
              <Bar dataKey="Meals" stackId="a" fill="#94a3b8" />
              <Bar dataKey="Office Supplies" stackId="a" fill="#cbd5e1" />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      <div className="mt-3 pt-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
        <span>
          {expenses.length === 0 
            ? `Baseline: ${formatMoney(0, currencyCode)} recorded` 
            : `${expenses.length} transaction entries aggregated`}
        </span>
        <span className="font-semibold text-slate-700">GAAP / IFRS Ledger Formatted</span>
      </div>
    </div>
  );
};
