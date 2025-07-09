/*
  Warnings:

  - The `skills` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `preferredLocations` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "skills",
ADD COLUMN     "skills" JSONB,
DROP COLUMN "preferredLocations",
ADD COLUMN     "preferredLocations" JSONB,
ALTER COLUMN "workPreference" DROP NOT NULL,
ALTER COLUMN "workPreference" DROP DEFAULT,
ALTER COLUMN "workPreference" SET DATA TYPE TEXT;
