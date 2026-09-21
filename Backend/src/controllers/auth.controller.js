import crypto from "crypto";
import mongoose from "mongoose";
import userModel from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {
  generateAccessAndRefreshTokens,
  generateAccessToken,
} from "../utils/generateTokens.js";
import {
  sendPasswordResetEmail,
  sendVerificationEmail,
} from "../utils/email.js";

const refreshTokenCookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: "none",
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: "/",
};

const hashToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

const createVerificationCode = () => {
  const code = crypto.randomInt(100000, 1000000).toString();
  return {
    code,
    hash: hashToken(code),
  };
};

async function registerUserController(req, res) {
  try {
    const { email, username, password } = req.body;

    const isUserAlreadyExists = await userModel.findOne({
      $or: [{ username }, { email }],
    });

    if (isUserAlreadyExists) {
      if (isUserAlreadyExists.email === email) {
        return res.status(409).json({ message: "Account already exist" });
      }
      if (isUserAlreadyExists.username === username) {
        return res.status(409).json({
          message: "Account already exist with this username",
        });
      }
    }

    const { code, hash } = createVerificationCode();
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await userModel.create({
      username,
      email,
      password: hashedPassword,
      emailVerified: false,
      emailVerificationCodeHash: hash,
      emailVerificationExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });

    try {
      await sendVerificationEmail(email, username, code);
    } catch (emailError) {
      await userModel.findByIdAndDelete(newUser._id);
      throw emailError;
    }

    return res.status(201).json({
      message: "Registration successful. Please verify your email.",
      email,
    });
  } catch (error) {
    console.error("Error in registerUserController", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

async function loginUserController(req, res) {
  try {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Account does not exist" });
    }

    if (!user.password) {
      return res.status(400).json({
        message:
          "This account was registered using Google. Please sign in with Google.",
      });
    }

    if (user.emailVerified !== true) {
      return res.status(403).json({
        message: "Please verify your email before signing in.",
      });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(400).json({
        message: "You have entered wrong password ",
      });
    }

    const { accessToken, refreshToken } =
      await generateAccessAndRefreshTokens(user._id, email);

    user.refreshToken = refreshToken;
    await user.save();

    res.cookie("refreshToken", refreshToken, refreshTokenCookieOptions);

    return res.status(200).json({
      message: "User Logged-in Successfully",
      accessToken,
      user: {
        id: user._id,
        username: user.username,
        email,
      },
    });
  } catch (error) {
    console.error("Error in loginUserController", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

async function verifyEmailController(req, res) {
  try {
    const { email, code } = req.body;
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid verification code" });
    }

    if (user.emailVerified) {
      return res.status(200).json({ message: "Email is already verified" });
    }

    if (
      !user.emailVerificationCodeHash ||
      !user.emailVerificationExpiresAt ||
      user.emailVerificationExpiresAt < new Date() ||
      !crypto.timingSafeEqual(
        Buffer.from(user.emailVerificationCodeHash, "hex"),
        Buffer.from(hashToken(code), "hex"),
      )
    ) {
      return res.status(400).json({
        message: "Invalid or expired verification code",
      });
    }

    user.emailVerified = true;
    user.emailVerificationCodeHash = undefined;
    user.emailVerificationExpiresAt = undefined;
    await user.save();

    return res.status(200).json({
      message: "Email verified successfully. You can now sign in.",
    });
  } catch (error) {
    console.error("Error in verifyEmailController", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

async function resendVerificationEmailController(req, res) {
  try {
    const { email } = req.body;
    const user = await userModel.findOne({ email });

    if (!user || user.emailVerified || !user.password) {
      return res.status(200).json({
        message: "If the account needs verification, a new code has been sent.",
      });
    }

    const { code, hash } = createVerificationCode();

    user.emailVerificationCodeHash = hash;
    user.emailVerificationExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    await sendVerificationEmail(user.email, user.username, code);

    return res.status(200).json({
      message: "If the account needs verification, a new code has been sent.",
    });
  } catch (error) {
    console.error("Error in resendVerificationEmailController", error);
    return res.status(200).json({
      message: "If the account needs verification, a new code has been sent.",
    });
  }
}

async function forgotPasswordController(req, res) {
  const genericResponse = {
    message:
      "If an account with that email exists, a password reset link has been sent.",
  };

  try {
    const { email } = req.body;
    const user = await userModel.findOne({ email });

    if (!user || !user.password) {
      return res.status(200).json(genericResponse);
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    user.passwordResetTokenHash = hashToken(resetToken);
    user.passwordResetExpiresAt = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    const clientUrl = process.env.CLIENT_URL;
    const resetUrl = `${clientUrl}/reset-password?token=${resetToken}`;

    try {
      await sendPasswordResetEmail(user.email, user.username, resetUrl);
    } catch (emailError) {
      console.error("Error sending password reset email", emailError);
    }

    return res.status(200).json(genericResponse);
  } catch (error) {
    console.error("Error in forgotPasswordController", error);
    return res.status(200).json(genericResponse);
  }
}

async function resetPasswordController(req, res) {
  try {
    const { token, password } = req.body;
    const tokenHash = hashToken(token);

    const user = await userModel.findOne({
      passwordResetTokenHash: tokenHash,
      passwordResetExpiresAt: { $gt: new Date() },
    });

    if (!user || !user.password) {
      return res.status(400).json({
        message: "Invalid or expired password reset link.",
      });
    }

    user.password = await bcrypt.hash(password, 10);
    user.passwordResetTokenHash = undefined;
    user.passwordResetExpiresAt = undefined;
    user.refreshToken = undefined;
    await user.save();

    return res.status(200).json({
      message: "Password reset successfully. You can now sign in.",
    });
  } catch (error) {
    console.error("Error in resetPasswordController", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

async function logoutUserController(req, res) {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (refreshToken) {
      await userModel.findOneAndUpdate(
        { refreshToken },
        { $unset: { refreshToken: 1 } },
      );
    }

    res.clearCookie("refreshToken", refreshTokenCookieOptions);
    return res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Error in LogoutUserController", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

async function googleCallbackController(req, res) {
  try {
    const user = req.user;

    if (!user) {
      throw new Error("Google authentication failed: user not found");
    }

    user.emailVerified = true;
    user.emailVerificationCodeHash = undefined;
    user.emailVerificationExpiresAt = undefined;
    const { accessToken, refreshToken } = generateAccessAndRefreshTokens(
      user._id,
      user.email,
    );

    user.refreshToken = refreshToken;
    await user.save();

    res.cookie("refreshToken", refreshToken, refreshTokenCookieOptions);

    const clientUrl = process.env.CLIENT_URL;
    return res.redirect(`${clientUrl}/oauth-success?token=${accessToken}`);
  } catch (error) {
    console.error("Error in googleCallbackController", error);
    const clientUrl = process.env.CLIENT_URL;
    return res.redirect(`${clientUrl}/login?error=oauth_error`);
  }
}

async function refreshTokenController(req, res) {
  try {
    const incomingRefreshToken = req.cookies.refreshToken;

    if (!incomingRefreshToken) {
      return res.status(401).json({ message: "No Token" });
    }

    let decoded;
    try {
      decoded = jwt.verify(
        incomingRefreshToken,
        process.env.REFRESH_TOKEN_SECRET,
      );
    } catch (err) {
      return res.status(403).json({
        message: "Invalid or expired refresh token",
      });
    }

    const user = await userModel.findById(decoded.userId);

    if (!user || user.refreshToken !== incomingRefreshToken) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const newAccessToken = generateAccessToken(user._id, user.email);
    return res.status(200).json({ accessToken: newAccessToken });
  } catch (error) {
    console.error("Error in refreshTokenController", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

async function getMeController(req, res) {
  const user = await userModel
    .findById(req.user.userId)
    .select("-password -refreshToken");

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  return res.status(200).json({ user });
}

export {
  registerUserController,
  loginUserController,
  verifyEmailController,
  resendVerificationEmailController,
  forgotPasswordController,
  resetPasswordController,
  googleCallbackController,
  logoutUserController,
  refreshTokenController,
  getMeController,
};
