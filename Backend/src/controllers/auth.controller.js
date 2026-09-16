import mongoose from "mongoose";
import userModel from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {
  generateAccessAndRefreshTokens,
  generateAccessToken,
} from "../utils/generateTokens.js";

const isProduction = process.env.NODE_ENV === "production"; //check env for development stage
const refreshTokenCookieOptions = {
  // Secure (HTTPS) is required in production, but turned off for localhost HTTP
  httpOnly: true,
  // 'none' is required for cross-domain cookies in production, 'lax' works for localhost
  secure: isProduction,
  // 'none' is required for cross-domain cookies in production, 'lax' works for localhost
  sameSite: isProduction ? "none" : "lax",
  partitioned: isProduction,
  maxAge: 7 * 24 * 60 * 60 * 1000, //7 Days
};
/**
 * @name registerUserController
 * @description register a new user, exports username, email and password
 * @access public
 */
async function registerUserController(req, res) {
  try {
    const { email, username, password } = req.body;

    const isUserAlreadyExists = await userModel.findOne({
      $or: [{ username }, { email }],
    });

    if (isUserAlreadyExists) {
      if (isUserAlreadyExists.email === email) {
        return res.status(409).json({
          message: "Account already exist",
        });
      }
      if (isUserAlreadyExists.username === username) {
        return res.status(409).json({
          message: "Account already exist with this username",
        });
      }
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await userModel.create({
      username,
      email,
      password: hashedPassword,
    });

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
      newUser._id,
      newUser.email,
    );
    //save refresh token to DB
    newUser.refreshToken = refreshToken;
    await newUser.save();
    //setting refresh token as HTTP cookie

    res.cookie("refreshToken", refreshToken, refreshTokenCookieOptions);

    return res.status(200).json({
      message: "User Registered Successfully",
      accessToken,
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
      },
    });
  } catch (error) {
    console.error("Error in regusterUserController", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
/**
 *@name loginUserController
 *@description Takes email and password from body
 *@access public
 */
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
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res
        .status(400)
        .json({ message: "You have entered wrong password " });
    }
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
      user._id,
      email,
    );
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

/**
 * @name logoutUserController
 * @description Log out user and clear cookie and add token to blacklist
 * @access public
 */
async function logoutUserController(req, res) {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (refreshToken) {
      await userModel.findOneAndUpdate(
        { refreshToken },
        { $unset: { refreshToken: 1 } }, //Removes refresh token, and we can give any value instead of 1  it dosent matter
      );
    }
    //clear http cookie
    res.clearCookie("refreshToken", refreshTokenCookieOptions);
    return res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Error in LogoutUserController", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

/**
 *@name googleCallbackController
 *@description req.user is already attached and generates tokens and redirects to frontend
 *@access public
 */
async function googleCallbackController(req, res) {
  try {
    const user = req.user; //attahced by passport

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
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

/**
 * @name refreshTokenController
 * @description Refreshes the access token using a valid refresh token from cookies.
 *              Verifies the refresh token, checks if it matches the one stored in the DB,
 *              and issues a new access token if valid.
 * @access public
 */
async function refreshTokenController(req, res) {
  try {
    const incomingRefreshToken = req.cookies.refreshToken;
    //check if refresh token is present in cookies
    if (!incomingRefreshToken) {
      return res.status(401).json({ message: "No Token" });
    }
    //verify if its valid and not expired
    let decoded;
    try {
      decoded = jwt.verify(
        incomingRefreshToken,
        process.env.REFRESH_TOKEN_SECRET,
      );
    } catch (err) {
      return res
        .status(403)
        .json({ message: "Invalid or expired refresh token" });
    }
    //check if it matches the one in DB
    const user = await userModel.findById(decoded.userId);
    if (!user || user.refreshToken !== incomingRefreshToken) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    //generate new access token
    const newAccessToken = generateAccessToken(user._id, user.email);
    return res.status(200).json({ accessToken: newAccessToken });
  } catch (error) {
    console.error("Error in refreshTokenController", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

/**
 * @name getMeController
 * @description Retrieves the authenticated user's information based on the access token.
 *              The access token is verified by the authUser middleware, which attaches the user object to req.user.
 * @access Public (requires valid access token)
 */
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
  googleCallbackController,
  logoutUserController,
  refreshTokenController,
  getMeController,
};
