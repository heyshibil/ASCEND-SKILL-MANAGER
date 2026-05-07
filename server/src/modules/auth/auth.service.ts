import jwt from "jsonwebtoken";
import crypto from "crypto";
import argon2 from "argon2";
import axios from "axios";
import { User } from "../../models/User.js";
import { sendEmail } from "../../config/email.js";
import { AppError } from "../../middlewares/error.middleware.js";
import type { RegisterInput, LoginInput } from "./auth.validation.js";

// -- JWT Helper --
const generateJWT = (userId: string): string => {
  return jwt.sign({ userId }, process.env.JWT_SECRET as string, {
    expiresIn: "7d",
  });
};

// -- Github OAuth --
export const handleGithubAuth = async (code: string) => {
  // Exchange code for access token
  const tokenResponse = await axios.post(
    "https://github.com/login/oauth/access_token",
    {
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
    },
    { headers: { Accept: "application/json" } },
  );

  const githubToken = tokenResponse.data.access_token;

  if (!githubToken) {
    throw new AppError("Failed to get access token from GitHub", 401);
  }

  // Get github profile
  const { data: profile } = await axios.get("https://api.github.com/user", {
    headers: { Authorization: `Bearer ${githubToken}` },
  });

  // Find or create user
  let user = await User.findOne({ githubId: profile.id.toString() });
  let isNewUser = false;

   if (user && user.status === "blocked") {
    throw new AppError("Your account is suspended. Please contact support.", 403);
  }

  if (!user) {
    isNewUser = true;

    user = await User.create({
      authProvider: "github",
      githubId: profile.id.toString(),
      username: profile.login,
      email: profile.email || `${profile.login}@users.noreply.github.com`,
      avatarUrl: profile.avatar_url,
      isEmailVerified: true, // #Github emails are already verified
      onboardingStatus: "pending_scan",
      careerGoal: "Fullstack Developer",
    });
  }

  // Generate JWT token
  const token = generateJWT(user._id!.toString());
  return { user, token, isNewUser, accessToken: githubToken };
};

// hash email verfication token
const hashToken = (token: string) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

const escapeRegex = (value: string): string => {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

// -- Manual Register --
export const registerUser = async (input: RegisterInput) => {
  // Check email exists
  const existingUser = await User.findOne({ email: input.email });

  if (existingUser) {
    throw new AppError("An account with this email already exists", 409);
  }

  const existingUsername = await User.findOne({
    username: { $regex: `^${escapeRegex(input.username)}$`, $options: "i" },
  })
    .select("_id")
    .lean();

  if (existingUsername) {
    throw new AppError("This username is already taken", 409);
  }

  // Hash password
  const hashedPassword = await argon2.hash(input.password);

  // Generate email verfication token
  const verificationToken = crypto.randomBytes(32).toString("hex");
  const hashedVerficationToken = hashToken(verificationToken);
  const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); //24h

  // Create User
  const user = await User.create({
    authProvider: "manual",
    username: input.username,
    email: input.email,
    password: hashedPassword,
    careerGoal: input.careerGoal,
    isEmailVerified: false,
    emailVerificationToken: hashedVerficationToken,
    emailVerificationExpires: verificationExpires,
    onboardingStatus: "pending_discovery", //manual user skip scan
  });

  // Send verification email
  const verifyUrl = `${process.env.CLIENT_URL}/verify-email/${verificationToken}`;
  await sendEmail({
    to: input.email,
    subject: "Verify your Ascend account",
    html: `
<div style="font-family:'DM Sans',sans-serif;max-width:480px;margin:0 auto;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
  <div style="background:#2563EB;padding:2rem 2.5rem 1.75rem;">
    <span style="font-size:15px;font-weight:500;color:rgba(255,255,255,0.9);letter-spacing:0.08em;text-transform:uppercase;">Ascend</span>
  </div>
  <div style="padding:2rem 2.5rem;background:#ffffff;">
    <p style="font-size:20px;font-weight:500;color:#111827;margin:0 0 0.75rem;">Verify your email</p>
    <p style="font-size:14px;color:#6b7280;line-height:1.6;margin:0 0 1.75rem;">One click to activate your account. This link is only valid for 24 hours.</p>
    <a href="${verifyUrl}" style="display:block;background:#2563EB;color:#ffffff;text-align:center;padding:0.8rem 1.5rem;border-radius:8px;font-size:14px;font-weight:500;text-decoration:none;">Verify my email →</a>
    <hr style="border:none;border-top:1px solid #f3f4f6;margin:1.75rem 0;">
    <p style="font-size:11px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.07em;margin:0 0 0.4rem;">Or copy this link</p>
    <p style="font-size:12px;color:#6b7280;word-break:break-all;font-family:monospace;line-height:1.5;margin:0;">${verifyUrl}</p>
  </div>
  <div style="padding:1rem 2.5rem 1.5rem;background:#ffffff;">
    <p style="font-size:12px;color:#9ca3af;margin:0;">⏱ Expires in 24 hours · If you didn't create an account, ignore this email.</p>
  </div>
</div>
`,
  });

  // Generate JWT token
  const token = generateJWT(user._id!.toString());
  return { user, token };
};

// -- Manual Login --
export const loginUser = async (input: LoginInput) => {
  const user = await User.findOne({ email: input.email }).select("+password");

  if (!user || user.authProvider !== "manual" || !user.password) {
    throw new AppError("Invalid email or password", 401);
  }

  if (user.status === "blocked") {
    throw new AppError(
      "Your account is suspended. Please contact support.",
      403,
    );
  }

  // Prevent login for not verified users
  if (!user.isEmailVerified) {
    throw new AppError(
      "Please check your email and verify your account before logging in.",
      403,
    );
  }

  const isPasswordValid = await argon2.verify(user.password, input.password);

  if (!isPasswordValid) {
    throw new AppError("Invalid email or password", 401);
  }

  const token = generateJWT(user._id!.toString());

  // protect password from sending back
  user.password = undefined;
  return { user, token };
};

//  -- Email Verification --
export const verifyUserEmail = async (token: string) => {
  const user = await User.findOne({
    emailVerificationToken: hashToken(token),
    emailVerificationExpires: { $gt: new Date() },
  });

  if (!user) {
    throw new AppError("Invalid or expired verification link", 400);
  }

  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save();

  // Generate token for direct login
  const jwtToken = generateJWT(user._id!.toString());

  return { message: "Email verified successfully", token: jwtToken, user };
};

// ---- Get Current User ----
export const getCurrentUser = async (userId: string) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (!user.isEmailVerified && user.authProvider === "manual") {
    throw new AppError("Please verify your email first", 403);
  }

  return user;
};
