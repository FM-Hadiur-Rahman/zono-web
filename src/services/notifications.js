import { api } from "./api";

export async function fetchNotifications(take = 20) {
  const { data } = await api.get("/api/notifications", { params: { take } });
  return data;
}

export async function markRead(id) {
  await api.patch(`/api/notifications/${id}/read`);
}

export async function markAllRead() {
  await api.patch(`/api/notifications/read-all`);
}
