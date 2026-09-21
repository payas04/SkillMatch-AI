import { Router } from "express";
import {
  forgotPasswordController,
  getMeController,
  googleCallbackController,
  loginUserController,
  logoutUserController,
  refreshTokenController,
  registerUserController,
  resendVerificationEmailController,
  resetPasswordController,
  verifyEmailController,
} from "../controllers/auth.controller.js";
import passport from "passport";
import { authUser } from "../middlewares/authMiddleware.js";
import {
  emailSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from "../zod/auth.schema.js";
import { validate } from "../middlewares/validate.js";

const authRouter = Router();

authRouter.post("/register", validate(registerSchema), registerUserController);
authRouter.post("/login", validate(loginSchema), loginUserController);

authRouter.post("/verify-email", validate(verifyEmailSchema), verifyEmailController);
authRouter.post(
  "/resend-verification",
  validate(emailSchema),
  resendVerificationEmailController,
);

authRouter.post(
  "/forgot-password",
  validate(emailSchema),
  forgotPasswordController,
);
authRouter.post(
  "/reset-password",
  validate(resetPasswordSchema),
  resetPasswordController,
);

authRouter.post("/logout", logoutUserController);
authRouter.get("/refresh-token", refreshTokenController);
authRouter.get("/get-me", authUser, getMeController);

authRouter.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  }),
);

authRouter.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${process.env.CLIENT_URL}/login?error=oauth_error`,
  }),
  googleCallbackController,
);

export default authRouter;
