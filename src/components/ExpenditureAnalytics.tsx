import React, { useState } from 'react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip as RechartsTooltip,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend
} from 'recharts';
import { 
  AlertTriangle, 
  CheckCircle, 
  Sliders, 
  TrendingUp,
  TrendingDown,
  Calendar,
  Layers,
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  ShieldCheck
} from 'lucide-react';
import { Transaction, BudgetLimit } from '../types';
import { CATEGORY_COLORS } from '../data/initialData';
import { formatCurrency } from '../utils/formatters';

interface ExpenditureAnalyticsProps {
  transactions: Transaction[];
  allTransactions?: Transaction[];
  budgets: BudgetLimit[];
  onUpdateBudget: (category: string, newLimit: number) => void;
}

export const ExpenditureAnalytics: React.FC<ExpenditureAnalyticsProps> = ({
  transactions,
  allTransactions,
  budgets,
  onUpdateBudget,
}) => {
  const [activeTab, setActiveTab] = useState<'budgets' | 'trends'>('budgets');
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editLimitInput, setEditLimitInput] = useState<string>('');

  // Line Chart filter states
  const [trendViewMode, setTrendViewMode] = useState<'all' | 'breakdown' | 'budget'>('all');
  const [timeRange, setTimeRange] = useState<'all' | '3m'>('all');

  const safeTransactions = Array.isArray(transactions) ? transactions : [];
  const safeBudgets = Array.isArray(budgets) ? budgets : [];

  // Calculate spending per category for current transactions
  const categoryTotals: Record<string, number> = {};
  safeTransactions
    .filter(t => t && t.type === 'expense')
    .forEach(t => {
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + (t.amount || 0);
    });

  const totalExpense = Object.values(categoryTotals).reduce((sum, v) => sum + v, 0);

  // Data for Donut Chart
  const pieData = Object.entries(categoryTotals)
    .map(([category, amount]) => ({
      name: category,
      value: Math.round(amount),
      percentage: totalExpense > 0 ? Math.round((amount / totalExpense) * 100) : 0,
      color: CATEGORY_COLORS[category]?.dot || '#64748B',
    }))
    .sort((a, b) => b.value - a.value);

  // Daily expenditure data for trend chart (current month)
  const dailyTotals: Record<string, number> = {};
  safeTransactions
    .filter(t => t && t.type === 'expense')
    .forEach(t => {
      const day = (t.date && typeof t.date === 'string') ? (t.date.split('-')[2] || '01') : '01';
      dailyTotals[day] = (dailyTotals[day] || 0) + (t.amount || 0);
    });

  const trendData = Object.keys(dailyTotals)
    .sort((a, b) => Number(a) - Number(b))
    .map(day => ({
      day: `Day ${day}`,
      spent: Math.round(dailyTotals[day]),
    }));

  const handleSaveBudget = (cat: string) => {
    const num = parseFloat(editLimitInput);
    if (!isNaN(num) && num > 0) {
      onUpdateBudget(cat, num);
    }
    setEditingCategory(null);
  };

  // --- Multi-month Spending Trends Calculation for Recharts LineChart ---
  const sourceTransactions = (allTransactions && Array.isArray(allTransactions) && allTransactions.length > 0) ? allTransactions : safeTransactions;

  const monthMap: Record<string, { total: number; essential: number; discretionary: number; count: number }> = {};

  sourceTransactions
    .filter(t => t && t.type === 'expense')
    .forEach(t => {
      const monthKey = (t.date && typeof t.date === 'string') ? t.date.substring(0, 7) : '2026-09';
      if (!monthMap[monthKey]) {
        monthMap[monthKey] = { total: 0, essential: 0, discretionary: 0, count: 0 };
      }
      monthMap[monthKey].total += (t.amount || 0);
      monthMap[monthKey].count += 1;

      const isEssential = (Array.isArray(t.tags) && t.tags.includes('essential')) || 
        ['Housing', 'Utilities & Bills', 'Groceries & Supermarkets'].includes(t.category);
      if (isEssential) {
        monthMap[monthKey].essential += (t.amount || 0);
      } else {
        monthMap[monthKey].discretionary += (t.amount || 0);
      }
    });

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const fullMonthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const rawSortedKeys = Object.keys(monthMap).sort();
  const totalMonthlyBudget = budgets.reduce((acc, b) => acc + b.monthlyLimit, 0);

  const fullMonthlyTrendData = rawSortedKeys.map(key => {
    const parts = key.split('-');
    const yearStr = parts[0];
    const monthNum = parseInt(parts[1], 10);
    const mIdx = Math.max(0, Math.min(11, monthNum - 1));
    const shortLabel = `${monthNames[mIdx]} '${yearStr.slice(2)}`;
    const fullLabel = `${fullMonthNames[mIdx]} ${yearStr}`;
    const data = monthMap[key];

    return {
      key,
      month: shortLabel,
      fullMonth: fullLabel,
      totalExpense: Math.round(data.total),
      essential: Math.round(data.essential),
      discretionary: Math.round(data.discretionary),
      budgetTarget: totalMonthlyBudget,
      transactionCount: data.count,
    };
  });

  const displayedTrendData = timeRange === '3m' 
    ? fullMonthlyTrendData.slice(-3) 
    : fullMonthlyTrendData;

  // Key trend summary stats
  const totalMonthsCount = fullMonthlyTrendData.length;
  const avgMonthlySpend = totalMonthsCount > 0 
    ? Math.round(fullMonthlyTrendData.reduce((s, m) => s + m.totalExpense, 0) / totalMonthsCount) 
    : 0;
  
  const latestMonthItem = fullMonthlyTrendData[totalMonthsCount - 1];
  const previousMonthItem = totalMonthsCount > 1 ? fullMonthlyTrendData[totalMonthsCount - 2] : null;

  const momPercentageChange = (previousMonthItem && previousMonthItem.totalExpense > 0 && latestMonthItem)
    ? Math.round(((latestMonthItem.totalExpense - previousMonthItem.totalExpense) / previousMonthItem.totalExpense) * 100)
    : 0;

  const peakSpendingMonth = fullMonthlyTrendData.reduce(
    (prev, curr) => (curr.totalExpense > prev.totalExpense ? curr : prev), 
    fullMonthlyTrendData[0] || { totalExpense: 0, month: 'N/A' }
  );

  // Custom LineChart Tooltip
  const CustomLineTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-[#161618] border border-[#1F1F22] rounded-xl p-3 shadow-2xl text-xs min-w-[210px]">
          <div className="flex items-center justify-between pb-2 border-b border-[#1F1F22] mb-2.5">
            <span className="font-medium text-[#EDEDED]">{item.fullMonth || label}</span>
            <span className="text-[10px] text-[#71717A] bg-[#0E0E10] px-1.5 py-0.5 rounded border border-[#1F1F22]">
              {item.transactionCount} txns
            </span>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-[#A1A1AA]">
                <span className="w-2 h-2 rounded-full bg-[#10B981]"></span>
                Total Spent:
              </span>
              <span className="font-semibold text-[#EDEDED]">{formatCurrency(item.totalExpense)}</span>
            </div>

            {(trendViewMode === 'breakdown' || trendViewMode === 'all') && (
              <>
                <div className="flex items-center justify-between text-[11px] pl-3">
                  <span className="flex items-center gap-1.5 text-[#71717A]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#818CF8]"></span>
                    Essential Needs:
                  </span>
                  <span className="text-[#A1A1AA]">{formatCurrency(item.essential)}</span>
                </div>
                <div className="flex items-center justify-between text-[11px] pl-3">
                  <span className="flex items-center gap-1.5 text-[#71717A]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FBBF24]"></span>
                    Discretionary:
                  </span>
                  <span className="text-[#A1A1AA]">{formatCurrency(item.discretionary)}</span>
                </div>
              </>
            )}

            {trendViewMode === 'budget' && (
              <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-[#1F1F22]">
                <span className="flex items-center gap-1.5 text-[#71717A]">
                  <span className="w-2 h-2 rounded-full bg-[#71717A]"></span>
                  Budget Target:
                </span>
                <span className="text-[#A1A1AA]">{formatCurrency(item.budgetTarget)}</span>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 mb-8">
      
      {/* Top Grid: Category Donut & Monthly Budgets */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Donut Category Breakdown (5 Cols) */}
        <div className="lg:col-span-5 bg-[#161618] rounded-2xl border border-[#1F1F22] p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-medium text-[#EDEDED]">
                Expenditures by Category
              </h2>
              <span className="text-xs font-medium text-[#71717A]">
                {pieData.length} Categories
              </span>
            </div>

            {/* Recharts Donut */}
            <div className="h-56 w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    formatter={(val: any) => [formatCurrency(Number(val)), 'Spent']}
                    contentStyle={{
                      backgroundColor: '#161618',
                      borderColor: '#1F1F22',
                      color: '#EDEDED',
                      borderRadius: '12px',
                      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
                      fontSize: '12px'
                    }}
                    itemStyle={{ color: '#EDEDED' }}
                  />
                </PieChart>
              </ResponsiveContainer>

              {/* Inner Center Label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xs text-[#71717A] font-medium">Total Spent</span>
                <span className="text-lg font-light text-[#EDEDED]">{formatCurrency(totalExpense)}</span>
              </div>
            </div>
          </div>

          {/* Category Legend List */}
          <div className="mt-4 pt-3 border-t border-[#1F1F22] space-y-2 max-h-48 overflow-y-auto pr-1 text-xs">
            {pieData.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <span 
                    className="w-2.5 h-2.5 rounded-full shrink-0" 
                    style={{ backgroundColor: item.color }}
                  ></span>
                  <span className="text-[#A1A1AA] font-medium truncate">{item.name}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-medium text-[#EDEDED]">{formatCurrency(item.value)}</span>
                  <span className="text-[#71717A] w-8 text-right">{item.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Budget Tracker & Spending Velocity (7 Cols) */}
        <div className="lg:col-span-7 bg-[#161618] rounded-2xl border border-[#1F1F22] p-5 shadow-xs flex flex-col">
          
          {/* Header with Tab toggle */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-medium text-[#EDEDED]">
                Monthly Budget Limits & Velocity
              </h2>
            </div>

            <div className="flex bg-[#0E0E10] p-1 rounded-xl border border-[#1F1F22] text-xs font-medium text-[#71717A]">
              <button
                id="tab-budgets-btn"
                onClick={() => setActiveTab('budgets')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  activeTab === 'budgets' ? 'bg-[#161618] text-[#EDEDED] border border-[#1F1F22] font-semibold' : 'hover:text-[#A1A1AA]'
                }`}
              >
                Budgets ({budgets.length})
              </button>
              <button
                id="tab-velocity-btn"
                onClick={() => setActiveTab('trends')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  activeTab === 'trends' ? 'bg-[#161618] text-[#EDEDED] border border-[#1F1F22] font-semibold' : 'hover:text-[#A1A1AA]'
                }`}
              >
                Daily Velocity
              </button>
            </div>
          </div>

          {activeTab === 'budgets' ? (
            <div className="space-y-3 flex-1 overflow-y-auto max-h-[340px] pr-1">
              {budgets.map((budget) => {
                const spent = categoryTotals[budget.category] || 0;
                const percent = Math.round((spent / budget.monthlyLimit) * 100);
                const remaining = budget.monthlyLimit - spent;
                const isOver = spent > budget.monthlyLimit;
                const isNear = percent >= 80 && !isOver;

                const isEditing = editingCategory === budget.category;

                return (
                  <div 
                    key={budget.category}
                    className="bg-[#0E0E10] rounded-xl p-3 border border-[#1F1F22] hover:border-[#2D2D33] transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span 
                          className="w-2.5 h-2.5 rounded-full" 
                          style={{ backgroundColor: CATEGORY_COLORS[budget.category]?.dot || '#71717A' }}
                        ></span>
                        <span className="text-sm font-medium text-[#EDEDED]">
                          {budget.category}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-xs">
                        {isEditing ? (
                          <div className="flex items-center gap-1.5">
                            <input
                              type="number"
                              value={editLimitInput}
                              onChange={(e) => setEditLimitInput(e.target.value)}
                              className="w-20 px-2 py-0.5 border border-[#1F1F22] rounded-lg text-xs bg-[#161618] text-[#EDEDED] focus:outline-none focus:border-[#10B981]"
                              placeholder="Limit"
                            />
                            <button
                              onClick={() => handleSaveBudget(budget.category)}
                              className="px-2 py-0.5 bg-[#10B981] text-[#0A0A0B] rounded-lg font-semibold hover:bg-[#0ea371]"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingCategory(null)}
                              className="px-1.5 py-0.5 text-[#71717A] hover:text-[#EDEDED]"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <>
                            <span className="font-medium text-[#EDEDED]">
                              {formatCurrency(spent)}
                            </span>
                            <span className="text-[#71717A]">/ {formatCurrency(budget.monthlyLimit)}</span>
                            <button
                              onClick={() => {
                                setEditingCategory(budget.category);
                                setEditLimitInput(budget.monthlyLimit.toString());
                              }}
                              className="text-[#71717A] hover:text-[#10B981] p-0.5 transition-colors"
                              title="Edit budget limit"
                            >
                              <Sliders className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-[#2D2D33] h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isOver 
                            ? 'bg-rose-500' 
                            : isNear 
                            ? 'bg-amber-400' 
                            : 'bg-[#10B981]'
                        }`}
                        style={{ width: `${Math.min(100, percent)}%` }}
                      ></div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-[#71717A] mt-1.5">
                      <div className="flex items-center gap-1">
                        {isOver ? (
                          <span className="text-rose-400 font-medium flex items-center gap-0.5">
                            <AlertTriangle className="w-3 h-3" /> Exceeded by {formatCurrency(Math.abs(remaining))}
                          </span>
                        ) : isNear ? (
                          <span className="text-amber-400 font-medium">
                            {formatCurrency(remaining)} remaining (80%+ reached)
                          </span>
                        ) : (
                          <span className="text-[#10B981] font-medium flex items-center gap-0.5">
                            <CheckCircle className="w-3 h-3" /> {formatCurrency(remaining)} remaining
                          </span>
                        )}
                      </div>
                      <span className="font-medium text-[#A1A1AA]">{percent}% of budget</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="h-72 w-full pt-4">
              <p className="text-xs text-[#71717A] mb-2">Daily burn rate across synced transactions:</p>
              <ResponsiveContainer width="100%" height="90%">
                <BarChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1F1F22" />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#71717A' }} stroke="#1F1F22" />
                  <YAxis tick={{ fontSize: 11, fill: '#71717A' }} stroke="#1F1F22" />
                  <RechartsTooltip
                    formatter={(val: any) => [formatCurrency(Number(val)), 'Expenditure']}
                    contentStyle={{
                      backgroundColor: '#161618',
                      borderColor: '#1F1F22',
                      color: '#EDEDED',
                      borderRadius: '12px',
                      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
                      fontSize: '12px'
                    }}
                    itemStyle={{ color: '#EDEDED' }}
                  />
                  <Bar dataKey="spent" fill="#10B981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

        </div>

      </div>

      {/* Monthly Spending Trends Over Time (Recharts Line Chart) */}
      <div 
        id="monthly-spending-trends-card"
        className="bg-[#161618] rounded-2xl border border-[#1F1F22] p-5 sm:p-6 shadow-xs"
      >
        
        {/* Header & Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#1F1F22]">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#2D2D33] border border-[#3F3F46] text-[#10B981] flex items-center justify-center font-bold shrink-0 mt-0.5">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-medium text-[#EDEDED]">
                  Monthly Spending Trends Over Time
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30">
                  {fullMonthlyTrendData.length} Months Tracked
                </span>
              </div>
              <p className="text-xs text-[#71717A] mt-0.5">
                Recharts line analysis showing multi-month expense trajectory and category velocity
              </p>
            </div>
          </div>

          {/* View mode and Timeframe toggles */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Series breakdown buttons */}
            <div className="flex bg-[#0E0E10] p-1 rounded-xl border border-[#1F1F22] text-xs font-medium text-[#71717A]">
              <button
                id="trend-mode-all-btn"
                onClick={() => setTrendViewMode('all')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  trendViewMode === 'all' 
                    ? 'bg-[#161618] text-[#EDEDED] border border-[#1F1F22] font-semibold' 
                    : 'hover:text-[#A1A1AA]'
                }`}
              >
                Total Spend
              </button>
              <button
                id="trend-mode-breakdown-btn"
                onClick={() => setTrendViewMode('breakdown')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  trendViewMode === 'breakdown' 
                    ? 'bg-[#161618] text-[#EDEDED] border border-[#1F1F22] font-semibold' 
                    : 'hover:text-[#A1A1AA]'
                }`}
              >
                Needs vs Wants
              </button>
              <button
                id="trend-mode-budget-btn"
                onClick={() => setTrendViewMode('budget')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  trendViewMode === 'budget' 
                    ? 'bg-[#161618] text-[#EDEDED] border border-[#1F1F22] font-semibold' 
                    : 'hover:text-[#A1A1AA]'
                }`}
              >
                Vs Budget
              </button>
            </div>

            {/* Timeframe selector */}
            <div className="flex bg-[#0E0E10] p-1 rounded-xl border border-[#1F1F22] text-xs font-medium text-[#71717A]">
              <button
                id="trend-range-all-btn"
                onClick={() => setTimeRange('all')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  timeRange === 'all' 
                    ? 'bg-[#161618] text-[#EDEDED] border border-[#1F1F22] font-semibold' 
                    : 'hover:text-[#A1A1AA]'
                }`}
              >
                All Months
              </button>
              <button
                id="trend-range-3m-btn"
                onClick={() => setTimeRange('3m')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  timeRange === '3m' 
                    ? 'bg-[#161618] text-[#EDEDED] border border-[#1F1F22] font-semibold' 
                    : 'hover:text-[#A1A1AA]'
                }`}
              >
                Last 3M
              </button>
            </div>

          </div>
        </div>

        {/* Statistical Summary Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 pb-5">
          
          <div className="bg-[#0E0E10] p-3 rounded-xl border border-[#1F1F22]">
            <span className="text-[11px] font-medium text-[#71717A] uppercase tracking-wider block">
              Latest Month Spend
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-lg font-light text-[#EDEDED]">
                {latestMonthItem ? formatCurrency(latestMonthItem.totalExpense) : '$0'}
              </span>
              {momPercentageChange !== 0 && (
                <span className={`inline-flex items-center text-[10px] font-medium px-1.5 py-0.5 rounded ${
                  momPercentageChange < 0 
                    ? 'bg-emerald-500/15 text-[#10B981]' 
                    : 'bg-rose-500/15 text-rose-400'
                }`}>
                  {momPercentageChange < 0 ? (
                    <ArrowDownRight className="w-3 h-3 mr-0.5" />
                  ) : (
                    <ArrowUpRight className="w-3 h-3 mr-0.5" />
                  )}
                  {Math.abs(momPercentageChange)}% MoM
                </span>
              )}
            </div>
          </div>

          <div className="bg-[#0E0E10] p-3 rounded-xl border border-[#1F1F22]">
            <span className="text-[11px] font-medium text-[#71717A] uppercase tracking-wider block">
              Monthly Average
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-lg font-light text-[#EDEDED]">
                {formatCurrency(avgMonthlySpend)}
              </span>
              <span className="text-[11px] text-[#71717A]">/ mo</span>
            </div>
          </div>

          <div className="bg-[#0E0E10] p-3 rounded-xl border border-[#1F1F22]">
            <span className="text-[11px] font-medium text-[#71717A] uppercase tracking-wider block">
              Peak Spending Month
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-lg font-light text-[#EDEDED]">
                {formatCurrency(peakSpendingMonth.totalExpense)}
              </span>
              <span className="text-[11px] text-[#10B981] font-medium">
                {peakSpendingMonth.month}
              </span>
            </div>
          </div>

          <div className="bg-[#0E0E10] p-3 rounded-xl border border-[#1F1F22]">
            <span className="text-[11px] font-medium text-[#71717A] uppercase tracking-wider block">
              Budget Target Cap
            </span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-lg font-light text-[#EDEDED]">
                {formatCurrency(totalMonthlyBudget)}
              </span>
              <span className="inline-flex items-center gap-0.5 text-[10px] text-[#10B981] font-medium">
                <ShieldCheck className="w-3 h-3" /> Cap
              </span>
            </div>
          </div>

        </div>

        {/* Recharts LineChart Visualizer */}
        <div className="h-72 w-full pt-1">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart 
              data={displayedTrendData}
              margin={{ top: 15, right: 25, left: 0, bottom: 5 }}
            >
              <CartesianGrid 
                strokeDasharray="3 3" 
                vertical={false} 
                stroke="#1F1F22" 
              />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 12, fill: '#71717A' }} 
                stroke="#1F1F22" 
                tickLine={false}
                axisLine={{ stroke: '#1F1F22' }}
              />
              <YAxis 
                tick={{ fontSize: 11, fill: '#71717A' }} 
                stroke="#1F1F22" 
                tickLine={false}
                axisLine={{ stroke: '#1F1F22' }}
                tickFormatter={(val) => `$${val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val}`}
                domain={['auto', 'auto']}
              />
              <RechartsTooltip content={<CustomLineTooltip />} />

              {/* Monthly Budget Benchmark Line (Visible when requested or in budget view) */}
              {trendViewMode === 'budget' && (
                <Line
                  type="monotone"
                  dataKey="budgetTarget"
                  name="Monthly Budget Cap"
                  stroke="#71717A"
                  strokeWidth={1.5}
                  strokeDasharray="5 5"
                  dot={false}
                  isAnimationActive={true}
                />
              )}

              {/* Essential Needs Line */}
              {trendViewMode === 'breakdown' && (
                <Line
                  type="monotone"
                  dataKey="essential"
                  name="Essential Needs"
                  stroke="#818CF8"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={{ r: 3.5, fill: '#818CF8', stroke: '#161618', strokeWidth: 1.5 }}
                  activeDot={{ r: 5.5, fill: '#818CF8', stroke: '#EDEDED', strokeWidth: 1.5 }}
                  isAnimationActive={true}
                />
              )}

              {/* Discretionary Wants Line */}
              {trendViewMode === 'breakdown' && (
                <Line
                  type="monotone"
                  dataKey="discretionary"
                  name="Discretionary"
                  stroke="#FBBF24"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={{ r: 3.5, fill: '#FBBF24', stroke: '#161618', strokeWidth: 1.5 }}
                  activeDot={{ r: 5.5, fill: '#FBBF24', stroke: '#EDEDED', strokeWidth: 1.5 }}
                  isAnimationActive={true}
                />
              )}

              {/* Primary Emerald Total Expenditure Trend Line */}
              <Line
                type="monotone"
                dataKey="totalExpense"
                name="Total Spending"
                stroke="#10B981"
                strokeWidth={3}
                dot={{ r: 4.5, fill: '#10B981', stroke: '#161618', strokeWidth: 2 }}
                activeDot={{ r: 7, fill: '#10B981', stroke: '#EDEDED', strokeWidth: 2 }}
                isAnimationActive={true}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Legend Ribbon */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 mt-1 border-t border-[#1F1F22] text-xs text-[#71717A]">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-1 bg-[#10B981] rounded-full"></span>
              <span className="text-[#A1A1AA]">Total Outflow</span>
            </div>
            {trendViewMode === 'breakdown' && (
              <>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-1 bg-[#818CF8] rounded-full"></span>
                  <span className="text-[#A1A1AA]">Essential Needs (Rent, Bills, Food)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-1 bg-[#FBBF24] rounded-full"></span>
                  <span className="text-[#A1A1AA]">Discretionary</span>
                </div>
              </>
            )}
            {trendViewMode === 'budget' && (
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 border-b border-dashed border-[#71717A]"></span>
                <span className="text-[#A1A1AA]">Combined Budget Target ({formatCurrency(totalMonthlyBudget)})</span>
              </div>
            )}
          </div>

          <div className="text-[11px] text-[#71717A]">
            Continuous trajectory aggregated from verified bank statement syncs
          </div>
        </div>

      </div>

    </div>
  );
};

