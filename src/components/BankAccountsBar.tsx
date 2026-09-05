import React from 'react';
import { 
  CreditCard, 
  Wallet, 
  PiggyBank, 
  TrendingUp, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle,
  MoreVertical,
  Plus
} from 'lucide-react';
import { BankAccount } from '../types';
import { formatCurrency, formatRelativeTime } from '../utils/formatters';

interface BankAccountsBarProps {
  accounts: BankAccount[];
  syncingAccountId: string | null;
  onSyncAccount: (id: string) => void;
  onDisconnectAccount: (id: string) => void;
  onOpenConnectModal?: () => void;
  onConnectAccount?: () => void;
}

export const BankAccountsBar: React.FC<BankAccountsBarProps> = ({
  accounts,
  syncingAccountId,
  onSyncAccount,
  onDisconnectAccount,
  onOpenConnectModal,
  onConnectAccount,
}) => {
  const handleOpenConnect = onOpenConnectModal || onConnectAccount || (() => {});
  const safeAccounts = Array.isArray(accounts) ? accounts : [];

  const getAccountIcon = (type: string) => {
    switch (type) {
      case 'credit_card':
        return <CreditCard className="w-4 h-4" />;
      case 'savings':
        return <PiggyBank className="w-4 h-4" />;
      case 'investment':
        return <TrendingUp className="w-4 h-4" />;
      default:
        return <Wallet className="w-4 h-4" />;
    }
  };

  const getAccountTypeLabel = (type: string) => {
    switch (type) {
      case 'credit_card':
        return 'Credit Card';
      case 'savings':
        return 'Savings';
      case 'investment':
        return 'Investment';
      default:
        return 'Checking';
    }
  };

  const totalAssets = safeAccounts
    .filter(a => a && a.accountType !== 'credit_card')
    .reduce((sum, a) => sum + (a.balance || 0), 0);

  const totalLiabilities = safeAccounts
    .filter(a => a && a.accountType === 'credit_card')
    .reduce((sum, a) => sum + (a.balance || 0), 0);

  return (
    <div className="bg-[#0E0E10] border-b border-[#1F1F22] py-4 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Subheader with Net Liquid Assets overview */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-[0.15em] text-[#71717A]">
              Synced Financial Institutions
            </span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#161618] text-[#A1A1AA] border border-[#1F1F22] font-medium">
              {safeAccounts.length} Active Feeds
            </span>
          </div>
          
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="text-[#71717A]">Total Liquid Cash:</span>
              <span className="font-medium text-[#EDEDED]">{formatCurrency(totalAssets)}</span>
            </div>
            <div className="w-px h-3.5 bg-[#1F1F22]"></div>
            <div className="flex items-center gap-1.5">
              <span className="text-[#71717A]">Current Card Balances:</span>
              <span className="font-medium text-rose-400">{formatCurrency(totalLiabilities)}</span>
            </div>
          </div>
        </div>

        {/* Bank Account cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {safeAccounts.map((acc) => {
            const isSyncing = syncingAccountId === acc.id || acc.syncStatus === 'syncing';
            return (
              <div
                key={acc.id}
                id={`account-card-${acc.id}`}
                className="bg-[#161618] rounded-2xl border border-[#1F1F22] p-4 flex flex-col justify-between hover:border-[#3F3F46] transition-all"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div 
                        className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-xs"
                        style={{ backgroundColor: acc.color }}
                      >
                        {getAccountIcon(acc.accountType)}
                      </div>
                      <div className="min-w-0">
                        <h2 className="text-sm font-medium text-[#EDEDED] truncate" title={acc.institutionName}>
                          {acc.institutionName}
                        </h2>
                        <div className="flex items-center gap-1.5 text-xs text-[#71717A]">
                          <span>{getAccountTypeLabel(acc.accountType)}</span>
                          <span>&bull;</span>
                          <span>&bull;&bull;&bull;&bull; {acc.mask}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => onSyncAccount(acc.id)}
                      disabled={isSyncing}
                      className="p-1 rounded-lg text-[#71717A] hover:text-[#EDEDED] hover:bg-[#2D2D33] transition-colors"
                      title="Sync this account now"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-[#10B981]' : ''}`} />
                    </button>
                  </div>

                  <div className="mt-3.5">
                    <div className="text-xs text-[#71717A]">
                      {acc.accountType === 'credit_card' ? 'Current Balance' : 'Available Balance'}
                    </div>
                    <div className="text-xl font-light text-[#EDEDED] tracking-tight mt-0.5">
                      {formatCurrency(acc.balance, acc.currency)}
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#1F1F22] flex items-center justify-between text-xs text-[#71717A]">
                  <div className="flex items-center gap-1">
                    {isSyncing ? (
                      <span className="flex items-center gap-1 text-[#10B981] font-medium">
                        <RefreshCw className="w-3 h-3 animate-spin" /> Syncing...
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[#10B981]">
                        <CheckCircle2 className="w-3 h-3" /> Synced {formatRelativeTime(acc.lastSyncedAt)}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      if (confirm(`Disconnect ${acc.institutionName} (${acc.accountName})?`)) {
                        onDisconnectAccount(acc.id);
                      }
                    }}
                    className="text-xs text-[#71717A] hover:text-rose-400 transition-colors"
                    title="Disconnect account"
                  >
                    Disconnect
                  </button>
                </div>
              </div>
            );
          })}

          {/* Quick Add Bank Card */}
          <button
            id="add-another-bank-btn"
            onClick={handleOpenConnect}
            className="border-2 border-dashed border-[#1F1F22] hover:border-[#10B981]/40 hover:bg-[#161618]/60 rounded-2xl p-4 flex flex-col items-center justify-center text-center transition-all group min-h-[120px]"
          >
            <div className="w-8 h-8 rounded-full bg-[#161618] border border-[#1F1F22] group-hover:border-[#10B981]/40 flex items-center justify-center text-[#71717A] group-hover:text-[#10B981] transition-colors mb-2">
              <Plus className="w-4 h-4" />
            </div>
            <span className="text-xs font-medium text-[#A1A1AA] group-hover:text-[#10B981]">
              Link Another Bank Feed
            </span>
            <span className="text-[11px] text-[#71717A] mt-0.5">
              Chase, BofA, Citi, Wells, Apple...
            </span>
          </button>
        </div>

      </div>
    </div>
  );
};
