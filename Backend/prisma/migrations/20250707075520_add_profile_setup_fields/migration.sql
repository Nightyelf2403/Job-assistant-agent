-- AlterTable
ALTER TABLE "User" ADD COLUMN     "currentLocation" TEXT,
ADD COLUMN     "desiredPosition" TEXT,
ADD COLUMN     "desiredSalary" TEXT,
ADD COLUMN     "jobType" TEXT,
ADD COLUMN     "preferredLocations" JSONB,
ADD COLUMN     "resumeLink" TEXT,
ADD COLUMN     "workPreference" TEXT;
