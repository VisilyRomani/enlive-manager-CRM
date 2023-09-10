/*
  Warnings:

  - A unique constraint covering the columns `[date]` on the table `timesheet` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "address" ADD COLUMN     "deleted" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX "timesheet_date_key" ON "timesheet"("date");
