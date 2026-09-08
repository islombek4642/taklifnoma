export interface BotCommandConfig {
  command: string;
  descriptionKey: string;
}

export const BOT_COMMANDS: BotCommandConfig[] = [
  { command: "start", descriptionKey: "commands.start" },
  { command: "help", descriptionKey: "commands.help" },
];
