import { describe, expect, it } from "vitest";
import { DeleteInvitationUseCase } from "../../../src/application/use-cases/delete-invitation.js";
import { InMemoryInvitationRepository } from "../../helpers/in-memory-invitation-repository.js";
import { NotFoundError } from "../../../src/domain/errors.js";

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

describe("DeleteInvitationUseCase", () => {
  it("deletes the invitation owned by the given telegram id", async () => {
    const repo = new InMemoryInvitationRepository();
    await repo.create(baseInput);
    const useCase = new DeleteInvitationUseCase(repo);

    await useCase.execute(1n);

    expect(await repo.findByOwnerTelegramId(1n)).toBeNull();
  });

  it("throws NotFoundError when the owner has no invitation", async () => {
    const repo = new InMemoryInvitationRepository();
    const useCase = new DeleteInvitationUseCase(repo);

    await expect(useCase.execute(999n)).rejects.toBeInstanceOf(NotFoundError);
  });
});
