import "../setup.js";
import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { resetTestDatabase, clearTestDatabaseTables } from "../setup.js";
import { PrismaInvitationRepository } from "../../../src/infrastructure/repositories/prisma-invitation-repository.js";

const baseInput = {
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

describe("PrismaInvitationRepository", () => {
  beforeAll(() => {
    resetTestDatabase();
  });

  beforeEach(async () => {
    await clearTestDatabaseTables();
  });

  it("persists and retrieves an invitation by slug", async () => {
    const repo = new PrismaInvitationRepository();
    await repo.create(baseInput);

    const found = await repo.findBySlug("ulugbek-malika");

    expect(found?.groomName).toBe("Ulug'bek");
    expect(found?.mapUrl).toBeUndefined();
  });

  it("updates fields and returns the merged row", async () => {
    const repo = new PrismaInvitationRepository();
    const created = await repo.create(baseInput);

    const updated = await repo.update(created.id, { venueName: "New Hall" });

    expect(updated.venueName).toBe("New Hall");
  });

  it("rejects a second invitation for the same owner telegram id", async () => {
    const repo = new PrismaInvitationRepository();
    await repo.create(baseInput);

    await expect(repo.create({ ...baseInput, slug: "someone-else" })).rejects.toThrow();
  });
});
