/*
  Warnings:

  - You are about to drop the column `workHistory` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "workHistory",
ADD COLUMN     "experience" JSONB;
