import React from 'react';
import { 
  X, 
  Sparkles, 
  TrendingUp, 
  AlertCircle, 
  DollarSign, 
  Lightbulb, 
  RefreshCw,
  CheckCircle2,
  ShieldCheck
} from 'lucide-react';
import { FinancialInsightsReport } from '../types';
import { formatCurrency, formatRelativeTime } from '../utils/formatters';

interface AIFinancialAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: FinancialInsightsReport | null;
  isLoading: boolean;
  onRefreshAudit: () => void;
  selectedMonth: string;
}

export const AIFinancialAuditModal: React.FC<AIFinancialAuditModalProps> = ({
  isOpen,
  onClose,
  report,
  isLoading,
  onRefreshAudit,
  selectedMonth,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-[#161618] rounded-2xl max-w-2xl w-full shadow-2xl border border-[#1F1F22] overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-[#1F1F22] flex items-center justify-between bg-[#0E0E10] text-[#EDEDED]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#2D2D33] border border-[#3F3F46] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-[#10B981]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-medium text-[#EDEDED]">
                  Monthly Financial Audit & Optimization
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30">
                  Gemini 3.8 Flash
                </span>
              </div>
              <p className="text-xs text-[#71717A]">
                Automated expenditure synthesis & wealth optimization
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
          {isLoading ? (
            <div className="py-16 flex flex-col items-center justify-center text-center">
              <RefreshCw className="w-10 h-10 text-[#10B981] animate-spin mb-3" />
              <h4 className="text-base font-medium text-[#EDEDED]">
                Synthesizing Monthly Expenditures...
              </h4>
              <p className="text-xs text-[#71717A] mt-1 max-w-xs">
                Gemini 3.8 Flash is calculating velocity ratios, auditing recurring bills, and detecting anomalies across connected bank accounts.
              </p>
            </div>
          ) : report ? (
            <>
              {/* Score & Summary Banner */}
              <div className="bg-[#0E0E10] rounded-2xl p-5 border border-[#1F1F22] flex flex-col sm:flex-row items-center gap-5">
                <div className="flex flex-col items-center justify-center shrink-0">
                  <div className="w-20 h-20 rounded-full border-4 border-[#10B981] flex flex-col items-center justify-center bg-[#161618] shadow-xs">
                    <span className="text-2xl font-bold text-[#EDEDED]">
                      {report.overallHealthScore}
                    </span>
                    <span className="text-[10px] uppercase font-semibold text-[#71717A]">/ 100</span>
                  </div>
                  <span className="text-[11px] font-medium text-[#10B981] mt-1.5">
                    Health Score
                  </span>
                </div>

                <div className="min-w-0 flex-1 text-center sm:text-left">
                  <span className="text-xs font-semibold uppercase tracking-[0.15em] text-[#10B981] block mb-1">
                    Executive Assessment
                  </span>
                  <p className="text-sm text-[#EDEDED] leading-relaxed font-normal">
                    {report.executiveSummary}
                  </p>
                </div>
              </div>

              {/* Key Observations */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-[0.15em] text-[#71717A] mb-2.5 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#10B981]" />
                  Key Financial Observations
                </h4>
                <div className="space-y-2">
                  {report.keyObservations.map((obs, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs text-[#EDEDED] bg-[#0E0E10] p-3 rounded-xl border border-[#1F1F22]">
                      <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" />
                      <span>{obs}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Spending Anomalies */}
              {report.anomaliesDetected.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-[0.15em] text-[#71717A] mb-2.5 flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-amber-400" />
                    Detected Spending Anomalies
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {report.anomaliesDetected.map((anom, idx) => (
                      <div key={idx} className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs">
                        <div className="flex items-center justify-between font-medium text-amber-300 mb-1">
                          <span>{anom.category}</span>
                          <span className="text-amber-400 font-bold">+{anom.percentageChange}% spike</span>
                        </div>
                        <p className="text-[#A1A1AA]">{anom.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Cost-Saving Suggestions */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-[0.15em] text-[#71717A] mb-2.5 flex items-center gap-1.5">
                  <Lightbulb className="w-4 h-4 text-[#10B981]" />
                  Actionable Monthly Savings Opportunities
                </h4>
                <div className="space-y-3">
                  {report.costSavingSuggestions.map((sug, idx) => (
                    <div key={idx} className="p-3.5 bg-[#0E0E10] border border-[#1F1F22] rounded-xl flex items-start justify-between gap-3 text-xs">
                      <div>
                        <span className="font-medium text-[#EDEDED] block text-sm">
                          {sug.title}
                        </span>
                        <p className="text-[#A1A1AA] mt-0.5">
                          {sug.action}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <span className="text-[10px] text-[#71717A] block">Est. Savings</span>
                        <span className="text-sm font-bold text-[#10B981]">
                          +{formatCurrency(sug.potentialMonthlySavings)}/mo
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-center text-[11px] text-[#71717A] pt-2">
                Report generated {formatRelativeTime(report.generatedAt)} based on synced bank feed transactions
              </div>
            </>
          ) : null}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#1F1F22] bg-[#0E0E10] flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-[#71717A] hover:text-[#EDEDED] hover:bg-[#2D2D33] rounded-lg transition-colors"
          >
            Close
          </button>

          <button
            onClick={onRefreshAudit}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-[#10B981] hover:bg-[#0ea371] text-[#0A0A0B] shadow-xs disabled:opacity-60 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Re-Analyze with Gemini</span>
          </button>
        </div>

      </div>
    </div>
  );
};
