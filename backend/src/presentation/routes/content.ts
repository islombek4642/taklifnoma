import type { FastifyInstance } from "fastify";
import { API_ROUTES } from "../../shared/constants/routes.js";
import type { AppDependencies } from "../types.js";

export async function registerContentRoutes(app: FastifyInstance, deps: AppDependencies): Promise<void> {
  app.get(API_ROUTES.TEMPLATES, async (_request, reply) => {
    reply.send(await deps.templateRegistry.list());
  });

  app.get(API_ROUTES.MUSIC_TRACKS, async (_request, reply) => {
    reply.send(await deps.musicRegistry.list());
  });
}
