import Fastify, { type FastifyInstance } from "fastify";
import cors from "@fastify/cors";
import type { AppDependencies } from "./types.js";
import { handleError } from "./error-handler.js";
import { registerInvitationsRoutes } from "./routes/invitations.js";
import { registerPublicInvitationsRoutes } from "./routes/public-invitations.js";

export function buildApp(deps: AppDependencies): FastifyInstance {
  const app = Fastify({ logger: false });

  // Mini App calls /api/invitations* cross-origin (its own domain, not
  // this API's), so it needs CORS; the public-site routes don't need it
  // (that app proxies server-side instead) but registering here at the
  // root applies to the whole app, which is harmless for them.
  void app.register(cors, {
    origin: deps.corsOrigin ?? true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  });

  app.setErrorHandler(handleError);

  app.get("/health", async (_request, reply) => {
    reply.send({ status: "ok" });
  });

  app.register(async (instance) => registerInvitationsRoutes(instance, deps));
  app.register(async (instance) => registerPublicInvitationsRoutes(instance, deps));

  return app;
}
