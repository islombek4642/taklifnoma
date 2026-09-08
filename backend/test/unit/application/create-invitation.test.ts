import { describe, expect, it } from "vitest";
import { CreateInvitationUseCase } from "../../../src/application/use-cases/create-invitation.js";
import { InMemoryInvitationRepository } from "../../helpers/in-memory-invitation-repository.js";
import { DomainValidationError, ConflictError } from "../../../src/domain/errors.js";

const validInput = {
  groomName: "Ulug'bek",
  brideName: "Malika",
  eventDateTime: new Date("2026-11-11T17:00:00.000Z"),
  venueName: "Baxtiyor restorani",
  venueAddress: "Toshkent viloyati",
  musicTrackId: "romantic-piano",
};

describe("CreateInvitationUseCase", () => {
  it("creates an invitation with a slug derived from both names", async () => {
    const repo = new InMemoryInvitationRepository();
    const useCase = new CreateInvitationUseCase(repo);

    const invitation = await useCase.execute({
      ownerTelegramId: 1n,
      ownerChatId: 1n,
      input: validInput,
    });

    expect(invitation.slug).toBe("ulugbek-malika");
    expect(invitation.ownerTelegramId).toBe(1n);
  });

  it("appends a numeric suffix when the slug is already taken", async () => {
    const repo = new InMemoryInvitationRepository();
    const useCase = new CreateInvitationUseCase(repo);

    await useCase.execute({ ownerTelegramId: 1n, ownerChatId: 1n, input: validInput });
    const second = await useCase.execute({ ownerTelegramId: 2n, ownerChatId: 2n, input: validInput });

    expect(second.slug).toBe("ulugbek-malika-2");
  });

  it("throws ConflictError when the owner already has an invitation", async () => {
    const repo = new InMemoryInvitationRepository();
    const useCase = new CreateInvitationUseCase(repo);

    await useCase.execute({ ownerTelegramId: 1n, ownerChatId: 1n, input: validInput });

    await expect(
      useCase.execute({ ownerTelegramId: 1n, ownerChatId: 1n, input: validInput }),
    ).rejects.toBeInstanceOf(ConflictError);
  });

  it("throws DomainValidationError for invalid input without touching the repository", async () => {
    const repo = new InMemoryInvitationRepository();
    const useCase = new CreateInvitationUseCase(repo);

    await expect(
      useCase.execute({
        ownerTelegramId: 1n,
        ownerChatId: 1n,
        input: { ...validInput, groomName: "" },
      }),
    ).rejects.toBeInstanceOf(DomainValidationError);

    expect(await repo.findByOwnerTelegramId(1n)).toBeNull();
  });
});
