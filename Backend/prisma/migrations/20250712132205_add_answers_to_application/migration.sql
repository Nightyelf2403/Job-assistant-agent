-- AlterTable
ALTER TABLE "Application" ADD COLUMN     "answers" JSONB,
ALTER COLUMN "status" SET DEFAULT 'in-progress';
