const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
});

const dateTimeFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

/** Accepts number, numeric string, Prisma Decimal, null, or undefined. */
export function toNumber(value: unknown): number {
  if (value === null || value === undefined) return 0;
  if (typeof value === "number") return value;
  return Number(value.toString());
}

export function formatCurrency(value: unknown) {
  return currencyFormatter.format(toNumber(value));
}

export function formatDate(value: Date | string | null | undefined) {
  if (!value) return "—";
  return dateFormatter.format(new Date(value));
}

export function formatDateTime(value: Date | string | null | undefined) {
  if (!value) return "—";
  return dateTimeFormatter.format(new Date(value));
}

export function formatDateInput(value: Date | string | null | undefined) {
  if (!value) return "";
  const d = new Date(value);
  return d.toISOString().slice(0, 10);
}

export function titleCase(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function formatHours(value: unknown) {
  const n = toNumber(value);
  return `${n.toLocaleString("en-US", { maximumFractionDigits: 2 })} hr${n === 1 ? "" : "s"}`;
}
