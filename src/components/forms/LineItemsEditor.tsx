"use client";

import { useId, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Field";
import { formatCurrency } from "@/lib/format";

export type LineItemRow = {
  key: string;
  description: string;
  quantity: string;
  unitPrice: string;
};

function emptyRow(): LineItemRow {
  return {
    key: Math.random().toString(36).slice(2),
    description: "",
    quantity: "1",
    unitPrice: "",
  };
}

export function LineItemsEditor({
  defaultItems,
  defaultTaxRate,
}: {
  defaultItems?: { description: string; quantity: unknown; unitPrice: unknown }[];
  defaultTaxRate?: unknown;
}) {
  const idBase = useId();
  const [rows, setRows] = useState<LineItemRow[]>(() =>
    defaultItems && defaultItems.length > 0
      ? defaultItems.map((item) => ({
          key: Math.random().toString(36).slice(2),
          description: item.description,
          quantity: String(item.quantity ?? "1"),
          unitPrice: String(item.unitPrice ?? ""),
        }))
      : [emptyRow()]
  );
  const [taxRate, setTaxRate] = useState(
    defaultTaxRate !== undefined ? String(defaultTaxRate) : "0"
  );

  function updateRow(key: string, patch: Partial<LineItemRow>) {
    setRows((rs) => rs.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  }

  function removeRow(key: string) {
    setRows((rs) => (rs.length > 1 ? rs.filter((r) => r.key !== key) : rs));
  }

  const subtotal = rows.reduce((sum, r) => {
    const q = Number(r.quantity) || 0;
    const p = Number(r.unitPrice) || 0;
    return sum + q * p;
  }, 0);
  const tax = subtotal * ((Number(taxRate) || 0) / 100);
  const total = subtotal + tax;

  return (
    <div>
      <Label htmlFor={idBase}>Line items</Label>
      <div className="overflow-hidden rounded-md border border-border">
        <table className="w-full text-sm">
          <thead className="bg-black/[.02] text-left text-xs text-muted">
            <tr>
              <th className="px-3 py-2 font-medium">Description</th>
              <th className="w-24 px-3 py-2 font-medium">Qty</th>
              <th className="w-32 px-3 py-2 font-medium">Unit price</th>
              <th className="w-32 px-3 py-2 text-right font-medium">Amount</th>
              <th className="w-10 px-2 py-2" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((row) => {
              const amount = (Number(row.quantity) || 0) * (Number(row.unitPrice) || 0);
              return (
                <tr key={row.key}>
                  <td className="p-2">
                    <Input
                      name="description[]"
                      value={row.description}
                      onChange={(e) => updateRow(row.key, { description: e.target.value })}
                      placeholder="Labor, materials, etc."
                      className="border-0 shadow-none focus:ring-0"
                      id={row.key === rows[0].key ? idBase : undefined}
                    />
                  </td>
                  <td className="p-2">
                    <Input
                      name="quantity[]"
                      type="number"
                      step="0.01"
                      min="0"
                      value={row.quantity}
                      onChange={(e) => updateRow(row.key, { quantity: e.target.value })}
                      className="border-0 shadow-none focus:ring-0"
                    />
                  </td>
                  <td className="p-2">
                    <Input
                      name="unitPrice[]"
                      type="number"
                      step="0.01"
                      min="0"
                      value={row.unitPrice}
                      onChange={(e) => updateRow(row.key, { unitPrice: e.target.value })}
                      className="border-0 shadow-none focus:ring-0"
                    />
                  </td>
                  <td className="px-3 py-2 text-right text-muted">{formatCurrency(amount)}</td>
                  <td className="p-2 text-center">
                    <button
                      type="button"
                      onClick={() => removeRow(row.key)}
                      className="rounded p-1 text-muted hover:bg-danger-soft hover:text-danger"
                      aria-label="Remove line item"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-2 flex items-center justify-between">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => setRows((rs) => [...rs, emptyRow()])}
        >
          <Plus className="h-4 w-4" /> Add line
        </Button>

        <div className="flex items-center gap-3 text-sm">
          <label className="flex items-center gap-1.5 text-muted">
            Tax rate
            <input
              name="taxRate"
              type="number"
              step="0.01"
              min="0"
              value={taxRate}
              onChange={(e) => setTaxRate(e.target.value)}
              className="w-16 rounded-md border border-border px-2 py-1 text-right text-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
            />
            %
          </label>
        </div>
      </div>

      <div className="mt-3 ml-auto w-full max-w-xs space-y-1 text-sm">
        <div className="flex justify-between text-muted">
          <span>Subtotal</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex justify-between text-muted">
          <span>Tax</span>
          <span>{formatCurrency(tax)}</span>
        </div>
        <div className="flex justify-between border-t border-border pt-1 font-semibold text-foreground">
          <span>Total</span>
          <span>{formatCurrency(total)}</span>
        </div>
      </div>
    </div>
  );
}
