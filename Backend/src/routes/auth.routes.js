import { Router } from "express";
import {
  getMeController,
  googleCallbackController,
  loginUserController,
  logoutUserController,
  refreshTokenController,
  registerUserController,
} from "../controllers/auth.controller.js";
import passport from "passport";
import { authUser } from "../middlewares/authMiddleware.js";
import { loginSchema, registerSchema } from "../zod/auth.schema.js";
import { validate } from "../middlewares/validate.js";

const authRouter = Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user with username, email, and password.
 *          Hashes the password, creates the user in the DB, and issues
 *          an access token (response body) + refresh token (httpOnly cookie).
 * @access  Public
 */
authRouter.post("/register", validate(registerSchema), registerUserController);

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate an existing user with email and password.
 *          Verifies credentials, then issues an access token (response body)
 *          + refresh token (httpOnly cookie).
 * @access  Public
 */
authRouter.post("/login", validate(loginSchema), loginUserController);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user clear cookie, and add token to blacklist
 * @access  Public
 */
authRouter.post("/logout", logoutUserController);

/**
 * @route   GET /api/auth/refresh-token
 * @desc    Refresh the access token using a valid refresh token.
 *          Verifies the refresh token from the httpOnly cookie, then issues
 *          a new access token (response body) + refresh token (httpOnly cookie).
 * @access  Public
 */
authRouter.get("/refresh-token", refreshTokenController);

/**
 * @route   GET /api/auth/get-me
 * @desc    Get the current authenticated user's information.
 * @access  Private
 */
authRouter.get("/get-me", authUser, getMeController);

/**
 * @route   GET /api/auth/google
 * @desc    Initiates the Google OAuth 2.0 flow by redirecting the user
 *          to Google's consent screen, requesting access to their
 *          basic profile and email.
 * @access  Public
 */
authRouter.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  }),
);

/**
 * @route   GET /api/auth/google/callback
 * @desc    Callback URL Google redirects to after the user grants/denies
 *          consent. Passport exchanges the auth code for the user's
 *          Google profile, finds or creates the corresponding user in
 *          the DB, and attaches it to req.user. On success, control
 *          passes to googleCallbackController, which issues the app's
 *          own access + refresh tokens. On failure, redirects to /login.
 * @access  Public
 */
authRouter.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${process.env.CLIENT_URL}/login?error=oauth_error`,
  }),
  googleCallbackController,
);
export default authRouter;
