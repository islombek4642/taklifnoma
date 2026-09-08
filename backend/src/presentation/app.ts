import Fastify, { type FastifyInstance } from "fastify";
import type { AppDependencies } from "./types.js";
import { handleError } from "./error-handler.js";
import { registerInvitationsRoutes } from "./routes/invitations.js";
import { registerPublicInvitationsRoutes } from "./routes/public-invitations.js";

export function buildApp(deps: AppDependencies): FastifyInstance {
  const app = Fastify({ logger: false });

  app.setErrorHandler(handleError);

  app.register(async (instance) => registerInvitationsRoutes(instance, deps));
  app.register(async (instance) => registerPublicInvitationsRoutes(instance, deps));

  return app;
}
