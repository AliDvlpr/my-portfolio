export type TerminalToken = {
  value: string;
  quoted: boolean;
};

export type ParsedCommand = {
  command: string;
  args: string[];
  flags: Record<string, string | boolean>;
  raw: string;
};

export type TerminalCommandResult =
  | { kind: "text"; output: string; announce?: string }
  | { kind: "navigation"; output: string; href: string }
  | { kind: "action"; output: string; run: () => void };

export type TerminalCommandDefinition = {
  name: string;
  aliases?: string[];
  usage: string;
  description: string;
  execute: (parsed: ParsedCommand) => TerminalCommandResult;
};
