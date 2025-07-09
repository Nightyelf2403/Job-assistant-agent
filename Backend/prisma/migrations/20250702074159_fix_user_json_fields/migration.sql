/*
  Warnings:

  - The `workHistory` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `education` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `skills` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[phone]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
DROP COLUMN "workHistory",
ADD COLUMN     "workHistory" JSONB,
DROP COLUMN "education",
ADD COLUMN     "education" JSONB,
DROP COLUMN "skills",
ADD COLUMN     "skills" JSONB;

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");
