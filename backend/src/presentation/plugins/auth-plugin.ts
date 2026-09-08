import type { FastifyReply, FastifyRequest } from "fastify";
import { validateTelegramInitData } from "../../infrastructure/auth/telegram-init-data-validator.js";

export function createTelegramAuthPreHandler(botToken: string) {
  return async function telegramAuthPreHandler(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const header = request.headers.authorization;
    if (!header || !header.startsWith("tma ")) {
      reply.code(401).send({ error: "Missing Telegram authorization" });
      return;
    }

    const result = validateTelegramInitData(header.slice("tma ".length), botToken);
    if (!result.isValid || result.telegramId === undefined) {
      reply.code(401).send({ error: "Invalid Telegram authorization" });
      return;
    }

    request.ownerTelegramId = result.telegramId;
  };
}
