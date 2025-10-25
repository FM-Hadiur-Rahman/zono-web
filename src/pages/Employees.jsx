import { useEffect, useState, useCallback } from "react";
import { api } from "../services/api";
import InviteBox from "../components/InviteBox"; // or comment this line + its usage if you don't have it

export default function Employees() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [role, setRole] = useState("Rider");
  const [error, setError] = useState("");

  // define it BEFORE using it anywhere
  const fetchEmployees = useCallback(() => {
    setLoading(true);
    setError("");
    api
      .get("/api/employees")
      .then(({ data }) => setRows(data?.items ?? data ?? []))
      .catch((e) => setError(e?.response?.data?.error || e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const addEmployee = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const payload = { name, role };
      const { data } = await api.post("/api/employees", payload); // note /api prefix
      setRows((r) => [data, ...r]);
      setName("");
      setRole("Rider");
    } catch (e) {
      setError(e?.response?.data?.error || e.message);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Employees</h1>

      {/* If you don’t have InviteBox yet, comment this out */}
      <InviteBox onInvited={fetchEmployees} />

      <form onSubmit={addEmployee} className="card flex gap-3 items-end">
        <div className="flex-1">
          <label className="label">Name</label>
          <input
            className="input w-full"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Nihal"
            required
          />
        </div>
        <div>
          <label className="label">Role</label>
          <select
            className="input"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option>Rider</option>
            <option>Cook</option>
            <option>Cashier</option>
            <option>Manager</option>
          </select>
        </div>
        <button className="btn">Add</button>
      </form>

      {error && <div className="text-red-600 text-sm">{error}</div>}
      {loading ? (
        <div className="text-slate-600">Loading…</div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-slate-600">
                <th className="py-2">Name</th>
                <th className="py-2">Role</th>
                <th className="py-2">Status</th>
                <th className="py-2">ID</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td className="py-4 text-slate-500" colSpan={4}>
                    No employees yet.
                  </td>
                </tr>
              ) : (
                rows.map((e) => (
                  <tr key={e.id} className="border-t">
                    <td className="py-2">{e.name || e.email}</td>
                    <td className="py-2">{e.role}</td>
                    <td className="py-2">{e.status}</td>
                    <td className="py-2 text-slate-500">{e.id}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
