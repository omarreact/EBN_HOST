export function distance(a: string, b: string): number {
  const prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let diagonal = prev[0];
    prev[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const next = prev[j];
      prev[j] = Math.min(
        prev[j] + 1,
        prev[j - 1] + 1,
        diagonal + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
      diagonal = next;
    }
  }
  return prev[b.length];
}
export function titleMatch(title: string, query: string): boolean {
  const text = title.normalize("NFKD").toLowerCase();
  const q = query.normalize("NFKD").toLowerCase().trim();
  if (text.includes(q)) return true;
  if (q.length < 4 || q.length > 50) return false;
  return text
    .split(/\s+/)
    .some(
      (word) =>
        Math.abs(word.length - q.length) <= 2 &&
        distance(word, q) <= (q.length > 7 ? 2 : 1),
    );
}
