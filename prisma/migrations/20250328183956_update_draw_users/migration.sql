-- CreateTable
CREATE TABLE "Draw" (
    "id" SERIAL NOT NULL,
    "drawName" TEXT NOT NULL,
    "drawUsers" JSONB NOT NULL,
    "drawWinners" JSONB NOT NULL,
    "drawOwner" JSONB NOT NULL,
    "drawStatus" TEXT NOT NULL,
    "drawDate" TIMESTAMP(3) NOT NULL,
    "drawPrize" TEXT NOT NULL,
    "drawDescription" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closeTime" TIMESTAMP(3),

    CONSTRAINT "Draw_pkey" PRIMARY KEY ("id")
);
