/*
  Warnings:

  - Added the required column `average_weight` to the `monthly_report_kpi_scores` table without a default value. This is not possible if the table is not empty.
  - Added the required column `criterion_name` to the `monthly_report_kpi_scores` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "monthly_report_kpi_scores" ADD COLUMN     "average_weight" DECIMAL(5,2) NOT NULL,
ADD COLUMN     "criterion_name" VARCHAR(150) NOT NULL;
