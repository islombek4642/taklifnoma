import Fastify, { type FastifyInstance } from "fastify";
import type { AppDependencies } from "./types.js";
import { createI18n } from "./i18n/i18n.js";
import { renderInvitationPage } from "./templates/render-page.js";
import { renderNotFoundPage } from "./templates/render-not-found.js";
import { RsvpSubmissionError } from "./services/backend-api-client.js";
import { FALLBACK_STYLE } from "./constants/fallback-style.js";

export function buildApp(deps: AppDependencies): FastifyInstance {
  const app = Fastify({ logger: false });
  const i18n = createI18n();
  const t = i18n.t.bind(i18n);

  app.get("/health", async (_request, reply) => {
    reply.send({ status: "ok" });
  });

  // Proxies music audio from the backend so the browser only ever talks
  // to this site's own domain (same reason RSVP is proxied below, rather
  // than exposed cross-origin) — the path shape matches the backend's own
  // /media/music/:id/:file route exactly, so a track's fileUrl from
  // GET /api/music-tracks can be used as-is for both.
  app.get("/media/music/:id/:file", async (request, reply) => {
    const { id, file } = request.params as { id: string; file: string };
    const media = await deps.backendApiClient.fetchMedia(`/media/music/${encodeURIComponent(id)}/${encodeURIComponent(file)}`);

    if (!media) {
      reply.code(404).send();
      return;
    }

    reply.type(media.contentType).send(Buffer.from(media.body));
  });

  app.get("/:slug", async (request, reply) => {
    const { slug } = request.params as { slug: string };
    // A slug can go from "not found" to "found" within seconds of the
    // owner creating it and sharing the link (and RSVP counts change on
    // every response), so this page must never be served from a client
    // or intermediate cache — a cached 404 from an early fetch (e.g. a
    // chat app generating a link preview) would otherwise stick around
    // and outlive the invitation actually being created.
    reply.header("cache-control", "no-store");
    const invitation = await deps.backendApiClient.getInvitationBySlug(slug);

    if (!invitation) {
      reply.code(404).type("text/html").send(renderNotFoundPage(t));
      return;
    }

    const [templates, musicTracks] = await Promise.all([
      deps.backendApiClient.getTemplates(),
      deps.backendApiClient.getMusicTracks(),
    ]);
    const styleCss = templates.find((template) => template.id === invitation.templateId)?.styleCss ?? FALLBACK_STYLE;
    const musicFileUrl = musicTracks.find((track) => track.id === invitation.musicTrackId)?.fileUrl;

    reply.type("text/html").send(renderInvitationPage(invitation, t, styleCss, musicFileUrl));
  });

  app.post("/:slug/rsvp", async (request, reply) => {
    reply.header("cache-control", "no-store");
    const { slug } = request.params as { slug: string };
    const body = request.body as Record<string, unknown>;

    const guestToken = typeof body.guestToken === "string" && body.guestToken.length > 0 ? body.guestToken : undefined;

    try {
      const result = await deps.backendApiClient.submitRsvp(slug, {
        guestName: String(body.guestName ?? ""),
        status: String(body.status ?? ""),
        guestToken,
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
