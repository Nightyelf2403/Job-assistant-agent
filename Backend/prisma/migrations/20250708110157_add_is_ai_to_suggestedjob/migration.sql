-- AlterTable
ALTER TABLE "SuggestedJob" ADD COLUMN     "applyLink" TEXT,
ADD COLUMN     "isAI" BOOLEAN NOT NULL DEFAULT false;
