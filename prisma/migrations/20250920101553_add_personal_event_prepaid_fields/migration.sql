-- AlterTable
ALTER TABLE "personal_event_participants" ADD COLUMN     "prePaid" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "prePaidCategory" TEXT NOT NULL DEFAULT '';
