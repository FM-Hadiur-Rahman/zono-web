import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { api } from "../services/api";
import RequestSwap from "../components/RequestSwap.jsx";
import ClockButtons from "../components/ClockButtons.jsx";

/* ---------------- helpers ---------------- */
const toISODate = (x) =>
  typeof x === "string"
    ? x.slice(0, 10)
    : new Date(x).toISOString().slice(0, 10);
const weekdayShort = (iso) =>
  new Date(iso).toLocaleDateString(
    typeof navigator !== "undefined" ? navigator.language : "en-GB",
    {
      weekday: "short",
    }
  );
const weekdayLong = (iso) =>
  new Date(iso).toLocaleDateString(
    typeof navigator !== "undefined" ? navigator.language : "en-GB",
    {
      weekday: "long",
    }
  );
const fmtDayDate = (iso) => `${weekdayShort(iso)} ${iso}`;
const toMinutes = (hhmm) => {
  const [h, m] = (hhmm || "00:00").split(":").map(Number);
  return h * 60 + m;
};
const rangesOverlap = (aStart, aEnd, bStart, bEnd) =>
  Math.max(toMinutes(aStart), toMinutes(bStart)) <
  Math.min(toMinutes(aEnd), toMinutes(bEnd));

const weekBounds = (d) => {
  const day = (d.getDay() + 6) % 7; // Mon=0..Sun=6
  const mon = new Date(d);
  mon.setDate(d.getDate() - day);
  const sun = new Date(mon);
  sun.setDate(mon.getDate() + 7);
  const fmt = (x) => x.toISOString().slice(0, 10);
  return { from: fmt(mon), to: fmt(sun) };
};

const getWeekDays = (weekStartISO) => {
  const start = new Date(weekStartISO);
  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const iso = toISODate(d);
    days.push({ iso, short: weekdayShort(iso), long: weekdayLong(iso) });
  }
  return days;
};

/* ---------------- UI atoms ---------------- */
const Chip = ({ active, onClick, top, bottom }) => (
  <button
    type="button"
    onClick={onClick}
    className={[
      "rounded-full px-4 py-2 text-center",
      "border transition shadow-sm",
      active
        ? "bg-slate-900 text-white border-slate-900"
        : "bg-slate-100 text-slate-800 border-slate-200 hover:bg-slate-200",
    ].join(" ")}
  >
    <div className="leading-tight flex flex-col items-center">
      <span className={active ? "font-semibold" : "font-medium"}>{top}</span>
      <span className={active ? "opacity-70" : "text-slate-600 opacity-90"}>
        {bottom}
      </span>
    </div>
  </button>
);

const Tiny = ({ children }) => (
  <span className="text-xs text-slate-500">{children}</span>
);

/* ---------------- page ---------------- */
export default function MyShifts() {
  const { user } = useAuth();
  const [weekStart, setWeekStart] = useState(() => weekBounds(new Date()).from);

  // shifts
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // availability

  // below: const [rows, setRows] = useState([]);
  const todayISO = new Date().toISOString().slice(0, 10);
  const myTodayShift = useMemo(
    () => rows.find((s) => toISODate(s.date) === todayISO) || null,
    [rows, todayISO]
  );

  const [availDate, setAvailDate] = useState(todayISO);
  const [availStart, setAvailStart] = useState("09:00");
  const [availEnd, setAvailEnd] = useState("17:00");
  const [availNote, setAvailNote] = useState("");
  const [availability, setAvailability] = useState([]);
  const [availErr, setAvailErr] = useState("");

  const wb = weekBounds(new Date(weekStart));
  const weekDays = useMemo(() => getWeekDays(wb.from), [wb.from]);

  const canSetAvailability = ["employee", "rider", "manager"].includes(
    user?.role
  );

  const loadAvailability = () => {
    if (!canSetAvailability) {
      setAvailability([]);
      return;
    }
    setAvailErr("");
    api
      .get("/api/availability/me", { params: { from: wb.from, to: wb.to } })
      .then(({ data }) => {
        const list = Array.isArray(data) ? data : data?.availability || [];
        setAvailability(list);
      })
      .catch((e) => setAvailErr(e?.response?.data?.error || e.message));
  };
  const [coworkers, setCoworkers] = useState([]);
  const [coworkersLoading, setCoworkersLoading] = useState(true);
  const [coworkersErr, setCoworkersErr] = useState("");

  useEffect(() => {
    let on = true;
    setCoworkersLoading(true);
    setCoworkersErr("");
    api
      .get("/api/employees") // adjust if your route differs (e.g., /users, /team)
      .then(({ data }) => {
        if (!on) return;
        const list = Array.isArray(data) ? data : data?.employees ?? [];
        setCoworkers(list);
      })
      .catch(
        (e) => on && setCoworkersErr(e?.response?.data?.error || e.message)
      )
      .finally(() => on && setCoworkersLoading(false));
    return () => {
      on = false;
    };
  }, []);

  useEffect(() => {
    loadAvailability();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wb.from, wb.to, user?.role]);

  useEffect(() => {
    let on = true;
    setLoading(true);
    setErr("");
    api
      .get(`/api/shifts/me`, { params: { from: wb.from, to: wb.to } })
      .then(({ data }) => on && setRows(data))
      .catch((e) => on && setErr(e?.response?.data?.error || e.message))
      .finally(() => on && setLoading(false));
    return () => {
      on = false;
    };
  }, [wb.from, wb.to]);

  const prevWeek = () => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() - 7);
    setWeekStart(d.toISOString().slice(0, 10));
  };
  const nextWeek = () => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + 7);
    setWeekStart(d.toISOString().slice(0, 10));
  };

  const addAvailability = async (e) => {
    e.preventDefault();
    setAvailErr("");
    if (toMinutes(availEnd) <= toMinutes(availStart)) {
      setAvailErr("End time must be after start time.");
      return;
    }
    // prevent overlapping with existing availability of same day
    const sameDayAvail = availability.filter(
      (a) => toISODate(a.date) === availDate
    );
    const overlapAvail = sameDayAvail.some((a) =>
      rangesOverlap(availStart, availEnd, a.start, a.end)
    );
    if (overlapAvail) {
      setAvailErr("You already added availability that overlaps this time.");
      return;
    }
    // prevent overlapping with scheduled shifts same day (optional but useful)
    const sameDayShifts = rows.filter((s) => toISODate(s.date) === availDate);
    const overlapShift = sameDayShifts.some((s) =>
      rangesOverlap(availStart, availEnd, s.start, s.end)
    );
    if (overlapShift) {
      setAvailErr("This overlaps with a scheduled shift on the same day.");
      return;
    }

    try {
      await api.post("/api/availability", {
        date: availDate,
        start: availStart,
        end: availEnd,
        note: availNote || undefined,
      });
      setAvailNote("");
      loadAvailability();
    } catch (e) {
      setAvailErr(e?.response?.data?.error || e.message);
    }
  };

  const removeAvailability = async (id) => {
    try {
      await api.delete(`/api/availability/${id}`);
      setAvailability((rows) => rows.filter((r) => r.id !== id));
    } catch (e) {
      setAvailErr(e?.response?.data?.error || e.message);
    }
  };

  const groupedAvailability = useMemo(() => {
    const m = new Map();
    for (const a of availability) {
      const k = toISODate(a.date);
      if (!m.has(k)) m.set(k, []);
      m.get(k).push(a);
    }
    for (const arr of m.values())
      arr.sort((x, y) => toMinutes(x.start) - toMinutes(y.start));
    return Array.from(m.entries()).sort((a, b) => (a[0] < b[0] ? -1 : 1));
  }, [availability]);

  return (
    <div className="space-y-8">
      <header className="flex items-baseline justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">My Shifts</h1>
          <p className="text-slate-600 text-sm">
            Logged in as {user?.email} ({user?.role})
          </p>
        </div>
        <div className="flex items-end gap-2">
          <div>
            <label className="label">Week starting</label>
            <input
              className="input"
              type="date"
              value={weekStart}
              onChange={(e) => setWeekStart(e.target.value)}
            />
          </div>
          <button className="btn" onClick={prevWeek}>
            ← Previous
          </button>
          <button className="btn" onClick={nextWeek}>
            Next →
          </button>
        </div>
      </header>
      {user?.employeeId && (
        <div className="card p-4 flex items-center justify-between">
          <div>
            <div className="font-medium">Today</div>
            {myTodayShift ? (
              <div>
                {myTodayShift.start} – {myTodayShift.end} ({myTodayShift.role})
              </div>
            ) : (
              <div className="text-slate-500 text-sm">No shift assigned</div>
            )}
          </div>

          <ClockButtons
            employeeId={user.employeeId}
            shiftId={myTodayShift?.id}
          />
        </div>
      )}

      <div className="text-sm text-slate-600">
        Range: {fmtDayDate(wb.from)} → {fmtDayDate(wb.to)}
      </div>

      {err && <div className="text-red-600 text-sm">{err}</div>}

      {/* Shifts */}
      <section className="card overflow-x-auto">
        {loading ? (
          <div className="p-3 text-slate-600">Loading…</div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="text-slate-600">
                <th className="py-2">Date</th>
                <th className="py-2">Start</th>
                <th className="py-2">End</th>
                <th className="py-2">Role</th>
                <th className="py-2 w-80">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td className="py-3 text-slate-500" colSpan={5}>
                    No shifts this week.
                  </td>
                </tr>
              ) : (
                rows.map((s) => (
                  <tr key={s.id} className="border-t">
                    <td className="py-2">{fmtDayDate(toISODate(s.date))}</td>
                    <td className="py-2">{s.start}</td>
                    <td className="py-2">{s.end}</td>
                    <td className="py-2">{s.role}</td>
                    <td className="py-2">
                      <RequestSwap
                        shiftId={s.id}
                        employees={coworkers}
                        employeesLoading={coworkersLoading}
                        currentUserId={user?.id}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </section>

      {/* Availability (no time presets; day+date chips like your screenshot) */}
      {canSetAvailability && (
        <section className="space-y-5">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h2 className="text-xl font-semibold">My Availability</h2>
            <Tiny>Select a day, then choose any start/end time and save.</Tiny>
          </div>

          {/* Chips bar */}
          <div className="card">
            <div className="flex flex-wrap items-center gap-3">
              {weekDays.map((d) => (
                <Chip
                  key={d.iso}
                  active={availDate === d.iso}
                  onClick={() => setAvailDate(d.iso)}
                  top={d.short}
                  bottom={d.iso} // MM-DD-yy
                />
              ))}
              <div className="ml-auto flex items-center gap-2">
                <Tiny>Pick any date</Tiny>
                <input
                  className="input"
                  type="date"
                  value={availDate}
                  onChange={(e) => setAvailDate(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Free-form time range */}
          <form onSubmit={addAvailability} className="card space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
              <div>
                <label className="label">Start</label>
                <input
                  className="input"
                  type="time"
                  value={availStart}
                  onChange={(e) => setAvailStart(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="label">End</label>
                <input
                  className="input"
                  type="time"
                  value={availEnd}
                  onChange={(e) => setAvailEnd(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="label">Note</label>
                <input
                  className="input"
                  placeholder="optional (e.g., class 14–16)"
                  value={availNote}
                  onChange={(e) => setAvailNote(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button className="btn" type="submit">
                Save availability
              </button>
              <Tiny>
                Selected: <strong>{weekdayLong(availDate)}</strong> ({availDate}
                ) · {availStart}–{availEnd}
              </Tiny>
            </div>

            {availErr && (
              <div className="rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
                {availErr}
              </div>
            )}
          </form>

          {/* Saved availability as chips per day */}
          <div className="space-y-3">
            {groupedAvailability.length === 0 ? (
              <div className="card text-slate-500">No availability yet.</div>
            ) : (
              groupedAvailability.map(([date, arr]) => (
                <div key={date} className="card">
                  <div className="mb-2 flex items-center justify-between">
                    <div className="font-medium">
                      {weekdayLong(date)}{" "}
                      <span className="text-slate-500">({date})</span>
                    </div>
                    <Tiny>
                      {arr.length} time slot{arr.length > 1 ? "s" : ""}
                    </Tiny>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {arr.map((a) => (
                      <div
                        key={a.id}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-slate-300 bg-white text-sm"
                      >
                        <span className="font-medium">
                          {a.start}–{a.end}
                        </span>
                        {a.note ? (
                          <span className="text-slate-500">· {a.note}</span>
                        ) : null}
                        <button
                          type="button"
                          className="ml-1 text-red-600 hover:text-red-700"
                          onClick={() => removeAvailability(a.id)}
                          aria-label="Delete availability"
                          title="Delete"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      )}
    </div>
  );
}
