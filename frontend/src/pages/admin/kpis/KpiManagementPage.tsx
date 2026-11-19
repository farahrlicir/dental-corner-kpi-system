
import { useState } from "react";
import {
  Plus,
  Save,
  Send,
  History,
  Settings2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

import Card from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";
import Badge from "../../../components/ui/Badge";

interface KpiCriterion {
  id: string;
  name: string;
  weight: number;
}

interface KpiVersion {
  version: number;
  publishedAt: string;
  criteria: KpiCriterion[];
}

const initialCriteria: KpiCriterion[] = [
  { id: "K01", name: "Room Turnover Time", weight: 10 },
  { id: "K02", name: "On-Time Seating Rate", weight: 8 },
  { id: "K03", name: "Chart Prep Completion", weight: 10 },
  { id: "K04", name: "Lab Case Tracking", weight: 8 },
  { id: "K05", name: "X-Ray & Image Quality", weight: 10 },
  { id: "K06", name: "Post-Op Call Success", weight: 9 },
  { id: "K07", name: "Ready-to-Work Punctuality", weight: 7 },
  { id: "K08", name: "Uniform & Hygiene Standards", weight: 8 },
  { id: "K09", name: "Overtime Management", weight: 4 },
  { id: "K10", name: "Emergency & Late Flexibility", weight: 6 },
  { id: "K11", name: "In-Chair Waiting Time", weight: 8 },
  { id: "K12", name: "Patient Comfort & Tone", weight: 12 },
];

function KpiManagementPage() {
  const [draft, setDraft] = useState<KpiCriterion[]>(initialCriteria);
  const [versions, setVersions] = useState<KpiVersion[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);

  const [newCriterion, setNewCriterion] = useState({
    name: "",
    weight: "",
  });

  const totalWeight = draft.reduce(
    (total, criterion) => total + criterion.weight,
    0
  );

  const canPublish =
    draft.length > 0 &&
    totalWeight === 100 &&
    draft.every((criterion) => criterion.name.trim().length > 0);

  const activeVersion = versions[0] ?? null;

  function updateCriterion(
    id: string,
    field: "name" | "weight",
    value: string
  ) {
    setDraft((previous) =>
      previous.map((criterion) =>
        criterion.id === id
          ? {
              ...criterion,
              [field]:
                field === "weight"
                  ? value === ""
                    ? 0
                    : Number(value)
                  : value,
            }
          : criterion
      )
    );
  }

  function addCriterion() {
    const name = newCriterion.name.trim();
    const weight = Number(newCriterion.weight);

    if (!name || newCriterion.weight === "") return;

    if (draft.some(
      (criterion) => criterion.name.toLowerCase() === name.toLowerCase()
    )) {
      alert("This KPI criterion already exists.");
      return;
    }

    if (!Number.isFinite(weight) || weight < 0 || weight > 100) {
      alert("Weight must be between 0 and 100.");
      return;
    }

    setDraft((previous) => [
      ...previous,
      {
        id: `K${Date.now()}`,
        name,
        weight,
      },
    ]);

    setNewCriterion({ name: "", weight: "" });
    setShowAddForm(false);
  }

  function publishConfiguration() {
    if (!canPublish) return;

    const nextVersion = versions.length + 1;

    const publishedVersion: KpiVersion = {
      version: nextVersion,
      publishedAt: new Date().toLocaleString(),
      criteria: draft.map((criterion) => ({ ...criterion })),
    };

    setVersions((previous) => [publishedVersion, ...previous]);
  }

  return (
    <div className="space-y-6">

      {/* Heading */}
      <div>
        <h1 className="text-2xl font-bold text-text-main">
          KPI Management
        </h1>
        <p className="mt-1 text-sm text-text-muted">
          Configure assistant evaluation criteria and their weights.
        </p>
      </div>

      {/* Configuration status */}
      <Card padding="lg">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-primary-light p-3">
              <Settings2 className="text-primary" size={22} />
            </div>

            <div>
              <h2 className="font-semibold text-text-main">
                KPI Configuration
              </h2>
              <p className="mt-1 text-sm text-text-muted">
                {activeVersion
                  ? `Active configuration: Version ${activeVersion.version}`
                  : "No configuration has been published yet."}
              </p>
            </div>
          </div>

          {activeVersion ? (
            <Badge variant="success">Published</Badge>
          ) : (
            <Badge variant="warning">Draft</Badge>
          )}
        </div>
      </Card>

      {/* Criteria */}
      <Card padding="lg">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold text-text-main">
              Evaluation Criteria
            </h2>
            <p className="mt-1 text-sm text-text-muted">
              Edit names and weights or add new criteria.
            </p>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowAddForm((previous) => !previous)}
          >
            <Plus size={16} />
            Add Criterion
          </Button>
        </div>

        {/* Add criterion form */}
        {showAddForm && (
          <div className="mb-6 rounded-xl border border-border bg-surface-muted p-4">
            <h3 className="mb-4 text-sm font-semibold text-text-main">
              New KPI Criterion
            </h3>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-text-main">
                  Criterion Name
                </label>
                <input
                  value={newCriterion.name}
                  onChange={(event) =>
                    setNewCriterion({
                      ...newCriterion,
                      name: event.target.value,
                    })
                  }
                  placeholder="Enter criterion name"
                  className="w-full rounded-control border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-text-main">
                  Weight (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={newCriterion.weight}
                  onChange={(event) =>
                    setNewCriterion({
                      ...newCriterion,
                      weight: event.target.value,
                    })
                  }
                  placeholder="Enter weight"
                  className="w-full rounded-control border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary"
                />
              </div>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowAddForm(false)}
              >
                Cancel
              </Button>

              <Button size="sm" onClick={addCriterion}>
                Add Criterion
              </Button>
            </div>
          </div>
        )}

        {/* Criteria table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[550px] text-left">
            <thead>
              <tr className="border-b border-border text-xs text-text-muted">
                <th className="pb-3 font-medium">Criterion</th>
                <th className="pb-3 text-right font-medium">
                  Weight (%)
                </th>
              </tr>
            </thead>

            <tbody>
              {draft.map((criterion) => (
                <tr
                  key={criterion.id}
                  className="border-b border-border last:border-0"
                >
                  <td className="py-3 pr-4">
                    <input
                      value={criterion.name}
                      onChange={(event) =>
                        updateCriterion(
                          criterion.id,
                          "name",
                          event.target.value
                        )
                      }
                      className="w-full rounded-control border border-transparent bg-transparent px-2 py-2 text-sm text-text-main outline-none focus:border-primary focus:bg-surface"
                    />
                  </td>

                  <td className="py-3">
                    <div className="flex justify-end">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={criterion.weight}
                        onChange={(event) =>
                          updateCriterion(
                            criterion.id,
                            "weight",
                            event.target.value
                          )
                        }
                        className="w-24 rounded-control border border-border bg-surface px-3 py-2 text-right text-sm outline-none focus:border-primary"
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Total weight */}
        <div className="mt-5 flex flex-col gap-3 rounded-xl bg-surface-muted p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-text-main">
              Total Weight
            </p>
            <p className="mt-1 text-xs text-text-muted">
              All criteria must add up to exactly 100%.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`text-xl font-bold ${
                totalWeight === 100
                  ? "text-success"
                  : "text-danger"
              }`}
            >
              {totalWeight}%
            </span>

            {totalWeight === 100 ? (
              <CheckCircle2 className="text-success" size={20} />
            ) : (
              <AlertCircle className="text-danger" size={20} />
            )}
          </div>
        </div>

        {/* Publish */}
        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-text-muted">
            Publishing creates a new immutable configuration version.
          </p>

          <Button
            disabled={!canPublish}
            onClick={publishConfiguration}
          >
            <Send size={16} />
            Publish Configuration
          </Button>
        </div>
      </Card>

      {/* Version history */}
      <Card padding="lg">
        <div className="mb-5 flex items-center gap-3">
          <History size={21} className="text-primary" />
          <div>
            <h2 className="font-semibold text-text-main">
              Configuration History
            </h2>
            <p className="mt-1 text-sm text-text-muted">
              Previously published KPI configurations.
            </p>
          </div>
        </div>

        {versions.length === 0 ? (
          <p className="py-6 text-center text-sm text-text-muted">
            No published versions yet.
          </p>
        ) : (
          <div className="space-y-3">
            {versions.map((version, index) => (
              <div
                key={version.version}
                className="flex flex-col gap-3 rounded-xl border border-border p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium text-text-main">
                    Configuration Version {version.version}
                  </p>
                  <p className="mt-1 text-xs text-text-muted">
                    Published: {version.publishedAt}
                  </p>
                  <p className="mt-1 text-xs text-text-muted">
                    {version.criteria.length} evaluation criteria
                  </p>
                </div>

                {index === 0 ? (
                  <Badge variant="success">Current Version</Badge>
                ) : (
                  <Badge variant="neutral">Previous Version</Badge>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

export default KpiManagementPage;
