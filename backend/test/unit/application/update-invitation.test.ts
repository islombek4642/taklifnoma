import { describe, expect, it } from "vitest";
import { UpdateInvitationUseCase } from "../../../src/application/use-cases/update-invitation.js";
import { InMemoryInvitationRepository } from "../../helpers/in-memory-invitation-repository.js";
import { NotFoundError, DomainValidationError } from "../../../src/domain/errors.js";

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

describe("UpdateInvitationUseCase", () => {
  it("updates the invitation owned by the given telegram id", async () => {
    const repo = new InMemoryInvitationRepository();
    await repo.create(baseInput);
    const useCase = new UpdateInvitationUseCase(repo);

    const updated = await useCase.execute({
      ownerTelegramId: 1n,
      input: { venueName: "New Hall" },
    });

    expect(updated.venueName).toBe("New Hall");
    expect(updated.brideName).toBe("Malika");
  });

  it("throws NotFoundError when the owner has no invitation", async () => {
    const repo = new InMemoryInvitationRepository();
    const useCase = new UpdateInvitationUseCase(repo);

    await expect(
      useCase.execute({ ownerTelegramId: 999n, input: { venueName: "New Hall" } }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it("throws DomainValidationError when the merged result is invalid", async () => {
    const repo = new InMemoryInvitationRepository();
    await repo.create(baseInput);
    const useCase = new UpdateInvitationUseCase(repo);

    await expect(
      useCase.execute({ ownerTelegramId: 1n, input: { venueName: "" } }),
    ).rejects.toBeInstanceOf(DomainValidationError);
  });
});
