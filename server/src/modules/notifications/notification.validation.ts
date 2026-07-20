import { z } from "zod";

// Validates the ?status= query parameter on GET /api/notifications
export const notificationStatusSchema = z.object({
  status: z.enum(["unread", "read"], {
    error: "status must be 'unread' or 'read'",
  }),
});

export type NotificationStatus = z.infer<typeof notificationStatusSchema>["status"];
