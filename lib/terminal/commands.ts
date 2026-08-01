import { parseCommand } from "./parser";
import { findCommand } from "./registry";

export function runTerminalCommand(input: string) {
  const parsed = parseCommand(input);
  if (!parsed) {
    return { kind: "text", output: "No command entered." } as const;
  }
  const command = findCommand(parsed.command);
  if (!command) {
    return {
      kind: "text",
      output: `Unknown command "${parsed.command}". Try: help`,
    } as const;
  }
  const unknownFlags = Object.keys(parsed.flags).filter((flag) => {
    const usage = command.usage;
    return !usage.includes(`--${flag}`);
  });
  if (unknownFlags.length) {
    return {
      kind: "text",
      output: `Unknown flag --${unknownFlags[0]} for ${command.name}.\nusage: ${command.usage}`,
    } as const;
  }
  return command.execute(parsed);
}
