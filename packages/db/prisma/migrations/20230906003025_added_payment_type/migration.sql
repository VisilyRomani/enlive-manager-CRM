-- CreateEnum
CREATE TYPE "payment_type" AS ENUM ('ETRANSFER', 'CASH', 'CHEQUE', 'OTHER');

-- DropForeignKey
ALTER TABLE "transaction" DROP CONSTRAINT "transaction_invoice_id_fkey";

-- AlterTable
ALTER TABLE "transaction" ADD COLUMN     "payment_type" "payment_type",
ALTER COLUMN "invoice_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "transaction" ADD CONSTRAINT "transaction_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoice"("invoice_id") ON DELETE SET NULL ON UPDATE CASCADE;
