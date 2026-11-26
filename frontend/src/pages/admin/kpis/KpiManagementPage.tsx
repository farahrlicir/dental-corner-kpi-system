
import { useEffect, useState } from "react";
import {
  Plus,
  Save,
  Send,
  History,
  Settings2,
  CheckCircle2,
  AlertCircle,
  Trash2,
  ChevronDown,
} from "lucide-react";

import Card from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";
import Badge from "../../../components/ui/Badge";
import { apiRequest } from "../../../services/api";

interface KpiCriterion {
  id: string;
  name: string;
  weight: number;
  displayOrder: number;
}

interface KpiConfiguration {
  id: string;
  version: number;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  publishedAt: string | null;
  criteria: {
    id: string;
    criterionName: string;
    weight: number;
    displayOrder: number;
  }[];
}

interface ConfigurationResponse {
  success: boolean;
  data: {
    draft: KpiConfiguration | null;
    history: KpiConfiguration[];
  };
}

function KpiManagementPage() {
  const [draft, setDraft] = useState<KpiCriterion[]>([]);
  const [draftId, setDraftId] = useState<string | null>(null);
  const [versions, setVersions] = useState<KpiConfiguration[]>([]);
  const [expandedVersion, setExpandedVersion] = useState<string | null>(null);

  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [creatingDraft, setCreatingDraft] = useState(false);
  const [error, setError] = useState("");

  const [newCriterion, setNewCriterion] = useState({
    name: "",
    weight: "",
  });

  const totalWeight = draft.reduce(
    (total, criterion) => total + criterion.weight,
    0
  );

  const hasDuplicateNames =
    new Set(
      draft.map((criterion) => criterion.name.trim().toLowerCase())
    ).size !== draft.length;

  const canPublish =
    draft.length > 0 &&
    !hasDuplicateNames &&
    Math.abs(totalWeight - 100) < 0.001 &&
    draft.every(
      (criterion) =>
        criterion.name.trim().length >= 2 &&
        Number.isFinite(criterion.weight) &&
        criterion.weight > 0 &&
        criterion.weight <= 100
    );

  const activeVersion = versions.find(
    (version) => version.status === "PUBLISHED"
  );

  async function loadConfigurations() {
    try {
      setLoading(true);
      setError("");

      const response =
        await apiRequest<ConfigurationResponse>(
          "/kpi/configurations"
        );

      const { draft: configuration, history } = response.data;

      setDraftId(configuration?.id ?? null);

      setDraft(
        configuration?.criteria.map((item) => ({
          id: item.id,
          name: item.criterionName,
          weight: Number(item.weight),
          displayOrder: item.displayOrder,
        })) ?? []
      );

      setVersions(history);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load KPI configurations."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadConfigurations();
  }, []);

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

  function deleteCriterion(id: string) {
    const criterion = draft.find((item) => item.id === id);

    if (!criterion) return;

    const confirmed = window.confirm(
      `Delete "${criterion.name}" from this draft? This change will take effect after saving.`
    );

    if (!confirmed) return;

    setDraft((previous) =>
      previous.filter((item) => item.id !== id)
    );
  }

  function addCriterion() {
    const name = newCriterion.name.trim();
    const weight = Number(newCriterion.weight);

    if (name.length < 2 || newCriterion.weight === "") {
      alert("Enter a valid criterion name and weight.");
      return;
    }

    if (
      draft.some(
        (criterion) =>
          criterion.name.trim().toLowerCase() === name.toLowerCase()
      )
    ) {
      alert("This KPI criterion already exists.");
      return;
    }

    if (!Number.isFinite(weight) || weight <= 0 || weight > 100) {
      alert("Weight must be greater than 0 and at most 100.");
      return;
    }

    setDraft((previous) => [
      ...previous,
      {
        id: `new-${Date.now()}`,
        name,
        weight,
        displayOrder: previous.length + 1,
      },
    ]);

    setNewCriterion({ name: "", weight: "" });
    setShowAddForm(false);
  }

  async function saveDraft() {
    if (!draftId) {
      alert("No draft configuration exists yet.");
      return;
    }

    if (draft.length === 0) {
      alert("A configuration must contain at least one criterion.");
      return;
    }

    if (hasDuplicateNames) {
      alert("Criterion names must be unique.");
      return;
    }

    if (
      draft.some(
        (criterion) =>
          criterion.name.trim().length < 2 ||
          !Number.isFinite(criterion.weight) ||
          criterion.weight <= 0 ||
          criterion.weight > 100
      )
    ) {
      alert("Every criterion needs a valid name and positive weight.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      await apiRequest(
        `/kpi/configurations/${draftId}`,
        {
          method: "PUT",
          body: JSON.stringify({
            criteria: draft.map((criterion, index) => ({
              name: criterion.name.trim(),
              weight: criterion.weight,
              displayOrder: index + 1,
            })),
          }),
        }
      );

      await loadConfigurations();
      alert("Draft saved successfully.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to save draft."
      );
    } finally {
      setSaving(false);
    }
  }

  async function publishConfiguration() {
    if (!draftId || !canPublish) return;

    try {
      setPublishing(true);
      setError("");

      await apiRequest(
        `/kpi/configurations/${draftId}/publish`,
        {
          method: "POST",
          body: JSON.stringify({
            criteria: draft.map((criterion, index) => ({
              name: criterion.name.trim(),
              weight: criterion.weight,
              displayOrder: index + 1,
            })),
          }),
        }
      );

      await loadConfigurations();
      alert("KPI configuration published successfully.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to publish configuration."
      );
    } finally {
      setPublishing(false);
    }
  }

  async function createNewDraft() {
    try {
      setCreatingDraft(true);
      setError("");

      await apiRequest("/kpi/configurations/draft", {
        method: "POST",
      });

      await loadConfigurations();

      alert(
        activeVersion
          ? "New KPI draft created successfully."
          : "Initial KPI configuration created successfully."
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to create a new draft."
      );
    } finally {
      setCreatingDraft(false);
    }
  }

  function toggleVersion(versionId: string) {
    setExpandedVersion((previous) =>
      previous === versionId ? null : versionId
    );
  }

  if (loading) {
    return (
      <p className="py-10 text-center">
        Loading KPI configurations...
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-main">
          KPI Management
        </h1>
        <p className="mt-1 text-sm text-text-muted">
          Configure assistant evaluation criteria and their weights.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-danger p-4 text-sm text-danger">
          {error}
        </div>
      )}

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
                  ? `Latest published version: ${activeVersion.version}`
                  : "No configuration has been published yet."}
              </p>
            </div>
          </div>

          {draftId ? (
            <Badge variant="warning">Draft</Badge>
          ) : (
            <Badge variant="success">
              {activeVersion ? "Published" : "Not configured"}
            </Badge>
          )}
        </div>
      </Card>

      <Card padding="lg">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold text-text-main">
              Evaluation Criteria
            </h2>
            <p className="mt-1 text-sm text-text-muted">
              Edit names and weights or add and remove criteria.
            </p>
          </div>

          {draftId && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowAddForm((previous) => !previous)}
            >
              <Plus size={16} />
              Add Criterion
            </Button>
          )}
        </div>

        {!draftId ? (
          <div className="py-8 text-center">
            <p className="mb-4 text-sm text-text-muted">
              There is no editable draft. Create one to continue managing
              KPI criteria.
            </p>

            <Button
              onClick={createNewDraft}
              disabled={creatingDraft}
            >
              <Plus size={16} />
              {creatingDraft
                ? "Creating Draft..."
                : activeVersion
                  ? "Create New Draft"
                  : "Create Initial Configuration"}
            </Button>
          </div>
        ) : (
          <>
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
                      min="0.01"
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

            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px] text-left">
                <thead>
                  <tr className="border-b border-border text-xs text-text-muted">
                    <th className="pb-3 font-medium">Criterion</th>
                    <th className="pb-3 text-right font-medium">
                      Weight (%)
                    </th>
                    <th className="w-16 pb-3 text-right font-medium">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {draft.length === 0 ? (
                    <tr>
                      <td
                        colSpan={3}
                        className="py-8 text-center text-sm text-text-muted"
                      >
                        No criteria in this draft. Add a criterion to continue.
                      </td>
                    </tr>
                  ) : (
                    draft.map((criterion) => (
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
                        <td className="py-3 text-right">
                          <button
                            type="button"
                            onClick={() => deleteCriterion(criterion.id)}
                            disabled={saving || publishing}
                            title="Delete criterion"
                            aria-label={`Delete ${criterion.name}`}
                            className="rounded-lg p-2 text-text-muted transition hover:bg-red-50 hover:text-danger disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <Trash2 size={17} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

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
                    Math.abs(totalWeight - 100) < 0.001
                      ? "text-success"
                      : "text-danger"
                  }`}
                >
                  {totalWeight.toFixed(2).replace(/\.?0+$/, "")}%
                </span>

                {Math.abs(totalWeight - 100) < 0.001 ? (
                  <CheckCircle2 className="text-success" size={20} />
                ) : (
                  <AlertCircle className="text-danger" size={20} />
                )}
              </div>
            </div>

            {hasDuplicateNames && (
              <p className="mt-3 text-sm text-danger">
                Criterion names must be unique.
              </p>
            )}

            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-text-muted">
                Publishing automatically saves your latest changes.
              </p>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  disabled={saving || publishing}
                  onClick={saveDraft}
                >
                  <Save size={16} />
                  {saving ? "Saving..." : "Save Draft"}
                </Button>

                <Button
                  disabled={!canPublish || saving || publishing}
                  onClick={publishConfiguration}
                >
                  <Send size={16} />
                  {publishing
                    ? "Publishing..."
                    : "Publish Configuration"}
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>

      <Card padding="lg">
        <div className="mb-5 flex items-center gap-3">
          <History size={21} className="text-primary" />
          <div>
            <h2 className="font-semibold text-text-main">
              Configuration History
            </h2>
            <p className="mt-1 text-sm text-text-muted">
              Select a version to view its criteria and weights.
            </p>
          </div>
        </div>

        {versions.length === 0 ? (
          <p className="py-6 text-center text-sm text-text-muted">
            No published versions yet.
          </p>
        ) : (
          <div className="space-y-3">
            {versions.map((version) => {
              const isExpanded = expandedVersion === version.id;

              return (
                <div
                  key={version.id}
                  className="overflow-hidden rounded-xl border border-border"
                >
                  <button
                    type="button"
                    onClick={() => toggleVersion(version.id)}
                    aria-expanded={isExpanded}
                    className="flex w-full flex-col gap-3 p-4 text-left transition hover:bg-surface-muted sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-medium text-text-main">
                        Configuration Version {version.version}
                      </p>
                      <p className="mt-1 text-xs text-text-muted">
                        Published:{" "}
                        {version.publishedAt
                          ? new Date(version.publishedAt).toLocaleString()
                          : "—"}
                      </p>
                      <p className="mt-1 text-xs text-text-muted">
                        {version.criteria.length} evaluation criteria
                      </p>
                    </div>

                    <div className="flex items-center justify-between gap-3 sm:justify-end">
                      {version.status === "PUBLISHED" ? (
                        <Badge variant="success">Published</Badge>
                      ) : (
                        <Badge variant="neutral">Archived</Badge>
                      )}

                      <ChevronDown
                        size={18}
                        className={`text-text-muted transition-transform ${
                          isExpanded ? "rotate-180" : ""
                        }`}
                      />
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="border-t border-border bg-surface-muted p-4">
                      {version.criteria.length === 0 ? (
                        <p className="py-3 text-center text-sm text-text-muted">
                          No criteria found for this version.
                        </p>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full min-w-[350px] text-left">
                            <thead>
                              <tr className="border-b border-border text-xs text-text-muted">
                                <th className="pb-3 font-medium">
                                  Criterion
                                </th>
                                <th className="pb-3 text-right font-medium">
                                  Weight (%)
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {[...version.criteria]
                                .sort(
                                  (a, b) =>
                                    a.displayOrder - b.displayOrder
                                )
                                .map((criterion) => (
                                  <tr
                                    key={criterion.id}
                                    className="border-b border-border last:border-0"
                                  >
                                    <td className="py-3 pr-4 text-sm text-text-main">
                                      {criterion.criterionName}
                                    </td>
                                    <td className="py-3 text-right text-sm font-medium text-text-main">
                                      {Number(criterion.weight)}%
                                    </td>
                                  </tr>
                                ))}
                            </tbody>
                            <tfoot>
                              <tr>
                                <td className="pt-3 text-sm font-semibold text-text-main">
                                  Total
                                </td>
                                <td className="pt-3 text-right text-sm font-semibold text-text-main">
                                  {version.criteria
                                    .reduce(
                                      (total, criterion) =>
                                        total + Number(criterion.weight),
                                      0
                                    )
                                    .toFixed(2)
                                    .replace(/\.?0+$/, "")}
                                  %
                                </td>
                              </tr>
                            </tfoot>
                          </table>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}

export default KpiManagementPage;
