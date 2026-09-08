import type { Invitation, InvitationInput } from "../../domain/invitation.js";

export interface InvitationRepository {
  create(input: InvitationInput & { slug: string; ownerTelegramId: bigint; ownerChatId: bigint }): Promise<Invitation>;
  findByOwnerTelegramId(ownerTelegramId: bigint): Promise<Invitation | null>;
  findBySlug(slug: string): Promise<Invitation | null>;
  slugExists(slug: string): Promise<boolean>;
  update(id: string, input: Partial<InvitationInput>): Promise<Invitation>;
  delete(id: string): Promise<void>;
}
