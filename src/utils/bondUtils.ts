/**
 * Converts an array of numbers into a formatted string with ranges
 * If 5 or more consecutive numbers are found, they're displayed as a range
 * Otherwise, individual numbers are shown
 */
export function formatBonds(bonds: number[]): string {
  if (!bonds || bonds.length === 0) return "";

  // Sort the bonds numerically
  const sortedBonds = [...bonds].sort((a, b) => a - b);

  const result: string[] = [];
  let start: number | null = null;
  let end: number | null = null;

  for (let i = 0; i < sortedBonds.length; i++) {
    const current = sortedBonds[i];

    if (start === null) {
      start = current;
      end = current;
    } else if (current === end! + 1) {
      // Consecutive number, extend the range
      end = current;
    } else {
      // Non-consecutive number, close the current range
      if (end! - start! >= 4) {
        // 5 or more consecutive numbers, show as range
        result.push(`${start}-${end}`);
      } else {
        // Less than 5 consecutive numbers, show individually
        for (let j = start!; j <= end!; j++) {
          result.push(j.toString());
        }
      }

      // Start a new sequence
      start = current;
      end = current;
    }
  }

  // Handle the last sequence
  if (start !== null) {
    if (end! - start! >= 4) {
      // 5 or more consecutive numbers, show as range
      result.push(`${start}-${end}`);
    } else {
      // Less than 5 consecutive numbers, show individually
      for (let j = start!; j <= end!; j++) {
        result.push(j.toString());
      }
    }
  }

  return result.join(", ");
}
