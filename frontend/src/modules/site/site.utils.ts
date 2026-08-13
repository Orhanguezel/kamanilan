export function sumCategoryCounts(counts: Record<string, number>): number {
  return Object.values(counts).reduce(
    (total, count) => total + Number(count || 0),
    0,
  );
}
