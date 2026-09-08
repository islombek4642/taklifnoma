import { describe, expect, it } from "vitest";
import { ListGuestsUseCase } from "../../../src/application/use-cases/list-guests.js";
import { InMemoryInvitationRepository } from "../../helpers/in-memory-invitation-repository.js";
import { InMemoryRsvpRepository } from "../../helpers/in-memory-rsvp-repository.js";
import { NotFoundError } from "../../../src/domain/errors.js";

const baseInvitation = {
  groomName: "Ulug'bek",
  brideName: "Malika",
  eventDateTime: new Date("2026-11-11T17:00:00.000Z"),
  venueName: "Baxtiyor restorani",
  venueAddress: "Toshkent viloyati",
  musicTrackId: "romantic-piano",
  slug: "ulugbek-malika",
  ownerTelegramId: 1n,
  ownerChatId: 1n,
};

describe("ListGuestsUseCase", () => {
  it("returns an empty list when nobody has responded yet", async () => {
    const invitations = new InMemoryInvitationRepository();
    await invitations.create(baseInvitation);
    const rsvps = new InMemoryRsvpRepository();
    const useCase = new ListGuestsUseCase(invitations, rsvps);

    expect(await useCase.execute(1n)).toEqual([]);
  });

  it("returns all responses for the owner's invitation", async () => {
    const invitations = new InMemoryInvitationRepository();
    const invitation = await invitations.create(baseInvitation);
    const rsvps = new InMemoryRsvpRepository();
    await rsvps.create(invitation.id, { guestName: "Aziza", status: "COMING" });
    await rsvps.create(invitation.id, { guestName: "Bek", status: "NOT_COMING" });
    const useCase = new ListGuestsUseCase(invitations, rsvps);

    const guests = await useCase.execute(1n);

    expect(guests.map((g) => g.guestName).sort()).toEqual(["Aziza", "Bek"]);
  });

  it("throws NotFoundError when the owner has no invitation", async () => {
    const invitations = new InMemoryInvitationRepository();
    const rsvps = new InMemoryRsvpRepository();
    const useCase = new ListGuestsUseCase(invitations, rsvps);

    await expect(useCase.execute(999n)).rejects.toBeInstanceOf(NotFoundError);
  });
});
