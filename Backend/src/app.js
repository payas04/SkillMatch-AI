import express from "express";
import authRouter from "./routes/auth.routes.js";
import cookieParser from "cookie-parser";
import passport from "./config/passport.js";
import cors from "cors";
import { interviewRouter } from "./routes/interview.routes.js";

//Remember to fix username  issues in backend and fronetend

// Initialize express app
const app = express();
// REQUIRED for cookies over HTTPS behind Render's reverse proxy
app.set("trust proxy", 1);

// Enable CORS for requests from the frontend
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);
// Parse incoming JSON requests
app.use(express.json());
// Parse cookies from incoming requests
app.use(cookieParser());
// Initialize Passport.js for authentication
app.use(passport.initialize());

app.use("/api/auth", authRouter);
app.use("/api/interview", interviewRouter);
export default app;
