export function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function getCycleStart(
  anchorDate: string,
  frequencyDays: number,
): string {
  const anchor = new Date(anchorDate + 'T00:00:00').getTime();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayMs = today.getTime();
  const dayMs = frequencyDays * 24 * 60 * 60 * 1000;
  const elapsed = todayMs - anchor;
  const cycles = Math.floor(elapsed / dayMs);
  const cycleStartMs = anchor + cycles * dayMs;
  return new Date(cycleStartMs).toISOString().slice(0, 10);
}
