import { Money } from "@/lib/money";
import { PaymentMethod, Sale, SaleItem } from "@/types/database";

export interface CreateSaleInputItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  costPrice: number;
  taxRatePercent: number;
}

export interface CreateSaleInput {
  tenantId: string;
  cashierId?: string;
  customerId?: string;
  paymentMethod: PaymentMethod;
  paidAmount: number;
  items: CreateSaleInputItem[];
  currency?: string;
  idempotencyKey?: string;
  isOfflineSync?: boolean;
}

export interface SaleResult {
  sale: Sale;
  items: SaleItem[];
}

export class PosService {
  /**
   * Process and calculate sale atomically with precise decimal arithmetic.
   */
  public static processSale(input: CreateSaleInput): SaleResult {
    const currency = input.currency || "GHS";
    let subtotal = new Money(0, currency);
    let taxTotal = new Money(0, currency);
    const saleItems: SaleItem[] = [];

    const saleId = `sale-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const receiptNumber = `REC-${Date.now().toString().slice(-6)}`;

    for (const item of input.items) {
      const qty = item.quantity;
      const unitPriceMoney = new Money(item.unitPrice, currency);
      const costPriceMoney = new Money(item.costPrice, currency);

      const itemSubtotal = unitPriceMoney.multiply(qty);
      const itemTax = itemSubtotal.calculateTax(item.taxRatePercent);
      const itemTotal = itemSubtotal.add(itemTax);

      subtotal = subtotal.add(itemSubtotal);
      taxTotal = taxTotal.add(itemTax);

      saleItems.push({
        id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        tenant_id: input.tenantId,
        sale_id: saleId,
        product_id: item.productId,
        product_name: item.productName,
        quantity: qty.toFixed(4),
        unit_price: unitPriceMoney.toFixed(4),
        cost_price: costPriceMoney.toFixed(4),
        tax_rate: item.taxRatePercent.toFixed(2),
        tax_amount: itemTax.toFixed(4),
        subtotal: itemSubtotal.toFixed(4),
        total: itemTotal.toFixed(4),
      });
    }

    const grandTotal = subtotal.add(taxTotal);
    const paidMoney = new Money(input.paidAmount, currency);
    const changeDue = paidMoney.subtract(grandTotal);

    if (changeDue.toDecimal().isNegative() && input.paymentMethod !== "credit") {
      throw new Error(`Insufficient paid amount. Expected ${grandTotal.toFixed(2)}, got ${paidMoney.toFixed(2)}`);
    }

    const saleRecord: Sale = {
      id: saleId,
      tenant_id: input.tenantId,
      receipt_number: receiptNumber,
      customer_id: input.customerId,
      cashier_id: input.cashierId,
      subtotal: subtotal.toFixed(4),
      tax_total: taxTotal.toFixed(4),
      discount_total: "0.0000",
      grand_total: grandTotal.toFixed(4),
      paid_amount: paidMoney.toFixed(4),
      change_due: changeDue.toDecimal().isNegative() ? "0.0000" : changeDue.toFixed(4),
      payment_method: input.paymentMethod,
      status: "completed",
      currency,
      idempotency_key: input.idempotencyKey,
      is_offline_sync: !!input.isOfflineSync,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    return {
      sale: saleRecord,
      items: saleItems,
    };
  }
}
