/*
  Warnings:

  - The `skills` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `preferredLocations` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `workPreference` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "skills",
ADD COLUMN     "skills" TEXT[] DEFAULT ARRAY[]::TEXT[],
DROP COLUMN "preferredLocations",
ADD COLUMN     "preferredLocations" TEXT[] DEFAULT ARRAY[]::TEXT[],
DROP COLUMN "workPreference",
ADD COLUMN     "workPreference" TEXT[] DEFAULT ARRAY[]::TEXT[];
