import { randomUUID } from "node:crypto";
import type { InvitationRepository } from "../../src/application/ports/invitation-repository.js";
import type { Invitation, InvitationInput } from "../../src/domain/invitation.js";

type CreateArgs = InvitationInput & { slug: string; ownerTelegramId: bigint; ownerChatId: bigint };

export class InMemoryInvitationRepository implements InvitationRepository {
  private readonly invitations = new Map<string, Invitation>();

  async create(input: CreateArgs): Promise<Invitation> {
    const now = new Date();
    const invitation: Invitation = { ...input, id: randomUUID(), createdAt: now, updatedAt: now };
    this.invitations.set(invitation.id, invitation);
    return invitation;
  }

  async findByOwnerTelegramId(ownerTelegramId: bigint): Promise<Invitation | null> {
    for (const invitation of this.invitations.values()) {
      if (invitation.ownerTelegramId === ownerTelegramId) return invitation;
    }
    return null;
  }

  async findBySlug(slug: string): Promise<Invitation | null> {
    for (const invitation of this.invitations.values()) {
      if (invitation.slug === slug) return invitation;
    }
    return null;
  }

  async slugExists(slug: string): Promise<boolean> {
    return (await this.findBySlug(slug)) !== null;
  }

  async update(id: string, input: Partial<InvitationInput>): Promise<Invitation> {
    const existing = this.invitations.get(id);
    if (!existing) throw new Error(`Invitation ${id} not found in fake repository`);

    const updated: Invitation = { ...existing, ...input, updatedAt: new Date() };
    this.invitations.set(id, updated);
    return updated;
  }
}
