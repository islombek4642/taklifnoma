import "../setup.js";
import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { resetTestDatabase, clearTestDatabaseTables } from "../setup.js";
import { prisma } from "../../../src/infrastructure/db/prisma-client.js";
import { PrismaRsvpRepository } from "../../../src/infrastructure/repositories/prisma-rsvp-repository.js";

async function createTestInvitation() {
  return prisma.invitation.create({
    data: {
      groomName: "Ulug'bek",
      brideName: "Malika",
      eventDateTime: new Date("2026-11-11T17:00:00.000Z"),
      venueName: "Baxtiyor restorani",
      venueAddress: "Toshkent viloyati",
      musicTrackId: "romantic-piano",
      slug: "ulugbek-malika",
      ownerTelegramId: 1n,
      ownerChatId: 1n,
    },
  });
}

describe("PrismaRsvpRepository", () => {
  beforeAll(() => {
    resetTestDatabase();
  });

  beforeEach(async () => {
    await clearTestDatabaseTables();
  });

  it("creates a response linked to the invitation", async () => {
    const invitation = await createTestInvitation();
    const repo = new PrismaRsvpRepository();

    const rsvp = await repo.create(invitation.id, { guestName: "Aziza", status: "COMING" });

    expect(rsvp.invitationId).toBe(invitation.id);
    expect(rsvp.status).toBe("COMING");
  });

  it("lists responses in the order they were submitted", async () => {
    const invitation = await createTestInvitation();
    const repo = new PrismaRsvpRepository();
    await repo.create(invitation.id, { guestName: "Aziza", status: "COMING" });
    await repo.create(invitation.id, { guestName: "Bek", status: "NOT_COMING" });

    const list = await repo.listByInvitationId(invitation.id);

    expect(list.map((r) => r.guestName)).toEqual(["Aziza", "Bek"]);
  });
});
