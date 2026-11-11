export function parseImages(raw: any): string[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
      return [raw];
    } catch {
      return [raw];
    }
  }
  return [];
}

export function formatCurrencyINR(amount: number): string {
  return "₹" + amount.toLocaleString("en-IN");
}
