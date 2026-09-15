import express from "express";
import { authUser } from "../middlewares/authMiddleware.js";
import { generateInterviewReportController } from "../controllers/interview.controller.js";
import { upload } from "../middlewares/file.middleware.js";
import { getInterviewReportByIdController } from "../controllers/getInterviewReportById.controller.js";
import { getInterviewReportsController } from "../controllers/getInterviewReports.controller.js";
import { generateResumeController } from "../controllers/generateResume.controller.js";
const interviewRouter = express.Router();

/**
 * @route POST /api/interview
 * @desc Generate an interview report based on the uploaded resume, job description, and self-description
 * @body { resume: File, jobDescription: String, selfDescription: String }
 * @access Private (requires authentication)
 */
interviewRouter.post(
  "/",
  authUser,
  upload.single("resume"),
  generateInterviewReportController,
);

interviewRouter.get(
  "/report/allReports",
  authUser,
  getInterviewReportsController,
);

interviewRouter.get(
  "/report/:interviewId",
  authUser,
  getInterviewReportByIdController,
);

interviewRouter.post(
  "/resume/pdf/:interviewReportId",
  authUser,
  generateResumeController,
);
export { interviewRouter };
