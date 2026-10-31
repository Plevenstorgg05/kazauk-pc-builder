/**
 * Money handling.
 *
 * Totals are summed in integer pence, never floating-point pounds. Summing
 * 358.99 + 142.95 + 515.95 ... in floats accumulates representation error;
 * in pence it is exact. This is what makes the happy-path total land on
 * exactly GBP 2,448.69 (brief 9.6).
 */

export function toPence(pounds: number): number {
  return Math.round(pounds * 100);
}

export function sumPence(values: number[]): number {
  return values.reduce((acc, v) => acc + toPence(v), 0);
}

const GBP = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
});

export function formatPence(pence: number): string {
  return GBP.format(pence / 100);
}

export function formatPounds(pounds: number): string {
  return GBP.format(pounds);
}
