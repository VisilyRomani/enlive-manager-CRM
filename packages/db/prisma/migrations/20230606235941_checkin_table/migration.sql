-- CreateEnum
CREATE TYPE "check" AS ENUM ('IN', 'OUT');

-- CreateTable
CREATE TABLE "timesheet" (
    "timesheet_id" VARCHAR NOT NULL,
    "date" DATE NOT NULL,
    "start" TIMESTAMP(3) NOT NULL,
    "end" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "timesheet_pk" PRIMARY KEY ("timesheet_id")
);

-- CreateTable
CREATE TABLE "timesheet_checkin" (
    "timesheet_checkin_id" VARCHAR NOT NULL,
    "check_time" TIMESTAMP(3) NOT NULL,
    "type" "check" NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "timesheet_checkin_pk" PRIMARY KEY ("timesheet_checkin_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "timesheet_timesheet_id_key" ON "timesheet"("timesheet_id");

-- CreateIndex
CREATE UNIQUE INDEX "timesheet_checkin_timesheet_checkin_id_key" ON "timesheet_checkin"("timesheet_checkin_id");

-- AddForeignKey
ALTER TABLE "timesheet" ADD CONSTRAINT "timesheet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timesheet_checkin" ADD CONSTRAINT "timesheet_checkin_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
