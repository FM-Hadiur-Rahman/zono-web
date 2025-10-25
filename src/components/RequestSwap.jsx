// src/components/RequestSwap.jsx
import { useEffect, useState } from "react";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext.jsx";

export default function RequestSwap({ shiftId }) {
  const { user } = useAuth(); // for currentUserId
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [toEmployeeId, setToEmployeeId] = useState("");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let on = true;
    setLoading(true);
    setErr("");
    api
      .get("/api/employees") // change if your route is different
      .then(({ data }) => {
        if (!on) return;
        const list = Array.isArray(data) ? data : data?.employees ?? [];
        setEmployees(list);
      })
      .catch((e) => on && setErr(e?.response?.data?.error || e.message))
      .finally(() => on && setLoading(false));
    return () => {
      on = false;
    };
  }, []);

  const options = (Array.isArray(employees) ? employees : [])
    .filter((e) => e?.id && e.id !== user?.id) // exclude self
    .map((e) => ({
      value: e.id,
      label: e.name || e.fullName || e.email || `User ${e.id}`,
      role: e.role || "",
    }));

  const submit = async () => {
    if (!toEmployeeId) return;
    setSubmitting(true);
    setErr("");
    try {
      await api.post(`/api/swaps/${shiftId}`, {
        toEmployeeId,
        reason: reason || undefined,
      });
      alert("Swap requested");
      setToEmployeeId("");
      setReason("");
    } catch (e) {
      setErr(e?.response?.data?.error || e.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
      {/* colleague select */}
      <select
        className="input"
        value={toEmployeeId}
        onChange={(e) => setToEmployeeId(e.target.value)}
        disabled={loading || submitting}
      >
        <option value="">
          {loading ? "Loading coworkers…" : "Select colleague…"}
        </option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label} {o.role ? `(${o.role})` : ""}
          </option>
        ))}
      </select>

      {/* reason */}
      <input
        className="input"
        placeholder="Reason (optional)"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        disabled={submitting}
      />

      {/* submit */}
      <button
        className="btn"
        disabled={!toEmployeeId || submitting}
        onClick={submit}
      >
        {submitting ? "Sending…" : "Request swap"}
      </button>

      {err && <div className="text-red-600 text-sm">{err}</div>}
    </div>
  );
}
