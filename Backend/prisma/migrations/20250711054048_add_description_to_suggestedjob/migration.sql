/*
  Warnings:

  - Added the required column `description` to the `SuggestedJob` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "SuggestedJob" ADD COLUMN     "description" TEXT NOT NULL;
