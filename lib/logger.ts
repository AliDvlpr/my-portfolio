type SafeLog = {
  event: string;
  requestId?: string;
  durationMs?: number;
  code?: string;
  timestamp?: string;
  [key: string]: string | number | boolean | undefined;
};

export function logServerEvent(entry: SafeLog) {
  console.info(JSON.stringify({ ...entry, timestamp: entry.timestamp ?? new Date().toISOString() }));
}

export function logServerError(entry: SafeLog) {
  console.error(JSON.stringify({ ...entry, timestamp: entry.timestamp ?? new Date().toISOString() }));
}
