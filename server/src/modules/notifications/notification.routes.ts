import { Router } from "express";
import * as notificationController from "./notification.controller.js";
import { authenticate } from "../../middlewares/auth.middleware.js";

const router = Router();

// NOTE: /read-all must be declared BEFORE /:id/read so Express doesn't
// interpret "read-all" as an :id param value.
router.patch(
  "/read-all",
  authenticate,
  notificationController.markAllNotificationsAsRead,
);

router.get("/", authenticate, notificationController.getNotifications);

router.patch(
  "/:id/read",
  authenticate,
  notificationController.markNotificationAsRead,
);

export default router;
