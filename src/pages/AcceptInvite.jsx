// src/pages/AcceptInvite.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../services/api";

export default function AcceptInvite() {
  const { token } = useParams();
  const nav = useNavigate();
  const [meta, setMeta] = useState(null);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    api
      .get(`/api/invitations/${token}`)
      .then((r) => setMeta(r.data))
      .catch(() => setErr("Invite invalid or expired."));
  }, [token]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setMsg("");
    try {
      await api.post("/api/invitations/accept", { token, name, password });
      setMsg("Invite accepted! Please log in.");
      setTimeout(() => nav("/login"), 1000);
    } catch (e) {
      setErr(e?.response?.data?.error || e.message);
    }
  };

  if (err) return <div className="max-w-md mx-auto card">{err}</div>;
  if (!meta) return <div className="max-w-md mx-auto card">Loading…</div>;

  return (
    <div className="max-w-md mx-auto card space-y-4">
      <h1 className="text-2xl font-semibold">Join {meta?.tenant?.name}</h1>
      <p>
        You’re joining as <b>{meta.role}</b> for <code>{meta.email}</code>.
      </p>
      <form onSubmit={onSubmit} className="space-y-3">
        <div>
          <label className="label">Your name</label>
          <input
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="label">Create password</label>
          <input
            type="password"
            className="input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button className="btn w-full">Accept invite</button>
      </form>
      {msg && <div className="text-green-700 text-sm">{msg}</div>}
      {err && <div className="text-red-600 text-sm">{err}</div>}
    </div>
  );
}
