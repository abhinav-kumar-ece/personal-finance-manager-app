import React from 'react';
import { 
  ArrowDownRight, 
  ArrowUpRight, 
  TrendingDown, 
  TrendingUp, 
  DollarSign, 
  PieChart as PieChartIcon, 
  Repeat,
  ShieldCheck
} from 'lucide-react';
import { Transaction } from '../types';
import { formatCurrency } from '../utils/formatters';

interface MonthlyMetricsProps {
  currentTransactions?: Transaction[];
  transactions?: Transaction[];
  previousTransactions?: Transaction[];
  previousMonthTransactions?: Transaction[];
  selectedMonth?: string;
  budgets?: any[];
}

export const MonthlyMetrics: React.FC<MonthlyMetricsProps> = (props) => {
  const currentTransactions = Array.isArray(props.currentTransactions)
    ? props.currentTransactions
    : Array.isArray(props.transactions)
    ? props.transactions
    : [];

  const previousTransactions = Array.isArray(props.previousTransactions)
    ? props.previousTransactions
    : Array.isArray(props.previousMonthTransactions)
    ? props.previousMonthTransactions
    : [];

  const selectedMonth = props.selectedMonth || 'all';

  // Current month totals
  const totalExpense = currentTransactions
    .filter(t => t && t.type === 'expense')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const totalIncome = currentTransactions
    .filter(t => t && t.type === 'income')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const netSavings = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? Math.round((netSavings / totalIncome) * 100) : 0;

  // Essential vs Discretionary breakdown
  const essentialExpense = currentTransactions
    .filter(t => t && t.type === 'expense' && Array.isArray(t.tags) && t.tags.includes('essential'))
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const discretionaryExpense = currentTransactions
    .filter(t => t && t.type === 'expense' && Array.isArray(t.tags) && t.tags.includes('discretionary'))
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const recurringExpense = currentTransactions
    .filter(t => t && t.type === 'expense' && (t.isRecurring || (Array.isArray(t.tags) && t.tags.includes('recurring'))))
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  // Previous month comparison
  const prevExpense = previousTransactions
    .filter(t => t && t.type === 'expense')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const expenseChangePercent = prevExpense > 0 
    ? Math.round(((totalExpense - prevExpense) / prevExpense) * 100)
    : 0;

  const essentialRatio = totalExpense > 0 ? Math.round((essentialExpense / totalExpense) * 100) : 0;
  const discretionaryRatio = totalExpense > 0 ? Math.round((discretionaryExpense / totalExpense) * 100) : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      
      {/* 1. Total Expenditure Card */}
      <div className="bg-[#161618] rounded-2xl border border-[#1F1F22] p-5 shadow-xs flex flex-col justify-between hover:border-[#2D2D33] transition-all">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#71717A]">
              Total Expenditures
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#2D2D33] border border-[#3F3F46] text-rose-400 flex items-center justify-center">
              <ArrowDownRight className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl font-light text-[#EDEDED] tracking-tight">
              {formatCurrency(totalExpense)}
            </span>
            {prevExpense > 0 && (
              <span className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full ${
                expenseChangePercent <= 0 
                  ? 'text-[#10B981] bg-[#10B981]/10 border border-[#10B981]/30' 
                  : 'text-rose-400 bg-rose-500/10 border border-rose-500/30'
              }`}>
                {expenseChangePercent <= 0 ? (
                  <TrendingDown className="w-3 h-3 mr-0.5" />
                ) : (
                  <TrendingUp className="w-3 h-3 mr-0.5" />
                )}
                {Math.abs(expenseChangePercent)}% vs last mo
              </span>
            )}
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-[#1F1F22] text-xs text-[#71717A] flex items-center justify-between">
          <span>{currentTransactions.filter(t => t && t.type === 'expense').length} synced expenses</span>
          <span className="text-[#A1A1AA]">Avg ${Math.round(totalExpense / 30)}/day</span>
        </div>
      </div>

      {/* 2. Total Inflow / Income Card */}
      <div className="bg-[#161618] rounded-2xl border border-[#1F1F22] p-5 shadow-xs flex flex-col justify-between hover:border-[#2D2D33] transition-all">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#71717A]">
              Total Income
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#2D2D33] border border-[#3F3F46] text-[#10B981] flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl font-light text-[#EDEDED] tracking-tight">
              {formatCurrency(totalIncome)}
            </span>
            <span className="text-xs font-medium text-[#10B981] bg-[#10B981]/10 border border-[#10B981]/30 px-2 py-0.5 rounded-full">
              +Interest & Salary
            </span>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-[#1F1F22] text-xs text-[#71717A] flex items-center justify-between">
          <span>{currentTransactions.filter(t => t && t.type === 'income').length} deposits verified</span>
          <span className="text-[#10B981] font-medium">Direct Deposit Active</span>
        </div>
      </div>

      {/* 3. Net Savings & Rate */}
      <div className="bg-[#161618] rounded-2xl border border-[#1F1F22] p-5 shadow-xs flex flex-col justify-between hover:border-[#2D2D33] transition-all">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#71717A]">
              Net Cash Flow & Savings
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#2D2D33] border border-[#3F3F46] text-[#10B981] flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-2.5 flex items-baseline gap-2">
            <span className={`text-2xl font-light tracking-tight ${netSavings >= 0 ? 'text-[#EDEDED]' : 'text-rose-400'}`}>
              {formatCurrency(netSavings)}
            </span>
            <span className="text-xs font-medium text-[#10B981] bg-[#10B981]/10 px-2 py-0.5 rounded-full border border-[#10B981]/30">
              {savingsRate}% Saved
            </span>
          </div>

          {/* Mini progress indicator */}
          <div className="mt-3">
            <div className="w-full bg-[#2D2D33] h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-[#10B981] h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(0, savingsRate))}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-[11px] text-[#71717A] mt-1.5">
              <span>Goal: 20%</span>
              <span className="text-[#A1A1AA]">Current: {savingsRate}%</span>
            </div>
          </div>
        </div>

        <div className="mt-2 pt-2 border-t border-[#1F1F22] text-[11px] text-[#71717A]">
          Safe-to-spend surplus tracked
        </div>
      </div>

      {/* 4. Categorization Ratio & Recurring */}
      <div className="bg-[#161618] rounded-2xl border border-[#1F1F22] p-5 shadow-xs flex flex-col justify-between hover:border-[#2D2D33] transition-all">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#71717A]">
              Expenditure Mix
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#2D2D33] border border-[#3F3F46] text-purple-400 flex items-center justify-center">
              <Repeat className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-2.5 flex items-center justify-between text-xs font-medium">
            <span className="text-indigo-400">{essentialRatio}% Essential</span>
            <span className="text-amber-400">{discretionaryRatio}% Discretionary</span>
          </div>

          {/* Dual Bar */}
          <div className="mt-2 flex h-2 w-full rounded-full overflow-hidden bg-[#2D2D33]">
            <div 
              className="bg-indigo-500 transition-all duration-500" 
              style={{ width: `${essentialRatio}%` }}
              title={`Essential: ${formatCurrency(essentialExpense)}`}
            ></div>
            <div 
              className="bg-amber-500 transition-all duration-500" 
              style={{ width: `${discretionaryRatio}%` }}
              title={`Discretionary: ${formatCurrency(discretionaryExpense)}`}
            ></div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-[#1F1F22] flex items-center justify-between text-xs text-[#71717A]">
          <span className="flex items-center gap-1">
            <Repeat className="w-3 h-3 text-purple-400" /> Recurring:
          </span>
          <span className="font-medium text-[#EDEDED]">{formatCurrency(recurringExpense)}/mo</span>
        </div>
      </div>

    </div>
  );
};
