import React, { useState } from 'react';
import { 
  X, 
  Building2, 
  ShieldCheck, 
  Check, 
  ArrowRight, 
  Lock, 
  RefreshCw, 
  Upload, 
  FileText,
  AlertCircle
} from 'lucide-react';
import { AVAILABLE_INSTITUTIONS } from '../data/initialData';
import { BankAccount, AccountType } from '../types';

interface BankSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnectAccount: (account: Omit<BankAccount, 'id' | 'lastSyncedAt' | 'syncStatus'>, rawTransactions?: string) => void;
}

export const BankSyncModal: React.FC<BankSyncModalProps> = ({
  isOpen,
  onClose,
  onConnectAccount,
}) => {
  const [step, setStep] = useState<'select_bank' | 'credentials' | 'import_file' | 'connecting'>('select_bank');
  const [selectedInst, setSelectedInst] = useState(AVAILABLE_INSTITUTIONS[0]);
  const [accountType, setAccountType] = useState<AccountType>('checking');
  const [accountName, setAccountName] = useState('Primary Checking');
  const [initialBalance, setInitialBalance] = useState('3250.00');
  const [pastedStatement, setPastedStatement] = useState('');
  const [username, setUsername] = useState('demo_user_secure');
  const [password, setPassword] = useState('••••••••••••');

  if (!isOpen) return null;

  const handleBankSelect = (inst: typeof AVAILABLE_INSTITUTIONS[0]) => {
    setSelectedInst(inst);
    setAccountType(inst.types[0] as AccountType);
    setAccountName(inst.name + (inst.types[0] === 'credit_card' ? ' Credit Card' : ' Checking'));
    setStep('credentials');
  };

  const handleConnectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('connecting');

    setTimeout(() => {
      onConnectAccount({
        institutionName: selectedInst.name,
        accountName,
        accountType,
        mask: Math.floor(1000 + Math.random() * 9000).toString(),
        balance: parseFloat(initialBalance) || 2500,
        currency: 'USD',
        color: selectedInst.color,
        institutionCode: selectedInst.id,
        autoSyncEnabled: true,
      }, pastedStatement);

      setStep('select_bank');
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-[#161618] rounded-2xl max-w-lg w-full shadow-2xl border border-[#1F1F22] overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-[#1F1F22] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#2D2D33] border border-[#3F3F46] text-[#10B981] flex items-center justify-center font-bold">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-medium text-[#EDEDED]">
                {step === 'select_bank' ? 'Connect Financial Institution' : `Link ${selectedInst.name}`}
              </h3>
              <p className="text-xs text-[#71717A]">
                End-to-end 256-bit encrypted bank sync simulation
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#71717A] hover:text-[#EDEDED] hover:bg-[#2D2D33] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {step === 'select_bank' && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-[0.15em] text-[#71717A]">
                  Select Your Bank or Card Provider
                </span>
                <button
                  onClick={() => setStep('import_file')}
                  className="text-xs text-[#10B981] font-medium hover:underline flex items-center gap-1"
                >
                  <Upload className="w-3 h-3" /> Or Import Statement CSV
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {AVAILABLE_INSTITUTIONS.map((inst) => (
                  <button
                    key={inst.id}
                    onClick={() => handleBankSelect(inst)}
                    className="flex items-center gap-3 p-3 rounded-xl border border-[#1F1F22] bg-[#0E0E10] hover:border-[#10B981]/40 hover:bg-[#1E1E22] text-left transition-all group"
                  >
                    <div 
                      className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-xs"
                      style={{ backgroundColor: inst.color }}
                    >
                      {inst.name[0]}
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs font-medium text-[#EDEDED] block truncate group-hover:text-[#10B981]">
                        {inst.name}
                      </span>
                      <span className="text-[10px] text-[#71717A]">Instant Sync</span>
                    </div>
                  </button>
                ))}
              </div>

              <div className="mt-5 p-3.5 bg-[#0E0E10] rounded-xl border border-[#1F1F22] flex items-start gap-2.5 text-xs text-[#71717A]">
                <ShieldCheck className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" />
                <p>
                  Bank credentials are tokenized via simulated secure Open Banking protocols. Credentials are never stored or logged in plain text.
                </p>
              </div>
            </div>
          )}

          {step === 'credentials' && (
            <form onSubmit={handleConnectSubmit} className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-[#0E0E10] rounded-xl border border-[#1F1F22]">
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-xs"
                  style={{ backgroundColor: selectedInst.color }}
                >
                  {selectedInst.name[0]}
                </div>
                <div>
                  <h4 className="text-sm font-medium text-[#EDEDED]">{selectedInst.name}</h4>
                  <span className="text-xs text-[#10B981] flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Encrypted Banking Handshake
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#A1A1AA] mb-1">
                  Online Banking Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3 py-2 border border-[#1F1F22] bg-[#0E0E10] text-[#EDEDED] rounded-lg text-xs focus:outline-none focus:border-[#10B981]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#A1A1AA] mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-[#1F1F22] bg-[#0E0E10] text-[#EDEDED] rounded-lg text-xs focus:outline-none focus:border-[#10B981]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#A1A1AA] mb-1">
                    Account Type
                  </label>
                  <select
                    value={accountType}
                    onChange={(e) => setAccountType(e.target.value as AccountType)}
                    className="w-full px-3 py-2 border border-[#1F1F22] bg-[#0E0E10] text-[#EDEDED] rounded-lg text-xs focus:outline-none focus:border-[#10B981]"
                  >
                    <option value="checking" className="bg-[#161618]">Checking</option>
                    <option value="savings" className="bg-[#161618]">Savings</option>
                    <option value="credit_card" className="bg-[#161618]">Credit Card</option>
                    <option value="investment" className="bg-[#161618]">Investment</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#A1A1AA] mb-1">
                    Current Balance ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={initialBalance}
                    onChange={(e) => setInitialBalance(e.target.value)}
                    className="w-full px-3 py-2 border border-[#1F1F22] bg-[#0E0E10] text-[#EDEDED] rounded-lg text-xs focus:outline-none focus:border-[#10B981]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#A1A1AA] mb-1">
                  Account Display Label
                </label>
                <input
                  type="text"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  className="w-full px-3 py-2 border border-[#1F1F22] bg-[#0E0E10] text-[#EDEDED] rounded-lg text-xs focus:outline-none focus:border-[#10B981]"
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[#1F1F22]">
                <button
                  type="button"
                  onClick={() => setStep('select_bank')}
                  className="px-3 py-1.5 rounded-lg text-xs text-[#71717A] hover:bg-[#2D2D33] hover:text-[#EDEDED] transition-colors"
                >
                  Back to Banks
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-xs font-semibold bg-[#10B981] hover:bg-[#0ea371] text-[#0A0A0B] shadow-xs flex items-center gap-1.5 transition-colors"
                >
                  <span>Authenticate & Sync</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#0A0A0B]" />
                </button>
              </div>
            </form>
          )}

          {step === 'import_file' && (
            <div className="space-y-4">
              <div className="p-3 bg-[#0E0E10] rounded-xl border border-[#1F1F22] text-xs text-[#A1A1AA] flex items-start gap-2">
                <FileText className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" />
                <span>
                  Upload or paste your bank statement in CSV, OFX, or plain text format. The AI categorization engine will parse and categorize each transaction immediately.
                </span>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#A1A1AA] mb-1">
                  Paste Raw Transactions or CSV Lines
                </label>
                <textarea
                  rows={5}
                  value={pastedStatement}
                  onChange={(e) => setPastedStatement(e.target.value)}
                  placeholder={`2026-09-02, Costco Wholesale, -189.40\n2026-09-03, Shell Oil Gas Station, -52.10\n2026-09-03, Apple.com/bill iCloud, -2.99\n2026-09-03, Client Direct Payment, +1200.00`}
                  className="w-full p-2.5 font-mono text-xs border border-[#1F1F22] bg-[#0E0E10] text-[#EDEDED] rounded-lg focus:outline-none focus:border-[#10B981]"
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[#1F1F22]">
                <button
                  type="button"
                  onClick={() => setStep('select_bank')}
                  className="px-3 py-1.5 rounded-lg text-xs text-[#71717A] hover:bg-[#2D2D33] hover:text-[#EDEDED] transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={() => {
                    handleBankSelect(AVAILABLE_INSTITUTIONS[0]);
                  }}
                  className="px-4 py-2 rounded-lg text-xs font-semibold bg-[#10B981] hover:bg-[#0ea371] text-[#0A0A0B] shadow-xs flex items-center gap-1.5 transition-colors"
                >
                  <span>Continue with Linked Bank</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {step === 'connecting' && (
            <div className="py-12 flex flex-col items-center justify-center text-center">
              <RefreshCw className="w-10 h-10 text-[#10B981] animate-spin mb-3" />
              <h4 className="text-base font-medium text-[#EDEDED]">
                Connecting to {selectedInst.name}...
              </h4>
              <p className="text-xs text-[#71717A] mt-1 max-w-xs">
                Exchanging secure bank tokens, verifying accounts, and syncing monthly expenditures.
              </p>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
