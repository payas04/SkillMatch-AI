import mongoose from "mongoose";
import InterviewReport from "../models/interviewReport.model.js";

export async function getInterviewReportByIdController(req, res) {
  try {
    const { interviewId } = req.params;

    // Validate the id format before hitting the DB
    if (!mongoose.Types.ObjectId.isValid(interviewId)) {
      return res.status(400).json({ message: "Invalid interview report ID" });
    }

    const interviewReport = await InterviewReport.findById(interviewId);

    if (!interviewReport) {
      return res.status(404).json({ message: "Report not found" });
    }

    // Ownership check — make sure this report belongs to the logged-in user
    if (interviewReport.user.toString() !== req.user.userId) {
      return res
        .status(403)
        .json({ message: "Not authorized to view this report" });
    }

    res.status(200).json({ interviewReport });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
}
