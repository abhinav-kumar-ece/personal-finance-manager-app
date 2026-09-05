import React, { useState } from 'react';
import { 
  Repeat, 
  AlertCircle, 
  CheckCircle2, 
  Calendar, 
  ShieldAlert, 
  Plus, 
  Trash2, 
  ExternalLink,
  DollarSign
} from 'lucide-react';
import { RecurringSubscription, BankAccount } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';

interface RecurringSubscriptionsProps {
  subscriptions: RecurringSubscription[];
  accounts: BankAccount[];
  onAddSubscription: (sub: Omit<RecurringSubscription, 'id' | 'annualCost'>) => void;
  onUpdateStatus: (id: string, status: 'active' | 'review_suggested' | 'cancelled') => void;
  onDeleteSubscription: (id: string) => void;
}

export const RecurringSubscriptions: React.FC<RecurringSubscriptionsProps> = ({
  subscriptions,
  accounts,
  onAddSubscription,
  onUpdateStatus,
  onDeleteSubscription,
}) => {
  const safeSubs = Array.isArray(subscriptions) ? subscriptions : [];
  const safeAccounts = Array.isArray(accounts) ? accounts : [];

  const [showAddForm, setShowAddForm] = useState(false);
  const [merchant, setMerchant] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Subscriptions & Digital');
  const [frequency, setFrequency] = useState<'monthly' | 'yearly'>('monthly');
  const [nextDueDate, setNextDueDate] = useState('');
  const [accountId, setAccountId] = useState(safeAccounts[0]?.id || '');

  const activeSubs = safeSubs.filter(s => s && s.status !== 'cancelled');
  const totalMonthly = activeSubs.reduce((sum, s) => {
    return sum + (s.frequency === 'yearly' ? s.amount / 12 : s.amount);
  }, 0);
  const totalAnnual = totalMonthly * 12;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) return;

    onAddSubscription({
      merchant,
      category,
      amount: val,
      frequency,
      nextDueDate: nextDueDate || new Date().toISOString().split('T')[0],
      accountId,
      status: 'active',
    });

    setMerchant('');
    setAmount('');
    setShowAddForm(false);
  };

  return (
    <div className="bg-[#161618] rounded-2xl border border-[#1F1F22] p-5 shadow-xs mb-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-[#1F1F22]">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#2D2D33] border border-[#3F3F46] text-purple-400 flex items-center justify-center font-bold">
              <Repeat className="w-4 h-4" />
            </div>
            <h2 className="text-base font-medium text-[#EDEDED]">
              Automated Recurring Subscriptions & Fixed Bills
            </h2>
          </div>
          <p className="text-xs text-[#71717A] mt-1">
            Gemini actively detects repeat billers, renewals, and duplicate subscriptions from bank statements.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="text-xs text-[#71717A] block">Total Monthly Outflow</span>
            <span className="text-lg font-light text-[#EDEDED]">{formatCurrency(totalMonthly)}/mo</span>
            <span className="text-[11px] text-[#71717A] block">({formatCurrency(totalAnnual)}/yr)</span>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#10B981] text-[#0A0A0B] hover:bg-[#0ea371] transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Bill</span>
          </button>
        </div>
      </div>

      {/* Add Subscription Form */}
      {showAddForm && (
        <form onSubmit={handleCreate} className="mt-4 p-4 bg-[#0E0E10] border border-[#1F1F22] rounded-xl space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-[#A1A1AA] mb-1">Service Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Disney+, Gym, Internet"
                value={merchant}
                onChange={(e) => setMerchant(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-[#161618] border border-[#1F1F22] text-[#EDEDED] rounded-lg text-xs focus:outline-none focus:border-[#10B981]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-[#A1A1AA] mb-1">Amount ($)</label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-[#161618] border border-[#1F1F22] text-[#EDEDED] rounded-lg text-xs focus:outline-none focus:border-[#10B981]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-[#A1A1AA] mb-1">Frequency</label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as any)}
                className="w-full px-2.5 py-1.5 bg-[#161618] border border-[#1F1F22] text-[#EDEDED] rounded-lg text-xs focus:outline-none focus:border-[#10B981]"
              >
                <option value="monthly" className="bg-[#161618]">Monthly</option>
                <option value="yearly" className="bg-[#161618]">Yearly</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-[#A1A1AA] mb-1">Next Renewal Date</label>
              <input
                type="date"
                required
                value={nextDueDate}
                onChange={(e) => setNextDueDate(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-[#161618] border border-[#1F1F22] text-[#EDEDED] rounded-lg text-xs focus:outline-none focus:border-[#10B981]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-[#A1A1AA] mb-1">Charged Account</label>
              <select
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-[#161618] border border-[#1F1F22] text-[#EDEDED] rounded-lg text-xs focus:outline-none focus:border-[#10B981]"
              >
                {accounts.map(a => (
                  <option key={a.id} value={a.id} className="bg-[#161618]">
                    {a.institutionName} (•••• {a.mask})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3 py-1 text-xs text-[#71717A] hover:bg-[#2D2D33] hover:text-[#EDEDED] rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1 text-xs font-semibold bg-[#10B981] text-[#0A0A0B] hover:bg-[#0ea371] rounded-lg shadow-xs transition-colors"
            >
              Track Subscription
            </button>
          </div>
        </form>
      )}

      {/* Subscriptions Grid */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {subscriptions.map((sub) => {
          const acc = accounts.find(a => a.id === sub.accountId);
          const isCancelled = sub.status === 'cancelled';
          const isReview = sub.status === 'review_suggested';

          return (
            <div 
              key={sub.id}
              className={`p-3.5 rounded-xl border transition-all ${
                isCancelled 
                  ? 'bg-[#0E0E10] border-[#1F1F22] opacity-50' 
                  : isReview
                  ? 'bg-[#0E0E10] border-amber-500/40 hover:border-amber-500/60'
                  : 'bg-[#0E0E10] border-[#1F1F22] hover:border-[#2D2D33]'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-sm font-medium text-[#EDEDED] truncate">
                    {sub.merchant}
                  </h3>
                  <span className="text-[11px] text-[#71717A] block">
                    {sub.category}
                  </span>
                </div>

                <span className="text-sm font-medium text-[#EDEDED]">
                  {formatCurrency(sub.amount)}
                  <span className="text-[10px] font-normal text-[#71717A]">/{sub.frequency === 'yearly' ? 'yr' : 'mo'}</span>
                </span>
              </div>

              <div className="mt-3 pt-2.5 border-t border-[#1F1F22] flex items-center justify-between text-[11px] text-[#71717A]">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-[#71717A]" />
                  <span>Next: {formatDate(sub.nextDueDate)}</span>
                </div>

                {acc && (
                  <span className="text-[#71717A] font-medium">
                    •••• {acc.mask}
                  </span>
                )}
              </div>

              {/* Status and Action pills */}
              <div className="mt-2.5 flex items-center justify-between">
                {isReview ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-full">
                    <ShieldAlert className="w-2.5 h-2.5" /> Review Suggested
                  </span>
                ) : isCancelled ? (
                  <span className="text-[10px] font-medium text-[#71717A] bg-[#2D2D33] border border-[#1F1F22] px-2 py-0.5 rounded-full">
                    Cancelled
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] font-medium text-[#10B981] bg-[#10B981]/10 border border-[#10B981]/30 px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="w-2.5 h-2.5" /> Auto-Renew Active
                  </span>
                )}

                <div className="flex items-center gap-1">
                  {isCancelled ? (
                    <button
                      onClick={() => onUpdateStatus(sub.id, 'active')}
                      className="text-[11px] font-medium text-[#10B981] hover:underline"
                    >
                      Reactivate
                    </button>
                  ) : (
                    <button
                      onClick={() => onUpdateStatus(sub.id, 'cancelled')}
                      className="text-[11px] font-medium text-[#71717A] hover:text-rose-400 transition-colors"
                      title="Mark as cancelled"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    onClick={() => onDeleteSubscription(sub.id)}
                    className="text-[#71717A] hover:text-rose-400 p-1 transition-colors"
                    title="Remove from tracking"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
