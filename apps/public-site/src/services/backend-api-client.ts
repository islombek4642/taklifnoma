export interface PublicInvitationDto {
  id: string;
  slug: string;
  groomName: string;
  brideName: string;
  eventDateTime: string;
  venueName: string;
  venueAddress: string;
  mapUrl: string | null;
  greetingText: string | null;
  musicTrackId: string;
}

export interface RsvpInputDto {
  guestName: string;
  status: string;
}

export class RsvpSubmissionError extends Error {
  constructor(
    public readonly status: number,
    public readonly body: unknown,
  ) {
    super(`RSVP submission failed with status ${status}`);
  }
}

export function createBackendApiClient(baseUrl: string) {
  return {
    async getInvitationBySlug(slug: string): Promise<PublicInvitationDto | null> {
      const response = await fetch(`${baseUrl}/api/public/invitations/${encodeURIComponent(slug)}`);
      if (response.status === 404) return null;
      if (!response.ok) throw new Error(`Backend returned ${response.status}`);
      return (await response.json()) as PublicInvitationDto;
    },

    async submitRsvp(slug: string, input: RsvpInputDto): Promise<{ id: string; status: string }> {
      const response = await fetch(`${baseUrl}/api/public/invitations/${encodeURIComponent(slug)}/rsvp`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(input),
      });
      const body = await response.json().catch(() => undefined);
      if (!response.ok) throw new RsvpSubmissionError(response.status, body);
      return body as { id: string; status: string };
    },
  };
}

export type BackendApiClient = ReturnType<typeof createBackendApiClient>;
