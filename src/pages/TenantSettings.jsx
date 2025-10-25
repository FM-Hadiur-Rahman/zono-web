import { useAuth } from "../context/AuthContext.jsx";
import { useState } from "react";

export default function TenantSettings() {
  const { user } = useAuth();
  const [name, setName] = useState("BurgerMe – Mülheim");
  const [plan, setPlan] = useState("Standard");
  const [open, setOpen] = useState("10:00");
  const [close, setClose] = useState("22:00");

  const save = () => {
    alert(`Saved mock settings:
Tenant: ${name}
Plan: ${plan}
Open hours: ${open}–${close}`);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Tenant Settings</h1>
      <p className="text-slate-600 text-sm">
        Logged in as <strong>{user?.email}</strong> ({user?.role})
      </p>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="card space-y-4">
          <h2 className="text-lg font-medium">General Info</h2>
          <div>
            <label className="label">Restaurant Name</label>
            <input
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="label">Subscription Plan</label>
            <select
              className="input"
              value={plan}
              onChange={(e) => setPlan(e.target.value)}
            >
              <option>Standard</option>
              <option>Pro</option>
              <option>Enterprise</option>
            </select>
          </div>
          <button className="btn w-full" onClick={save}>
            Save Settings
          </button>
        </div>

        <div className="card space-y-4">
          <h2 className="text-lg font-medium">Operating Hours</h2>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="label">Open</label>
              <input
                type="time"
                className="input"
                value={open}
                onChange={(e) => setOpen(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <label className="label">Close</label>
              <input
                type="time"
                className="input"
                value={close}
                onChange={(e) => setClose(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
