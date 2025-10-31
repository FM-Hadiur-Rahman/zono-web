// src/pages/Attendance.jsx
import { useEffect, useMemo, useState } from "react";
import { api } from "../services/api"; // axios with baseURL & x-tenant
import { toCSV, downloadCSV } from "../utils/csv.js";

export default function Attendance() {
  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(today);
  const [q, setQ] = useState("");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // fetch from API whenever date/search changes
  useEffect(() => {
    let ignore = false;
    const run = async () => {
      setLoading(true);
      setErr("");
      try {
        const { data } = await api.get("/attendance/daily", {
          params: { date, search: q },
        });
        if (ignore) return;
        const list = (data?.data || []).map((r) => ({
          id: r.id,
          employee: r.employee?.name || "",
          role: r.employee?.role || "",
          date: new Date(r.date).toISOString().slice(0, 10),
          clockIn: r.clockInAt
            ? new Date(r.clockInAt).toLocaleTimeString()
            : "",
          clockOut: r.clockOutAt
            ? new Date(r.clockOutAt).toLocaleTimeString()
            : "",
          minutes: r.minutes ?? "",
          status: r.status,
        }));
        setRows(list);
      } catch (e) {
        setErr(e?.response?.data?.error || "Failed to load attendance");
        setRows([]);
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    run();
    return () => {
      ignore = true;
    };
  }, [date, q]);

  const headers = useMemo(
    () => [
      { key: "employee", label: "Employee" },
      { key: "role", label: "Role" },
      { key: "date", label: "Date" },
      { key: "clockIn", label: "Clock In" },
      { key: "clockOut", label: "Clock Out" },
      { key: "status", label: "Status" },
    ],
    []
  );

  const exportCSV = () => {
    const csv = toCSV(rows, headers);
    downloadCSV(csv, `attendance_${date}.csv`);
    // Or call server export instead:
    // window.location.href = `${import.meta.env.VITE_API_URL}/attendance/export?date=${date}`;
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Attendance</h1>

      <div className="card grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <div>
          <label className="label">Date</label>
          <input
            className="input"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        <div className="md:col-span-2">
          <label className="label">Search by name or role</label>
          <input
            className="input"
            placeholder="e.g., Ali or Rider"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <button
            className="btn"
            onClick={exportCSV}
            disabled={rows.length === 0}
          >
            Export CSV
          </button>
        </div>
      </div>

      <div className="card overflow-x-auto">
        {err && <div className="text-red-600 p-3">{err}</div>}
        {loading ? (
          <div className="p-4 text-slate-500">Loading…</div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="text-slate-600">
                {headers.map((h) => (
                  <th key={h.key} className="py-2">
                    {h.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td className="py-4 text-slate-500" colSpan={headers.length}>
                    No records for selected date.
                  </td>
                </tr>
              ) : (
                rows.map((r) => (
                  <tr key={r.id} className="border-t">
                    <td className="py-2">{r.employee}</td>
                    <td className="py-2">{r.role}</td>
                    <td className="py-2">{r.date}</td>
                    <td className="py-2">{r.clockIn}</td>
                    <td className="py-2">{r.clockOut}</td>
                    <td className="py-2">{r.status}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
