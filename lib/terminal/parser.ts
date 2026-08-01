import type { ParsedCommand, TerminalToken } from "./types";

function tokenize(input: string): TerminalToken[] {
  const tokens: TerminalToken[] = [];
  let current = "";
  let quoted = false;
  let activeQuote: '"' | "'" | null = null;

  for (let index = 0; index < input.length; index += 1) {
    const char = input[index];
    if ((char === '"' || char === "'") && activeQuote == null) {
      activeQuote = char;
      quoted = true;
      continue;
    }
    if (activeQuote && char === activeQuote) {
      activeQuote = null;
      continue;
    }
    if (!activeQuote && /\s/.test(char)) {
      if (current) {
        tokens.push({ value: current, quoted });
        current = "";
        quoted = false;
      }
      continue;
    }
    current += char;
  }

  if (current) tokens.push({ value: current, quoted });
  return tokens;
}

export function parseCommand(input: string): ParsedCommand | null {
  const raw = input.trim();
  if (!raw) return null;
  const tokens = tokenize(raw);
  if (!tokens.length) return null;
  const [head, ...rest] = tokens;
  const args: string[] = [];
  const flags: Record<string, string | boolean> = {};

  for (let index = 0; index < rest.length; index += 1) {
    const token = rest[index];
    if (token.value.startsWith("--")) {
      const key = token.value.slice(2);
      const next = rest[index + 1];
      if (!key) continue;
      if (next && !next.value.startsWith("--")) {
        flags[key] = next.value;
        index += 1;
      } else {
        flags[key] = true;
      }
      continue;
    }
    args.push(token.value);
  }

  return {
    command: head.value.toLowerCase(),
    args,
    flags,
    raw,
  };
}
