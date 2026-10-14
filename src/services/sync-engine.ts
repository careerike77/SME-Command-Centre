import { PosService } from "./pos-service";
import { OfflineSaleQueueEntry } from "@/lib/offline-db";
import { Sale, SaleItem } from "@/types/database";

export interface SyncBatchResult {
  processedCount: number;
  successes: { idempotencyKey: string; sale: Sale; items: SaleItem[] }[];
  conflicts: { idempotencyKey: string; reason: string }[];
}

export class SyncEngine {
  private static processedKeys = new Set<string>();

  /**
   * Process a queue of offline transactions with strict idempotency and conflict resolution.
   */
  public static async processQueue(entries: OfflineSaleQueueEntry[]): Promise<SyncBatchResult> {
    const result: SyncBatchResult = {
      processedCount: 0,
      successes: [],
      conflicts: [],
    };

    for (const entry of entries) {
      result.processedCount++;

      // Idempotency check: prevent duplicate sync
      if (this.processedKeys.has(entry.idempotencyKey)) {
        result.conflicts.push({
          idempotencyKey: entry.idempotencyKey,
          reason: "Duplicate sale transaction ignored (Idempotency Key already processed)",
        });
        continue;
      }

      try {
        // Validate items and inventory rules before committing
        if (!entry.items || entry.items.length === 0) {
          result.conflicts.push({
            idempotencyKey: entry.idempotencyKey,
            reason: "Empty sale items list",
          });
          continue;
        }

        const saleResult = PosService.processSale({
          tenantId: entry.tenantId,
          cashierId: entry.cashierId,
          customerId: entry.customerId,
          paymentMethod: entry.paymentMethod,
          paidAmount: entry.paidAmount,
          items: entry.items,
          currency: entry.currency,
          idempotencyKey: entry.idempotencyKey,
          isOfflineSync: true,
        });

        this.processedKeys.add(entry.idempotencyKey);
        result.successes.push({
          idempotencyKey: entry.idempotencyKey,
          sale: saleResult.sale,
          items: saleResult.items,
        });
      } catch (err) {
        result.conflicts.push({
          idempotencyKey: entry.idempotencyKey,
          reason: err instanceof Error ? err.message : "Sync processing failed",
        });
      }
    }

    return result;
  }
}
