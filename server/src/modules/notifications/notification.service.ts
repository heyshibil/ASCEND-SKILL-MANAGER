import { Notification } from "../../models/Notification.js";
import type { NotificationType } from "../../types/index.js";

/**
 * Create a notification or update the message/createdAt of an existing unread one by using [upsert].
 * This is a MongoDB operation that combines:
    Find a document
    Update it if found
    Optionally insert one if not found
    into a single atomic operation.
 */
export const createOrUpdateNotification = async (
  userId: string,
  skillId: string,
  type: NotificationType,
  message: string,
): Promise<void> => {
  await Notification.findOneAndUpdate(
    // Match existing unread notification for the same user + skill + type
    { userId, skillId, type, isRead: false },
    // Refresh message and timestamp so the notification surfaces as "new"
    { $set: { message, createdAt: new Date() } },
    // Insert a fresh doc if no match — sets all fields on creation
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    },
  );
};

/**
 * List notifications for a user filtered by read status, newest first.
 */
export const listNotifications = async (
  userId: string,
  status: "unread" | "read",
) => {
  return Notification.find({
    userId,
    isRead: status === "read",
  })
    .sort({ createdAt: -1 })
    .lean();
};

/**
 * Mark a single notification as read. Scoped to userId to prevent cross-user access.
 */
export const markAsRead = async (
  notificationId: string,
  userId: string,
) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: notificationId, userId },
    { $set: { isRead: true, readAt: new Date() } },
    { new: true },
  );

  return notification;
};

/**
 * Mark all unread notifications for a user as read in one operation.
 */
export const markAllAsRead = async (userId: string) => {
  const now = new Date();
  const result = await Notification.updateMany(
    { userId, isRead: false },
    { $set: { isRead: true, readAt: now } },
  );

  return result.modifiedCount;
};
