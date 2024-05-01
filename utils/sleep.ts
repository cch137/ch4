export default function sleep(sleepMs: number | null = 0) {
  return new Promise<void>((r) => setTimeout(r, sleepMs || 0));
}
