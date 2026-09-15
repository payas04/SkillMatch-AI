import express from "express";
import authRouter from "./routes/auth.routes.js";
import cookieParser from "cookie-parser";
import passport from "./config/passport.js";
import cors from "cors";
import { interviewRouter } from "./routes/interview.routes.js";

//Remember to fix username  issues in backend and fronetend

// Initialize express app
const app = express();
// Enable CORS for requests from the frontend
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
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
