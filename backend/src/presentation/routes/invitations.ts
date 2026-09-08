import type { FastifyInstance } from "fastify";
import { API_ROUTES } from "../../shared/constants/routes.js";
import { createTelegramAuthPreHandler } from "../plugins/auth-plugin.js";
import { serializeInvitation, serializeGuest } from "../serializers.js";
import { CreateInvitationUseCase } from "../../application/use-cases/create-invitation.js";
import { GetMyInvitationUseCase } from "../../application/use-cases/get-my-invitation.js";
import { UpdateInvitationUseCase } from "../../application/use-cases/update-invitation.js";
import { ListGuestsUseCase } from "../../application/use-cases/list-guests.js";
import { DeleteInvitationUseCase } from "../../application/use-cases/delete-invitation.js";
import type { AppDependencies } from "../types.js";
import type { InvitationInput } from "../../domain/invitation.js";

function readOptionalString(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function toInvitationInput(body: Record<string, unknown>): InvitationInput {
  return {
    groomName: String(body.groomName ?? ""),
    brideName: String(body.brideName ?? ""),
    eventDateTime: new Date(String(body.eventDateTime ?? "")),
    venueName: String(body.venueName ?? ""),
    venueAddress: String(body.venueAddress ?? ""),
    mapUrl: readOptionalString(body.mapUrl),
    greetingText: readOptionalString(body.greetingText),
    musicTrackId: String(body.musicTrackId ?? ""),
  };
}

function toPartialInvitationInput(body: Record<string, unknown>): Partial<InvitationInput> {
  const partial: Partial<InvitationInput> = {};
  if ("groomName" in body) partial.groomName = String(body.groomName);
  if ("brideName" in body) partial.brideName = String(body.brideName);
  if ("eventDateTime" in body) partial.eventDateTime = new Date(String(body.eventDateTime));
  if ("venueName" in body) partial.venueName = String(body.venueName);
  if ("venueAddress" in body) partial.venueAddress = String(body.venueAddress);
  if ("mapUrl" in body) partial.mapUrl = readOptionalString(body.mapUrl);
  if ("greetingText" in body) partial.greetingText = readOptionalString(body.greetingText);
  if ("musicTrackId" in body) partial.musicTrackId = String(body.musicTrackId);
  return partial;
}

export async function registerInvitationsRoutes(app: FastifyInstance, deps: AppDependencies): Promise<void> {
  const auth = createTelegramAuthPreHandler(deps.botToken);
  const createInvitation = new CreateInvitationUseCase(deps.invitationRepository);
  const getMyInvitation = new GetMyInvitationUseCase(deps.invitationRepository);
  const updateInvitation = new UpdateInvitationUseCase(deps.invitationRepository);
  const listGuests = new ListGuestsUseCase(deps.invitationRepository, deps.rsvpRepository);
  const deleteInvitation = new DeleteInvitationUseCase(deps.invitationRepository);

  app.post(API_ROUTES.CREATE_INVITATION, { preHandler: auth }, async (request, reply) => {
    const ownerTelegramId = request.ownerTelegramId!;
    const invitation = await createInvitation.execute({
      ownerTelegramId,
      ownerChatId: ownerTelegramId, // private chat id equals the user's telegram id
      input: toInvitationInput(request.body as Record<string, unknown>),
    });
    reply.code(201).send(serializeInvitation(invitation));
  });

  app.get(API_ROUTES.MY_INVITATION, { preHandler: auth }, async (request, reply) => {
    const invitation = await getMyInvitation.execute(request.ownerTelegramId!);
    reply.send(serializeInvitation(invitation));
  });

  app.put(API_ROUTES.MY_INVITATION, { preHandler: auth }, async (request, reply) => {
    const invitation = await updateInvitation.execute({
      ownerTelegramId: request.ownerTelegramId!,
      input: toPartialInvitationInput(request.body as Record<string, unknown>),
    });
    reply.send(serializeInvitation(invitation));
  });

  app.get(API_ROUTES.MY_GUESTS, { preHandler: auth }, async (request, reply) => {
    const guests = await listGuests.execute(request.ownerTelegramId!);
    reply.send(guests.map(serializeGuest));
  });

  app.delete(API_ROUTES.MY_INVITATION, { preHandler: auth }, async (request, reply) => {
    await deleteInvitation.execute(request.ownerTelegramId!);
    reply.code(204).send();
  });
}
