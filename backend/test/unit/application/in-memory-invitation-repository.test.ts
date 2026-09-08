import { describe, expect, it } from "vitest";
import { InMemoryInvitationRepository } from "../../helpers/in-memory-invitation-repository.js";

const baseInput = {
  groomName: "Ulug'bek",
  brideName: "Malika",
  eventDateTime: new Date("2026-11-11T17:00:00.000Z"),
  venueName: "Baxtiyor restorani",
  venueAddress: "Toshkent viloyati",
  musicTrackId: "romantic-piano",
  slug: "ulugbek-malika",
  ownerTelegramId: 111n,
  ownerChatId: 111n,
};

describe("InMemoryInvitationRepository", () => {
  it("creates and finds an invitation by owner telegram id", async () => {
    const repo = new InMemoryInvitationRepository();
    const created = await repo.create(baseInput);

    const found = await repo.findByOwnerTelegramId(111n);

    expect(found?.id).toBe(created.id);
  });

  it("reports slugExists correctly", async () => {
    const repo = new InMemoryInvitationRepository();
    await repo.create(baseInput);

    expect(await repo.slugExists("ulugbek-malika")).toBe(true);
    expect(await repo.slugExists("someone-else")).toBe(false);
  });

  it("updates only the provided fields", async () => {
    const repo = new InMemoryInvitationRepository();
    const created = await repo.create(baseInput);

    const updated = await repo.update(created.id, { venueName: "New Hall" });

    expect(updated.venueName).toBe("New Hall");
    expect(updated.brideName).toBe("Malika");
  });
});
