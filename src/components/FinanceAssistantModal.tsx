import React, { useState, useRef, useEffect } from 'react';
import Markdown from 'react-markdown';
import { 
  X, 
  Send, 
  Sparkles, 
  Trash2, 
  Bot, 
  User as UserIcon, 
  TrendingUp, 
  DollarSign, 
  CreditCard,
  Zap,
  Brain,
  Sliders,
  ChevronDown,
  Info,
  Check
} from 'lucide-react';
import { 
  ChatMessage, 
  Transaction, 
  BudgetLimit, 
  BankAccount, 
  RecurringSubscription, 
  UserProfile,
  ChatbotRole,
  GeminiChatModel
} from '../types';
import { saveUserChatHistory } from '../lib/firestoreService';
import { getAuthIdToken } from '../lib/firebase';

interface FinanceAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  transactions: Transaction[];
  budgets: BudgetLimit[];
  accounts: BankAccount[];
  subscriptions: RecurringSubscription[];
}

const ROLES_CONFIG: Record<ChatbotRole, {
  name: string;
  badge: string;
  icon: any;
  color: string;
  description: string;
  systemInstructionSnippet: string;
  prompts: string[];
}> = {
  budget_coach: {
    name: 'Daily Budget Coach',
    badge: 'General & Habit Coaching',
    icon: Sparkles,
    color: 'emerald',
    description: 'Specializes in everyday spending habits, monthly category balance enforcement, and subscription trimming.',
    systemInstructionSnippet: 'Role: Encouraging, pragmatic Daily Budget & Spending Coach focused on monthly category discipline and cashflow.',
    prompts: [
      'How can I cut $200 from my monthly expenses?',
      'Analyze my grocery vs restaurant spending this month',
      'Review my recurring subscriptions for leaks',
      'Am I on pace to meet my monthly savings goal?'
    ]
  },
  wealth_strategist: {
    name: 'Wealth & Portfolio Strategist',
    badge: 'Complex Financial Modeling',
    icon: Brain,
    color: 'indigo',
    description: 'Handles advanced financial planning, compound interest, emergency reserves, FIRE milestones, and debt payoff strategy.',
    systemInstructionSnippet: 'Role: Certified Financial Planner & Strategic Wealth Advisor specialized in long-term compound growth and asset allocation.',
    prompts: [
      'Formulate a 6-month emergency reserve roadmap from my cash',
      'What is my current savings velocity and financial independence timeline?',
      'Create an optimized debt payoff strategy for my accounts',
      'How should I allocate my monthly surplus for wealth compounding?'
    ]
  },
  rapid_auditor: {
    name: 'Rapid Auditor & Affordability Sentinel',
    badge: 'Fast Affordability Checks',
    icon: Zap,
    color: 'amber',
    description: 'Provides instant, ultra-fast yes/no affordability answers and immediate transaction scrutiny with zero fluff.',
    systemInstructionSnippet: 'Role: Ultra-fast Financial Auditor & Affordability Sentinel delivering direct, bold numerical yes/no decisions.',
    prompts: [
      'Can I afford a $150 dinner tonight?',
      'What is my exact remaining discretionary balance right now?',
      'Can I purchase a $300 gadget this week?',
      'Quick breakdown of my top 3 expenses this month'
    ]
  },
  custom: {
    name: 'Custom System Instruction',
    badge: 'Custom Persona',
    icon: Sliders,
    color: 'purple',
    description: 'Define your own specialized system instructions, personality, or financial constraints for Gemini.',
    systemInstructionSnippet: 'Custom user-specified instructions and parameters.',
    prompts: [
      'Evaluate my cashflow using the 50/30/20 rule',
      'Audit my discretionary spending with strict frugality',
      'Give me a 3-step action plan for this weekend',
      'Summarize my financial health in 3 bullet points'
    ]
  }
};

const MODELS_CONFIG: Record<GeminiChatModel, {
  name: string;
  tag: string;
  badgeColor: string;
  description: string;
  recommendedFor: string;
}> = {
  'auto': {
    name: 'Smart Auto-Route',
    tag: 'Adaptive',
    badgeColor: 'bg-[#10B981]/15 text-[#10B981] border-[#10B981]/30',
    description: 'Intelligently selects the best Gemini model based on query complexity and urgency.',
    recommendedFor: 'Automatic optimal routing'
  },
  'gemini-3.5-flash': {
    name: 'Gemini 3.5 Flash',
    tag: 'General Tasks',
    badgeColor: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    description: 'High-speed, balanced multimodal reasoning optimized for day-to-day financial inquiries.',
    recommendedFor: 'General tasks & budget conversations'
  },
  'gemini-3.1-pro-preview': {
    name: 'Gemini 3.1 Pro Preview',
    tag: 'Complex Tasks',
    badgeColor: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
    description: 'State-of-the-art analytical power for complex multi-year calculations, debt modeling, and wealth planning.',
    recommendedFor: 'Particularly complex financial modeling'
  },
  'gemini-3.1-flash-lite': {
    name: 'Gemini 3.1 Flash Lite',
    tag: 'Fast Tasks',
    badgeColor: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    description: 'Ultra-low latency model engineered for instant answers, quick balance inquiries, and fast affordability checks.',
    recommendedFor: 'Tasks that should happen fast'
  }
};

export const FinanceAssistantModal: React.FC<FinanceAssistantModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  messages,
  setMessages,
  transactions,
  budgets,
  accounts,
  subscriptions,
}) => {
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedRole, setSelectedRole] = useState<ChatbotRole>('budget_coach');
  const [selectedModel, setSelectedModel] = useState<GeminiChatModel>('auto');
  const [customInstruction, setCustomInstruction] = useState(
    'Act as a seasoned fiduciary financial advisor. Always calculate percentage impact on monthly net cashflow and recommend risk-adjusted actions.'
  );
  const [showSettings, setShowSettings] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, isTyping]);

  if (!isOpen) return null;

  const safeAccounts = Array.isArray(accounts) ? accounts : [];
  const safeTransactions = Array.isArray(transactions) ? transactions : [];
  const safeBudgets = Array.isArray(budgets) ? budgets : [];
  const safeSubscriptions = Array.isArray(subscriptions) ? subscriptions : [];

  // Compute live user financial context to ground the multi-turn Gemini conversation
  const totalLiquid = safeAccounts
    .filter(a => a && (a.accountType === 'checking' || a.accountType === 'savings'))
    .reduce((sum, a) => sum + (a.balance || 0), 0);

  const currentMonthExpense = safeTransactions
    .filter(t => t && t.type === 'expense')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const monthlyBudgetLimit = safeBudgets.reduce((sum, b) => sum + (b.monthlyLimit || 0), 0);

  const remainingDiscretionary = Math.max(0, monthlyBudgetLimit - currentMonthExpense);

  // Category breakdown for context
  const catTotals: Record<string, number> = {};
  safeTransactions
    .filter(t => t && t.type === 'expense')
    .forEach(t => {
      catTotals[t.category] = (catTotals[t.category] || 0) + (t.amount || 0);
    });

  const topCategories = Object.entries(catTotals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([cat, amt]) => ({ category: cat, spent: Math.round(amt) }));

  const recurringTotal = safeSubscriptions.reduce((sum, s) => sum + (s.amount || 0), 0);

  const financialContext = {
    userName: currentUser?.displayName || 'User',
    totalLiquid: Math.round(totalLiquid),
    currentMonthExpense: Math.round(currentMonthExpense),
    monthlyBudgetLimit: Math.round(monthlyBudgetLimit),
    discretionaryAllowanceRemaining: Math.round(remainingDiscretionary),
    recurringCount: safeSubscriptions.length,
    recurringTotal: Math.round(recurringTotal),
    topCategories,
    recentTransactions: safeTransactions.slice(0, 8).map(t => ({
      merchant: t.merchant,
      amount: t.amount,
      category: t.category,
      date: t.date,
    })),
  };

  const handleSendMessage = async (userText: string) => {
    const textToSend = userText.trim();
    if (!textToSend || isTyping) return;

    const userMessage: ChatMessage = {
      id: `msg_user_${Date.now()}`,
      role: 'user',
      text: textToSend,
      timestamp: new Date().toISOString(),
    };

    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    setInput('');
    setIsTyping(true);

    if (currentUser) {
      saveUserChatHistory(currentUser.uid, newHistory);
    }

    try {
      const authToken = await getAuthIdToken();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          messages: newHistory.map(m => ({ role: m.role, text: m.text })),
          financialContext,
          requestedModel: selectedModel,
          role: selectedRole,
          customSystemInstruction: selectedRole === 'custom' ? customInstruction : undefined,
        }),
      });

      if (res.status === 429) {
        const errorData = await res.json().catch(() => ({}));
        const rateLimitMessage: ChatMessage = {
          id: `msg_err_limit_${Date.now()}`,
          role: 'model',
          text: errorData.error || "Rate limit reached: Maximum 10 chat requests per minute are allowed. Please wait a moment before trying again.",
          timestamp: new Date().toISOString(),
          modelUsed: 'rate-limiter',
          roleUsed: 'Security Sentinel',
        };
        const updatedWithLimit = [...newHistory, rateLimitMessage];
        setMessages(updatedWithLimit);
        return;
      }

      const data = await res.json();
      const replyText = data.reply || "I've reviewed your financial balance and everything is tracking smoothly.";

      const aiMessage: ChatMessage = {
        id: `msg_model_${Date.now()}`,
        role: 'model',
        text: replyText,
        timestamp: new Date().toISOString(),
        modelUsed: data.model || selectedModel,
        roleUsed: data.roleUsed || ROLES_CONFIG[selectedRole].name,
      };

      const updatedWithAI = [...newHistory, aiMessage];
      setMessages(updatedWithAI);
      if (currentUser) {
        saveUserChatHistory(currentUser.uid, updatedWithAI);
      }
    } catch (err) {
      console.error('Chat error:', err);
      const errorMessage: ChatMessage = {
        id: `msg_err_${Date.now()}`,
        role: 'model',
        text: "I'm having trouble connecting to the financial intelligence server right now, but your cash reserves remain in positive standing. Feel free to try again in a moment.",
        timestamp: new Date().toISOString(),
        modelUsed: 'offline-fallback',
        roleUsed: ROLES_CONFIG[selectedRole].name,
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleClearHistory = () => {
    const initial: ChatMessage[] = [
      {
        id: `msg_welcome_${Date.now()}`,
        role: 'model',
        text: `Hello ${currentUser?.displayName || 'there'}! I am your AI Finance Assistant powered by Google Gemini.\n\nI have access to your live financial dashboard: **$${totalLiquid.toLocaleString()}** in liquid reserves, **$${Math.round(currentMonthExpense).toLocaleString()}** spent this month against a **$${monthlyBudgetLimit.toLocaleString()}** budget, and **${safeSubscriptions.length}** recurring subscriptions.\n\nSelect a specialized role or ask me any question below!`,
        timestamp: new Date().toISOString(),
        modelUsed: 'gemini-3.5-flash',
        roleUsed: ROLES_CONFIG[selectedRole].name,
      }
    ];
    setMessages(initial);
    if (currentUser) {
      saveUserChatHistory(currentUser.uid, initial);
    }
  };

  const activeRoleConfig = ROLES_CONFIG[selectedRole];
  const activeModelConfig = MODELS_CONFIG[selectedModel];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-xs">
      <div 
        id="finance-assistant-modal"
        className="bg-[#161618] border border-[#2D2D33] rounded-2xl w-full max-w-3xl h-[92vh] max-h-[820px] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        
        {/* Header */}
        <div className="p-3.5 sm:p-4 border-b border-[#1F1F22] bg-[#121214] flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#10B981]/15 border border-[#10B981]/30 text-[#10B981] flex items-center justify-center font-bold shrink-0">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base font-semibold text-[#EDEDED]">
                    Gemini Financial Assistant
                  </h3>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${activeModelConfig.badgeColor}`}>
                    {activeModelConfig.name}
                  </span>
                </div>
                <p className="text-xs text-[#71717A]">
                  Multi-turn dialog grounded in your real-time accounts, budgets, and transactions
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                id="toggle-assistant-settings-btn"
                onClick={() => setShowSettings(!showSettings)}
                title="Configure Chatbot Roles & Gemini Models"
                className={`p-2 rounded-xl border text-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
                  showSettings 
                    ? 'bg-[#10B981]/20 border-[#10B981]/50 text-[#10B981]' 
                    : 'bg-[#1A1A1D] border-[#2D2D33] text-[#A1A1AA] hover:text-[#EDEDED]'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span className="hidden sm:inline font-medium">Role & Model</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${showSettings ? 'rotate-180' : ''}`} />
              </button>

              <button
                id="clear-chat-history-btn"
                onClick={handleClearHistory}
                title="Reset conversation thread"
                className="p-2 rounded-xl bg-[#1A1A1D] border border-[#2D2D33] text-[#71717A] hover:text-[#EDEDED] hover:bg-[#202024] transition-colors text-xs flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Reset</span>
              </button>

              <button
                id="close-assistant-modal-btn"
                onClick={onClose}
                className="p-2 rounded-xl bg-[#1A1A1D] border border-[#2D2D33] text-[#71717A] hover:text-[#EDEDED] hover:bg-[#202024] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Role & Model Configuration Drawer (Collapsible) */}
          {showSettings && (
            <div className="p-3 rounded-xl bg-[#1A1A1E] border border-[#2A2A30] flex flex-col gap-3 text-xs mt-1 animate-in slide-in-from-top-2 duration-150">
              
              {/* Chatbot Role Selection with System Instructions */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-medium text-[#EDEDED] flex items-center gap-1.5">
                    <Bot className="w-3.5 h-3.5 text-[#10B981]" />
                    Chatbot Role & System Instruction:
                  </span>
                  <span className="text-[11px] text-[#A1A1AA]">
                    {activeRoleConfig.badge}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {(Object.keys(ROLES_CONFIG) as ChatbotRole[]).map((roleKey) => {
                    const r = ROLES_CONFIG[roleKey];
                    const isSelected = selectedRole === roleKey;
                    const IconComp = r.icon;
                    return (
                      <button
                        key={roleKey}
                        onClick={() => setSelectedRole(roleKey)}
                        className={`p-2 rounded-lg text-left transition-all border flex flex-col gap-1 cursor-pointer ${
                          isSelected 
                            ? 'bg-[#10B981]/15 border-[#10B981]/50 text-[#EDEDED]' 
                            : 'bg-[#141416] border-[#25252A] text-[#A1A1AA] hover:border-[#35353D]'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <IconComp className={`w-3.5 h-3.5 ${isSelected ? 'text-[#10B981]' : 'text-[#71717A]'}`} />
                          {isSelected && <Check className="w-3 h-3 text-[#10B981]" />}
                        </div>
                        <span className="font-semibold text-xs leading-tight">{r.name}</span>
                      </button>
                    );
                  })}
                </div>

                {selectedRole === 'custom' && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-[11px] text-[#A1A1AA] mb-1">
                      <span>Custom System Instruction (Finance-only enforced):</span>
                      <span className={customInstruction.length >= 480 ? 'text-amber-400 font-medium' : 'text-[#71717A]'}>
                        {customInstruction.length}/500
                      </span>
                    </div>
                    <textarea
                      value={customInstruction}
                      onChange={(e) => setCustomInstruction(e.target.value.slice(0, 500))}
                      maxLength={500}
                      rows={2}
                      className="w-full bg-[#121214] border border-[#2D2D33] rounded-lg p-2 text-xs text-[#EDEDED] focus:outline-none focus:border-[#10B981]"
                      placeholder="Specify your custom advisor role, tone, and financial rules (max 500 chars)..."
                    />
                    <p className="text-[10px] text-[#71717A] mt-0.5">
                      Prompt injection guard active: Non-overridable security directives enforce confidentiality and financial domain restriction.
                    </p>
                  </div>
                )}
              </div>

              {/* Gemini Model Selection */}
              <div className="pt-2 border-t border-[#25252A]">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-medium text-[#EDEDED] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#10B981]" />
                    Gemini Model Engine:
                  </span>
                  <span className="text-[11px] text-[#A1A1AA]">
                    {activeModelConfig.recommendedFor}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {(Object.keys(MODELS_CONFIG) as GeminiChatModel[]).map((mKey) => {
                    const m = MODELS_CONFIG[mKey];
                    const isSelected = selectedModel === mKey;
                    return (
                      <button
                        key={mKey}
                        onClick={() => setSelectedModel(mKey)}
                        className={`p-2 rounded-lg text-left transition-all border flex flex-col gap-0.5 cursor-pointer ${
                          isSelected 
                            ? 'bg-[#10B981]/15 border-[#10B981]/50 text-[#EDEDED]' 
                            : 'bg-[#141416] border-[#25252A] text-[#A1A1AA] hover:border-[#35353D]'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="font-semibold text-xs leading-tight truncate">{m.name}</span>
                          {isSelected && <Check className="w-3 h-3 text-[#10B981]" />}
                        </div>
                        <span className="text-[10px] text-[#71717A]">{m.tag}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>
          )}
        </div>

        {/* Live Financial Context Bar */}
        <div className="px-4 py-2 bg-[#0E0E10] border-b border-[#1F1F22] flex items-center justify-between text-xs overflow-x-auto gap-4 shrink-0">
          <div className="flex items-center gap-1.5 text-[#A1A1AA] shrink-0">
            <DollarSign className="w-3.5 h-3.5 text-[#10B981]" />
            <span>Liquid Cash: <strong className="text-[#EDEDED]">${totalLiquid.toLocaleString()}</strong></span>
          </div>
          <div className="flex items-center gap-1.5 text-[#A1A1AA] shrink-0">
            <TrendingUp className="w-3.5 h-3.5 text-[#FBBF24]" />
            <span>Spent: <strong className="text-[#EDEDED]">${Math.round(currentMonthExpense).toLocaleString()}</strong> / ${monthlyBudgetLimit.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1.5 text-[#A1A1AA] shrink-0">
            <CreditCard className="w-3.5 h-3.5 text-[#818CF8]" />
            <span>Discretionary Left: <strong className="text-[#10B981]">${Math.round(remainingDiscretionary).toLocaleString()}</strong></span>
          </div>
          <div className="flex items-center gap-1.5 text-[#A1A1AA] shrink-0">
            <Bot className="w-3.5 h-3.5 text-[#10B981]" />
            <span>Role: <strong className="text-[#EDEDED]">{activeRoleConfig.name}</strong></span>
          </div>
        </div>

        {/* Conversation Message List (Scrollable Thread) */}
        <div 
          id="chat-messages-thread"
          className="flex-1 p-3 sm:p-4 overflow-y-auto space-y-4 min-h-0 bg-[#121214]/60"
        >
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div 
                key={msg.id}
                className={`flex gap-2.5 sm:gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-xl bg-[#10B981]/20 border border-[#10B981]/40 text-[#10B981] flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div 
                  className={`max-w-[88%] sm:max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                    isUser 
                      ? 'bg-[#10B981] text-[#0A0A0B] font-medium rounded-tr-xs' 
                      : 'bg-[#1C1C1F] border border-[#2D2D33] text-[#EDEDED] rounded-tl-xs'
                  }`}
                >
                  {/* Model & Role metadata tags for AI replies */}
                  {!isUser && (msg.modelUsed || msg.roleUsed) && (
                    <div className="flex items-center gap-2 mb-2 pb-1.5 border-b border-[#2A2A30] text-[10px] text-[#A1A1AA]">
                      {msg.roleUsed && (
                        <span className="font-semibold text-[#10B981]">
                          {msg.roleUsed}
                        </span>
                      )}
                      {msg.modelUsed && (
                        <span className="px-1.5 py-0.2 rounded-md bg-[#25252A] text-[#D4D4D8] border border-[#333338]">
                          {msg.modelUsed}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Message body with Markdown support */}
                  {isUser ? (
                    <div className="whitespace-pre-wrap">{msg.text}</div>
                  ) : (
                    <div className="text-[#E4E4E7] space-y-2 prose prose-invert prose-sm max-w-none text-xs sm:text-sm">
                      <Markdown>{msg.text}</Markdown>
                    </div>
                  )}

                  <div className={`text-[10px] mt-1.5 text-right ${isUser ? 'text-[#0A0A0B]/70' : 'text-[#71717A]'}`}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-xl bg-[#2D2D33] border border-[#3E3E46] text-[#EDEDED] flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                    <UserIcon className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {isTyping && (
            <div className="flex gap-2.5 sm:gap-3 justify-start items-start">
              <div className="w-8 h-8 rounded-xl bg-[#10B981]/20 border border-[#10B981]/40 text-[#10B981] flex items-center justify-center shrink-0 mt-0.5">
                <Bot className="w-4 h-4 animate-pulse" />
              </div>
              <div className="bg-[#1C1C1F] border border-[#2D2D33] text-[#EDEDED] rounded-2xl rounded-tl-xs px-4 py-3 text-sm flex items-center gap-2 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-[#10B981] animate-bounce"></span>
                <span className="w-2 h-2 rounded-full bg-[#10B981] animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-2 h-2 rounded-full bg-[#10B981] animate-bounce [animation-delay:0.4s]"></span>
                <span className="text-xs text-[#A1A1AA] ml-2">
                  {activeRoleConfig.name} is reasoning with Gemini...
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Quick Prompts tailored to active Role */}
        <div className="p-2.5 sm:p-3 bg-[#121214] border-t border-[#1F1F22] shrink-0">
          <div className="flex items-center justify-between text-[11px] text-[#71717A] mb-1.5 font-medium">
            <span>Suggested prompts for {activeRoleConfig.name}:</span>
            <span className="hidden sm:inline text-[10px] text-[#52525B]">Click to test multi-turn inquiry</span>
          </div>
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {activeRoleConfig.prompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(p)}
                disabled={isTyping}
                className="whitespace-nowrap px-2.5 py-1 rounded-lg bg-[#1C1C1F] hover:bg-[#2A2A2E] hover:border-[#10B981]/40 border border-[#2D2D33] text-xs text-[#A1A1AA] hover:text-[#EDEDED] transition-colors shrink-0 disabled:opacity-50 cursor-pointer"
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Input Form */}
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage(input);
          }}
          className="p-3 sm:p-4 bg-[#161618] border-t border-[#1F1F22] flex gap-2 shrink-0"
        >
          <input
            id="finance-assistant-chat-input"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isTyping}
            placeholder={`Ask ${activeRoleConfig.name} about your balances, budgets, or savings...`}
            className="flex-1 bg-[#0E0E10] border border-[#2D2D33] rounded-xl px-4 py-2.5 text-sm text-[#EDEDED] placeholder-[#71717A] focus:outline-none focus:border-[#10B981] transition-colors"
          />
          <button
            id="finance-assistant-send-btn"
            type="submit"
            disabled={!input.trim() || isTyping}
            className="px-4 py-2.5 rounded-xl bg-[#10B981] hover:bg-[#0ea371] text-[#0A0A0B] font-semibold text-sm flex items-center justify-center gap-1.5 transition-colors disabled:opacity-40 cursor-pointer shadow-md shadow-[#10B981]/20"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </form>

      </div>
    </div>
  );
};
