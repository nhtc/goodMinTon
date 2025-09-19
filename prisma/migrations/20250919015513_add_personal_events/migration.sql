-- CreateTable
CREATE TABLE "personal_events" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "location" TEXT,
    "totalCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "personal_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "personal_event_participants" (
    "id" TEXT NOT NULL,
    "personalEventId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "customAmount" DOUBLE PRECISION NOT NULL,
    "hasPaid" BOOLEAN NOT NULL DEFAULT false,
    "paidAt" TIMESTAMP(3),

    CONSTRAINT "personal_event_participants_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "personal_event_participants_personalEventId_memberId_key" ON "personal_event_participants"("personalEventId", "memberId");

-- AddForeignKey
ALTER TABLE "personal_event_participants" ADD CONSTRAINT "personal_event_participants_personalEventId_fkey" FOREIGN KEY ("personalEventId") REFERENCES "personal_events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "personal_event_participants" ADD CONSTRAINT "personal_event_participants_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "members"("id") ON DELETE CASCADE ON UPDATE CASCADE;
