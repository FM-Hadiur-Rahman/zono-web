import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import {
  fetchNotifications,
  markRead,
  markAllRead,
} from "../services/notifications";
import { useAuth } from "../context/AuthContext.jsx";

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const btnRef = useRef(null);

  const { user } = useAuth();

  const unread = rows.filter((r) => !r.isRead).length;
  const socketURL = import.meta.env.VITE_API_URL || "http://localhost:4000";

  useEffect(() => {
    const socket = io(socketURL, {
      path: "/socket.io",
      withCredentials: true,
    });

    // auth: send user & tenant once you have them
    const token = localStorage.getItem("zono_token");
    socket.emit("auth", {
      // include only what you need; token optional if you trust Axios auth
      userId: user?.id,
      tenantId: user?.tenantId,
      token,
    });

    socket.on("notification", (n) => {
      // prepend new row, update badge
      setRows((prev) => [n, ...prev]);
    });

    return () => socket.disconnect();
  }, [user?.id, user?.tenantId]);

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchNotifications(20);
      setRows(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // close on outside click
  useEffect(() => {
    const onDoc = (e) => {
      if (!open) return;
      if (!btnRef.current) return;
      if (!btnRef.current.parentElement.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const onToggle = () => setOpen((v) => !v);

  const onMarkOne = async (id) => {
    await markRead(id);
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, isRead: true } : r)));
  };

  const onMarkAll = async () => {
    await markAllRead();
    setRows((rs) => rs.map((r) => ({ ...r, isRead: true })));
  };

  return (
    <div className="relative">
      <button
        ref={btnRef}
        onClick={onToggle}
        className="relative inline-flex items-center justify-center w-9 h-9 rounded-full border border-slate-300 bg-white hover:bg-slate-50"
        aria-label="Notifications"
        title="Notifications"
      >
        🔔
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-600 text-white text-[11px] flex items-center justify-center">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-96 max-w-[95vw] rounded-xl border border-slate-200 bg-white shadow-lg z-50">
          <div className="flex items-center justify-between px-3 py-2 border-b bg-slate-50 rounded-t-xl">
            <div className="font-medium">Notifications</div>
            <div className="flex items-center gap-2">
              <button
                className="text-xs text-slate-600 hover:underline"
                onClick={load}
                disabled={loading}
              >
                Refresh
              </button>
              <button
                className="text-xs text-slate-600 hover:underline"
                onClick={onMarkAll}
                disabled={unread === 0}
              >
                Mark all read
              </button>
            </div>
          </div>

          {loading ? (
            <div className="p-3 text-sm text-slate-600">Loading…</div>
          ) : rows.length === 0 ? (
            <div className="p-3 text-sm text-slate-500">No notifications</div>
          ) : (
            <ul className="max-h-96 overflow-auto divide-y">
              {rows.map((n) => (
                <li
                  key={n.id}
                  className={`px-3 py-2 text-sm ${
                    n.isRead ? "bg-white" : "bg-slate-50"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <div className="mt-[2px]">
                      {n.type === "shift.created" ? "🗓️" : "🔔"}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{n.title}</div>
                      <div className="text-slate-600">{n.body}</div>
                      <div className="text-xs text-slate-400 mt-1">
                        {new Date(n.createdAt).toLocaleString()}
                      </div>
                    </div>
                    {!n.isRead && (
                      <button
                        className="text-xs text-blue-600 hover:underline"
                        onClick={() => onMarkOne(n.id)}
                      >
                        Mark read
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
