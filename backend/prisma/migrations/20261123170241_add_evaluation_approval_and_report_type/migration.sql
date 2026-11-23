/*
  Warnings:

  - A unique constraint covering the columns `[assistant_id,year,month,generation_type]` on the table `monthly_reports` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "EvaluationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ReportGenerationType" AS ENUM ('AUTOMATIC', 'MANUAL');

-- DropIndex
DROP INDEX "monthly_reports_assistant_id_year_month_key";

-- AlterTable
ALTER TABLE "evaluations" ADD COLUMN     "approved_at" TIMESTAMP(3),
ADD COLUMN     "approved_by_id" UUID,
ADD COLUMN     "dentist_id" UUID,
ADD COLUMN     "status" "EvaluationStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "monthly_reports" ADD COLUMN     "generation_type" "ReportGenerationType" NOT NULL DEFAULT 'MANUAL';

-- CreateIndex
CREATE INDEX "evaluations_dentist_id_submitted_at_idx" ON "evaluations"("dentist_id", "submitted_at");

-- CreateIndex
CREATE INDEX "evaluations_status_submitted_at_idx" ON "evaluations"("status", "submitted_at");

-- CreateIndex
CREATE UNIQUE INDEX "monthly_reports_assistant_id_year_month_generation_type_key" ON "monthly_reports"("assistant_id", "year", "month", "generation_type");

-- AddForeignKey
ALTER TABLE "evaluations" ADD CONSTRAINT "evaluations_dentist_id_fkey" FOREIGN KEY ("dentist_id") REFERENCES "dentists"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evaluations" ADD CONSTRAINT "evaluations_approved_by_id_fkey" FOREIGN KEY ("approved_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
-- Preserve historical evaluations as approved.
UPDATE "evaluations"
SET "status" = 'APPROVED';