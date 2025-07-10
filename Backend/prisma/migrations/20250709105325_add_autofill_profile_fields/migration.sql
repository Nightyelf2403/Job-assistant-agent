/*
  Warnings:

  - You are about to drop the column `resumeLink` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "resumeLink",
ADD COLUMN     "certifications" TEXT[],
ADD COLUMN     "education" TEXT[],
ADD COLUMN     "experience" TEXT,
ADD COLUMN     "github" TEXT,
ADD COLUMN     "languages" TEXT[],
ADD COLUMN     "portfolio" TEXT;
