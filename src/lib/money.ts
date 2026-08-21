import { toNumber } from "@/lib/format";

export type LineItemLike = {
  quantity: unknown;
  unitPrice: unknown;
};

export function lineItemTotal(item: LineItemLike) {
  return toNumber(item.quantity) * toNumber(item.unitPrice);
}

export function subtotalOf(items: LineItemLike[]) {
  return items.reduce((sum, item) => sum + lineItemTotal(item), 0);
}

export function computeTotals(items: LineItemLike[], taxRate: unknown) {
  const subtotal = subtotalOf(items);
  const tax = subtotal * (toNumber(taxRate) / 100);
  const total = subtotal + tax;
  return { subtotal, tax, total };
}

export function amountPaid(payments: { amount: unknown }[]) {
  return payments.reduce((sum, p) => sum + toNumber(p.amount), 0);
}
