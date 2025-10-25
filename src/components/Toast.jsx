import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";

const ToastCtx = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(1);

  const remove = useCallback((id) => {
    setToasts((ts) => ts.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (t) => {
      const id = idRef.current++;
      const toast = {
        id,
        title: t.title || "",
        desc: t.desc || "",
        variant: t.variant || "info", // "success" | "error" | "info"
        duration: t.duration ?? 3500,
      };
      setToasts((ts) => [toast, ...ts]);
      if (toast.duration > 0) {
        setTimeout(() => remove(id), toast.duration);
      }
      return id;
    },
    [remove]
  );

  const api = useMemo(
    () => ({
      show: push,
      success: (title, desc, opts = {}) =>
        push({ title, desc, variant: "success", ...opts }),
      error: (title, desc, opts = {}) =>
        push({ title, desc, variant: "error", ...opts }),
      info: (title, desc, opts = {}) =>
        push({ title, desc, variant: "info", ...opts }),
      dismiss: remove,
    }),
    [push, remove]
  );

  return (
    <ToastCtx.Provider value={api}>
      {children}
      {/* viewport */}
      <div className="fixed top-3 right-3 z-[1000] space-y-2 w-[min(92vw,360px)]">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={[
              "rounded-lg border shadow-md p-3 text-sm bg-white flex items-start gap-2",
              t.variant === "success"
                ? "border-green-200"
                : t.variant === "error"
                ? "border-red-200"
                : "border-slate-200",
            ].join(" ")}
            role="status"
          >
            <div className="mt-0.5">
              {t.variant === "success"
                ? "✅"
                : t.variant === "error"
                ? "⚠️"
                : "🔔"}
            </div>
            <div className="flex-1">
              {t.title ? <div className="font-medium">{t.title}</div> : null}
              {t.desc ? <div className="text-slate-600">{t.desc}</div> : null}
            </div>
            <button
              onClick={() => remove(t.id)}
              className="text-slate-400 hover:text-slate-600"
              aria-label="Close"
              title="Close"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider />");
  return ctx;
}
