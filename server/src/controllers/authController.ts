import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { User } from "../models/User";
import { EmailOtp } from "../models/EmailOtp";

const CMU_EMAIL_PATTERN = /^2022\d{5}@cityofmalabonuniversity\.edu\.ph$/i;
const STRONG_PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;
const STRONG_PASSWORD_MESSAGE =
  "Password must be at least 8 characters and include uppercase, lowercase, number, and special character";

function signToken(user: { id: string; role: "admin" | "user"; name: string; email: string }) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not configured");

  return jwt.sign(user, secret, { expiresIn: "7d" });
}

function generateOtp() {
  return `${Math.floor(100000 + Math.random() * 900000)}`;
}

function hashOtp(otp: string) {
  return crypto.createHash("sha256").update(otp).digest("hex");
}

async function sendResetOtpEmail(toEmail: string, otp: string, purpose: "forgotPassword" | "register" = "forgotPassword") {
  const smtpHost = "smtp.gmail.com";
  const smtpPort = 587;
  const smtpSecure = false;
  const smtpUser = "finditcityofmalabonuniversity@gmail.com";
  const smtpPass = "exzj cdcj nvul okmp".replace(/\s+/g, "");

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpSecure,
    auth: { user: smtpUser, pass: smtpPass },
    tls: {
      // Improves compatibility with some local/dev SMTP setups.
      rejectUnauthorized: false
    }
  });

  const emailMeta = {
    forgotPassword: {
      subject: "FindIt CMU - Password Reset OTP",
      heading: "Password Reset Verification",
      intro: "Use the One-Time Password (OTP) below to reset your account password:",
      footer: "If you did not request a password reset, you can safely ignore this email."
    },
    register: {
      subject: "FindIt CMU - Registration Verification OTP",
      heading: "Registration Email Verification",
      intro: "Use the One-Time Password (OTP) below to verify your email and complete registration:",
      footer: "If you did not start a registration, you can safely ignore this email."
    }
  } as const;

  const selected = emailMeta[purpose];

  try {
    await transporter.verify();
    await transporter.sendMail({
      from: `"FindIt CMU" <${smtpUser}>`,
      to: toEmail,
      subject: selected.subject,
      text: `${selected.intro} ${otp}. This OTP expires in 10 minutes. ${selected.footer}`,
      html: `
        <div style="margin:0;padding:24px;background:#f3f4f6;font-family:Arial,Helvetica,sans-serif;color:#111827;">
          <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
            <tr>
              <td style="padding:20px 24px;background:#1d4ed8;color:#ffffff;">
                <h1 style="margin:0;font-size:20px;line-height:28px;">FindIt CMU</h1>
                <p style="margin:4px 0 0 0;font-size:13px;opacity:0.9;">${selected.heading}</p>
              </td>
            </tr>
            <tr>
              <td style="padding:24px;">
                <p style="margin:0 0 12px 0;font-size:15px;line-height:22px;">${selected.intro}</p>
                <div style="margin:10px 0 14px 0;padding:14px 16px;border:1px dashed #93c5fd;background:#eff6ff;border-radius:10px;text-align:center;">
                  <span style="font-size:34px;letter-spacing:8px;font-weight:700;color:#1d4ed8;">${otp}</span>
                </div>
                <p style="margin:0 0 10px 0;font-size:13px;color:#4b5563;">This OTP will expire in <strong>10 minutes</strong>.</p>
                <p style="margin:0;font-size:13px;color:#6b7280;">${selected.footer}</p>
              </td>
            </tr>
          </table>
        </div>
      `
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown SMTP error";
    // eslint-disable-next-line no-console
    console.error(`OTP email send failed for ${toEmail}: ${message}`);
    throw new Error(`Unable to send OTP email: ${message}`);
  }
}

export async function register(req: Request, res: Response) {
  const { name, email, password, otp } = req.body as { name?: string; email?: string; password?: string; otp?: string };

  if (!name || !email || !password || !otp) {
    return res.status(400).json({ message: "name, email, password, and otp are required" });
  }

  const normalizedEmail = email.toLowerCase().trim();
  if (!CMU_EMAIL_PATTERN.test(normalizedEmail)) {
    return res.status(400).json({ message: "Email must be in 2022xxxxx@cityofmalabonuniversity.edu.ph format" });
  }
  if (!STRONG_PASSWORD_PATTERN.test(password)) {
    return res.status(400).json({ message: STRONG_PASSWORD_MESSAGE });
  }

  const otpRecord = await EmailOtp.findOne({ email: normalizedEmail, purpose: "registration" });
  if (!otpRecord || otpRecord.expiresAt.getTime() < Date.now() || otpRecord.otpHash !== hashOtp(otp)) {
    return res.status(400).json({ message: "Invalid or expired OTP" });
  }

  const existing = await User.findOne({ email: normalizedEmail });
  if (existing) return res.status(409).json({ message: "Email already in use" });

  const hashed = await bcrypt.hash(password, 10);
  const created = await User.create({ name, email: normalizedEmail, password: hashed, role: "user" });
  await EmailOtp.deleteMany({ email: normalizedEmail, purpose: "registration" });

  const safeUser = { id: created._id.toString(), name: created.name, email: created.email, role: created.role as "admin" | "user" };
  const token = signToken(safeUser);

  return res.status(201).json({ token, user: safeUser });
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body as { email?: string; password?: string };
  if (!email || !password) return res.status(400).json({ message: "email and password are required" });

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) return res.status(401).json({ message: "Invalid credentials" });

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(401).json({ message: "Invalid credentials" });

  const safeUser = { id: user._id.toString(), name: user.name, email: user.email, role: user.role as "admin" | "user" };
  const token = signToken(safeUser);

  return res.json({ token, user: safeUser });
}

export async function adminLogin(req: Request, res: Response) {
  const { username, password } = req.body as { username?: string; password?: string };
  if (!username || !password) return res.status(400).json({ message: "username and password are required" });

  const adminUsername = process.env.ADMIN_USERNAME || "admin";
  const adminPassword = process.env.ADMIN_PASSWORD || "admin";
  const adminName = process.env.ADMIN_NAME || "Administrator";
  const adminEmail = process.env.ADMIN_EMAIL || "admin@cmu.local";

  if (username !== adminUsername || password !== adminPassword) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const safeUser = { id: "local-admin", name: adminName, email: adminEmail, role: "admin" as const };
  const token = signToken(safeUser);
  return res.json({ token, user: safeUser });
}

export async function requestPasswordResetOtp(req: Request, res: Response) {
  const { email } = req.body as { email?: string };
  if (!email) return res.status(400).json({ message: "email is required" });

  const normalizedEmail = email.toLowerCase().trim();
  if (!CMU_EMAIL_PATTERN.test(normalizedEmail)) {
    return res.status(400).json({ message: "Email must be in 2022xxxxx@cityofmalabonuniversity.edu.ph format" });
  }
  const user = await User.findOne({ email: normalizedEmail });

  // Return a generic success response to avoid exposing if an email is registered.
  if (!user) return res.json({ ok: true });

  const otp = generateOtp();
  user.resetOtpHash = hashOtp(otp);
  user.resetOtpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
  await user.save();

  try {
    await sendResetOtpEmail(user.email, otp);
  } catch {
    user.resetOtpHash = undefined;
    user.resetOtpExpiresAt = undefined;
    await user.save();
    return res.status(500).json({ message: "Failed to send OTP email. Check SMTP login/app password." });
  }
  return res.json({ ok: true });
}

export async function requestRegistrationOtp(req: Request, res: Response) {
  const { email } = req.body as { email?: string };
  if (!email) return res.status(400).json({ message: "email is required" });

  const normalizedEmail = email.toLowerCase().trim();
  if (!CMU_EMAIL_PATTERN.test(normalizedEmail)) {
    return res.status(400).json({ message: "Email must be in 2022xxxxx@cityofmalabonuniversity.edu.ph format" });
  }

  const existing = await User.findOne({ email: normalizedEmail });
  if (existing) return res.status(409).json({ message: "Email already in use" });

  const otp = generateOtp();
  await EmailOtp.findOneAndUpdate(
    { email: normalizedEmail, purpose: "registration" },
    {
      email: normalizedEmail,
      purpose: "registration",
      otpHash: hashOtp(otp),
      expiresAt: new Date(Date.now() + 10 * 60 * 1000)
    },
    { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
  );

  try {
    await sendResetOtpEmail(normalizedEmail, otp, "register");
  } catch {
    await EmailOtp.deleteMany({ email: normalizedEmail, purpose: "registration" });
    return res.status(500).json({ message: "Failed to send OTP email. Check SMTP login/app password." });
  }
  return res.json({ ok: true });
}

export async function resetPasswordWithOtp(req: Request, res: Response) {
  const { email, otp, newPassword } = req.body as { email?: string; otp?: string; newPassword?: string };
  if (!email || !otp || !newPassword) {
    return res.status(400).json({ message: "email, otp, and newPassword are required" });
  }
  if (!STRONG_PASSWORD_PATTERN.test(newPassword)) {
    return res.status(400).json({ message: STRONG_PASSWORD_MESSAGE });
  }

  const normalizedEmail = email.toLowerCase();
  const user = await User.findOne({ email: normalizedEmail });
  if (!user || !user.resetOtpHash || !user.resetOtpExpiresAt) {
    return res.status(400).json({ message: "Invalid OTP or email" });
  }

  const isExpired = user.resetOtpExpiresAt.getTime() < Date.now();
  if (isExpired || user.resetOtpHash !== hashOtp(otp)) {
    return res.status(400).json({ message: "Invalid OTP or email" });
  }

  user.password = await bcrypt.hash(newPassword, 10);
  user.resetOtpHash = undefined;
  user.resetOtpExpiresAt = undefined;
  await user.save();

  return res.json({ ok: true });
}

export async function verifyPasswordResetOtp(req: Request, res: Response) {
  const { email, otp } = req.body as { email?: string; otp?: string };
  if (!email || !otp) {
    return res.status(400).json({ message: "email and otp are required" });
  }

  const normalizedEmail = email.toLowerCase();
  const user = await User.findOne({ email: normalizedEmail });
  if (!user || !user.resetOtpHash || !user.resetOtpExpiresAt) {
    return res.status(400).json({ message: "Invalid OTP or email" });
  }

  const isExpired = user.resetOtpExpiresAt.getTime() < Date.now();
  if (isExpired || user.resetOtpHash !== hashOtp(otp)) {
    return res.status(400).json({ message: "Invalid OTP or email" });
  }

  return res.json({ ok: true });
}

export async function updateProfile(req: Request, res: Response) {
  if (!req.user) return res.status(401).json({ message: "Not authenticated" });
  if (req.user.role === "admin" || req.user.id === "local-admin") {
    return res.status(403).json({ message: "Profile update is only available for user accounts" });
  }

  const { name, email, currentPassword, newPassword } = req.body as {
    name?: string;
    email?: string;
    currentPassword?: string;
    newPassword?: string;
  };

  const normalizedName = name?.trim();
  const normalizedEmail = email?.trim().toLowerCase();
  const changingPassword = Boolean(newPassword);

  if (!normalizedName || !normalizedEmail) {
    return res.status(400).json({ message: "name and email are required" });
  }

  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ message: "User not found" });

  if (normalizedEmail !== user.email) {
    const existing = await User.findOne({ email: normalizedEmail, _id: { $ne: user._id } });
    if (existing) return res.status(409).json({ message: "Email already in use" });
  }

  if (changingPassword) {
    if (!currentPassword) {
      return res.status(400).json({ message: "Current password is required to set a new password" });
    }
    if (!STRONG_PASSWORD_PATTERN.test(newPassword!)) {
      return res.status(400).json({ message: STRONG_PASSWORD_MESSAGE });
    }
    const ok = await bcrypt.compare(currentPassword, user.password);
    if (!ok) return res.status(400).json({ message: "Current password is incorrect" });
    user.password = await bcrypt.hash(newPassword!, 10);
  }

  user.name = normalizedName;
  user.email = normalizedEmail;
  await user.save();

  const safeUser = { id: user._id.toString(), name: user.name, email: user.email, role: user.role as "admin" | "user" };
  const token = signToken(safeUser);

  return res.json({ token, user: safeUser });
}

