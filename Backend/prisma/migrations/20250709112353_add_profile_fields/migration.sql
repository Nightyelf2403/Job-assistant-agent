/*
  Warnings:

  - You are about to drop the column `experience` on the `User` table. All the data in the column will be lost.
  - The `education` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "experience",
ADD COLUMN     "workHistory" JSONB,
DROP COLUMN "education",
ADD COLUMN     "education" JSONB;
