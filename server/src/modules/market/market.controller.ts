import type { Request, Response } from "express";
import * as marketService from "./market.service.js";
import {
  addClient,
  removeClient,
  publishMarketEvent,
} from "../../utils/sseManager.js";


/**
 * GET /market/stream
 *  - A 25s heartbeat to survive reverse-proxy idle timeouts
 * 
 *  - Automatic cleanup on disconnect
 *
 * Broadcasts are handled via Redis Pub/Sub (see sseManager.ts)
 */
export const streamMarketUpdates = async (req: Request, res: Response) => {
  // Required HTTP headers for Server-Sent Events
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  // Register this client — starts heartbeat automatically
  const clientId = addClient(res);

  try {
    const activeSkills = await marketService.getActiveMarketSkills();
    res.write(
      `data: ${JSON.stringify({ type: "INITIAL_DATA", payload: activeSkills })}\n\n`,
    );
  } catch (error) {
    console.error("SSE initial data fetch failed:", error);
    res.write(
      `data: ${JSON.stringify({ type: "ERROR", message: "Failed to load market data." })}\n\n`,
    );
  }

  // Clean up when the client disconnects
  req.on("close", () => {
    removeClient(clientId);
  });
};
// Each mutation persists to MongoDB first, then publishes an event to Redis.

export const addTrendingSkill = async (req: Request, res: Response) => {
  try {
    const { skillName, demandPercentage, parentLanguage, openRoles } = req.body;

    const newSkill = await marketService.createTrendingSkill({
      skillName,
      demandPercentage,
      parentLanguage,
      openRoles,
    });

    // Publish via Redis → all processes broadcast to their SSE clients
    publishMarketEvent({ type: "NEW_SKILL", payload: newSkill });

    res.status(201).json({ success: true, data: newSkill });
  } catch (error) {
    console.error("Error creating trending skill:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const updateTrendingSkill = async (req: Request, res: Response) => {
  try {
    const skillId = req.params.id as string;
    const updateData = req.body;

    const updatedSkill = await marketService.updateTrendingSkill(
      skillId,
      updateData,
    );

    if (!updatedSkill) {
      res.status(404).json({ success: false, message: "Skill not found" });
      return;
    }

    // Publish via Redis → all processes broadcast to their SSE clients
    publishMarketEvent({ type: "UPDATE_SKILL", payload: updatedSkill });

    res.json({ success: true, data: updatedSkill });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const deleteTrendingSkill = async (req: Request, res: Response) => {
  try {
    const skillId = req.params.id as string;

    const deleted = await marketService.deleteTrendingSkill(skillId);

    if (!deleted) {
      res.status(404).json({ success: false, message: "Skill not found" });
      return;
    }

    // Publish via Redis → all processes broadcast to their SSE clients
    publishMarketEvent({ type: "DELETE_SKILL", payload: skillId });

    res.json({ success: true, message: "Skill deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
