import { useState } from "react";
import { api } from "../services/api";

export default function InviteBox({ onInvited }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Employee");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const sendInvite = async (e) => {
    e.preventDefault();
    setMsg("");
    setErr("");
    try {
      const { data } = await api.post("/api/invitations/send", {
        email,
        role: role.toLowerCase(), // if backend expects lowercase: role.toLowerCase()
      });
      setMsg(`Invite sent. Link (dev): ${data.link}`);
      setEmail("");
      onInvited?.();
    } catch (e) {
      setErr(e?.response?.data?.error || e.message);
    }
  };

  return (
    <form onSubmit={sendInvite} className="card flex gap-3 items-end">
      <div className="flex-1">
        <label className="label">Invite email</label>
        <input
          className="input w-full"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="employee@company.com"
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
          <option>Employee</option>
          <option>Rider</option>
          <option>Cook</option>
          <option>Cashier</option>
          <option>Manager</option>
        </select>
      </div>
      <button className="btn">Send invite</button>
      {msg && <div className="text-xs text-green-700 ml-2">{msg}</div>}
      {err && <div className="text-xs text-red-600 ml-2">{err}</div>}
    </form>
  );
}
