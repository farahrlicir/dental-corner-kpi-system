-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'DENTIST', 'ASSISTANT');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('PENDING', 'ACTIVE', 'INACTIVE', 'REJECTED', 'DELETED');

-- CreateEnum
CREATE TYPE "KpiVersionStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "MonthlyReportStatus" AS ENUM ('DRAFT', 'FINALIZED');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "full_name" VARCHAR(150) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(30),
    "password_hash" VARCHAR(255) NOT NULL,
    "status" "UserStatus" NOT NULL DEFAULT 'PENDING',
    "email_verified_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_roles" (
    "user_id" UUID NOT NULL,
    "role" "Role" NOT NULL,

    CONSTRAINT "user_roles_pkey" PRIMARY KEY ("user_id","role")
);

-- CreateTable
CREATE TABLE "dentists" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "license_number" VARCHAR(100),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dentists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assistants" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "assistants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kpi_configurations" (
    "id" UUID NOT NULL,
    "version" INTEGER NOT NULL,
    "status" "KpiVersionStatus" NOT NULL DEFAULT 'DRAFT',
    "published_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kpi_configurations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kpi_criteria" (
    "id" UUID NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "kpi_criteria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kpi_configuration_items" (
    "id" UUID NOT NULL,
    "configuration_id" UUID NOT NULL,
    "criterion_name" VARCHAR(150) NOT NULL,
    "criterion_id" UUID NOT NULL,
    "weight" DECIMAL(5,2) NOT NULL,
    "display_order" INTEGER NOT NULL,

    CONSTRAINT "kpi_configuration_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evaluations" (
    "id" UUID NOT NULL,
    "assistant_id" UUID NOT NULL,
    "configuration_id" UUID NOT NULL,
    "overall_score" DECIMAL(5,2) NOT NULL,
    "observation" TEXT,
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "evaluations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evaluation_items" (
    "id" UUID NOT NULL,
    "evaluation_id" UUID NOT NULL,
    "configuration_item_id" UUID NOT NULL,
    "rating" INTEGER NOT NULL,
    "score" DECIMAL(5,2) NOT NULL,

    CONSTRAINT "evaluation_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "monthly_reports" (
    "id" UUID NOT NULL,
    "assistant_id" UUID NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "overall_score" DECIMAL(5,2),
    "evaluation_count" INTEGER NOT NULL DEFAULT 0,
    "status" "MonthlyReportStatus" NOT NULL DEFAULT 'DRAFT',
    "finalized_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "monthly_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "monthly_report_kpi_scores" (
    "id" UUID NOT NULL,
    "report_id" UUID NOT NULL,
    "criterion_id" UUID NOT NULL,
    "average_score" DECIMAL(5,2) NOT NULL,

    CONSTRAINT "monthly_report_kpi_scores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" UUID NOT NULL,
    "actor_id" UUID,
    "action" VARCHAR(100) NOT NULL,
    "entity_type" VARCHAR(100) NOT NULL,
    "entity_id" VARCHAR(100),
    "details" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "dentists_user_id_key" ON "dentists"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "dentists_license_number_key" ON "dentists"("license_number");

-- CreateIndex
CREATE UNIQUE INDEX "assistants_user_id_key" ON "assistants"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "kpi_configurations_version_key" ON "kpi_configurations"("version");

-- CreateIndex
CREATE UNIQUE INDEX "kpi_criteria_name_key" ON "kpi_criteria"("name");

-- CreateIndex
CREATE UNIQUE INDEX "kpi_configuration_items_configuration_id_criterion_id_key" ON "kpi_configuration_items"("configuration_id", "criterion_id");

-- CreateIndex
CREATE UNIQUE INDEX "kpi_configuration_items_configuration_id_display_order_key" ON "kpi_configuration_items"("configuration_id", "display_order");

-- CreateIndex
CREATE INDEX "evaluations_assistant_id_submitted_at_idx" ON "evaluations"("assistant_id", "submitted_at");

-- CreateIndex
CREATE INDEX "evaluations_configuration_id_idx" ON "evaluations"("configuration_id");

-- CreateIndex
CREATE UNIQUE INDEX "evaluation_items_evaluation_id_configuration_item_id_key" ON "evaluation_items"("evaluation_id", "configuration_item_id");

-- CreateIndex
CREATE INDEX "monthly_reports_year_month_idx" ON "monthly_reports"("year", "month");

-- CreateIndex
CREATE UNIQUE INDEX "monthly_reports_assistant_id_year_month_key" ON "monthly_reports"("assistant_id", "year", "month");

-- CreateIndex
CREATE UNIQUE INDEX "monthly_report_kpi_scores_report_id_criterion_id_key" ON "monthly_report_kpi_scores"("report_id", "criterion_id");

-- CreateIndex
CREATE INDEX "audit_logs_actor_id_created_at_idx" ON "audit_logs"("actor_id", "created_at");

-- CreateIndex
CREATE INDEX "audit_logs_entity_type_entity_id_idx" ON "audit_logs"("entity_type", "entity_id");

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dentists" ADD CONSTRAINT "dentists_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assistants" ADD CONSTRAINT "assistants_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kpi_configuration_items" ADD CONSTRAINT "kpi_configuration_items_configuration_id_fkey" FOREIGN KEY ("configuration_id") REFERENCES "kpi_configurations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kpi_configuration_items" ADD CONSTRAINT "kpi_configuration_items_criterion_id_fkey" FOREIGN KEY ("criterion_id") REFERENCES "kpi_criteria"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evaluations" ADD CONSTRAINT "evaluations_assistant_id_fkey" FOREIGN KEY ("assistant_id") REFERENCES "assistants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evaluations" ADD CONSTRAINT "evaluations_configuration_id_fkey" FOREIGN KEY ("configuration_id") REFERENCES "kpi_configurations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evaluation_items" ADD CONSTRAINT "evaluation_items_evaluation_id_fkey" FOREIGN KEY ("evaluation_id") REFERENCES "evaluations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evaluation_items" ADD CONSTRAINT "evaluation_items_configuration_item_id_fkey" FOREIGN KEY ("configuration_item_id") REFERENCES "kpi_configuration_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "monthly_reports" ADD CONSTRAINT "monthly_reports_assistant_id_fkey" FOREIGN KEY ("assistant_id") REFERENCES "assistants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "monthly_report_kpi_scores" ADD CONSTRAINT "monthly_report_kpi_scores_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "monthly_reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "monthly_report_kpi_scores" ADD CONSTRAINT "monthly_report_kpi_scores_criterion_id_fkey" FOREIGN KEY ("criterion_id") REFERENCES "kpi_criteria"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;


-- ==========================================
-- DATA INTEGRITY CONSTRAINTS
-- ==========================================

-- Evaluation ratings must be between 1 and 5.
ALTER TABLE "evaluation_items"
ADD CONSTRAINT "evaluation_items_rating_check"
CHECK ("rating" BETWEEN 1 AND 5);

-- Scores must be between 60 and 100.
ALTER TABLE "evaluation_items"
ADD CONSTRAINT "evaluation_items_score_check"
CHECK ("score" BETWEEN 60 AND 100);

-- Each rating must match its corresponding score.
ALTER TABLE "evaluation_items"
ADD CONSTRAINT "evaluation_items_rating_score_check"
CHECK (
  ("rating" = 1 AND "score" = 60) OR
  ("rating" = 2 AND "score" = 70) OR
  ("rating" = 3 AND "score" = 80) OR
  ("rating" = 4 AND "score" = 90) OR
  ("rating" = 5 AND "score" = 100)
);

-- KPI weights must be positive and cannot exceed 100%.
ALTER TABLE "kpi_configuration_items"
ADD CONSTRAINT "kpi_configuration_items_weight_check"
CHECK ("weight" > 0 AND "weight" <= 100);

-- Display order must be positive.
ALTER TABLE "kpi_configuration_items"
ADD CONSTRAINT "kpi_configuration_items_display_order_check"
CHECK ("display_order" > 0);

-- Monthly report values must be valid.
ALTER TABLE "monthly_reports"
ADD CONSTRAINT "monthly_reports_month_check"
CHECK ("month" BETWEEN 1 AND 12);

ALTER TABLE "monthly_reports"
ADD CONSTRAINT "monthly_reports_year_check"
CHECK ("year" >= 1);

ALTER TABLE "monthly_reports"
ADD CONSTRAINT "monthly_reports_evaluation_count_check"
CHECK ("evaluation_count" >= 0);

ALTER TABLE "monthly_reports"
ADD CONSTRAINT "monthly_reports_overall_score_check"
CHECK ("overall_score" IS NULL OR "overall_score" BETWEEN 0 AND 100);

-- Monthly KPI averages must be valid.
ALTER TABLE "monthly_report_kpi_scores"
ADD CONSTRAINT "monthly_report_kpi_scores_average_check"
CHECK ("average_score" BETWEEN 0 AND 100);

ALTER TABLE "evaluations"
ADD CONSTRAINT "evaluations_overall_score_check"
CHECK ("overall_score" BETWEEN 0 AND 100);
