import type { FastifyInstance } from "fastify";
import { API_ROUTES } from "../../shared/constants/routes.js";
import { LIMITS } from "../../shared/constants/limits.js";
import { serializeInvitation } from "../serializers.js";
import { GetInvitationBySlugUseCase } from "../../application/use-cases/get-invitation-by-slug.js";
import { SubmitRsvpUseCase } from "../../application/use-cases/submit-rsvp.js";
import { InMemoryRateLimiter } from "../../infrastructure/rate-limiter.js";
import type { AppDependencies } from "../types.js";

export async function registerPublicInvitationsRoutes(app: FastifyInstance, deps: AppDependencies): Promise<void> {
  const getInvitationBySlug = new GetInvitationBySlugUseCase(deps.invitationRepository);
  const submitRsvp = new SubmitRsvpUseCase(deps.invitationRepository, deps.rsvpRepository, deps.ownerNotifier);
  const rateLimiter = new InMemoryRateLimiter(LIMITS.RSVP_SUBMISSIONS_PER_MINUTE_PER_IP, 60_000);

  app.get(API_ROUTES.PUBLIC_INVITATION_BY_SLUG, async (request, reply) => {
    const { slug } = request.params as { slug: string };
    const invitation = await getInvitationBySlug.execute(slug);
    reply.send(serializeInvitation(invitation));
  });

  app.post(API_ROUTES.PUBLIC_RSVP, async (request, reply) => {
    if (!rateLimiter.isAllowed(request.ip)) {
      reply.code(429).send({ error: "Too many RSVP submissions, please try again later" });
      return;
    }

    const { slug } = request.params as { slug: string };
    const body = request.body as Record<string, unknown>;
    const rsvp = await submitRsvp.execute({
      slug,
      input: { guestName: String(body.guestName ?? ""), status: String(body.status ?? "") },
    });
    reply.code(201).send({ id: rsvp.id, status: rsvp.status });
  });
}
