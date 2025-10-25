import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { mockTenants, MODULES } from "../data/mockTenants.js";

export default function TenantDetail() {
  const { id } = useParams();
  const tenant = useMemo(() => mockTenants.find((t) => t.id === id), [id]);
  const [features, setFeatures] = useState(tenant?.features ?? {});

  const toggle = (k) => setFeatures((prev) => ({ ...prev, [k]: !prev[k] }));
  const save = () => {
    // TODO: call admin API: PATCH /admin/tenants/:id/features
    alert("Saved feature flags (mock):\n" + JSON.stringify(features, null, 2));
  };

  if (!tenant) return <div>Tenant not found.</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{tenant.name}</h1>
        <button className="btn" onClick={save}>
          Save Changes
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="card">
          <h2 className="text-lg font-medium mb-2">Overview</h2>
          <div className="text-sm text-slate-700 space-y-1">
            <div>
              <strong>Plan:</strong> {tenant.plan}
            </div>
            <div>
              <strong>Status:</strong> {tenant.status}
            </div>
            <div>
              <strong>Locations:</strong> {tenant.locations}
            </div>
            <div>
              <strong>Owner:</strong> {tenant.ownerEmail}
            </div>
            <div>
              <strong>Created:</strong> {tenant.createdAt}
            </div>
          </div>
        </div>

        <div className="card md:col-span-2">
          <h2 className="text-lg font-medium mb-2">Feature Flags</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {MODULES.map((m) => (
              <label key={m.key} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={!!features[m.key]}
                  onChange={() => toggle(m.key)}
                />
                <span>{m.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="text-lg font-medium mb-2">Usage (mock)</h2>
        <p className="text-slate-600 text-sm">
          Shifts/week: 124 · Clock-ins/week: 380 · Active users: 26
        </p>
      </div>
    </div>
  );
}
