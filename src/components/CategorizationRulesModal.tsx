import React, { useState } from 'react';
import { 
  X, 
  SlidersHorizontal, 
  Plus, 
  Trash2, 
  Check, 
  Play, 
  Sparkles,
  Tag
} from 'lucide-react';
import { CategorizationRule, ExpenseTag } from '../types';
import { CATEGORY_COLORS } from '../data/initialData';

interface CategorizationRulesModalProps {
  isOpen: boolean;
  onClose: () => void;
  rules: CategorizationRule[];
  onAddRule: (rule: Omit<CategorizationRule, 'id'>) => void;
  onDeleteRule: (id: string) => void;
  onToggleRule: (id: string) => void;
  onApplyRulesToAll: () => void;
}

export const CategorizationRulesModal: React.FC<CategorizationRulesModalProps> = ({
  isOpen,
  onClose,
  rules,
  onAddRule,
  onDeleteRule,
  onToggleRule,
  onApplyRulesToAll,
}) => {
  const [keyword, setKeyword] = useState('');
  const [targetCategory, setTargetCategory] = useState('Groceries & Supermarkets');
  const [targetTag, setTargetTag] = useState<ExpenseTag>('essential');

  if (!isOpen) return null;

  const categories = Object.keys(CATEGORY_COLORS);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyword.trim()) return;

    onAddRule({
      keyword: keyword.trim(),
      targetCategory,
      targetTags: [targetTag],
      active: true,
    });

    setKeyword('');
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-[#161618] rounded-2xl max-w-xl w-full shadow-2xl border border-[#1F1F22] overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-[#1F1F22] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#2D2D33] border border-[#3F3F46] text-[#10B981] flex items-center justify-center font-bold">
              <SlidersHorizontal className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-medium text-[#EDEDED]">
                Automated Categorization Rules
              </h3>
              <p className="text-xs text-[#71717A]">
                Define deterministic merchant rules to auto-assign categories and tags on bank sync
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

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* Create Rule Form */}
          <form onSubmit={handleCreate} className="p-4 bg-[#0E0E10] rounded-xl border border-[#1F1F22] space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-[0.15em] text-[#71717A]">
              Create New Auto-Rule
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-[#A1A1AA] mb-1">
                  If description contains
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Starbucks, Uber, Shell"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-[#161618] border border-[#1F1F22] text-[#EDEDED] rounded-lg text-xs focus:outline-none focus:border-[#10B981]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#A1A1AA] mb-1">
                  Set Category
                </label>
                <select
                  value={targetCategory}
                  onChange={(e) => setTargetCategory(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-[#161618] border border-[#1F1F22] text-[#EDEDED] rounded-lg text-xs focus:outline-none focus:border-[#10B981]"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat} className="bg-[#161618]">
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#A1A1AA] mb-1">
                  Set Tag
                </label>
                <select
                  value={targetTag}
                  onChange={(e) => setTargetTag(e.target.value as ExpenseTag)}
                  className="w-full px-2.5 py-1.5 bg-[#161618] border border-[#1F1F22] text-[#EDEDED] rounded-lg text-xs focus:outline-none focus:border-[#10B981]"
                >
                  <option value="essential" className="bg-[#161618]">Essential</option>
                  <option value="discretionary" className="bg-[#161618]">Discretionary</option>
                  <option value="recurring" className="bg-[#161618]">Recurring</option>
                  <option value="tax_deductible" className="bg-[#161618]">Tax Deductible</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#10B981] hover:bg-[#0ea371] text-[#0A0A0B] shadow-xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Rule</span>
              </button>
            </div>
          </form>

          {/* Existing Rules List */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-[0.15em] text-[#71717A]">
                Active Rules ({rules.length})
              </span>
              <button
                onClick={onApplyRulesToAll}
                className="inline-flex items-center gap-1 text-xs font-medium text-[#10B981] hover:underline"
              >
                <Play className="w-3 h-3" /> Run Rules on All Existing Transactions
              </button>
            </div>

            <div className="space-y-2">
              {rules.map((rule) => {
                const catStyle = CATEGORY_COLORS[rule.targetCategory] || CATEGORY_COLORS['General Expense'];
                return (
                  <div
                    key={rule.id}
                    className="flex items-center justify-between p-3 rounded-xl border border-[#1F1F22] bg-[#0E0E10] hover:border-[#2D2D33] transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={rule.active}
                        onChange={() => onToggleRule(rule.id)}
                        className="rounded accent-[#10B981] w-4 h-4 cursor-pointer"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-[#EDEDED]">
                            "{rule.keyword}"
                          </span>
                          <span className="text-[#71717A] text-xs">&rarr;</span>
                          <span className={`text-[11px] font-medium px-2 py-0.5 rounded-md border ${catStyle.bg} ${catStyle.text} ${catStyle.border}`}>
                            {rule.targetCategory}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-[#71717A] mt-0.5">
                          <span>Tags: {rule.targetTags.join(', ')}</span>
                          <span>&bull;</span>
                          <span>{rule.active ? 'Active' : 'Disabled'}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => onDeleteRule(rule.id)}
                      className="p-1.5 text-[#71717A] hover:text-rose-400 hover:bg-[#2D2D33] rounded-lg transition-colors"
                      title="Delete rule"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
