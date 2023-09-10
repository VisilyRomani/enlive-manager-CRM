/*
  Warnings:

  - Made the column `invoice_id` on table `transaction` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "transaction" DROP CONSTRAINT "transaction_invoice_id_fkey";

-- AlterTable
ALTER TABLE "transaction" ADD COLUMN     "reference_code" TEXT,
ALTER COLUMN "invoice_id" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "transaction" ADD CONSTRAINT "transaction_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoice"("invoice_id") ON DELETE RESTRICT ON UPDATE CASCADE;
