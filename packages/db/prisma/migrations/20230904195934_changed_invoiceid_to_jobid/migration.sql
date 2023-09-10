/*
  Warnings:

  - You are about to drop the column `invoice_id` on the `email_validate` table. All the data in the column will be lost.
  - Added the required column `job_id` to the `email_validate` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "email_validate" DROP CONSTRAINT "email_validate_invoice_id_fkey";

-- AlterTable
ALTER TABLE "email_validate" DROP COLUMN "invoice_id",
ADD COLUMN     "job_id" VARCHAR NOT NULL;
