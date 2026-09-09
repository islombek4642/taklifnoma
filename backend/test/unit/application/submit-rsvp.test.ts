import { describe, expect, it } from "vitest";
import { SubmitRsvpUseCase } from "../../../src/application/use-cases/submit-rsvp.js";
import { InMemoryInvitationRepository } from "../../helpers/in-memory-invitation-repository.js";
import { InMemoryRsvpRepository } from "../../helpers/in-memory-rsvp-repository.js";
import { FakeOwnerNotifier } from "../../helpers/fake-owner-notifier.js";
import { NotFoundError, DomainValidationError } from "../../../src/domain/errors.js";

const baseInvitation = {
  groomName: "Ulug'bek",
  brideName: "Malika",
  eventDateTime: new Date("2026-11-11T17:00:00.000Z"),
  venueName: "Baxtiyor restorani",
  venueAddress: "Toshkent viloyati",
  musicTrackId: "romantic-piano",
  slug: "ulugbek-malika",
  ownerTelegramId: 1n,
  ownerChatId: 42n,
};

function buildUseCase() {
  const invitations = new InMemoryInvitationRepository();
  const rsvps = new InMemoryRsvpRepository();
  const notifier = new FakeOwnerNotifier();
  const useCase = new SubmitRsvpUseCase(invitations, rsvps, notifier);
  return { invitations, rsvps, notifier, useCase };
}

describe("SubmitRsvpUseCase", () => {
  it("stores the RSVP against the invitation and notifies the owner", async () => {
    const { invitations, rsvps, notifier, useCase } = buildUseCase();
    await invitations.create(baseInvitation);

    const rsvp = await useCase.execute({
      slug: "ulugbek-malika",
      input: { guestName: "Aziza", status: "COMING" },
    });

    expect(rsvp.guestName).toBe("Aziza");
    expect(await rsvps.listByInvitationId(rsvp.invitationId)).toHaveLength(1);
    expect(notifier.notifications).toHaveLength(1);
    expect(notifier.notifications[0]?.ownerChatId).toBe(42n);
  });

  it("throws NotFoundError for an unknown slug", async () => {
    const { useCase } = buildUseCase();

    await expect(
      useCase.execute({ slug: "unknown", input: { guestName: "Aziza", status: "COMING" } }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it("throws DomainValidationError for invalid input without notifying anyone", async () => {
    const { invitations, notifier, useCase } = buildUseCase();
    await invitations.create(baseInvitation);

    await expect(
      useCase.execute({ slug: "ulugbek-malika", input: { guestName: "", status: "COMING" } }),
    ).rejects.toBeInstanceOf(DomainValidationError);

    expect(notifier.notifications).toHaveLength(0);
  });

  it("resubmitting the same guestToken with the same status updates in place and does not re-notify", async () => {
    const { invitations, rsvps, notifier, useCase } = buildUseCase();
    await invitations.create(baseInvitation);

    const first = await useCase.execute({
      slug: "ulugbek-malika",
      input: { guestName: "Aziza", status: "COMING", guestToken: "guest-1" },
    });
    const second = await useCase.execute({
      slug: "ulugbek-malika",
      input: { guestName: "Aziza", status: "COMING", guestToken: "guest-1" },
    });

    expect(second.id).toBe(first.id);
    expect(await rsvps.listByInvitationId(first.invitationId)).toHaveLength(1);
    expect(notifier.notifications).toHaveLength(1);
  });

  it("resubmitting the same guestToken with a different status updates the row and notifies again", async () => {
    const { invitations, rsvps, notifier, useCase } = buildUseCase();
    await invitations.create(baseInvitation);

    const first = await useCase.execute({
      slug: "ulugbek-malika",
      input: { guestName: "Aziza", status: "COMING", guestToken: "guest-1" },
    });
    const second = await useCase.execute({
      slug: "ulugbek-malika",
      input: { guestName: "Aziza", status: "NOT_COMING", guestToken: "guest-1" },
    });

    expect(second.id).toBe(first.id);
    expect(second.status).toBe("NOT_COMING");
    expect(await rsvps.listByInvitationId(first.invitationId)).toHaveLength(1);
    expect(notifier.notifications).toHaveLength(2);
  });

  it("different guestTokens each create their own response", async () => {
    const { invitations, rsvps, useCase } = buildUseCase();
    await invitations.create(baseInvitation);

    const first = await useCase.execute({
      slug: "ulugbek-malika",
      input: { guestName: "Aziza", status: "COMING", guestToken: "guest-1" },
    });
    await useCase.execute({
      slug: "ulugbek-malika",
      input: { guestName: "Bek", status: "COMING", guestToken: "guest-2" },
    });

    expect(await rsvps.listByInvitationId(first.invitationId)).toHaveLength(2);
  });
});
