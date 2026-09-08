import type { Invitation as PrismaInvitationRow } from "@prisma/client";
import { prisma } from "../db/prisma-client.js";
import type { InvitationRepository } from "../../application/ports/invitation-repository.js";
import type { Invitation, InvitationInput } from "../../domain/invitation.js";

type CreateArgs = InvitationInput & { slug: string; ownerTelegramId: bigint; ownerChatId: bigint };

function toDomain(row: PrismaInvitationRow): Invitation {
  return {
    id: row.id,
    slug: row.slug,
    ownerTelegramId: row.ownerTelegramId,
    ownerChatId: row.ownerChatId,
    groomName: row.groomName,
    brideName: row.brideName,
    eventDateTime: row.eventDateTime,
    venueName: row.venueName,
    venueAddress: row.venueAddress,
    mapUrl: row.mapUrl ?? undefined,
    greetingText: row.greetingText ?? undefined,
    musicTrackId: row.musicTrackId,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export class PrismaInvitationRepository implements InvitationRepository {
  async create(input: CreateArgs): Promise<Invitation> {
    const row = await prisma.invitation.create({ data: { ...input } });
    return toDomain(row);
  }

  async findByOwnerTelegramId(ownerTelegramId: bigint): Promise<Invitation | null> {
    const row = await prisma.invitation.findUnique({ where: { ownerTelegramId } });
    return row ? toDomain(row) : null;
  }

  async findBySlug(slug: string): Promise<Invitation | null> {
    const row = await prisma.invitation.findUnique({ where: { slug } });
    return row ? toDomain(row) : null;
  }

  async slugExists(slug: string): Promise<boolean> {
    const count = await prisma.invitation.count({ where: { slug } });
    return count > 0;
  }

  async update(id: string, input: Partial<InvitationInput>): Promise<Invitation> {
    const row = await prisma.invitation.update({ where: { id }, data: input });
    return toDomain(row);
  }
}
