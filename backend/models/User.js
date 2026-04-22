const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["STUDENT", "ADMIN"],
    default: "STUDENT",
    set: (value) => (typeof value === "string" ? value.toUpperCase() : value),
  },
  resetPasswordToken: {
    type: String,
  },
  resetPasswordExpire: {
    type: Date,
  },
});

userSchema.pre("validate", function normalizeRoleBeforeValidation(next) {
  if (typeof this.role === "string") {
    this.role = this.role.toUpperCase();
  }

  next();
});

module.exports = mongoose.model("User", userSchema);
