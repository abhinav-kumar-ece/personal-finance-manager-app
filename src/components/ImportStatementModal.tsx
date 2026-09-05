import React, { useState } from 'react';
import { 
  X, 
  Upload, 
  FileSpreadsheet, 
  Sparkles, 
  Check, 
  AlertCircle,
  FileText
} from 'lucide-react';
import { BankAccount, Transaction } from '../types';

interface ImportStatementModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: BankAccount[];
  onImportTransactions: (accountId: string, rawText: string) => void;
  isProcessing: boolean;
}

export const ImportStatementModal: React.FC<ImportStatementModalProps> = ({
  isOpen,
  onClose,
  accounts,
  onImportTransactions,
  isProcessing,
}) => {
  const [selectedAccountId, setSelectedAccountId] = useState(accounts[0]?.id || '');
  const [rawText, setRawText] = useState(
`2026-09-03, Trader Joe's #502, -64.20
2026-09-03, Blue Bottle Coffee Mint Plaza, -6.75
2026-09-03, Shell Gas Station Fuel, -48.10
2026-09-02, Amazon.com Marketplace Essentials, -32.50
2026-09-01, Dropbox Plus Subscription, -11.99
2026-09-01, Freelance Web Design Invoice #402, +1500.00`
  );

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (text) setRawText(text);
      };
      reader.readAsText(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawText.trim()) return;
    onImportTransactions(selectedAccountId, rawText);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-[#161618] rounded-2xl max-w-lg w-full shadow-2xl border border-[#1F1F22] overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-[#1F1F22] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#2D2D33] border border-[#3F3F46] text-[#10B981] flex items-center justify-center font-bold">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-medium text-[#EDEDED]">
                Import Bank Statement or Feed
              </h3>
              <p className="text-xs text-[#71717A]">
                CSV or text format &bull; Automatically categorized via AI
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#A1A1AA] mb-1">
              Select Destination Account
            </label>
            <select
              value={selectedAccountId}
              onChange={(e) => setSelectedAccountId(e.target.value)}
              className="w-full px-3 py-2 border border-[#1F1F22] bg-[#0E0E10] text-[#EDEDED] rounded-lg text-xs focus:outline-none focus:border-[#10B981]"
            >
              {accounts.map((a) => (
                <option key={a.id} value={a.id} className="bg-[#161618]">
                  {a.institutionName} ({a.accountName} •••• {a.mask})
                </option>
              ))}
            </select>
          </div>

          {/* Upload Button */}
          <div>
            <label className="block text-xs font-medium text-[#A1A1AA] mb-1">
              Upload CSV Statement File
            </label>
            <div className="flex items-center gap-2">
              <label className="flex-1 cursor-pointer flex items-center justify-center gap-2 py-2 px-3 border border-dashed border-[#1F1F22] rounded-lg bg-[#0E0E10] hover:bg-[#1E1E22] text-xs text-[#EDEDED] transition-colors">
                <Upload className="w-3.5 h-3.5 text-[#10B981]" />
                <span>Choose .CSV or text file</span>
                <input
                  type="file"
                  accept=".csv,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Statement Text Area */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-medium text-[#A1A1AA]">
                Or Paste Statement Lines
              </label>
              <span className="text-[11px] text-[#71717A]">Date, Merchant, Amount</span>
            </div>
            <textarea
              rows={8}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              className="w-full p-3 font-mono text-xs border border-[#1F1F22] rounded-lg bg-[#0E0E10] text-[#EDEDED] focus:outline-none focus:border-[#10B981]"
              placeholder="2026-09-02, Whole Foods Market, -84.20"
            />
          </div>

          <div className="p-3 bg-[#0E0E10] rounded-xl border border-[#1F1F22] flex items-start gap-2 text-xs text-[#A1A1AA]">
            <Sparkles className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" />
            <span>
              Transactions will be parsed, matched against your custom rules, and categorized with Gemini 3.8 Flash automatically upon sync.
            </span>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#1F1F22]">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-[#71717A] hover:bg-[#2D2D33] hover:text-[#EDEDED] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isProcessing}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-[#10B981] hover:bg-[#0ea371] text-[#0A0A0B] shadow-xs disabled:opacity-60 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isProcessing ? 'Parsing & Categorizing...' : 'Import & Categorize'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
