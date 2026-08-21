export type ParsedLineItem = {
  description: string;
  quantity: number;
  unitPrice: number;
};

/** Reads repeated `description[]` / `quantity[]` / `unitPrice[]` fields written
 * by <LineItemsEditor> and returns the well-formed rows (blank rows dropped). */
export function parseLineItems(formData: FormData): ParsedLineItem[] {
  const descriptions = formData.getAll("description[]").map(String);
  const quantities = formData.getAll("quantity[]").map(String);
  const unitPrices = formData.getAll("unitPrice[]").map(String);

  const items: ParsedLineItem[] = [];
  for (let i = 0; i < descriptions.length; i++) {
    const description = descriptions[i]?.trim();
    if (!description) continue;
    const quantity = Number(quantities[i]);
    const unitPrice = Number(unitPrices[i]);
    items.push({
      description,
      quantity: Number.isFinite(quantity) && quantity > 0 ? quantity : 1,
      unitPrice: Number.isFinite(unitPrice) && unitPrice >= 0 ? unitPrice : 0,
    });
  }
  return items;
}
