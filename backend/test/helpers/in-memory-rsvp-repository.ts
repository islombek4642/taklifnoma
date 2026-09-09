import { randomUUID } from "node:crypto";
import type { RsvpRepository, RsvpUpsertResult } from "../../src/application/ports/rsvp-repository.js";
import type { RsvpInput, RsvpResponse } from "../../src/domain/rsvp-response.js";
import { RSVP_STATUS, type RsvpStatus } from "../../src/shared/constants/rsvp-status.js";

export class InMemoryRsvpRepository implements RsvpRepository {
  private readonly responses: RsvpResponse[] = [];
  private readonly tokensByResponseId = new Map<string, string>();

  async create(invitationId: string, input: RsvpInput): Promise<RsvpResponse> {
    const response: RsvpResponse = {
      id: randomUUID(),
      invitationId,
      guestName: input.guestName.trim(),
      status: (input.status as RsvpStatus) ?? RSVP_STATUS.COMING,
      respondedAt: new Date(),
    };
    this.responses.push(response);
    return response;
  }

  async upsertByToken(invitationId: string, guestToken: string, input: RsvpInput): Promise<RsvpUpsertResult> {
    const existing = this.responses.find(
      (response) => response.invitationId === invitationId && this.tokensByResponseId.get(response.id) === guestToken,
    );

    if (existing) {
      const previousStatus = existing.status;
      existing.guestName = input.guestName.trim();
      existing.status = input.status as RsvpStatus;
      existing.respondedAt = new Date();
      return { rsvp: existing, previousStatus };
    }

    const rsvp = await this.create(invitationId, input);
    this.tokensByResponseId.set(rsvp.id, guestToken);
    return { rsvp, previousStatus: null };
  }

  async listByInvitationId(invitationId: string): Promise<RsvpResponse[]> {
    return this.responses.filter((response) => response.invitationId === invitationId);
  }
}
