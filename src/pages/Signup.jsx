// src/pages/Signup.jsx
import { useState } from "react";
import { registerTenant } from "../services/apiAuth";

export default function Signup() {
  const [form, setForm] = useState({
    company: "",
    subdomain: "",
    name: "",
    email: "",
    password: "",
    phone: "",
    country: "",
  });
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const onChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setMsg("");
    try {
      await registerTenant(form);
      setMsg("Workspace created. Check your email to verify your account.");
    } catch (e) {
      setErr(e?.response?.data?.error || e.message);
    }
  };

  return (
    <div className="max-w-md mx-auto card space-y-4">
      <h1 className="text-2xl font-semibold">Create your workspace</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <div>
          <label className="label">Company</label>
          <input
            name="company"
            className="input"
            value={form.company}
            onChange={onChange}
            required
          />
        </div>
        <div>
          <label className="label">Subdomain</label>
          <input
            name="subdomain"
            className="input"
            placeholder="e.g., burgerme-mh"
            value={form.subdomain}
            onChange={onChange}
          />
          <p className="text-xs text-slate-500 mt-1">
            Used as your workspace URL (must be unique).
          </p>
        </div>
        <div>
          <label className="label">Your name</label>
          <input
            name="name"
            className="input"
            value={form.name}
            onChange={onChange}
            required
          />
        </div>
        <div>
          <label className="label">Email</label>
          <input
            type="email"
            name="email"
            className="input"
            value={form.email}
            onChange={onChange}
            required
          />
        </div>
        <div>
          <label className="label">Password</label>
          <input
            type="password"
            name="password"
            className="input"
            value={form.password}
            onChange={onChange}
            required
          />
          <p className="text-xs text-slate-500 mt-1">Min 8 chars.</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Phone (optional)</label>
            <input
              name="phone"
              className="input"
              value={form.phone}
              onChange={onChange}
            />
          </div>
          <div>
            <label className="label">Country (optional)</label>
            <input
              name="country"
              className="input"
              value={form.country}
              onChange={onChange}
            />
          </div>
        </div>
        <button className="btn w-full" type="submit">
          Create workspace
        </button>
      </form>

      {msg && <div className="text-green-700 text-sm">{msg}</div>}
      {err && <div className="text-red-600 text-sm">{err}</div>}
    </div>
  );
}
