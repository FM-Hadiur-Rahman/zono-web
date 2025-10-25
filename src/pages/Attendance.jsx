import { useMemo, useState } from "react";
import { mockAttendance } from "../data/mockData.js";
import { toCSV, downloadCSV } from "../utils/csv.js";

export default function Attendance() {
  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(today);
  const [q, setQ] = useState("");

  const rows = useMemo(() => {
    return mockAttendance
      .filter((r) => r.date === date)
      .filter((r) => {
        if (!q.trim()) return true;
        const t = (r.employee + " " + r.role).toLowerCase();
        return t.includes(q.toLowerCase());
      });
  }, [date, q]);

  const headers = [
    { key: "employee", label: "Employee" },
    { key: "role", label: "Role" },
    { key: "date", label: "Date" },
    { key: "clockIn", label: "Clock In" },
    { key: "clockOut", label: "Clock Out" },
    { key: "status", label: "Status" },
  ];

  const exportCSV = () => {
    const csv = toCSV(rows, headers);
    downloadCSV(csv, `attendance_${date}.csv`);
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
          <button className="btn" onClick={exportCSV}>
            Export CSV
          </button>
        </div>
      </div>

      <div className="card overflow-x-auto">
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
      </div>
    </div>
  );
}
