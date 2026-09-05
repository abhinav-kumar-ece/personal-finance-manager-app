import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Sparkles, 
  Plus, 
  Repeat, 
  Check, 
  Trash2, 
  SlidersHorizontal,
  ChevronDown,
  Info,
  ArrowDownLeft,
  ArrowUpRight,
  ShieldAlert
} from 'lucide-react';
import { Transaction, BankAccount, ExpenseTag } from '../types';
import { CATEGORY_COLORS } from '../data/initialData';
import { formatCurrency, formatDate } from '../utils/formatters';

interface TransactionListProps {
  transactions: Transaction[];
  accounts: BankAccount[];
  isCategorizingAI: boolean;
  onBulkAICategorize: () => void;
  onUpdateCategory: (txId: string, newCategory: string) => void;
  onDeleteTransaction: (txId: string) => void;
  onAddTransaction: (tx: Omit<Transaction, 'id'>) => void;
  onCreateRuleFromMerchant: (merchant: string, category: string) => void;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  accounts,
  isCategorizingAI,
  onBulkAICategorize,
  onUpdateCategory,
  onDeleteTransaction,
  onAddTransaction,
  onCreateRuleFromMerchant,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('ALL');
  const [selectedAccountFilter, setSelectedAccountFilter] = useState('ALL');
  const [selectedTagFilter, setSelectedTagFilter] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);

  // New transaction modal state
  const safeTransactions = Array.isArray(transactions) ? transactions : [];
  const safeAccounts = Array.isArray(accounts) ? accounts : [];

  const [newMerchant, setNewMerchant] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [newAccountId, setNewAccountId] = useState(safeAccounts[0]?.id || '');
  const [newCategory, setNewCategory] = useState('Groceries & Supermarkets');
  const [newType, setNewType] = useState<'expense' | 'income'>('expense');
  const [newTag, setNewTag] = useState<ExpenseTag>('essential');

  const categories = Object.keys(CATEGORY_COLORS);

  // Filter transactions
  const filtered = safeTransactions.filter(tx => {
    if (!tx) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchMerchant = (tx.merchant || '').toLowerCase().includes(q);
      const matchRaw = (tx.rawDescription || '').toLowerCase().includes(q);
      const matchCat = (tx.category || '').toLowerCase().includes(q);
      if (!matchMerchant && !matchRaw && !matchCat) return false;
    }

    if (selectedCategoryFilter !== 'ALL' && tx.category !== selectedCategoryFilter) {
      return false;
    }

    if (selectedAccountFilter !== 'ALL' && tx.accountId !== selectedAccountFilter) {
      return false;
    }

    if (selectedTagFilter !== 'ALL') {
      const tags = Array.isArray(tx.tags) ? tx.tags : [];
      if (selectedTagFilter === 'recurring' && !tx.isRecurring && !tags.includes('recurring')) return false;
      if (selectedTagFilter === 'essential' && !tags.includes('essential')) return false;
      if (selectedTagFilter === 'discretionary' && !tags.includes('discretionary')) return false;
    }

    return true;
  });

  const handleCreateManualTx = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(newAmount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) return;

    onAddTransaction({
      accountId: newAccountId,
      date: newDate,
      amount: parsedAmount,
      type: newType,
      merchant: newMerchant || 'Manual Transaction',
      rawDescription: `MANUAL ENTRY: ${newMerchant}`,
      category: newCategory,
      tags: [newTag],
      confidenceScore: 100,
      categorizedBy: 'manual',
      status: 'posted',
      reasoning: 'Entered manually by user',
    });

    setNewMerchant('');
    setNewAmount('');
    setShowAddModal(false);
  };

  const uncategorizedCount = safeTransactions.filter(t => t && t.category === 'General Expense').length;

  return (
    <div className="bg-[#161618] rounded-2xl border border-[#1F1F22] shadow-xs overflow-hidden">
      
      {/* Top Header & AI action toolbar */}
      <div className="p-4 sm:p-5 border-b border-[#1F1F22]">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-medium text-[#EDEDED]">
                Synced Bank Expenditures & Inflow
              </h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#0E0E10] border border-[#1F1F22] text-[#A1A1AA] font-medium">
                {filtered.length} of {transactions.length}
              </span>
            </div>
            <p className="text-xs text-[#71717A] mt-0.5">
              Synced from linked institutions & auto-categorized by Gemini 3.8 Flash
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            
            {/* Bulk AI Categorize */}
            <button
              id="bulk-ai-categorize-btn"
              onClick={onBulkAICategorize}
              disabled={isCategorizingAI}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold bg-[#10B981] hover:bg-[#0ea371] text-[#0A0A0B] disabled:opacity-60 shadow-xs transition-colors"
            >
              <Sparkles className={`w-4 h-4 ${isCategorizingAI ? 'animate-spin' : ''}`} />
              <span>{isCategorizingAI ? 'Gemini Categorizing...' : 'Auto-Categorize with AI'}</span>
              {uncategorizedCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 bg-[#0A0A0B] text-[#10B981] text-[10px] rounded-full font-bold">
                  {uncategorizedCount}
                </span>
              )}
            </button>

            {/* Add manual transaction */}
            <button
              id="add-manual-tx-btn"
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium border border-[#1F1F22] bg-[#0E0E10] text-[#EDEDED] hover:bg-[#1E1E22] hover:border-[#3F3F46] transition-colors"
            >
              <Plus className="w-4 h-4 text-[#10B981]" />
              <span>Add Expense</span>
            </button>

          </div>

        </div>

        {/* Filter controls row */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          
          {/* Search box */}
          <div className="relative">
            <Search className="w-4 h-4 text-[#71717A] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search merchant or description..."
              className="w-full pl-9 pr-3 py-1.5 bg-[#0E0E10] border border-[#1F1F22] rounded-lg text-xs text-[#EDEDED] placeholder-[#71717A] focus:outline-none focus:border-[#10B981]"
            />
          </div>

          {/* Category filter */}
          <div>
            <select
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              className="w-full px-3 py-1.5 bg-[#0E0E10] border border-[#1F1F22] rounded-lg text-xs font-medium text-[#EDEDED] focus:outline-none focus:border-[#10B981] cursor-pointer"
            >
              <option value="ALL" className="bg-[#161618]">All Categories ({categories.length})</option>
              {categories.map(cat => (
                <option key={cat} value={cat} className="bg-[#161618]">{cat}</option>
              ))}
            </select>
          </div>

          {/* Account filter */}
          <div>
            <select
              value={selectedAccountFilter}
              onChange={(e) => setSelectedAccountFilter(e.target.value)}
              className="w-full px-3 py-1.5 bg-[#0E0E10] border border-[#1F1F22] rounded-lg text-xs font-medium text-[#EDEDED] focus:outline-none focus:border-[#10B981] cursor-pointer"
            >
              <option value="ALL" className="bg-[#161618]">All Connected Accounts ({accounts.length})</option>
              {accounts.map(acc => (
                <option key={acc.id} value={acc.id} className="bg-[#161618]">
                  {acc.institutionName} (•••• {acc.mask})
                </option>
              ))}
            </select>
          </div>

          {/* Tag filter */}
          <div>
            <select
              value={selectedTagFilter}
              onChange={(e) => setSelectedTagFilter(e.target.value)}
              className="w-full px-3 py-1.5 bg-[#0E0E10] border border-[#1F1F22] rounded-lg text-xs font-medium text-[#EDEDED] focus:outline-none focus:border-[#10B981] cursor-pointer"
            >
              <option value="ALL" className="bg-[#161618]">All Expenditure Types</option>
              <option value="essential" className="bg-[#161618]">Essential Spending</option>
              <option value="discretionary" className="bg-[#161618]">Discretionary / Leisure</option>
              <option value="recurring" className="bg-[#161618]">Recurring & Subscriptions</option>
            </select>
          </div>

        </div>

      </div>

      {/* Transactions Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#0E0E10] text-[11px] font-semibold uppercase tracking-[0.15em] text-[#71717A] border-b border-[#1F1F22]">
              <th className="py-3.5 px-4">Date</th>
              <th className="py-3.5 px-4">Merchant & Details</th>
              <th className="py-3.5 px-4">Account</th>
              <th className="py-3.5 px-4">Category</th>
              <th className="py-3.5 px-4">AI Verification</th>
              <th className="py-3.5 px-4 text-right">Amount</th>
              <th className="py-3.5 px-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1F1F22] text-xs">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-[#71717A]">
                  <div className="flex flex-col items-center justify-center">
                    <Filter className="w-8 h-8 text-[#71717A] mb-2" />
                    <p className="text-sm font-medium text-[#EDEDED]">No matching transactions found</p>
                    <p className="text-xs text-[#71717A] mt-1">Try clearing search filters or syncing accounts</p>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((tx) => {
                const acc = accounts.find(a => a.id === tx.accountId);
                const isIncome = tx.type === 'income';
                const catStyle = CATEGORY_COLORS[tx.category] || CATEGORY_COLORS['General Expense'];

                return (
                  <tr 
                    key={tx.id}
                    id={`tx-row-${tx.id}`}
                    className="hover:bg-[#1E1E22]/50 transition-colors group"
                  >
                    {/* Date */}
                    <td className="py-3 px-4 text-[#71717A] whitespace-nowrap font-mono text-[11px]">
                      {formatDate(tx.date)}
                    </td>

                    {/* Merchant & Raw description */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                          isIncome ? 'bg-[#10B981]/15 text-[#10B981]' : 'bg-[#2D2D33] text-[#A1A1AA]'
                        }`}>
                          {isIncome ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownLeft className="w-3.5 h-3.5" />}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-medium text-[#EDEDED] truncate">
                              {tx.merchant}
                            </span>
                            {tx.isRecurring && (
                              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[10px] font-medium bg-purple-500/15 text-purple-400 border border-purple-500/30" title="Recurring subscription or bill">
                                <Repeat className="w-2.5 h-2.5" /> Recurring
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-[#71717A] truncate max-w-xs" title={tx.rawDescription}>
                            {tx.rawDescription}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Connected Account */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      {acc ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#A1A1AA]">
                          <span 
                            className="w-2 h-2 rounded-full" 
                            style={{ backgroundColor: acc.color }}
                          ></span>
                          <span>{acc.institutionName}</span>
                          <span className="text-[#71717A]">({acc.mask})</span>
                        </span>
                      ) : (
                        <span className="text-[#71717A]">Manual</span>
                      )}
                    </td>

                    {/* Category Selector (Inline Changeable) */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <select
                        value={tx.category}
                        onChange={(e) => onUpdateCategory(tx.id, e.target.value)}
                        className={`text-xs font-medium px-2 py-1 rounded-lg border cursor-pointer outline-none transition-colors ${catStyle.bg} ${catStyle.text} ${catStyle.border}`}
                      >
                        {categories.map((c) => (
                          <option key={c} value={c} className="bg-[#161618] text-[#EDEDED]">
                            {c}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* AI Confidence & Reasoning */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        {tx.categorizedBy === 'ai' ? (
                          <span 
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30"
                            title={tx.reasoning || "AI recognized pattern"}
                          >
                            <Sparkles className="w-3 h-3 text-[#10B981]" />
                            <span>AI {tx.confidenceScore ? `${tx.confidenceScore}%` : 'Categorized'}</span>
                          </span>
                        ) : tx.categorizedBy === 'rule' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-500/15 text-amber-400 border border-amber-500/30">
                            <SlidersHorizontal className="w-3 h-3" /> Rule Matched
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#2D2D33] text-[#A1A1AA] border border-[#1F1F22]">
                            Manual
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Amount */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <span className={`font-medium font-mono text-sm ${
                        isIncome ? 'text-[#10B981]' : 'text-[#EDEDED]'
                      }`}>
                        {isIncome ? '+' : '-'}{formatCurrency(tx.amount)}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1 opacity-80 group-hover:opacity-100">
                        <button
                          onClick={() => onCreateRuleFromMerchant(tx.merchant, tx.category)}
                          className="p-1 rounded-lg text-[#71717A] hover:text-[#10B981] hover:bg-[#2D2D33] transition-colors"
                          title={`Always categorize "${tx.merchant}" as ${tx.category}`}
                        >
                          <SlidersHorizontal className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteTransaction(tx.id)}
                          className="p-1 rounded-lg text-[#71717A] hover:text-rose-400 hover:bg-[#2D2D33] transition-colors"
                          title="Delete transaction"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Manual Expense Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-[#161618] rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#1F1F22]">
            <h3 className="text-base font-medium text-[#EDEDED] mb-4">
              Add Manual Expenditure or Income
            </h3>

            <form onSubmit={handleCreateManualTx} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#A1A1AA] mb-1">
                  Type
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setNewType('expense')}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                      newType === 'expense' ? 'bg-rose-500/15 border-rose-500/40 text-rose-400' : 'bg-[#0E0E10] border-[#1F1F22] text-[#71717A]'
                    }`}
                  >
                    Expense Outflow
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewType('income')}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                      newType === 'income' ? 'bg-[#10B981]/15 border-[#10B981]/40 text-[#10B981]' : 'bg-[#0E0E10] border-[#1F1F22] text-[#71717A]'
                    }`}
                  >
                    Income Inflow
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#A1A1AA] mb-1">
                  Merchant / Payee Name
                </label>
                <input
                  type="text"
                  required
                  value={newMerchant}
                  onChange={(e) => setNewMerchant(e.target.value)}
                  placeholder="e.g. Costco Wholesale"
                  className="w-full px-3 py-2 border border-[#1F1F22] bg-[#0E0E10] text-[#EDEDED] rounded-lg text-xs focus:outline-none focus:border-[#10B981]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#A1A1AA] mb-1">
                    Amount ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={newAmount}
                    onChange={(e) => setNewAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-3 py-2 border border-[#1F1F22] bg-[#0E0E10] text-[#EDEDED] rounded-lg text-xs focus:outline-none focus:border-[#10B981]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#A1A1AA] mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    required
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full px-3 py-2 border border-[#1F1F22] bg-[#0E0E10] text-[#EDEDED] rounded-lg text-xs focus:outline-none focus:border-[#10B981]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#A1A1AA] mb-1">
                  Bank Account
                </label>
                <select
                  value={newAccountId}
                  onChange={(e) => setNewAccountId(e.target.value)}
                  className="w-full px-3 py-2 border border-[#1F1F22] bg-[#0E0E10] text-[#EDEDED] rounded-lg text-xs focus:outline-none focus:border-[#10B981]"
                >
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id} className="bg-[#161618]">
                      {a.institutionName} ({a.accountName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#A1A1AA] mb-1">
                  Category
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-[#1F1F22] bg-[#0E0E10] text-[#EDEDED] rounded-lg text-xs focus:outline-none focus:border-[#10B981]"
                >
                  {categories.map((c) => (
                    <option key={c} value={c} className="bg-[#161618]">
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#A1A1AA] mb-1">
                  Tag Classification
                </label>
                <select
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value as ExpenseTag)}
                  className="w-full px-3 py-2 border border-[#1F1F22] bg-[#0E0E10] text-[#EDEDED] rounded-lg text-xs focus:outline-none focus:border-[#10B981]"
                >
                  <option value="essential" className="bg-[#161618]">Essential (Needs)</option>
                  <option value="discretionary" className="bg-[#161618]">Discretionary (Wants)</option>
                  <option value="recurring" className="bg-[#161618]">Recurring Bill</option>
                  <option value="tax_deductible" className="bg-[#161618]">Tax Deductible</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#1F1F22]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-[#71717A] hover:bg-[#2D2D33] hover:text-[#EDEDED] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-[#10B981] hover:bg-[#0ea371] text-[#0A0A0B] shadow-xs transition-colors"
                >
                  Save Transaction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
