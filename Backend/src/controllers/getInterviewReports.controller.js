import InterviewReport from "../models/interviewReport.model.js";

export async function getInterviewReportsController(req, res) {
  try {
    const userId = req.user.userId;

    const interviewReports = await InterviewReport.find({ user: userId }).sort({
      createdAt: -1,
    });

    res.status(200).json({ interviewReports });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
}
