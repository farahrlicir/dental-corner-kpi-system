
import { useMemo, useState } from "react";
import { MessageSquareText, ClipboardCheck, CheckCircle2 } from "lucide-react";

import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";

const assistants = [
  { id: "1", name: "Sarah Ahmed" },
  { id: "2", name: "Amine Benali" },
  { id: "3", name: "Lina Mansouri" },
];

const criteria = [
  { id: "1", name: "Room Turnover Time", weight: 10 },
  { id: "2", name: "On-Time Seating Rate", weight: 8 },
  { id: "3", name: "Chart Prep Completion", weight: 10 },
  { id: "4", name: "Lab Case Tracking", weight: 8 },
  { id: "5", name: "X-Ray & Image Quality", weight: 10 },
  { id: "6", name: "Post-Op Call Success", weight: 9 },
  { id: "7", name: "Ready-to-Work Punctuality", weight: 7 },
  { id: "8", name: "Uniform & Hygiene Standards", weight: 8 },
  { id: "9", name: "Overtime Management", weight: 4 },
  { id: "10", name: "Emergency & Late Flexibility", weight: 6 },
  { id: "11", name: "In-Chair Waiting Time", weight: 8 },
  { id: "12", name: "Patient Comfort & Tone", weight: 12 },
];

const ratingScores: Record<number, number> = {
  1: 60,
  2: 70,
  3: 80,
  4: 90,
  5: 100,
};

export default function EvaluationsPage() {
  const [assistantId, setAssistantId] = useState("");
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [observation, setObservation] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const completedCount = Object.keys(ratings).length;
  const allRated = completedCount === criteria.length;

  const score = useMemo(() => {
    return criteria.reduce((total, criterion) => {
      const rating = ratings[criterion.id];

      if (!rating) return total;

      return total + (criterion.weight * ratingScores[rating]) / 100;
    }, 0);
  }, [ratings]);

  const handleRating = (criterionId: string, rating: number) => {
    setRatings((previous) => ({
      ...previous,
      [criterionId]: rating,
    }));
  };

  const handleSubmit = () => {
    if (!assistantId || !allRated) return;

    // Temporary submission simulation.
    // Later, this will send the evaluation to the backend.
    console.log({
      assistantId,
      ratings,
      observation: observation.trim() || null,
      score,
    });

    setSubmitted(true);
  };

  const resetForm = () => {
    setAssistantId("");
    setRatings({});
    setObservation("");
    setSubmitted(false);
  };

  if (submitted) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <Card padding="lg">
          <div className="flex flex-col items-center py-8 text-center">
            <CheckCircle2 size={52} className="mb-4 text-emerald-600" />
            <h2 className="text-xl font-semibold text-slate-800">
              Evaluation submitted
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              The evaluation has been recorded successfully.
            </p>

            <p className="mt-5 text-3xl font-bold text-slate-800">
              {score.toFixed(1)}%
            </p>
            <p className="text-sm text-slate-500">Final score</p>

            <Button className="mt-6" onClick={resetForm}>
              New Evaluation
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          Assistant Evaluation
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Evaluate an assistant based on the clinic's KPI criteria.
        </p>
      </div>

      {/* Assistant selection */}
      <Card padding="lg">
        <h2 className="mb-4 font-semibold text-slate-800">
          Evaluation Details
        </h2>

        <label className="mb-2 block text-sm font-medium text-slate-700">
          Select Assistant
        </label>

        <select
          value={assistantId}
          onChange={(e) => setAssistantId(e.target.value)}
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
        >
          <option value="">Choose an assistant</option>
          {assistants.map((assistant) => (
            <option key={assistant.id} value={assistant.id}>
              {assistant.name}
            </option>
          ))}
        </select>
      </Card>

      {/* KPI criteria */}
      <Card padding="lg">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-semibold text-slate-800">
              KPI Assessment
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Rate each criterion from 1 to 5.
            </p>
          </div>

          <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
            {completedCount}/{criteria.length} completed
          </span>
        </div>

        <div className="space-y-5">
          {criteria.map((criterion, index) => (
            <div
              key={criterion.id}
              className="border-b border-slate-100 pb-5 last:border-0 last:pb-0"
            >
              <div className="mb-3 flex flex-wrap justify-between gap-2">
                <div>
                  <p className="text-sm font-medium text-slate-800">
                    {index + 1}. {criterion.name}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Weight: {criterion.weight}%
                  </p>
                </div>

                <span className="text-xs text-slate-500">
                  {ratings[criterion.id]
                    ? `Rating: ${ratings[criterion.id]}/5`
                    : "Not rated"}
                </span>
              </div>

              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    type="button"
                    onClick={() => handleRating(criterion.id, rating)}
                    className={`h-10 flex-1 rounded-lg border text-sm font-semibold transition ${
                      ratings[criterion.id] === rating
                        ? "border-blue-600 bg-blue-600 text-white"
                        : "border-slate-200 bg-white text-slate-600 hover:border-blue-400 hover:bg-blue-50"
                    }`}
                  >
                    {rating}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Observation */}
      <Card padding="lg">
        <div className="mb-3 flex items-center gap-2">
          <MessageSquareText size={19} className="text-blue-600" />
          <h2 className="font-semibold text-slate-800">
            Dentist's Observation
          </h2>
          <span className="text-xs text-slate-400">Optional</span>
        </div>

        <p className="mb-3 text-sm text-slate-500">
          Record any specific event, behavior, or situation observed during
          this evaluation.
        </p>

        <textarea
          value={observation}
          onChange={(e) => setObservation(e.target.value)}
          placeholder="Describe your observation..."
          rows={4}
          maxLength={2000}
          className="w-full resize-y rounded-lg border border-slate-200 px-3 py-3 text-sm outline-none focus:border-blue-500"
        />

        <p className="mt-1 text-right text-xs text-slate-400">
          {observation.length}/2000
        </p>
      </Card>

      {/* Score and submission */}
      <Card padding="lg">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500">Current weighted score</p>
            <p className="text-3xl font-bold text-slate-800">
              {score.toFixed(1)}%
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {allRated
                ? "All criteria have been rated."
                : `Rate ${criteria.length - completedCount} more criteria to complete.`}
            </p>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={!assistantId || !allRated}
          >
            <ClipboardCheck size={17} />
            Submit Evaluation
          </Button>
        </div>
      </Card>
    </div>
  );
}
