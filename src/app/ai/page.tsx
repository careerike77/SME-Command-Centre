"use client";

import React, { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { AiService, AIProposal } from "@/services/ai-service";
import { Bot, Send, Sparkles, AlertCircle, CheckCircle2 } from "lucide-react";

export default function AiPage() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<{
    recommendationText: string;
    proposals: AIProposal[];
  } | null>(null);
  const [actionStatus, setActionStatus] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    setActionStatus(null);

    const res = await AiService.analyze({
      tenantId: "tenant-accra-01",
      prompt,
    });

    setResponse(res);
    setLoading(false);
  };

  const handleExecuteProposal = (proposal: AIProposal) => {
    setActionStatus(
      `Proposal '${proposal.summary}' successfully approved and logged to database for execution!`
    );
  };

  return (
    <AppShell activeModule="ai">
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Bot className="w-6 h-6 text-blue-600" /> AI Business Assistant
            </h1>
            <p className="text-sm text-slate-500">
              Autonomous SME operational intelligence & policy-governed business workflow proposals
            </p>
          </div>
          <span className="text-xs bg-slate-200 text-slate-700 px-2.5 py-1 rounded font-mono font-medium">
            Mode: Safe Mock LLM
          </span>
        </div>

        {/* Prompt Input Form */}
        <form onSubmit={handleSubmit} className="bg-white p-4 border border-slate-200 rounded-xl shadow-xs space-y-3">
          <label className="block text-xs font-bold text-slate-700">Ask AI-BOSS about your business operations</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. Check low inventory stock and propose restock orders..."
              className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-hidden"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-2"
            >
              <Send className="w-4 h-4" /> {loading ? "Analyzing..." : "Ask Assistant"}
            </button>
          </div>
        </form>

        {actionStatus && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionStatus}</span>
          </div>
        )}

        {/* AI Analysis Response Card */}
        {response && (
          <div className="bg-white p-6 border border-slate-200 rounded-xl shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Sparkles className="w-5 h-5 text-blue-600" />
              <h2 className="font-bold text-slate-900 text-base">Analysis & Recommendation</h2>
            </div>

            <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-lg border border-slate-100">
              {response.recommendationText}
            </p>

            {response.proposals.length > 0 && (
              <div className="space-y-3 pt-2">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Proposed Action (Requires Human Approval)
                </h3>
                {response.proposals.map((prop, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-amber-50/50 border border-amber-200 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-amber-600" />
                        <p className="font-bold text-xs text-slate-900">{prop.summary}</p>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Authority Level: <strong className="uppercase">{prop.authorityLevel}</strong> | Cost Estimate: GH₵ 750.00
                      </p>
                    </div>
                    <button
                      onClick={() => handleExecuteProposal(prop)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg transition-colors shrink-0"
                    >
                      Approve & Execute Action
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}
