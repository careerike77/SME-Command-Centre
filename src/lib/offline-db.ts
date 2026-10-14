import Dexie, { Table } from "dexie";
import { PaymentMethod } from "@/types/database";

export interface OfflineSaleItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  costPrice: number;
  taxRatePercent: number;
}

export interface OfflineSaleQueueEntry {
  id?: number;
  idempotencyKey: string;
  tenantId: string;
  cashierId?: string;
  customerId?: string;
  paymentMethod: PaymentMethod;
  paidAmount: number;
  items: OfflineSaleItem[];
  currency: string;
  status: "pending" | "synced" | "conflict" | "failed";
  errorMessage?: string;
  createdAt: string;
}

export class OfflineDatabase extends Dexie {
  public saleQueue!: Table<OfflineSaleQueueEntry, number>;

  constructor() {
    super("aiboss_offline_db");
    this.version(1).stores({
      saleQueue: "++id, idempotencyKey, tenantId, status, createdAt",
    });
  }
}

export const offlineDb = typeof window !== "undefined" ? new OfflineDatabase() : null;
