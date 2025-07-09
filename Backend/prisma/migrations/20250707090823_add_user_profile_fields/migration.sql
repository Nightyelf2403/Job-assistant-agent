/*
  Warnings:

  - You are about to drop the column `education` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `workHistory` on the `User` table. All the data in the column will be lost.
  - The `workPreference` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `skills` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `preferredLocations` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Made the column `phone` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "education",
DROP COLUMN "workHistory",
ALTER COLUMN "phone" SET NOT NULL,
DROP COLUMN "workPreference",
ADD COLUMN     "workPreference" TEXT[] DEFAULT ARRAY[]::TEXT[],
DROP COLUMN "skills",
ADD COLUMN     "skills" TEXT[] DEFAULT ARRAY[]::TEXT[],
DROP COLUMN "preferredLocations",
ADD COLUMN     "preferredLocations" TEXT[] DEFAULT ARRAY[]::TEXT[];
