import mongoose from "mongoose";

const userSchema = mongoose.Schema({
  username: {
    type: String,
    unique: [true, "Username already taken"],
    required: true,
  },
  email: {
    type: String,
    unique: [true, "Account Already Exist With This Email Address"],
    required: true,
  },
  password: {
    type: String,
  },
  refreshToken: {
    type: String,
  },
  googleId: {
    type: String,
  },
  provider: {
    type: String,
    default: "local",
  },
  emailVerified: {
    type: Boolean,
    default: false,
  },
  emailVerificationCodeHash: {
    type: String,
  },
  emailVerificationExpiresAt: {
    type: Date,
  },
  passwordResetTokenHash: {
    type: String,
  },
  passwordResetExpiresAt: {
    type: Date,
  },
});

const userModel = mongoose.model("users", userSchema);

export default userModel;
