import { useEffect, useMemo, useState } from "react";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext.jsx";
import RequestSwap from "../components/RequestSwap.jsx";
import { useToast } from "../components/Toast.jsx";
import ClockButtons from "../components/ClockButtons.jsx";

/* ---------- helpers ---------- */
const toISODate = (x) =>
  typeof x === "string"
    ? x.slice(0, 10)
    : new Date(x).toISOString().slice(0, 10);

const weekdayShort = (iso) =>
  new Date(iso).toLocaleDateString(
    typeof navigator !== "undefined" ? navigator.language : "en-GB",
    { weekday: "short" }
  );

const fmtDayDate = (iso) => `${weekdayShort(iso)} ${iso}`;

/* Monday → Sunday bounds */
const weekBounds = (d) => {
  const day = (d.getDay() + 6) % 7; // Mon=0…Sun=6
  const mon = new Date(d);
  mon.setDate(d.getDate() - day);
  const sun = new Date(mon);
  sun.setDate(mon.getDate() + 7);
  const fmt = (x) => x.toISOString().slice(0, 10);
  return { from: fmt(mon), to: fmt(sun) };
};

const DAY_KEYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
const DAY_LABEL = {
  mon: "MON",
  tue: "TUE",
  wed: "WED",
  thu: "THU",
  fri: "FRI",
  sat: "SAT",
  sun: "SUN",
};
const PRESETS = [
  { s: "09:00", e: "17:00" },
  { s: "10:00", e: "18:00" },
  { s: "12:00", e: "20:00" },
];

export default function Shifts() {
  const { user } = useAuth();
  const [weekStart, setWeekStart] = useState(() => weekBounds(new Date()).from);
  const wb = useMemo(() => weekBounds(new Date(weekStart)), [weekStart]);
  const toast = useToast();
  // shifts
  const [rows, setRows] = useState([]);

  // employees for select + name resolution
  const [employees, setEmployees] = useState([]);
  const employeesById = useMemo(
    () => new Map(employees.map((e) => [e.id || e._id, e])),
    [employees]
  );

  // form state
  const [employeeIds, setEmployeeIds] = useState([]); // multi-select (#3)
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [start, setStart] = useState("10:00");
  const [end, setEnd] = useState("18:00");
  const [role, setRole] = useState("Staff"); // (#1)
  const [repeatDays, setRepeatDays] = useState({
    mon: false,
    tue: false,
    wed: false,
    thu: false,
    fri: false,
    sat: false,
    sun: false,
  }); // (#2)

  const [err, setErr] = useState("");

  // availability (manager view)
  const [availability, setAvailability] = useState([]);
  const [availErr, setAvailErr] = useState("");

  const isManager = ["manager", "tenant_admin", "zono_admin"].includes(
    user?.role
  );
  const canRequestSwap = ["employee", "rider"].includes(user?.role); // employees can request swaps

  const isSelf = (r) =>
    r.employeeId && user?.employeeId && r.employeeId === user.employeeId;

  const isToday = (iso) =>
    toISODate(iso) === new Date().toISOString().slice(0, 10);
  /* Return a display name for a row/availability item */
  const getEmployeeDisplay = (obj) => {
    const embeddedName =
      obj.employee?.name || obj.user?.name || obj.employeeName;
    if (embeddedName) return embeddedName;

    const eid =
      obj.employeeId ?? obj.userId ?? obj.employee?.id ?? obj.user?.id;
    const rec = eid ? employeesById.get(eid) : null;
    if (rec?.name) return rec.name;

    return rec?.email || obj.employee?.email || eid || "Unknown";
  };

  /* load employees (for dropdown + name map) */
  useEffect(() => {
    api
      .get("/api/employees")
      .then(({ data }) => {
        const list = Array.isArray(data) ? data : data?.employees || [];
        setEmployees(list);
        // preselect first employee for convenience
        if (list[0]?.id) setEmployeeIds([list[0].id]);
      })
      .catch(() => {});
  }, []);

  /* load shifts in range */
  const loadShifts = () => {
    setErr("");
    api
      .get("/api/shifts/range", { params: { from: wb.from, to: wb.to } })
      .then(({ data }) => setRows(data))
      .catch((e) => setErr(e?.response?.data?.error || e.message));
  };
  useEffect(loadShifts, [wb.from, wb.to]); // eslint-disable-line

  /* load availability in range (manager) */
  const loadAvailability = () => {
    if (!isManager) {
      setAvailability([]);
      return;
    }
    setAvailErr("");
    api
      .get("/api/availability", { params: { from: wb.from, to: wb.to } })
      .then(({ data }) => {
        const list = Array.isArray(data) ? data : data?.availability || [];
        setAvailability(list);
      })
      .catch((e) => setAvailErr(e?.response?.data?.error || e.message));
  };
  useEffect(loadAvailability, [isManager, wb.from, wb.to]); // eslint-disable-line

  /* ---------- #2 repeat helpers ---------- */
  function datesFromRepeat(weekStartISO) {
    const startDate = new Date(weekStartISO);
    const out = [];
    DAY_KEYS.forEach((k, i) => {
      if (repeatDays[k]) {
        const d = new Date(startDate);
        d.setDate(startDate.getDate() + i);
        out.push(d.toISOString().slice(0, 10));
      }
    });
    // If no days checked, fall back to the single date field
    return out.length ? out : [date];
  }

  /* create shifts (bulk for #2 & #3) */
  const addShift = async (e) => {
    e.preventDefault();
    setErr("");

    const dates = datesFromRepeat(weekStart);
    const ids = employeeIds.length ? employeeIds : [];

    if (ids.length === 0) {
      const msg = "Please select at least one employee.";
      setErr(msg);
      toast.error("Cannot create shifts", msg);
      return;
    }

    try {
      const ops = [];
      for (const id of ids)
        for (const d of dates) {
          ops.push(
            api.post("/api/shifts", {
              employeeId: id,
              date: d,
              start,
              end,
              role,
            })
          );
        }

      const results = await Promise.allSettled(ops);
      const ok = results.filter((r) => r.status === "fulfilled").length;
      const fail = results.length - ok;

      if (ok) {
        toast.success(
          "Shifts created",
          `Created ${ok} shift${ok > 1 ? "s" : ""}${
            fail ? ` · ${fail} skipped` : ``
          }`
        );
      }
      if (fail) {
        const msg = `Some shifts conflicted (overlap/validation). Skipped ${fail}.`;
        setErr(msg);
        toast.error("Some shifts skipped", msg, { duration: 5000 });
      }

      loadShifts();
    } catch (e2) {
      const msg = e2?.response?.data?.error || e2.message;
      setErr(msg);
      toast.error("Failed to create shifts", msg, { duration: 5000 });
    }
  };

  const remove = async (id) => {
    setErr("");
    try {
      await api.delete(`/api/shifts/${id}`);
      setRows((prev) => prev.filter((r) => r.id !== id));
      toast.success("Shift removed");
    } catch (e) {
      const msg = e?.response?.data?.error || e.message;
      setErr(msg);
      toast.error("Failed to remove shift", msg);
    }
  };
  /* group availability by date for the manager panel */
  const availabilityByDate = useMemo(() => {
    const map = new Map(); // date -> items[]
    for (const a of availability) {
      const k = toISODate(a.date);
      if (!map.has(k)) map.set(k, []);
      map.get(k).push(a);
    }
    for (const arr of map.values()) {
      arr.sort((x, y) => (x.start < y.start ? -1 : x.start > y.start ? 1 : 0));
    }
    return Array.from(map.entries()).sort((a, b) => (a[0] < b[0] ? -1 : 1));
  }, [availability]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Shifts</h1>

      <div className="card flex items-end gap-3">
        <div>
          <label className="label">Week starting</label>
          <input
            className="input"
            type="date"
            value={weekStart}
            onChange={(e) => setWeekStart(e.target.value)}
          />
        </div>
        <button
          className="btn"
          onClick={() => {
            loadShifts();
            loadAvailability();
          }}
        >
          Refresh
        </button>
        <div className="ml-auto text-sm text-slate-600">
          Range: {fmtDayDate(wb.from)} → {fmtDayDate(wb.to)}
        </div>
      </div>

      {(err || availErr) && (
        <div className="text-red-600 text-sm">
          {err ? err : null}
          {err && availErr ? " · " : null}
          {availErr ? availErr : null}
        </div>
      )}

      {/* Manager: create shift */}
      {isManager && (
        <form onSubmit={addShift} className="card space-y-4">
          {/* top row */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
            <div>
              <label className="label">Date</label>
              <input
                className="input"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            {/* #3 multi-select employees */}
            <div className="md:col-span-2">
              <label className="label">Employees (multi-select)</label>
              <select
                multiple
                className="input h-28"
                value={employeeIds}
                onChange={(e) =>
                  setEmployeeIds(
                    Array.from(e.target.selectedOptions, (o) => o.value)
                  )
                }
                required
              >
                {employees.map((e) => (
                  <option key={e.id || e._id} value={e.id || e._id}>
                    {(e.name || e.email || e.id || e._id) +
                      (e.role ? ` (${e.role})` : "")}
                  </option>
                ))}
              </select>
              <div className="text-xs text-slate-500 mt-1">
                Tip: ⌘/Ctrl-click to pick multiple
              </div>
            </div>

            <div>
              <label className="label">Start</label>
              <input
                className="input"
                type="time"
                value={start}
                onChange={(e) => setStart(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="label">End</label>
              <input
                className="input"
                type="time"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
                required
              />
            </div>
          </div>

          {/* #1 quick time presets + role */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-600">Presets:</span>
              {PRESETS.map((p) => (
                <button
                  type="button"
                  key={p.s + p.e}
                  className="px-2 py-1 rounded border text-xs bg-white hover:bg-slate-50"
                  onClick={() => {
                    setStart(p.s);
                    setEnd(p.e);
                  }}
                >
                  {p.s}–{p.e}
                </button>
              ))}
            </div>

            <div className="ml-auto">
              <label className="label">Role</label>
              <select
                className="input"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option>Staff</option>
                <option>Kitchen</option>
                <option>Rider</option>
                <option>Cashier</option>
              </select>
            </div>
          </div>

          {/* #2 repeat across week */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="text-sm text-slate-600">Repeat on:</div>
            {DAY_KEYS.map((k) => (
              <label key={k} className="text-xs flex items-center gap-1">
                <input
                  type="checkbox"
                  checked={repeatDays[k]}
                  onChange={(e) =>
                    setRepeatDays({ ...repeatDays, [k]: e.target.checked })
                  }
                />
                {DAY_LABEL[k]}
              </label>
            ))}
            <div className="text-xs text-slate-500">
              (If none selected, only the chosen Date is used)
            </div>

            <button className="btn ml-auto">Add Shift(s)</button>
          </div>
        </form>
      )}

      {/* Shifts table */}
      <div className="card overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-slate-600">
              <th className="py-2">Date</th>
              <th className="py-2">Employee</th>
              <th className="py-2">Start</th>
              <th className="py-2">End</th>
              <th className="py-2">Role</th>
              <th className="py-2 w-36">Clock</th>

              {canRequestSwap && <th className="py-2 w-28">Swap</th>}
              {isManager && <th className="py-2 w-28">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="py-2">{fmtDayDate(toISODate(r.date))}</td>
                <td className="py-2">{getEmployeeDisplay(r)}</td>
                <td className="py-2">{r.start}</td>
                <td className="py-2">{r.end}</td>
                <td className="py-2">{r.role}</td>
                <td className="py-2">
                  {(isManager || isSelf(r)) && isToday(r.date) ? (
                    <ClockButtons employeeId={r.employeeId} shiftId={r.id} />
                  ) : (
                    <span className="text-slate-400 text-xs">—</span>
                  )}
                </td>

                {canRequestSwap && (
                  <td className="py-2">
                    <RequestSwap shiftId={r.id} />
                  </td>
                )}

                {isManager && (
                  <td className="py-2">
                    <button
                      className="text-red-600 hover:underline"
                      onClick={() => remove(r.id)}
                    >
                      Remove
                    </button>
                  </td>
                )}
              </tr>
            ))}

            {rows.length === 0 && (
              <tr>
                <td
                  className="py-3 text-slate-500"
                  colSpan={5 + (canRequestSwap ? 1 : 0) + (isManager ? 1 : 0)}
                >
                  No shifts found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Manager availability panel for the selected week */}
      {isManager && (
        <div className="space-y-3">
          <h2 className="text-xl font-semibold">Availability (week)</h2>
          {availabilityByDate.length === 0 ? (
            <div className="card text-slate-500">
              No availability submitted for this range.
            </div>
          ) : (
            availabilityByDate.map(([d, items]) => (
              <div key={d} className="card">
                <div className="mb-2 font-medium">{fmtDayDate(d)}</div>
                <div className="flex flex-wrap gap-2">
                  {items.map((a) => (
                    <div
                      key={a.id}
                      className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-slate-300 bg-white text-sm"
                    >
                      <span className="font-medium">
                        {getEmployeeDisplay(a)}
                      </span>
                      <span className="text-slate-500">
                        · {a.start}–{a.end}
                      </span>
                      {a.note ? (
                        <span className="text-slate-500">· {a.note}</span>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
