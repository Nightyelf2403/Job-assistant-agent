/*
  Warnings:

  - You are about to drop the column `recruiterAsnwer` on the `Application` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Application" DROP COLUMN "recruiterAsnwer",
ADD COLUMN     "recruiterAsnwers" JSONB;
