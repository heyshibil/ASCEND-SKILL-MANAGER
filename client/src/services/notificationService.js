import { API } from "./api";

/**
 * Fetch notifications filtered by read status.
 * @param {string} status - 'unread' | 'read'
 */
export const getNotifications = async (status) => {
  const { data } = await API.get("/notifications", { params: { status } });
  return data;
};

/**
 * Mark a single notification as read.
 * @param {string} id - Notification ObjectId
 */
export const markAsRead = async (id) => {
  const { data } = await API.patch(`/notifications/${id}/read`);
  return data;
};

/**
 * Mark all unread notifications as read.
 */
export const markAllAsRead = async () => {
  const { data } = await API.patch("/notifications/read-all");
  return data;
};
