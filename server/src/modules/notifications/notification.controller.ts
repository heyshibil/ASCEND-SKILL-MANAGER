import type { Request, Response, NextFunction } from "express";
import * as notificationService from "./notification.service.js";
import { notificationStatusSchema } from "./notification.validation.js";
import { AppError } from "../../middlewares/error.middleware.js";

/**
 * GET /api/notifications?status=unread|read
 */
export const getNotifications = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { status } = notificationStatusSchema.parse(req.query);

    const notifications = await notificationService.listNotifications(
      req.userId!,
      status,
    );

    res.status(200).json({
      success: true,
      notifications,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/notifications/:id/read
 */
export const markNotificationAsRead = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;

    if (typeof id !== 'string') {
      throw new AppError("Invalid notification ID", 400);
    }

    const notification = await notificationService.markAsRead(id, req.userId!);

    if (!notification) {
      throw new AppError("Notification not found", 404);
    }

    res.status(200).json({
      success: true,
      message: "Notification marked as read",
      notification,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/notifications/read-all
 */
export const markAllNotificationsAsRead = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const count = await notificationService.markAllAsRead(req.userId!);

    res.status(200).json({
      success: true,
      message: `${count} notification(s) marked as read`,
      modifiedCount: count,
    });
  } catch (error) {
    next(error);
  }
};
