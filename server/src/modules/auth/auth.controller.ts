import type { Request, Response, NextFunction } from "express";
import { scanQueue } from "../../queues/scan.queue.js";
import { registerSchema, loginSchema } from "./auth.validation.js";
import * as authService from "./auth.service.js";
import { setTokenCookie } from "../../utils/setTokenCookie.js";

export const githubCallback = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { code } = req.query;

    if (!code || typeof code !== "string") {
      res
        .status(400)
        .json({ success: false, message: "Authorization code missing" });
      return;
    }

    const { user, token, isNewUser, accessToken } =
      await authService.handleGithubAuth(code);

    // Queue GitHub scan for new users
    if (isNewUser) {
      await scanQueue.add(`initial_scan_${user._id}`, {
        userId: user._id,
        accessToken,
        username: user.username,
      });
    }

    setTokenCookie(res, token);

    res.redirect(`${process.env.CLIENT_URL}/dashboard`);
  } catch (error: any) {
    next(error);
  }
};

// Register
export const register = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const validatedData = registerSchema.parse(req.body);
    const result = await authService.registerUser(validatedData);

    setTokenCookie(res, result.token);

    res.status(201).json({
      success: true,
      message: "Account created. Please check your email to verify.",
      token: result.token,
      user: result.user,
    });
  } catch (error) {
    next(error);
  }
};

// Login
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const validatedData = loginSchema.parse(req.body);
    const result = await authService.loginUser(validatedData);

    setTokenCookie(res, result.token);

    res.status(200).json({
      success: true,
      message: "Login successful",
      token: result.token,
      user: result.user,
    });
  } catch (error) {
    next(error);
  }
};

// Logout
export const logout = async (req: Request, res: Response) => {
  res.cookie("token", "", { httpOnly: true, expires: new Date(0) });
  res.status(200).json({ success: true, message: "Logged out" });
};

// Verify Email
export const verifyEmail = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { token } = req.params;

    if (typeof token !== "string") {
      return res.status(400).json({ message: "Invalid or missing token" });
    }

    const result = await authService.verifyUserEmail(token);

    // set the cookie, so that the user can logged in
    setTokenCookie(res, result.token);

    // redirect to react app /discovery
    res.redirect(`${process.env.CLIENT_URL}/discovery`)


    res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

// getMe
export const getMe = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = await authService.getCurrentUser(req.userId!);

    res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};
