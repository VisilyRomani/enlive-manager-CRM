/*
  Warnings:

  - You are about to drop the `equiptment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `service` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `timesheet` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `timesheet_checkin` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `vehicle` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "service" DROP CONSTRAINT "service_equiptment_id_fkey";

-- DropForeignKey
ALTER TABLE "service" DROP CONSTRAINT "service_vehicle_id_fkey";

-- DropForeignKey
ALTER TABLE "timesheet" DROP CONSTRAINT "timesheet_userId_fkey";

-- DropForeignKey
ALTER TABLE "timesheet_checkin" DROP CONSTRAINT "timesheet_checkin_userId_fkey";

-- DropTable
DROP TABLE "equiptment";

-- DropTable
DROP TABLE "service";

-- DropTable
DROP TABLE "timesheet";

-- DropTable
DROP TABLE "timesheet_checkin";

-- DropTable
DROP TABLE "vehicle";

-- CreateTable
CREATE TABLE "email_validate" (
    "email_validate" VARCHAR NOT NULL,
    "invoice_id" VARCHAR NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "email_validate_pk" PRIMARY KEY ("email_validate")
);

-- CreateIndex
CREATE UNIQUE INDEX "email_validate_email_validate_key" ON "email_validate"("email_validate");

-- AddForeignKey
ALTER TABLE "email_validate" ADD CONSTRAINT "email_validate_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoice"("invoice_id") ON DELETE RESTRICT ON UPDATE CASCADE;
