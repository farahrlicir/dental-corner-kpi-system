ALTER TABLE "evaluation_items"
DROP CONSTRAINT "evaluation_items_rating_score_check";

ALTER TABLE "evaluation_items"
ADD CONSTRAINT "evaluation_items_rating_score_check"
CHECK (
    (rating = 1 AND score IN (20, 60)) OR
    (rating = 2 AND score IN (40, 70)) OR
    (rating = 3 AND score IN (60, 80)) OR
    (rating = 4 AND score IN (80, 90)) OR
    (rating = 5 AND score = 100)
);