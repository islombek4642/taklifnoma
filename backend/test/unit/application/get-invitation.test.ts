import { describe, expect, it } from "vitest";
import { GetMyInvitationUseCase } from "../../../src/application/use-cases/get-my-invitation.js";
import { GetInvitationBySlugUseCase } from "../../../src/application/use-cases/get-invitation-by-slug.js";
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

describe("GetMyInvitationUseCase", () => {
  it("returns the invitation owned by the given telegram id", async () => {
    const repo = new InMemoryInvitationRepository();
    await repo.create(baseInput);
    const useCase = new GetMyInvitationUseCase(repo);

    const invitation = await useCase.execute(1n);

    expect(invitation.slug).toBe("ulugbek-malika");
  });

  it("throws NotFoundError when the owner has no invitation", async () => {
    const repo = new InMemoryInvitationRepository();
    const useCase = new GetMyInvitationUseCase(repo);

    await expect(useCase.execute(999n)).rejects.toBeInstanceOf(NotFoundError);
  });
});

describe("GetInvitationBySlugUseCase", () => {
  it("returns the invitation matching the slug", async () => {
    const repo = new InMemoryInvitationRepository();
    await repo.create(baseInput);
    const useCase = new GetInvitationBySlugUseCase(repo);

    const invitation = await useCase.execute("ulugbek-malika");

    expect(invitation.ownerTelegramId).toBe(1n);
  });

  it("throws NotFoundError for an unknown slug", async () => {
    const repo = new InMemoryInvitationRepository();
    const useCase = new GetInvitationBySlugUseCase(repo);

    await expect(useCase.execute("unknown-slug")).rejects.toBeInstanceOf(NotFoundError);
  });
});
