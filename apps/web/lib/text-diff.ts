export type DiffOp = 'equal' | 'add' | 'remove';

export interface DiffLine {
  op: DiffOp;
  fromLine: number | null;
  toLine: number | null;
  text: string;
}

/**
 * Compute a line-level diff using the LCS dynamic-programming algorithm.
 * Suitable for snapshots up to ~10k lines; we cap inputs in the route handler.
 */
export function diffLines(from: string, to: string): DiffLine[] {
  const a = from.split('\n');
  const b = to.split('\n');
  const m = a.length;
  const n = b.length;

  // Build LCS length table
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = m - 1; i >= 0; i--) {
    for (let j = n - 1; j >= 0; j--) {
      if (a[i] === b[j]) dp[i]![j]! = dp[i + 1]![j + 1]! + 1;
      else dp[i]![j]! = Math.max(dp[i + 1]![j]!, dp[i]![j + 1]!);
    }
  }

  // Walk back to emit ops
  const out: DiffLine[] = [];
  let i = 0;
  let j = 0;
  while (i < m && j < n) {
    if (a[i] === b[j]) {
      out.push({ op: 'equal', fromLine: i + 1, toLine: j + 1, text: a[i]! });
      i++;
      j++;
    } else if (dp[i + 1]![j]! >= dp[i]![j + 1]!) {
      out.push({ op: 'remove', fromLine: i + 1, toLine: null, text: a[i]! });
      i++;
    } else {
      out.push({ op: 'add', fromLine: null, toLine: j + 1, text: b[j]! });
      j++;
    }
  }
  while (i < m) {
    out.push({ op: 'remove', fromLine: i + 1, toLine: null, text: a[i]! });
    i++;
  }
  while (j < n) {
    out.push({ op: 'add', fromLine: null, toLine: j + 1, text: b[j]! });
    j++;
  }
  return out;
}
