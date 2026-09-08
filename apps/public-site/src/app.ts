import Fastify, { type FastifyInstance } from "fastify";
import type { AppDependencies } from "./types.js";
import { createI18n } from "./i18n/i18n.js";
import { renderInvitationPage } from "./templates/render-page.js";
import { renderNotFoundPage } from "./templates/render-not-found.js";
import { RsvpSubmissionError } from "./services/backend-api-client.js";

export function buildApp(deps: AppDependencies): FastifyInstance {
  const app = Fastify({ logger: false });
  const i18n = createI18n();
  const t = i18n.t.bind(i18n);

  app.get("/:slug", async (request, reply) => {
    const { slug } = request.params as { slug: string };
    const invitation = await deps.backendApiClient.getInvitationBySlug(slug);

    if (!invitation) {
      reply.code(404).type("text/html").send(renderNotFoundPage(t));
      return;
    }

    reply.type("text/html").send(renderInvitationPage(invitation, t));
  });

  app.post("/:slug/rsvp", async (request, reply) => {
    const { slug } = request.params as { slug: string };
    const body = request.body as Record<string, unknown>;

    try {
      const result = await deps.backendApiClient.submitRsvp(slug, {
        guestName: String(body.guestName ?? ""),
        status: String(body.status ?? ""),
      });
      reply.code(201).send(result);
    } catch (error) {
      if (error instanceof RsvpSubmissionError) {
        reply.code(error.status).send(error.body);
        return;
      }
      reply.code(500).send({ error: "Internal server error" });
    }
  });

  return app;
}
