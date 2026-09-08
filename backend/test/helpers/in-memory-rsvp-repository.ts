import { randomUUID } from "node:crypto";
import type { RsvpRepository } from "../../src/application/ports/rsvp-repository.js";
import type { RsvpInput, RsvpResponse } from "../../src/domain/rsvp-response.js";
import { RSVP_STATUS, type RsvpStatus } from "../../src/shared/constants/rsvp-status.js";

export class InMemoryRsvpRepository implements RsvpRepository {
  private readonly responses: RsvpResponse[] = [];

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

  async listByInvitationId(invitationId: string): Promise<RsvpResponse[]> {
    return this.responses.filter((response) => response.invitationId === invitationId);
  }
}
