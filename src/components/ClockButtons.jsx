// src/components/ClockButtons.jsx
import { useState } from "react";
import { api } from "../services/api"; // axios instance with x-tenant, auth

export default function ClockButtons({ employeeId, shiftId }) {
  const [loading, setLoading] = useState(false);

  const getGeo = () =>
    new Promise((resolve) =>
      navigator.geolocation?.getCurrentPosition(
        (pos) =>
          resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => resolve({})
      )
    );

  const doClock = async (path) => {
    setLoading(true);
    const geo = await getGeo();
    await api.post(`/attendance/${path}`, {
      employeeId,
      shiftId,
      ...geo,
      source: "web",
    });
    setLoading(false);
  };

  return (
    <div className="flex gap-2">
      <button
        disabled={loading}
        onClick={() => doClock("clock-in")}
        className="btn btn-primary"
      >
        Clock In
      </button>
      <button
        disabled={loading}
        onClick={() => doClock("clock-out")}
        className="btn btn-outline"
      >
        Clock Out
      </button>
    </div>
  );
}
