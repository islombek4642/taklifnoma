import path from "node:path";
import Fastify, { type FastifyInstance } from "fastify";
import cors from "@fastify/cors";
import fastifyStatic from "@fastify/static";
import type { AppDependencies } from "./types.js";
import { handleError } from "./error-handler.js";
import { registerInvitationsRoutes } from "./routes/invitations.js";
import { registerPublicInvitationsRoutes } from "./routes/public-invitations.js";
import { registerContentRoutes } from "./routes/content.js";
import { registerAdminRoutes } from "./routes/admin.js";
import { MEDIA_ROUTES } from "../shared/constants/routes.js";
import { MUSIC_UPLOAD_MAX_BYTES } from "../shared/constants/music-upload.js";

export function buildApp(deps: AppDependencies): FastifyInstance {
  // The default 1MB body limit is fine for every other route, but an
  // admin music upload sends the audio file itself as base64 JSON (~33%
  // larger than the raw file), so the whole app needs enough headroom for
  // that one route.
  const app = Fastify({ logger: false, bodyLimit: MUSIC_UPLOAD_MAX_BYTES * 2 });

  // Mini App calls /api/invitations* cross-origin (its own domain, not
  // this API's), so it needs CORS; the public-site routes don't need it
  // (that app proxies server-side instead) but registering here at the
  // root applies to the whole app, which is harmless for them.
  void app.register(cors, {
    origin: deps.corsOrigin ?? true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  });

  // Serves music track audio files (a plain <audio src> load isn't subject
  // to CORS, so this needs no special origin handling even for the public
  // invitation page on a different domain).
  void app.register(fastifyStatic, {
    root: path.join(deps.contentDir, "music"),
    prefix: MEDIA_ROUTES.MUSIC_PREFIX,
    decorateReply: false,
  });

  app.setErrorHandler(handleError);

  app.get("/health", async (_request, reply) => {
    reply.send({ status: "ok" });
  });

  app.register(async (instance) => registerInvitationsRoutes(instance, deps));
  app.register(async (instance) => registerPublicInvitationsRoutes(instance, deps));
  app.register(async (instance) => registerContentRoutes(instance, deps));
  app.register(async (instance) => registerAdminRoutes(instance, deps));

  return app;
}
