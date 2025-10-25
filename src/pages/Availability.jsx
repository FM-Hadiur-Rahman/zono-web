// src/pages/Availability.jsx
import { useEffect, useState } from "react";
import { api } from "../services/api";

const weekBounds = (d) => {
  const day = (d.getDay() + 6) % 7;
  const mon = new Date(d);
  mon.setDate(d.getDate() - day);
  const sun = new Date(mon);
  sun.setDate(mon.getDate() + 7);
  const fmt = (x) => x.toISOString().slice(0, 10);
  return { from: fmt(mon), to: fmt(sun) };
};

export default function Availability() {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [start, setStart] = useState("09:00");
  const [end, setEnd] = useState("17:00");
  const [note, setNote] = useState("");
  const [rows, setRows] = useState([]);
  const [wb] = useState(() => weekBounds(new Date()));
  const [err, setErr] = useState("");

  const load = () => {
    setErr("");
    api
      .get("/api/availability/me", { params: { from: wb.from, to: wb.to } })
      .then(({ data }) => setRows(data))
      .catch((e) => setErr(e?.response?.data?.error || e.message));
  };

  useEffect(load, [wb.from, wb.to]);

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    try {
      await api.post("/availability", { date, start, end, note });
      setNote("");
      load();
    } catch (e) {
      setErr(e?.response?.data?.error || e.message);
    }
  };

  const remove = async (id) => {
    try {
      await api.delete(`/availability/${id}`);
      setRows((r) => r.filter((x) => x.id !== id));
    } catch (e) {
      setErr(e?.response?.data?.error || e.message);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">My Availability</h1>

      <form
        onSubmit={submit}
        className="card grid grid-cols-1 md:grid-cols-5 gap-4 items-end"
      >
        <div>
          <label className="label">Date</label>
          <input
            className="input"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        <div>
          <label className="label">Start</label>
          <input
            className="input"
            type="time"
            value={start}
            onChange={(e) => setStart(e.target.value)}
          />
        </div>
        <div>
          <label className="label">End</label>
          <input
            className="input"
            type="time"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
          />
        </div>
        <div>
          <label className="label">Note</label>
          <input
            className="input"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="optional"
          />
        </div>
        <button className="btn">Add</button>
      </form>

      {err && <div className="text-red-600 text-sm">{err}</div>}

      <div className="card overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-slate-600">
              <th className="py-2">Date</th>
              <th className="py-2">Start</th>
              <th className="py-2">End</th>
              <th className="py-2">Note</th>
              <th className="py-2 w-24">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td className="py-3 text-slate-500" colSpan={5}>
                  No availability submitted.
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id} className="border-t">
                  <td className="py-2">{String(r.date).slice(0, 10)}</td>
                  <td className="py-2">{r.start}</td>
                  <td className="py-2">{r.end}</td>
                  <td className="py-2">{r.note || "-"}</td>
                  <td className="py-2">
                    <button
                      className="text-red-600 hover:underline"
                      onClick={() => remove(r.id)}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
