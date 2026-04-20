const User = require("../models/User");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const { normalizeRole } = require("../middleware/authMiddleware");

const RESET_PASSWORD_SUCCESS_MESSAGE = "If an account exists for that email, a password reset link has been sent.";

const buildUserPayload = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: normalizeRole(user.role),
});

const signAuthToken = (user) => jwt.sign(
  { id: user._id, role: normalizeRole(user.role) },
  process.env.JWT_SECRET,
  { expiresIn: "1d" }
);

const hashResetToken = (token) => crypto.createHash("sha256").update(token).digest("hex");

const createResetTransport = () => nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: String(process.env.SMTP_SECURE).toLowerCase() === "true",
  auth: process.env.SMTP_USER && process.env.SMTP_PASS
    ? {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      }
    : undefined,
});

exports.register = async (req, res) => {
  try {
    // Also extract role from req.body
    const { name, email, password, role } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists with that email" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Default unknown role input to STUDENT while preserving explicit ADMIN registration.
    const finalRole = normalizeRole(role) === "ADMIN" ? "ADMIN" : "STUDENT";

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: finalRole
    });

    const token = signAuthToken(user);

    res.status(201).json({
      token,
      user: buildUserPayload(user),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = signAuthToken(user);

    res.json({
      token,
      user: buildUserPayload(user),
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body || {};

    if (!email) {
      return res.status(200).json({ message: RESET_PASSWORD_SUCCESS_MESSAGE });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(200).json({ message: RESET_PASSWORD_SUCCESS_MESSAGE });
    }

    const rawToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = hashResetToken(rawToken);
    user.resetPasswordExpire = Date.now() + 30 * 60 * 1000;
    await user.save();

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const resetUrl = `${frontendUrl.replace(/\/$/, "")}/reset-password/${rawToken}`;

    try {
      const transporter = createResetTransport();
      await transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: user.email,
        subject: "Reset your Smart Placement password",
        text: `Use this link to reset your password. It expires in 30 minutes: ${resetUrl}`,
        html: `
          <p>Use the link below to reset your Smart Placement password.</p>
          <p>This link expires in 30 minutes.</p>
          <p><a href="${resetUrl}">Reset password</a></p>
        `,
      });
    } catch (emailError) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();
      return res.status(500).json({ message: "Failed to send password reset email" });
    }

    return res.status(200).json({ message: RESET_PASSWORD_SUCCESS_MESSAGE });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { password } = req.body || {};

    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }

    const resetPasswordToken = hashResetToken(req.params.token);
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    const token = signAuthToken(user);

    return res.json({
      token,
      user: buildUserPayload(user),
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
