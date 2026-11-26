ALTER TABLE "evaluation_items"
DROP CONSTRAINT "evaluation_items_score_check";

ALTER TABLE "evaluation_items"
ADD CONSTRAINT "evaluation_items_score_check"
CHECK ("score" >= 20 AND "score" <= 100);