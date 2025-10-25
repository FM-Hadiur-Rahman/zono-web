// src/pages/VerifyEmail.jsx
import { useEffect, useState } from "react";
import { verifyEmail } from "../services/apiAuth";
import { useSearchParams, useNavigate } from "react-router-dom";

export default function VerifyEmail() {
  const [params] = useSearchParams();
  const nav = useNavigate();
  const [msg, setMsg] = useState("Verifying…");
  const [err, setErr] = useState("");

  useEffect(() => {
    const token = params.get("token");
    if (!token) {
      setErr("Missing token");
      setMsg("");
      return;
    }

    verifyEmail(token)
      .then(() => {
        setMsg("Email verified! Redirecting to login…");
        setTimeout(() => nav("/login"), 1200);
      })
      .catch((e) => {
        setErr(e?.response?.data?.error || e.message);
        setMsg("");
      });
  }, []);

  return (
    <div className="max-w-md mx-auto card space-y-3">
      <h1 className="text-2xl font-semibold">Verify Email</h1>
      {msg && <div className="text-slate-700">{msg}</div>}
      {err && <div className="text-red-600">{err}</div>}
    </div>
  );
}
