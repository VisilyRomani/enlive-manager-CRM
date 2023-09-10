/*
  Warnings:

  - You are about to drop the `job` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "invoice" DROP CONSTRAINT "invoice_job_id_fkey";

-- DropForeignKey
ALTER TABLE "job" DROP CONSTRAINT "job_address_id_fkey";

-- DropForeignKey
ALTER TABLE "job" DROP CONSTRAINT "job_scheduleSchedule_id_fkey";

-- DropForeignKey
ALTER TABLE "job_task" DROP CONSTRAINT "job_task_job_id_fkey";

-- AlterTable
ALTER TABLE "address" RENAME CONSTRAINT "addresses_pk" TO "address_pk";

-- AlterTable
ALTER TABLE "client" RENAME CONSTRAINT "clients_pk" TO "client_pk";

-- DropTable
DROP TABLE "job";

-- CreateTable
CREATE TABLE "job_details" (
    "company_id" VARCHAR NOT NULL,
    "job_id" VARCHAR NOT NULL,
    "job_number" INTEGER NOT NULL,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "creation_date" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "status" NOT NULL DEFAULT 'PENDING',
    "job_note" VARCHAR NOT NULL DEFAULT '',
    "address_id" VARCHAR NOT NULL,
    "scheduleSchedule_id" VARCHAR,
    "estimated_time" INTEGER DEFAULT 60,
    "estimated_date" DATE,
    "start_time" TIMESTAMPTZ,
    "end_time" TIMESTAMPTZ,
    "estimated_start_time" TIMESTAMPTZ,
    "estimated_end_time" TIMESTAMPTZ,

    CONSTRAINT "jobs_pk" PRIMARY KEY ("job_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "job_details_job_id_key" ON "job_details"("job_id");

-- AddForeignKey
ALTER TABLE "job_details" ADD CONSTRAINT "job_details_address_id_fkey" FOREIGN KEY ("address_id") REFERENCES "address"("address_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_details" ADD CONSTRAINT "job_details_scheduleSchedule_id_fkey" FOREIGN KEY ("scheduleSchedule_id") REFERENCES "schedule"("schedule_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice" ADD CONSTRAINT "invoice_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "job_details"("job_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_task" ADD CONSTRAINT "job_task_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "job_details"("job_id") ON DELETE RESTRICT ON UPDATE CASCADE;
