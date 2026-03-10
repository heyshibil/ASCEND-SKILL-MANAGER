import type { Request, Response } from "express";
import axios from "axios";
import jwt from "jsonwebtoken";
import { User } from "../../models/User.js";

export const githubCallback = async (req: Request, res: Response) => {
  const { code } = req.query;

  if (!code) {
    return res.status(400).json({ message: "Authorization code missing" });
  }

  try {
    // Exchange the 'code' for a GitHub Access Token
    const tokenResponse = await axios.post(
      "https://github.com/login/oauth/access_token",
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      },
      { headers: { Accept: "application/json" } },
    );

    const accessToken = tokenResponse.data.access_token;

    // Use that token to get the user's GitHub profile
    const { data: profile } = await axios.get("https://api.github.com/user", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    let user = await User.findOne({ githubId: profile.id.toString() });

    // create new user
    if (!user) {
      user = await User.create({
        githubId: profile.id.toString(),
        username: profile.login,
        email: profile.email || `${profile.login}@users.noreply.github.com`,
        targetRole: "Fullstack Developer", // Default starting point
        settings: {
          decayNotifications: true,
          weeklyReport: true,
        },
      });
    }

    // Issue the JWT
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET as string,
      { expiresIn: "7d" },
    );

    res.status(200).json({
      message: "Authenticated successfully",
      token,
      user,
    });
  } catch (error: any) {
    console.error('OAuth Handshake Error:', error.response?.data || error.message);
    res.status(500).json({ message: 'Authentication failed' });
  }
};
