const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { normalizeRole } = require("../middleware/authMiddleware");

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

    const token = jwt.sign(
      { id: user._id, role: normalizeRole(user.role) },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: normalizeRole(user.role),
      },
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

    const token = jwt.sign(
      { id: user._id, role: normalizeRole(user.role) },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: normalizeRole(user.role),
      },
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
