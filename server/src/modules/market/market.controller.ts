import type { Request, Response } from "express";
import * as marketService from "./market.service.js";

let clients: Response[] = [];

//  Establish SSE Connection
export const streamMarketUpdates = async (req: Request, res: Response) => {
  // Required HTTP headers for Server-Sent Events
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  res.write(`data: ${JSON.stringify({ type: "CONNECTED" })}\n\n`);

  clients.push(res);

  try {
    const activeSkills = await marketService.getActiveMarketSkills();
    res.write(
      `data: ${JSON.stringify({ type: "INITIAL_DATA", payload: activeSkills })}\n\n`,
    );
  } catch (error) {
    console.error("Error while SSE connection:", error);
    res.write(
      `data: ${JSON.stringify({ type: "ERROR", message: "Failed to load market data." })}\n\n`,
    );
    res.end();
  }

  // Clean up dead connections to prevent memory leaks
  req.on("close", () => {
    clients = clients.filter((client) => client !== res);
  });
};

export const addTrendingSkill = async (req: Request, res: Response) => {
  try {
    const { skillName, demandPercentage, parentLanguage, openRoles } = req.body;

    const newSKill = await marketService.createTrendingSkill({
      skillName,
      demandPercentage,
      parentLanguage,
      openRoles,
    });

    // Loop through and broadcast
    clients.forEach((client) => {
      client.write(
        `data: ${JSON.stringify({ type: "NEW_SKILL", payload: newSKill })}\n\n`,
      );
    });

    res.status(201).json({ success: true, data: newSKill });
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

    // Update broadcast
    clients.forEach((client) => {
      client.write(
        `data: ${JSON.stringify({ type: "UPDATE_SKILL", payload: updatedSkill })}\n\n`,
      );
    });

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

    // Broadcast the ID to be removed
    clients.forEach((client) => {
      client.write(
        `data: ${JSON.stringify({ type: "DELETE_SKILL", payload: skillId })}\n\n`,
      );
    });

    res.json({ success: true, message: "Skill deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
