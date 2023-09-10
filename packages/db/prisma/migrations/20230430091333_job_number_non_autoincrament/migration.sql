-- DropIndex
DROP INDEX "job_job_number_key";

-- AlterTable
ALTER TABLE "job" ALTER COLUMN "job_number" DROP DEFAULT;
DROP SEQUENCE "job_job_number_seq";
