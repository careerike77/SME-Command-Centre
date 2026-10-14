import { describe, it, expect } from "vitest";
import { Money } from "../lib/money";
import { PosService } from "../services/pos-service";
import { assertPermission, AuthorizationError } from "../services/auth-service";
import { SyncEngine } from "../services/sync-engine";

describe("Decimal-Safe Financial Arithmetic", () => {
  it("calculates precise GHS money addition and tax without floating point errors", () => {
    const item1 = new Money(19.99, "GHS");
    const item2 = new Money(10.01, "GHS");
    const total = item1.add(item2);

    expect(total.toFixed(2)).toBe("30.00");
    expect(total.formatSymbol()).toBe("GH₵30.00");

    const tax = total.calculateTax(15); // 15% VAT
    expect(tax.toFixed(2)).toBe("4.50");
  });
});

describe("POS Sale Processing", () => {
  it("processes sale atomically and computes grand total and change accurately", () => {
    const result = PosService.processSale({
      tenantId: "tenant-gh-1",
      paymentMethod: "cash",
      paidAmount: 100.0,
      currency: "GHS",
      items: [
        {
          productId: "p1",
          productName: "Rice 5kg",
          quantity: 1,
          unitPrice: 80.0,
          costPrice: 60.0,
          taxRatePercent: 15,
        },
      ],
    });

    expect(result.sale.subtotal).toBe("80.0000");
    expect(result.sale.tax_total).toBe("12.0000");
    expect(result.sale.grand_total).toBe("92.0000");
    expect(result.sale.change_due).toBe("8.0000");
    expect(result.items.length).toBe(1);
  });
});

describe("Multi-Tenant & Role Authorization Enforcer", () => {
  it("allows owners access to all domain actions", () => {
    expect(() => assertPermission("owner", "finance:read")).not.toThrow();
    expect(() => assertPermission("owner", "staff:manage")).not.toThrow();
  });

  it("blocks cashiers from accessing staff management or finance", () => {
    expect(() => assertPermission("cashier", "pos:create_sale")).not.toThrow();
    expect(() => assertPermission("cashier", "staff:manage")).toThrow(AuthorizationError);
    expect(() => assertPermission("cashier", "finance:create_entry")).toThrow(AuthorizationError);
  });
});

describe("Offline Synchronization & Idempotency", () => {
  it("prevents duplicate offline sale processing using idempotency keys", async () => {
    const offlineBatch = [
      {
        idempotencyKey: "key-unique-001",
        tenantId: "tenant-gh-1",
        paymentMethod: "cash" as const,
        paidAmount: 50.0,
        currency: "GHS",
        status: "pending" as const,
        createdAt: new Date().toISOString(),
        items: [
          {
            productId: "p2",
            productName: "Cooking Oil 1L",
            quantity: 1,
            unitPrice: 40.0,
            costPrice: 30.0,
            taxRatePercent: 15,
          },
        ],
      },
      {
        idempotencyKey: "key-unique-001", // Duplicate key in batch
        tenantId: "tenant-gh-1",
        paymentMethod: "cash" as const,
        paidAmount: 50.0,
        currency: "GHS",
        status: "pending" as const,
        createdAt: new Date().toISOString(),
        items: [
          {
            productId: "p2",
            productName: "Cooking Oil 1L",
            quantity: 1,
            unitPrice: 40.0,
            costPrice: 30.0,
            taxRatePercent: 15,
          },
        ],
      },
    ];

    const syncResult = await SyncEngine.processQueue(offlineBatch);

    expect(syncResult.successes.length).toBe(1);
    expect(syncResult.conflicts.length).toBe(1);
    expect(syncResult.conflicts[0].reason).toContain("Idempotency Key already processed");
  });
});
