import { Schema, model, type Document } from "mongoose";
import type { INotification } from "../types/index.js";

const notificationSchema = new Schema<INotification & Document>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    skillId: { type: Schema.Types.ObjectId, ref: "Skill", required: true },
    type: {
      type: String,
      enum: ["DECAYING", "DEBT", "REVERIFY"],
      required: true,
    },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    readAt: { type: Date, default: null },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: false }, // createdAt managed manually so TTL index on readAt works correctly
);

// Fast list queries (unread/read per user)
notificationSchema.index({ userId: 1, isRead: 1 });

// Prevent duplicate unread notifications for same user+skill+type
// Only enforced while isRead: false — once read the unique constraint lifts
notificationSchema.index(
  { userId: 1, skillId: 1, type: 1, isRead: 1 },
  {
    unique: true,
    partialFilterExpression: { isRead: false },
    name: "unique_unread_notification",
  },
);

// Auto-delete read notifications 30 days after readAt (native Mongo TTL — no manual cleanup needed)
notificationSchema.index(
  { readAt: 1 },
  {
    expireAfterSeconds: 60 * 60 * 24 * 30,
    partialFilterExpression: { isRead: true },
    name: "ttl_read_notifications",
  },
);

export const Notification = model<INotification & Document>(
  "Notification",
  notificationSchema,
);
