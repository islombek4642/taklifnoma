-- AlterTable
ALTER TABLE "RsvpResponse" ADD COLUMN "guestToken" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "RsvpResponse_invitationId_guestToken_key" ON "RsvpResponse"("invitationId", "guestToken");
