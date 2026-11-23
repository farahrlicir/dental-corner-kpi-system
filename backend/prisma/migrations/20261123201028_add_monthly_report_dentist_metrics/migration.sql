-- AlterTable
ALTER TABLE "monthly_reports" ADD COLUMN     "average_kpi_coverage" DECIMAL(5,2),
ADD COLUMN     "dentist_count" INTEGER NOT NULL DEFAULT 0;
