const requests = new Map<string, { count: number; reset: number }>();

export function rateLimit(ip: string, limit = 5, windowMs = 60_000): boolean {
  const now = Date.now();
  const record = requests.get(ip);
  if (!record || now > record.reset) {
    requests.set(ip, { count: 1, reset: now + windowMs });
    return true;
  }
  if (record.count >= limit) return false;
  record.count++;
  return true;
}
