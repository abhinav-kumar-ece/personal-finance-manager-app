import React from 'react';
import { 
  Building2, 
  RefreshCw, 
  Plus, 
  Sparkles, 
  FileSpreadsheet, 
  SlidersHorizontal,
  Calendar,
  User as UserIcon,
  LogOut,
  Bot
} from 'lucide-react';
import { BankAccount, UserProfile } from '../types';

interface HeaderProps {
  accounts: BankAccount[];
  isSyncingAll: boolean;
  onSyncAll: () => void;
  onOpenConnectModal: () => void;
  onOpenRulesModal: () => void;
  onOpenAuditModal: () => void;
  onOpenImportModal: () => void;
  selectedMonth: string;
  onSelectMonth: (month: string) => void;
  currentUser: UserProfile | null;
  onOpenAuthModal: () => void;
  onOpenAssistantModal: () => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  accounts,
  isSyncingAll,
  onSyncAll,
  onOpenConnectModal,
  onOpenRulesModal,
  onOpenAuditModal,
  onOpenImportModal,
  selectedMonth,
  onSelectMonth,
  currentUser,
  onOpenAuthModal,
  onOpenAssistantModal,
  onLogout,
}) => {
  const safeAccounts = Array.isArray(accounts) ? accounts : [];
  const activeCount = safeAccounts.filter(a => a && (a.syncStatus === 'active' || a.syncStatus === 'syncing')).length;

  return (
    <header className="bg-[#0A0A0B]/95 backdrop-blur-md border-b border-[#1F1F22] sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          
          {/* Brand & Sync status */}
          <div className="flex items-center justify-between lg:justify-start gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#161618] border border-[#1F1F22] text-[#10B981] flex items-center justify-center font-bold text-lg shadow-sm">
                <Building2 className="w-5 h-5 text-[#10B981]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-medium tracking-tight text-[#EDEDED]">
                    Personal Finance Manager
                  </h1>
                  <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse"></span>
                    Bank Sync
                  </span>
                </div>
                <p className="text-xs text-[#71717A]">
                  {activeCount} of {accounts.length} accounts linked &bull; Per-user Firestore isolated
                </p>
              </div>
            </div>

            {/* Mobile Assistant Trigger */}
            <button
              onClick={onOpenAssistantModal}
              className="lg:hidden inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#10B981] text-[#0A0A0B]"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ask AI</span>
            </button>
          </div>

          {/* Action toolbar */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Month selector */}
            <div className="flex items-center bg-[#161618] rounded-xl px-2 py-0.5 border border-[#1F1F22] text-sm">
              <Calendar className="w-4 h-4 text-[#71717A] mr-1.5" />
              <select
                id="month-selector"
                value={selectedMonth}
                onChange={(e) => onSelectMonth(e.target.value)}
                className="bg-transparent text-xs sm:text-sm font-medium text-[#EDEDED] pr-2 py-1.5 outline-none cursor-pointer"
              >
                <option value="2026-09" className="bg-[#161618] text-[#EDEDED]">September 2026</option>
                <option value="2026-08" className="bg-[#161618] text-[#EDEDED]">August 2026</option>
                <option value="2026-07" className="bg-[#161618] text-[#EDEDED]">July 2026</option>
                <option value="2026-06" className="bg-[#161618] text-[#EDEDED]">June 2026</option>
                <option value="2026-05" className="bg-[#161618] text-[#EDEDED]">May 2026</option>
                <option value="2026-04" className="bg-[#161618] text-[#EDEDED]">April 2026</option>
                <option value="all" className="bg-[#161618] text-[#EDEDED]">All Transactions</option>
              </select>
            </div>

            {/* ASK FINANCE ASSISTANT (Multi-turn Gemini Chatbot) */}
            <button
              id="ask-finance-assistant-btn"
              onClick={onOpenAssistantModal}
              className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold bg-gradient-to-r from-[#10B981] to-[#059669] text-[#0A0A0B] hover:opacity-95 shadow-md shadow-[#10B981]/20 transition-all cursor-pointer"
              title="Open Multi-Turn Gemini Finance Assistant"
            >
              <Sparkles className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-[#0A0A0B]" />
              <span className="hidden sm:inline">Ask Finance Assistant</span>
              <span className="sm:hidden">AI Assistant</span>
            </button>

            {/* AI Financial Audit */}
            <button
              id="ai-audit-btn"
              onClick={onOpenAuditModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium bg-[#10B981]/10 text-[#10B981] hover:bg-[#10B981]/20 border border-[#10B981]/30 transition-colors"
              title="Generate Monthly AI Audit with Gemini"
            >
              <Bot className="w-4 h-4 text-[#10B981]" />
              <span className="hidden sm:inline">Monthly Report</span>
              <span className="sm:hidden">Report</span>
            </button>

            {/* Categorization Rules */}
            <button
              id="rules-btn"
              onClick={onOpenRulesModal}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs sm:text-sm font-medium text-[#A1A1AA] bg-[#161618] hover:bg-[#2D2D33] hover:text-[#EDEDED] border border-[#1F1F22] transition-colors"
              title="Manage Auto-Categorization Rules"
            >
              <SlidersHorizontal className="w-4 h-4 text-[#71717A]" />
              <span className="hidden md:inline">Rules</span>
            </button>

            {/* Statement Import */}
            <button
              id="import-statement-btn"
              onClick={onOpenImportModal}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs sm:text-sm font-medium text-[#A1A1AA] bg-[#161618] hover:bg-[#2D2D33] hover:text-[#EDEDED] border border-[#1F1F22] transition-colors"
              title="Import Statement CSV or File"
            >
              <FileSpreadsheet className="w-4 h-4 text-[#71717A]" />
              <span className="hidden md:inline">Import</span>
            </button>

            {/* Sync Now */}
            <button
              id="sync-now-btn"
              onClick={onSyncAll}
              disabled={isSyncingAll}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium text-[#A1A1AA] bg-[#161618] hover:bg-[#2D2D33] hover:text-[#EDEDED] border border-[#1F1F22] disabled:opacity-50 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#71717A] ${isSyncingAll ? 'animate-spin text-[#10B981]' : ''}`} />
              <span className="hidden sm:inline">{isSyncingAll ? 'Syncing...' : 'Sync'}</span>
            </button>

            {/* Connect Bank Button */}
            <button
              id="connect-bank-btn"
              onClick={onOpenConnectModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium text-[#EDEDED] bg-[#1F1F22] hover:bg-[#2D2D33] border border-[#2D2D33] transition-colors"
            >
              <Plus className="w-4 h-4 text-[#10B981]" />
              <span className="hidden sm:inline">Bank</span>
            </button>

            {/* User Profile / Auth Button */}
            <div className="flex items-center pl-1 border-l border-[#1F1F22]">
              <button
                id="user-profile-btn"
                onClick={onOpenAuthModal}
                className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-[#161618] hover:bg-[#202024] border border-[#2D2D33] transition-colors text-xs text-[#EDEDED]"
                title="Manage Multi-User Authentication"
              >
                <div className="w-5 h-5 rounded-full bg-[#10B981]/20 text-[#10B981] flex items-center justify-center font-bold text-[10px]">
                  {currentUser?.displayName ? currentUser.displayName.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="max-w-[100px] truncate font-medium hidden sm:inline">
                  {currentUser?.displayName || 'Sign In'}
                </span>
              </button>

              {currentUser && (
                <button
                  id="user-logout-btn"
                  onClick={onLogout}
                  title="Sign out of current account"
                  className="p-1.5 text-[#71717A] hover:text-rose-400 rounded-lg transition-colors ml-1"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}
            </div>

          </div>
        </div>
      </div>
    </header>
  );
};
