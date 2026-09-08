import type { BackendApiClient, PublicInvitationDto, RsvpInputDto } from "../../src/services/backend-api-client.js";
import { RsvpSubmissionError } from "../../src/services/backend-api-client.js";

export class FakeBackendApiClient implements BackendApiClient {
  private readonly invitations = new Map<string, PublicInvitationDto>();
  readonly submittedRsvps: Array<{ slug: string; input: RsvpInputDto }> = [];
  rsvpFailure: { status: number; body: unknown } | undefined;

  seedInvitation(invitation: PublicInvitationDto): void {
    this.invitations.set(invitation.slug, invitation);
  }

  async getInvitationBySlug(slug: string): Promise<PublicInvitationDto | null> {
    return this.invitations.get(slug) ?? null;
  }

  async submitRsvp(slug: string, input: RsvpInputDto): Promise<{ id: string; status: string }> {
    if (this.rsvpFailure) throw new RsvpSubmissionError(this.rsvpFailure.status, this.rsvpFailure.body);
    this.submittedRsvps.push({ slug, input });
    return { id: "rsvp-1", status: input.status };
  }
}
