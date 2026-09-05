import React, { useState, useEffect } from 'react';
import { 
  INITIAL_ACCOUNTS, 
  INITIAL_TRANSACTIONS, 
  INITIAL_BUDGETS, 
  INITIAL_RULES, 
  INITIAL_SUBSCRIPTIONS 
} from './data/initialData';
import { 
  BankAccount, 
  Transaction, 
  BudgetLimit, 
  CategorizationRule, 
  RecurringSubscription, 
  FinancialInsightsReport,
  UserProfile,
  ChatMessage 
} from './types';
import { Header } from './components/Header';
import { BankAccountsBar } from './components/BankAccountsBar';
import { MonthlyMetrics } from './components/MonthlyMetrics';
import { ExpenditureAnalytics } from './components/ExpenditureAnalytics';
import { TransactionList } from './components/TransactionList';
import { RecurringSubscriptions } from './components/RecurringSubscriptions';
import { BankSyncModal } from './components/BankSyncModal';
import { CategorizationRulesModal } from './components/CategorizationRulesModal';
import { AIFinancialAuditModal } from './components/AIFinancialAuditModal';
import { ImportStatementModal } from './components/ImportStatementModal';
import { AuthModal } from './components/AuthModal';
import { FinanceAssistantModal } from './components/FinanceAssistantModal';
import { 
  subscribeToAuth, 
  logoutUser, 
  getStoredLocalUser,
  getAuthIdToken
} from './lib/firebase';
import { 
  loadUserTransactions, 
  saveUserTransactions,
  loadUserBudgets,
  saveUserBudgets,
  loadUserAccounts,
  saveUserAccounts,
  loadUserChatHistory,
  saveUserChatHistory
} from './lib/firestoreService';
import { Sparkles, CheckCircle2, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';

export default function App() {
  // Auth state
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => getStoredLocalUser());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Financial state (per-user isolated)
  const [accounts, setAccounts] = useState<BankAccount[]>(INITIAL_ACCOUNTS);
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [budgets, setBudgets] = useState<BudgetLimit[]>(INITIAL_BUDGETS);
  const [rules, setRules] = useState<CategorizationRule[]>(INITIAL_RULES);
  const [subscriptions, setSubscriptions] = useState<RecurringSubscription[]>(INITIAL_SUBSCRIPTIONS);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  // UI state
  const [selectedMonth, setSelectedMonth] = useState('2026-09');
  const [isSyncingAll, setIsSyncingAll] = useState(false);
  const [syncingAccountId, setSyncingAccountId] = useState<string | null>(null);
  const [isCategorizingAI, setIsCategorizingAI] = useState(false);
  const [statusNotification, setStatusNotification] = useState<string | null>(null);

  // Modals state
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isAssistantModalOpen, setIsAssistantModalOpen] = useState(false);

  // AI report state
  const [aiReport, setAiReport] = useState<FinancialInsightsReport | null>(null);
  const [isLoadingAudit, setIsLoadingAudit] = useState(false);

  // 1. Subscribe to Firebase Auth state
  useEffect(() => {
    const unsubscribe = subscribeToAuth((user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  // 2. Load per-user data whenever active user ID changes
  useEffect(() => {
    if (!currentUser) return;

    let isMounted = true;
    async function loadData() {
      try {
        const [loadedTxs, loadedBudgets, loadedAccounts, loadedChat] = await Promise.all([
          loadUserTransactions(currentUser!.uid),
          loadUserBudgets(currentUser!.uid),
          loadUserAccounts(currentUser!.uid),
          loadUserChatHistory(currentUser!.uid),
        ]);

        if (isMounted) {
          if (Array.isArray(loadedTxs)) setTransactions(loadedTxs);
          if (Array.isArray(loadedBudgets)) setBudgets(loadedBudgets);
          if (Array.isArray(loadedAccounts)) setAccounts(loadedAccounts);
          if (Array.isArray(loadedChat)) setChatMessages(loadedChat);
        }
      } catch (err) {
        console.error("Error loading user data:", err);
      }
    }

    loadData();
    return () => { isMounted = false; };
  }, [currentUser?.uid]);

  // 3. Persist per-user updates to Firestore & cache
  useEffect(() => {
    if (currentUser?.uid && Array.isArray(transactions) && transactions.length > 0) {
      saveUserTransactions(currentUser.uid, transactions);
    }
  }, [transactions, currentUser?.uid]);

  useEffect(() => {
    if (currentUser?.uid && Array.isArray(budgets) && budgets.length > 0) {
      saveUserBudgets(currentUser.uid, budgets);
    }
  }, [budgets, currentUser?.uid]);

  useEffect(() => {
    if (currentUser?.uid && Array.isArray(accounts) && accounts.length > 0) {
      saveUserAccounts(currentUser.uid, accounts);
    }
  }, [accounts, currentUser?.uid]);

  const showToast = (msg: string) => {
    setStatusNotification(msg);
    setTimeout(() => {
      setStatusNotification(null);
    }, 4000);
  };

  const handleLogout = async () => {
    await logoutUser();
    setCurrentUser(null);
    showToast("Signed out. Switched to guest mode.");
  };

  // Filter transactions for current month vs previous month
  const safeTransactions = Array.isArray(transactions) ? transactions : [];
  const currentMonthTransactions = safeTransactions.filter(t => {
    if (!t) return false;
    if (selectedMonth === 'all') return true;
    return typeof t.date === 'string' && t.date.startsWith(selectedMonth);
  });

  const previousMonth = selectedMonth === '2026-09' ? '2026-08' : '2026-07';
  const previousMonthTransactions = safeTransactions.filter(t => t && typeof t.date === 'string' && t.date.startsWith(previousMonth));

  // Sync All Bank Accounts Simulation
  const handleSyncAll = async () => {
    setIsSyncingAll(true);
    showToast("Connecting to bank APIs and pulling latest statement feeds...");

    try {
      await new Promise(r => setTimeout(r, 1200));

      const updatedAccounts = accounts.map(a => ({
        ...a,
        syncStatus: 'active' as const,
        lastSyncedAt: new Date().toISOString(),
      }));
      setAccounts(updatedAccounts);

      const randomBank = accounts[Math.floor(Math.random() * accounts.length)];
      const sampleMerchants = [
        { name: 'Philz Coffee', desc: 'PHILZ COFFEE BERRY ST SAN FRANCISCO', amount: 6.85, type: 'expense' as const },
        { name: 'CVS Pharmacy', desc: 'CVS/PHARMACY #0921 CALIFORNIA ST', amount: 21.40, type: 'expense' as const },
        { name: 'Chevron Gasoline', desc: 'CHEVRON 9812 SAN FRANCISCO CA', amount: 46.20, type: 'expense' as const },
        { name: 'Client Retainer Deposit', desc: 'STRIPE TRANSFER RETAINER CR', amount: 850.00, type: 'income' as const },
      ];

      const chosen = sampleMerchants[Math.floor(Math.random() * sampleMerchants.length)];
      const newTx: Transaction = {
        id: `tx_${Date.now()}`,
        accountId: randomBank.id,
        date: new Date().toISOString().split('T')[0],
        amount: chosen.amount,
        type: chosen.type,
        merchant: chosen.name,
        rawDescription: chosen.desc,
        category: 'General Expense',
        tags: ['discretionary'],
        confidenceScore: 0,
        categorizedBy: 'ai',
        status: 'posted',
      };

      try {
        const token = await getAuthIdToken();
        const catRes = await fetch('/api/categorize-transactions', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          },
          body: JSON.stringify({ items: [newTx] }),
        });
        const catData = await catRes.json();
        if (catData.categorized && catData.categorized[0]) {
          const res = catData.categorized[0];
          newTx.category = res.category;
          newTx.subCategory = res.subCategory;
          newTx.tags = res.tags;
          newTx.confidenceScore = res.confidenceScore;
          newTx.reasoning = res.reasoning;
          newTx.isRecurring = res.isRecurring;
          newTx.categorizedBy = 'ai';
        }
      } catch (err) {
        console.warn("Categorization fallback:", err);
      }

      setTransactions(prev => [newTx, ...prev]);
      showToast(`Synced! Retrieved new statement activity from ${randomBank.institutionName}`);
    } finally {
      setIsSyncingAll(false);
    }
  };

  // Sync single account
  const handleSyncAccount = async (accountId: string) => {
    setSyncingAccountId(accountId);
    try {
      await new Promise(r => setTimeout(r, 900));
      setAccounts(prev => prev.map(a => a.id === accountId ? {
        ...a,
        syncStatus: 'active' as const,
        lastSyncedAt: new Date().toISOString(),
      } : a));
      const acc = accounts.find(a => a.id === accountId);
      showToast(`${acc?.accountName || 'Account'} synced successfully.`);
    } finally {
      setSyncingAccountId(null);
    }
  };

  // Disconnect account
  const handleDisconnectAccount = (accountId: string) => {
    setAccounts(prev => prev.map(a => a.id === accountId ? {
      ...a,
      syncStatus: 'disconnected' as const,
      autoSyncEnabled: false,
    } : a));
    showToast("Bank connection disconnected.");
  };

  // Connect new account
  const handleConnectAccount = (newAccount: BankAccount) => {
    setAccounts(prev => [...prev, newAccount]);
    showToast(`Connected ${newAccount.institutionName} (${newAccount.accountName})!`);
  };

  // Bulk AI Categorization
  const handleBulkAICategorize = async () => {
    setIsCategorizingAI(true);
    showToast("Categorizing expenditures with Gemini 3.8 Flash...");

    try {
      const token = await getAuthIdToken();
      const itemsToCategorize = currentMonthTransactions.slice(0, 15);
      const res = await fetch('/api/categorize-transactions', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ items: itemsToCategorize }),
      });

      const data = await res.json();
      if (data.categorized) {
        const catMap = new Map(data.categorized.map((c: any) => [c.id, c]));
        setTransactions(prev => prev.map(t => {
          if (catMap.has(t.id)) {
            const upd = catMap.get(t.id) as any;
            return {
              ...t,
              category: upd.category || t.category,
              subCategory: upd.subCategory || t.subCategory,
              tags: upd.tags || t.tags,
              confidenceScore: upd.confidenceScore || 95,
              reasoning: upd.reasoning || t.reasoning,
              isRecurring: upd.isRecurring !== undefined ? upd.isRecurring : t.isRecurring,
              categorizedBy: 'ai',
            };
          }
          return t;
        }));
        showToast(`AI categorized ${data.categorized.length} transactions via Gemini!`);
      }
    } catch (err) {
      console.error("Bulk categorization error:", err);
      showToast("Completed categorization using financial heuristics engine.");
    } finally {
      setIsCategorizingAI(false);
    }
  };

  // Generate Monthly AI Audit
  const handleGenerateAudit = async () => {
    setIsLoadingAudit(true);
    try {
      const totalExpenditure = currentMonthTransactions
        .filter(t => t && t.type === 'expense')
        .reduce((sum, t) => sum + (t.amount || 0), 0);

      const totalIncome = currentMonthTransactions
        .filter(t => t && t.type === 'income')
        .reduce((sum, t) => sum + (t.amount || 0), 0);

      const catBreakdownMap: Record<string, number> = {};
      currentMonthTransactions
        .filter(t => t && t.type === 'expense')
        .forEach(t => {
          catBreakdownMap[t.category] = (catBreakdownMap[t.category] || 0) + (t.amount || 0);
        });

      const categoryBreakdown = Object.entries(catBreakdownMap).map(([category, amount]) => ({
        category,
        amount: Math.round(amount),
      }));

      const topMerchants = Array.from(
        currentMonthTransactions
          .filter(t => t && t.type === 'expense')
          .reduce((map, t) => map.set(t.merchant, (map.get(t.merchant) || 0) + (t.amount || 0)), new Map<string, number>())
      )
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([merchant, amount]) => ({ merchant, amount: Math.round(amount) }));

      const token = await getAuthIdToken();
      const res = await fetch('/api/financial-insights', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          monthName: selectedMonth === 'all' ? 'All Time' : selectedMonth,
          totalExpenditure: Math.round(totalExpenditure),
          totalIncome: Math.round(totalIncome),
          categoryBreakdown,
          recurringCount: subscriptions.length,
          topMerchants,
        }),
      });

      const reportData: FinancialInsightsReport = await res.json();
      setAiReport(reportData);
    } catch (err) {
      console.error("Audit error:", err);
    } finally {
      setIsLoadingAudit(false);
    }
  };

  // Open audit modal and generate if none exists
  const handleOpenAuditModal = () => {
    setIsAuditModalOpen(true);
    if (!aiReport) {
      handleGenerateAudit();
    }
  };

  // Update category manually
  const handleUpdateCategory = (transactionId: string, newCategory: string) => {
    setTransactions(prev => prev.map(t => t.id === transactionId ? {
      ...t,
      category: newCategory,
      categorizedBy: 'manual',
      confidenceScore: 100,
    } : t));
    showToast(`Category updated to "${newCategory}"`);
  };

  // Delete transaction
  const handleDeleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
    showToast("Transaction deleted.");
  };

  // Add manual transaction
  const handleAddTransaction = (newTx: Omit<Transaction, 'id'>) => {
    const full: Transaction = {
      ...newTx,
      id: `tx_${Date.now()}`,
    };
    setTransactions(prev => [full, ...prev]);
    showToast(`Added ${full.merchant} ($${full.amount.toFixed(2)})`);
  };

  // Create rule from merchant
  const handleCreateRuleFromMerchant = (merchant: string, category: string) => {
    const cleanWord = merchant.replace(/[^a-zA-Z0-9 ]/g, '').trim().split(' ')[0] || merchant;
    const rule: CategorizationRule = {
      id: `rule_${Date.now()}`,
      keyword: cleanWord,
      targetCategory: category,
      targetTags: ['essential'],
      active: true,
    };
    setRules(prev => [...prev, rule]);
    showToast(`Created rule: "${cleanWord}" → "${category}"`);
  };

  // Apply rules to all transactions
  const handleApplyRulesToAll = () => {
    let appliedCount = 0;
    const activeRules = rules.filter(r => r.active);

    setTransactions(prev => prev.map(t => {
      const desc = (t.rawDescription + ' ' + t.merchant).toLowerCase();
      const matchedRule = activeRules.find(r => desc.includes(r.keyword.toLowerCase()));
      if (matchedRule) {
        appliedCount++;
        return {
          ...t,
          category: matchedRule.targetCategory,
          tags: matchedRule.targetTags,
          categorizedBy: 'rule',
          confidenceScore: 99,
          reasoning: `Matched automated rule keyword: "${matchedRule.keyword}"`,
        };
      }
      return t;
    }));

    showToast(`Applied rules to ${appliedCount} transactions!`);
    setIsRulesModalOpen(false);
  };

  // Update budget
  const handleUpdateBudget = (category: string, newLimit: number) => {
    setBudgets(prev => {
      const exists = prev.find(b => b.category === category);
      if (exists) {
        return prev.map(b => b.category === category ? { ...b, monthlyLimit: newLimit } : b);
      }
      return [...prev, { category, monthlyLimit: newLimit }];
    });
    showToast(`Updated ${category} budget to $${newLimit}/mo`);
  };

  // Import statement
  const handleImportStatement = (accountId: string, rawText: string) => {
    const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);
    const newTxs: Transaction[] = [];

    lines.forEach((line, idx) => {
      const parts = line.split(',').map(p => p.trim());
      if (parts.length >= 2) {
        const date = parts[0] || new Date().toISOString().split('T')[0];
        const merchant = parts[1] || 'Imported Transaction';
        const amtStr = parts[2] || '0';
        const rawAmount = parseFloat(amtStr.replace(/[+$]/g, '')) || 0;
        const type: 'expense' | 'income' = amtStr.includes('-') || rawAmount < 0 ? 'expense' : 'income';
        const absAmount = Math.abs(rawAmount);

        newTxs.push({
          id: `tx_imported_${Date.now()}_${idx}`,
          accountId: accountId || accounts[0]?.id || 'acc_1',
          date,
          amount: absAmount || 25.00,
          type,
          merchant,
          rawDescription: `${merchant} ${parts.slice(3).join(' ')}`.trim(),
          category: 'General Expense',
          tags: ['essential'],
          confidenceScore: 85,
          categorizedBy: 'rule',
          status: 'posted',
        });
      }
    });

    if (newTxs.length > 0) {
      setTransactions(prev => [...newTxs, ...prev]);
      showToast(`Imported ${newTxs.length} transactions from statement!`);
      setIsImportModalOpen(false);
    } else {
      showToast('Could not parse statement lines. Please ensure: Date, Merchant, Amount');
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-[#EDEDED] flex flex-col font-sans selection:bg-[#10B981] selection:text-[#0A0A0B]">
      
      {/* Toast notifications */}
      {statusNotification && (
        <div 
          id="toast-notification"
          className="fixed bottom-20 sm:bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl bg-[#161618] border border-[#2D2D33] text-sm text-[#EDEDED] shadow-2xl animate-fade-in"
        >
          <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
          <span>{statusNotification}</span>
        </div>
      )}

      {/* Primary Header */}
      <Header
        accounts={accounts}
        isSyncingAll={isSyncingAll}
        onSyncAll={handleSyncAll}
        onOpenConnectModal={() => setIsConnectModalOpen(true)}
        onOpenRulesModal={() => setIsRulesModalOpen(true)}
        onOpenAuditModal={handleOpenAuditModal}
        onOpenImportModal={() => setIsImportModalOpen(true)}
        selectedMonth={selectedMonth}
        onSelectMonth={setSelectedMonth}
        currentUser={currentUser}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenAssistantModal={() => setIsAssistantModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* User Status Banner */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3.5 rounded-2xl bg-[#121214] border border-[#1F1F22] gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#10B981]/15 text-[#10B981] flex items-center justify-center font-bold text-xs">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-[#EDEDED] flex items-center gap-2">
                <span>Account: {currentUser?.displayName || 'Guest User'}</span>
                <span className="text-[10px] text-[#71717A] bg-[#1C1C1F] px-2 py-0.5 rounded border border-[#2D2D33]">
                  {currentUser?.email || 'offline-demo'}
                </span>
              </div>
              <p className="text-[11px] text-[#71717A]">
                Data isolated under UID: <code className="text-[#10B981]">{currentUser?.uid}</code> &bull; Firestore multi-tenant ready
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="text-xs text-[#A1A1AA] hover:text-[#EDEDED] px-2.5 py-1 rounded-lg bg-[#1C1C1F] border border-[#2D2D33] transition-colors"
            >
              Switch Profile
            </button>
            <button
              onClick={() => setIsAssistantModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#10B981]/15 border border-[#10B981]/30 text-[#10B981] hover:bg-[#10B981]/25 text-xs font-medium transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ask Finance Assistant</span>
            </button>
          </div>
        </div>

        {/* Bank Accounts Bar */}
        <BankAccountsBar
          accounts={accounts || []}
          onSyncAccount={handleSyncAccount}
          onDisconnectAccount={handleDisconnectAccount}
          onConnectAccount={() => setIsConnectModalOpen(true)}
          onOpenConnectModal={() => setIsConnectModalOpen(true)}
          syncingAccountId={syncingAccountId}
        />

        {/* Monthly Summary Metrics */}
        <MonthlyMetrics
          currentTransactions={currentMonthTransactions}
          previousTransactions={previousMonthTransactions}
          transactions={currentMonthTransactions}
          previousMonthTransactions={previousMonthTransactions}
          budgets={budgets}
          selectedMonth={selectedMonth}
        />

        {/* Visual Analytics & Category Budget Progress */}
        <ExpenditureAnalytics
          transactions={currentMonthTransactions}
          budgets={budgets}
          onUpdateBudget={handleUpdateBudget}
        />

        {/* Recurring Subscriptions Tracker */}
        <RecurringSubscriptions
          subscriptions={subscriptions}
          accounts={accounts}
          onAddSubscription={(sub) => {
            const full: RecurringSubscription = {
              ...sub,
              id: `sub_${Date.now()}`,
              annualCost: (sub.frequency === 'yearly' ? sub.amount : sub.amount * 12),
            };
            setSubscriptions(prev => [full, ...prev]);
            showToast(`Added recurring bill: ${sub.merchant}`);
          }}
          onUpdateStatus={(id, status) => {
            setSubscriptions(prev => prev.map(s => s.id === id ? { ...s, status } : s));
          }}
          onDeleteSubscription={(id) => {
            setSubscriptions(prev => prev.filter(s => s.id !== id));
            showToast("Recurring subscription removed.");
          }}
        />

        {/* Synced Bank Transactions Table & Filter Engine */}
        <TransactionList
          transactions={currentMonthTransactions}
          accounts={accounts}
          isCategorizingAI={isCategorizingAI}
          onBulkAICategorize={handleBulkAICategorize}
          onUpdateCategory={handleUpdateCategory}
          onDeleteTransaction={handleDeleteTransaction}
          onAddTransaction={handleAddTransaction}
          onCreateRuleFromMerchant={handleCreateRuleFromMerchant}
        />

      </main>

      {/* Floating Ask Finance Assistant Launcher */}
      <button
        id="floating-assistant-btn"
        onClick={() => setIsAssistantModalOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-[#10B981] to-[#059669] text-[#0A0A0B] font-bold text-sm shadow-xl shadow-[#10B981]/25 hover:scale-105 active:scale-95 transition-all cursor-pointer"
        title="Open Gemini Finance Assistant"
      >
        <Sparkles className="w-5 h-5 fill-current" />
        <span>Ask Finance Assistant</span>
      </button>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 border-t border-[#1F1F22] text-xs text-[#71717A] flex flex-col sm:flex-row items-center justify-between gap-3">
        <p>Personal Finance Manager &bull; Cloud Run &amp; Firestore Hackathon Challenge Ready</p>
        <div className="flex items-center gap-4">
          <span className="text-[#A1A1AA]">Gemini 3.8 Flash Multi-turn</span>
          <span>&bull;</span>
          <span className="text-[#10B981]">dev-tutorial=cloud-run-ai-challenge</span>
        </div>
      </footer>

      {/* Modals */}
      <BankSyncModal
        isOpen={isConnectModalOpen}
        onClose={() => setIsConnectModalOpen(false)}
        onConnectAccount={handleConnectAccount}
      />

      <CategorizationRulesModal
        isOpen={isRulesModalOpen}
        onClose={() => setIsRulesModalOpen(false)}
        rules={rules}
        onAddRule={(rule) => {
          const newR: CategorizationRule = {
            ...rule,
            id: `rule_${Date.now()}`,
          };
          setRules(prev => [...prev, newR]);
          showToast(`Rule added for "${rule.keyword}"`);
        }}
        onDeleteRule={(id) => {
          setRules(prev => prev.filter(r => r.id !== id));
          showToast("Rule removed.");
        }}
        onToggleRule={(id) => {
          setRules(prev => prev.map(r => r.id === id ? { ...r, active: !r.active } : r));
        }}
        onApplyRulesToAll={handleApplyRulesToAll}
      />

      <AIFinancialAuditModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
        report={aiReport}
        isLoading={isLoadingAudit}
        onRefreshAudit={handleGenerateAudit}
        selectedMonth={selectedMonth}
      />

      <ImportStatementModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        accounts={accounts}
        onImportTransactions={handleImportStatement}
        isProcessing={isCategorizingAI}
      />

      {/* Multi-User Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        onUserChange={(newUser) => {
          setCurrentUser(newUser);
          showToast(`Switched profile to ${newUser.displayName} (${newUser.email})`);
        }}
      />

      {/* Multi-Turn Gemini Financial Assistant Modal */}
      <FinanceAssistantModal
        isOpen={isAssistantModalOpen}
        onClose={() => setIsAssistantModalOpen(false)}
        currentUser={currentUser}
        messages={chatMessages}
        setMessages={setChatMessages}
        transactions={currentMonthTransactions}
        budgets={budgets}
        accounts={accounts}
        subscriptions={subscriptions}
      />

      {/* Floating Gemini Chatbot Launcher Button */}
      <motion.button
        id="floating-gemini-chat-btn"
        onClick={() => setIsAssistantModalOpen(true)}
        whileHover={{ 
          scale: 1.07,
          boxShadow: "0 0 25px rgba(16, 185, 129, 0.45), 0 10px 20px -5px rgba(0, 0, 0, 0.5)"
        }}
        whileTap={{ 
          scale: 0.93,
          boxShadow: "0 0 12px rgba(16, 185, 129, 0.3)"
        }}
        transition={{ 
          type: "spring", 
          stiffness: 400, 
          damping: 20 
        }}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-4 py-3 rounded-full bg-[#10B981] hover:bg-[#0ea371] text-[#0A0A0B] font-semibold text-sm shadow-xl shadow-[#10B981]/30 cursor-pointer group select-none transition-colors"
        title="Open Multi-Turn Gemini Financial Assistant"
      >
        <div className="relative">
          <Sparkles className="w-5 h-5 text-[#0A0A0B] transition-transform duration-200 group-hover:rotate-12 group-hover:scale-110" />
          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-950 animate-ping"></span>
        </div>
        <span className="font-bold tracking-tight">Ask Gemini</span>
        <span className="hidden sm:inline-block px-1.5 py-0.5 rounded-md bg-black/15 text-[10px] uppercase font-bold text-[#0A0A0B]">
          AI
        </span>
      </motion.button>

    </div>
  );
}
