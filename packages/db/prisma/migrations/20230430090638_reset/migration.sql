-- CreateEnum
CREATE TYPE "status" AS ENUM ('PENDING', 'POSTPONED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELED');

-- CreateEnum
CREATE TYPE "platform" AS ENUM ('FACEBOOK', 'EMAIL', 'TEXT', 'PHONE');

-- CreateEnum
CREATE TYPE "roles" AS ENUM ('OWNER', 'ADMIN', 'OPERATIONS', 'TEAMLEAD', 'WORKER');

-- CreateEnum
CREATE TYPE "account_type" AS ENUM ('ACCOUNTS_RECIEVABLE', 'ACCOUNTS_PAYABLE');

-- CreateEnum
CREATE TYPE "transaction_type" AS ENUM ('CREDIT', 'DEBIT');

-- CreateEnum
CREATE TYPE "pdf_type" AS ENUM ('INVOICE', 'RECEIPT');

-- CreateTable
CREATE TABLE "address" (
    "address_id" VARCHAR NOT NULL,
    "address" VARCHAR NOT NULL,
    "city" VARCHAR NOT NULL,
    "country" VARCHAR NOT NULL,
    "province" VARCHAR NOT NULL,
    "lat" DOUBLE PRECISION,
    "long" DOUBLE PRECISION,
    "is_billing" BOOLEAN NOT NULL,
    "client_id" VARCHAR NOT NULL,

    CONSTRAINT "addresses_pk" PRIMARY KEY ("address_id")
);

-- CreateTable
CREATE TABLE "client" (
    "company_id" VARCHAR NOT NULL,
    "client_id" VARCHAR NOT NULL,
    "first_name" VARCHAR NOT NULL,
    "last_name" VARCHAR NOT NULL,
    "phone_number" VARCHAR,
    "mobile_number" VARCHAR,
    "fax" VARCHAR,
    "term" VARCHAR NOT NULL DEFAULT '',
    "note" VARCHAR NOT NULL DEFAULT '',
    "email" VARCHAR NOT NULL DEFAULT '',
    "platform" "platform" NOT NULL,

    CONSTRAINT "clients_pk" PRIMARY KEY ("client_id")
);

-- CreateTable
CREATE TABLE "job" (
    "company_id" VARCHAR NOT NULL,
    "job_id" VARCHAR NOT NULL,
    "job_number" SERIAL NOT NULL,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "creation_date" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "status" NOT NULL DEFAULT 'PENDING',
    "job_note" VARCHAR NOT NULL DEFAULT '',
    "address_id" VARCHAR NOT NULL,
    "scheduleSchedule_id" VARCHAR,
    "est_time" INTEGER DEFAULT 60,
    "est_date" DATE,
    "start_time" TIMESTAMPTZ,
    "end_time" TIMESTAMPTZ,
    "est_start_time" TIMESTAMPTZ,
    "est_end_time" TIMESTAMPTZ,

    CONSTRAINT "jobs_pk" PRIMARY KEY ("job_id")
);

-- CreateTable
CREATE TABLE "invoice" (
    "invoice_id" VARCHAR NOT NULL,
    "invoice_number" INTEGER NOT NULL,
    "company_id" VARCHAR NOT NULL,
    "sent_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "invoice_template_id" VARCHAR NOT NULL,
    "job_id" VARCHAR NOT NULL,
    "payment" INTEGER NOT NULL DEFAULT 0,
    "void" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "invoice_id_pk" PRIMARY KEY ("invoice_id")
);

-- CreateTable
CREATE TABLE "invoice_data" (
    "invoice_data_id" VARCHAR NOT NULL,
    "product_service_id" VARCHAR NOT NULL,
    "price" INTEGER NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "invoice_id" TEXT NOT NULL,

    CONSTRAINT "invoice_data_id_pk" PRIMARY KEY ("invoice_data_id")
);

-- CreateTable
CREATE TABLE "invoice_template" (
    "invoice_template_id" VARCHAR NOT NULL,
    "company_id" VARCHAR NOT NULL,
    "logo" VARCHAR,
    "gst" VARCHAR,
    "pst" VARCHAR,
    "address" VARCHAR,
    "city" VARCHAR,
    "phone" VARCHAR,
    "link" VARCHAR,
    "email" VARCHAR,
    "terms" VARCHAR,
    "footer" VARCHAR,
    "due_date" INTEGER,

    CONSTRAINT "invoice_template_pk" PRIMARY KEY ("invoice_template_id")
);

-- CreateTable
CREATE TABLE "invoice_location" (
    "invoice_location_id" VARCHAR NOT NULL,
    "invoice_key" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "invoice_id" TEXT NOT NULL,
    "type" "pdf_type" NOT NULL,

    CONSTRAINT "invoice_location_pk" PRIMARY KEY ("invoice_location_id")
);

-- CreateTable
CREATE TABLE "transaction" (
    "transaction_id" VARCHAR NOT NULL,
    "amount" INTEGER NOT NULL,
    "date" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "transaction" "transaction_type" NOT NULL,
    "account" "account_type" NOT NULL,
    "invoice_id" TEXT,

    CONSTRAINT "transaction_id_pk" PRIMARY KEY ("transaction_id")
);

-- CreateTable
CREATE TABLE "account_statement" (
    "statement_id" VARCHAR NOT NULL,
    "account" "account_type" NOT NULL,
    "date" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closing_balance" INTEGER NOT NULL,
    "total_credit" INTEGER NOT NULL,
    "total_debit" INTEGER NOT NULL,

    CONSTRAINT "statement_id_pk" PRIMARY KEY ("statement_id")
);

-- CreateTable
CREATE TABLE "job_task" (
    "job_task_id" VARCHAR NOT NULL,
    "job_id" VARCHAR NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "price" INTEGER NOT NULL,
    "product_service_id" VARCHAR NOT NULL,

    CONSTRAINT "job_type_pk" PRIMARY KEY ("job_task_id")
);

-- CreateTable
CREATE TABLE "product_service" (
    "product_service_id" VARCHAR NOT NULL,
    "name" VARCHAR NOT NULL,
    "company_id" VARCHAR NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_service_id" PRIMARY KEY ("product_service_id")
);

-- CreateTable
CREATE TABLE "product_service_tax" (
    "product_service_id" VARCHAR NOT NULL,
    "tax_id" VARCHAR NOT NULL,

    CONSTRAINT "product_service_tax_pkey" PRIMARY KEY ("product_service_id","tax_id")
);

-- CreateTable
CREATE TABLE "tax" (
    "tax_id" VARCHAR NOT NULL,
    "name" VARCHAR NOT NULL,
    "percent" INTEGER NOT NULL,
    "company_id" VARCHAR NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tax_id_pk" PRIMARY KEY ("tax_id")
);

-- CreateTable
CREATE TABLE "schedule" (
    "schedule_id" VARCHAR NOT NULL,
    "schedule_name" VARCHAR NOT NULL,
    "company_id" VARCHAR NOT NULL,
    "date" DATE NOT NULL,

    CONSTRAINT "schedule_pk" PRIMARY KEY ("schedule_id")
);

-- CreateTable
CREATE TABLE "user_schedule" (
    "schedule_id" VARCHAR NOT NULL,
    "user_id" VARCHAR NOT NULL,

    CONSTRAINT "user_schedule_pkey" PRIMARY KEY ("schedule_id","user_id")
);

-- CreateTable
CREATE TABLE "item_stock" (
    "company_id" TEXT NOT NULL,
    "stock_id" VARCHAR NOT NULL,
    "name" VARCHAR NOT NULL,
    "manufacturer" VARCHAR NOT NULL,
    "order_link" VARCHAR,
    "quantity" INTEGER NOT NULL,

    CONSTRAINT "stock_pk" PRIMARY KEY ("stock_id")
);

-- CreateTable
CREATE TABLE "equiptment" (
    "company_id" TEXT NOT NULL,
    "serial" VARCHAR NOT NULL,
    "name" VARCHAR NOT NULL,

    CONSTRAINT "equiptment_pk" PRIMARY KEY ("serial")
);

-- CreateTable
CREATE TABLE "vehicle" (
    "company_id" TEXT NOT NULL,
    "vin" VARCHAR NOT NULL,
    "name" VARCHAR NOT NULL,
    "odometer" INTEGER NOT NULL,
    "licence" VARCHAR NOT NULL,

    CONSTRAINT "vehicle_pk" PRIMARY KEY ("vin")
);

-- CreateTable
CREATE TABLE "service" (
    "company_id" TEXT NOT NULL,
    "service_id" VARCHAR NOT NULL,
    "vehicle_id" VARCHAR NOT NULL,
    "equiptment_id" VARCHAR NOT NULL,
    "name" VARCHAR NOT NULL,
    "due" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "service_pk" PRIMARY KEY ("service_id")
);

-- CreateTable
CREATE TABLE "company" (
    "id" VARCHAR NOT NULL,
    "profile_picture" VARCHAR,
    "company_name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "company_job_count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "company_pk" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_code" (
    "code" TEXT NOT NULL,
    "company_id" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" VARCHAR,
    "access_token" VARCHAR,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" VARCHAR,
    "session_state" TEXT,

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "company_id" TEXT,
    "user_role" "roles",
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_token" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "client_client_id_key" ON "client"("client_id");

-- CreateIndex
CREATE UNIQUE INDEX "job_job_id_key" ON "job"("job_id");

-- CreateIndex
CREATE UNIQUE INDEX "job_job_number_key" ON "job"("job_number");

-- CreateIndex
CREATE UNIQUE INDEX "invoice_invoice_id_key" ON "invoice"("invoice_id");

-- CreateIndex
CREATE UNIQUE INDEX "invoice_data_invoice_data_id_key" ON "invoice_data"("invoice_data_id");

-- CreateIndex
CREATE UNIQUE INDEX "invoice_template_invoice_template_id_key" ON "invoice_template"("invoice_template_id");

-- CreateIndex
CREATE UNIQUE INDEX "invoice_template_company_id_key" ON "invoice_template"("company_id");

-- CreateIndex
CREATE UNIQUE INDEX "invoice_location_invoice_location_id_key" ON "invoice_location"("invoice_location_id");

-- CreateIndex
CREATE UNIQUE INDEX "transaction_transaction_id_key" ON "transaction"("transaction_id");

-- CreateIndex
CREATE UNIQUE INDEX "account_statement_statement_id_key" ON "account_statement"("statement_id");

-- CreateIndex
CREATE UNIQUE INDEX "job_task_job_task_id_key" ON "job_task"("job_task_id");

-- CreateIndex
CREATE UNIQUE INDEX "product_service_product_service_id_key" ON "product_service"("product_service_id");

-- CreateIndex
CREATE UNIQUE INDEX "tax_tax_id_key" ON "tax"("tax_id");

-- CreateIndex
CREATE UNIQUE INDEX "schedule_schedule_id_key" ON "schedule"("schedule_id");

-- CreateIndex
CREATE UNIQUE INDEX "item_stock_stock_id_key" ON "item_stock"("stock_id");

-- CreateIndex
CREATE UNIQUE INDEX "equiptment_serial_key" ON "equiptment"("serial");

-- CreateIndex
CREATE UNIQUE INDEX "vehicle_vin_key" ON "vehicle"("vin");

-- CreateIndex
CREATE UNIQUE INDEX "service_service_id_key" ON "service"("service_id");

-- CreateIndex
CREATE UNIQUE INDEX "company_id_key" ON "company"("id");

-- CreateIndex
CREATE UNIQUE INDEX "company_address_key" ON "company"("address");

-- CreateIndex
CREATE UNIQUE INDEX "company_email_key" ON "company"("email");

-- CreateIndex
CREATE UNIQUE INDEX "company_number_key" ON "company"("number");

-- CreateIndex
CREATE UNIQUE INDEX "company_code_code_key" ON "company_code"("code");

-- CreateIndex
CREATE UNIQUE INDEX "account_provider_providerAccountId_key" ON "account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "session_sessionToken_key" ON "session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "verification_token_token_key" ON "verification_token"("token");

-- CreateIndex
CREATE UNIQUE INDEX "verification_token_identifier_token_key" ON "verification_token"("identifier", "token");

-- AddForeignKey
ALTER TABLE "address" ADD CONSTRAINT "address_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "client"("client_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job" ADD CONSTRAINT "job_address_id_fkey" FOREIGN KEY ("address_id") REFERENCES "address"("address_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job" ADD CONSTRAINT "job_scheduleSchedule_id_fkey" FOREIGN KEY ("scheduleSchedule_id") REFERENCES "schedule"("schedule_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice" ADD CONSTRAINT "invoice_invoice_template_id_fkey" FOREIGN KEY ("invoice_template_id") REFERENCES "invoice_template"("invoice_template_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice" ADD CONSTRAINT "invoice_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "job"("job_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_data" ADD CONSTRAINT "invoice_data_product_service_id_fkey" FOREIGN KEY ("product_service_id") REFERENCES "product_service"("product_service_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_data" ADD CONSTRAINT "invoice_data_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoice"("invoice_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_location" ADD CONSTRAINT "invoice_location_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoice"("invoice_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaction" ADD CONSTRAINT "transaction_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoice"("invoice_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_task" ADD CONSTRAINT "job_task_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "job"("job_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_task" ADD CONSTRAINT "job_task_product_service_id_fkey" FOREIGN KEY ("product_service_id") REFERENCES "product_service"("product_service_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_service_tax" ADD CONSTRAINT "product_service_tax_product_service_id_fkey" FOREIGN KEY ("product_service_id") REFERENCES "product_service"("product_service_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_service_tax" ADD CONSTRAINT "product_service_tax_tax_id_fkey" FOREIGN KEY ("tax_id") REFERENCES "tax"("tax_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_schedule" ADD CONSTRAINT "user_schedule_schedule_id_fkey" FOREIGN KEY ("schedule_id") REFERENCES "schedule"("schedule_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_schedule" ADD CONSTRAINT "user_schedule_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service" ADD CONSTRAINT "service_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicle"("vin") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service" ADD CONSTRAINT "service_equiptment_id_fkey" FOREIGN KEY ("equiptment_id") REFERENCES "equiptment"("serial") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_code" ADD CONSTRAINT "company_code_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account" ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE SET NULL ON UPDATE CASCADE;
