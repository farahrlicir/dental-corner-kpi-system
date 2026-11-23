
import { useEffect, useMemo, useState } from "react";
import {
  MessageSquareText,
  ClipboardCheck,
  CheckCircle2,
} from "lucide-react";

import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { apiRequest } from "../../services/api";

interface Assistant {
  id: string;
  name: string;
}

interface Criterion {
  id: string;
  name: string;
  weight: number;
  displayOrder: number;
}

interface EvaluationFormResponse {
  success: boolean;
  data: {
    assistants: Assistant[];
    configuration: {
      id: string;
      version: number;
      criteria: Criterion[];
    };
  };
}

interface EvaluationResponse {
  success: boolean;
  message: string;
  data: {
    overallScore: number | string;
  };
}

const ratingScores: Record<number, number> = {
  1: 60,
  2: 70,
  3: 80,
  4: 90,
  5: 100,
};

export default function EvaluationsPage() {
  const [assistants, setAssistants] = useState<Assistant[]>([]);
  const [criteria, setCriteria] = useState<Criterion[]>([]);

  const [assistantId, setAssistantId] = useState("");
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [observation, setObservation] = useState("");

  const [submitted, setSubmitted] = useState(false);
  const [submittedScore, setSubmittedScore] = useState<number | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadEvaluationForm() {
      try {
        setLoading(true);
        setError("");

        const response = await apiRequest<EvaluationFormResponse>(
          "/evaluations/form"
        );

        setAssistants(response.data.assistants);
        setCriteria(response.data.configuration.criteria);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load evaluation data."
        );
      } finally {
        setLoading(false);
      }
    }

    void loadEvaluationForm();
  }, []);

  const completedCount = Object.keys(ratings).length;
  const hasRatings = completedCount > 0;

  const score = useMemo(() => {
    const selectedCriteria = criteria.filter(
      (criterion) => ratings[criterion.id] !== undefined
    );

    const totalSelectedWeight = selectedCriteria.reduce(
      (total, criterion) => total + criterion.weight,
      0
    );

    if (totalSelectedWeight === 0) return 0;

    const weightedScore = selectedCriteria.reduce((total, criterion) => {
      const rating = ratings[criterion.id];

      return total + criterion.weight * ratingScores[rating];
    }, 0);

    return weightedScore / totalSelectedWeight;
  }, [ratings, criteria]);

  const handleRating = (criterionId: string, rating: number) => {
    setRatings((previous) => {
      const updated = { ...previous };

      if (updated[criterionId] === rating) {
        delete updated[criterionId];
      } else {
        updated[criterionId] = rating;
      }

      return updated;
    });
  };

  const handleSubmit = async () => {
    if (!assistantId || !hasRatings || saving) return;

    try {
      setSaving(true);
      setError("");

      const response = await apiRequest<EvaluationResponse>(
        "/evaluations",
        {
          method: "POST",
          body: JSON.stringify({
            assistantId,
            ratings: criteria
              .filter((criterion) => ratings[criterion.id] !== undefined)
              .map((criterion) => ({
                configurationItemId: criterion.id,
                rating: ratings[criterion.id],
              })),
            observation: observation.trim() || null,
          }),
        }
      );

      setSubmittedScore(Number(response.data.overallScore));
      setSubmitted(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to submit evaluation."
      );
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setAssistantId("");
    setRatings({});
    setObservation("");
    setSubmittedScore(null);
    setSubmitted(false);
    setError("");
  };

  if (loading) {
    return <p className="py-10 text-center">Loading evaluation form...</p>;
  }

  if (error && criteria.length === 0) {
    return (
      <p className="rounded-xl border border-red-200 p-4 text-sm text-red-600">
        {error}
      </p>
    );
  }

  if (submitted) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <Card padding="lg">
          <div className="flex flex-col items-center py-8 text-center">
            <CheckCircle2
              size={52}
              className="mb-4 text-emerald-600"
            />

            <h2 className="text-xl font-semibold text-slate-800">
              Evaluation submitted
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Your evaluation has been submitted and is awaiting admin approval.
            </p>

            <p className="mt-5 text-3xl font-bold text-slate-800">
              {submittedScore?.toFixed(1)}%
            </p>

            <p className="text-sm text-slate-500">
              Provisional score
            </p>

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

      {error && (
        <div className="rounded-xl border border-red-200 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

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

        {assistants.length === 0 && (
          <p className="mt-2 text-sm text-slate-500">
            No active assistants available.
          </p>
        )}
      </Card>

      <Card padding="lg">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-semibold text-slate-800">
              KPI Assessment
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Rate the criteria you want to evaluate. At least one is required.
            </p>
          </div>

          <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
            {completedCount}/{criteria.length} selected
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
                    : "Not evaluated"}
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

        <p className="mt-4 text-xs text-slate-400">
          Click a selected rating again to remove it.
        </p>
      </Card>

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

      <Card padding="lg">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500">
              Current weighted score
            </p>

            <p className="text-3xl font-bold text-slate-800">
              {score.toFixed(1)}%
            </p>

            <p className="mt-1 text-xs text-slate-500">
              {hasRatings
                ? `Calculated from ${completedCount} selected ${
                    completedCount === 1 ? "criterion" : "criteria"
                  }.`
                : "Select at least one criterion to calculate the score."}
            </p>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={!assistantId || !hasRatings || saving}
          >
            <ClipboardCheck size={17} />
            {saving ? "Submitting..." : "Submit Evaluation"}
          </Button>
        </div>
      </Card>
    </div>
  );
}
