import Decimal from "decimal.js";

// Ensure high precision for financial and stock calculations
Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_UP });

export class Money {
  private amount: Decimal;
  public currency: string;

  constructor(amount: number | string | Decimal, currency: string = "GHS") {
    this.amount = new Decimal(amount);
    this.currency = currency;
  }

  public add(other: Money): Money {
    this.ensureSameCurrency(other);
    return new Money(this.amount.plus(other.amount), this.currency);
  }

  public subtract(other: Money): Money {
    this.ensureSameCurrency(other);
    return new Money(this.amount.minus(other.amount), this.currency);
  }

  public multiply(factor: number | string | Decimal): Money {
    return new Money(this.amount.times(new Decimal(factor)), this.currency);
  }

  public calculateTax(taxRatePercent: number | string | Decimal): Money {
    const rate = new Decimal(taxRatePercent).dividedBy(100);
    return new Money(this.amount.times(rate), this.currency);
  }

  public toDecimal(): Decimal {
    return this.amount;
  }

  public toFixed(decimals: number = 2): string {
    return this.amount.toFixed(decimals);
  }

  public formatSymbol(): string {
    const symbolMap: Record<string, string> = {
      GHS: "GH₵",
      USD: "$",
      EUR: "€",
      GBP: "£",
      NGN: "₦",
      KES: "KSh",
    };
    const symbol = symbolMap[this.currency] || this.currency;
    return `${symbol}${this.toFixed(2)}`;
  }

  private ensureSameCurrency(other: Money): void {
    if (this.currency !== other.currency) {
      throw new Error(`Currency mismatch: ${this.currency} vs ${other.currency}`);
    }
  }
}
