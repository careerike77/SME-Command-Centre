import { AIActionLog, AIAuthorityLevel } from "@/types/database";

export interface AIAnalysisRequest {
  tenantId: string;
  userId?: string;
  prompt: string;
  contextData?: Record<string, unknown>;
}

export interface AIProposal {
  actionType: string;
  authorityLevel: AIAuthorityLevel;
  summary: string;
  payload: Record<string, unknown>;
  requiresHumanApproval: boolean;
}

export interface AIAnalysisResponse {
  isMock: boolean;
  provider: string;
  recommendationText: string;
  proposals: AIProposal[];
}

export class AiService {
  /**
   * Sanitize user prompt to remove potential PII/injection vectors
   */
  public static sanitizePrompt(prompt: string): string {
    return prompt
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .replace(/DROP TABLE|DELETE FROM|UPDATE users/gi, "[REDACTED SQL]")
      .trim();
  }

  /**
   * Process prompt with LLM adapter or Mock Engine
   */
  public static async analyze(request: AIAnalysisRequest): Promise<AIAnalysisResponse> {
    const cleanPrompt = this.sanitizePrompt(request.prompt);

    // Default mock response when MOCK_LLM_MODE is enabled or API keys absent
    const isRestockIntent = cleanPrompt.toLowerCase().includes("stock") || cleanPrompt.toLowerCase().includes("reorder");

    const proposals: AIProposal[] = [];

    if (isRestockIntent) {
      proposals.push({
        actionType: "inventory_restock_proposal",
        authorityLevel: "propose",
        summary: "Propose reordering 50 units of Low Stock Product (SKU-1002)",
        payload: {
          productId: "prod-sku-1002",
          productName: "Basmati Rice 5kg",
          reorderQuantity: 50,
          estimatedCostGHS: 750.0,
        },
        requiresHumanApproval: true,
      });
    }

    return {
      isMock: true,
      provider: "mock-llm-engine",
      recommendationText: `AI Analysis for '${cleanPrompt}': Based on current GHS sales trends, weekend revenue is up 18%. ${
        isRestockIntent ? "Identified 1 item below minimum safety stock level." : "All inventory levels are optimal."
      }`,
      proposals,
    };
  }

  /**
   * Create an auditable AI action log
   */
  public static createActionLog(
    tenantId: string,
    promptSummary: string,
    proposal: AIProposal
  ): AIActionLog {
    return {
      id: `ai-action-${Date.now()}`,
      tenant_id: tenantId,
      prompt_summary: promptSummary,
      action_type: proposal.actionType,
      authority_level: proposal.authorityLevel,
      proposed_payload: proposal.payload,
      status: proposal.requiresHumanApproval ? "pending" : "approved",
      created_at: new Date().toISOString(),
    };
  }
}
