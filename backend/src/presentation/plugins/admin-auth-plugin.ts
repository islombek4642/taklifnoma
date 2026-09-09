import type { FastifyReply, FastifyRequest } from "fastify";

// Admin routes are only ever called by the bot process itself (its admin
// panel, gated to allowlisted Telegram ids on that side) — not by the Mini
// App or a browser — so this only needs to prove "the caller has the bot
// token", the one secret both server-side processes already share, rather
// than a whole new credential.
export function createAdminAuthPreHandler(botToken: string) {
  return async function adminAuthPreHandler(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const header = request.headers.authorization;
    if (header !== `Bearer ${botToken}`) {
      reply.code(401).send({ error: "Unauthorized" });
      return;
    }
  };
}
