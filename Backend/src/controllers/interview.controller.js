import InterviewReport from "../models/interviewReport.model.js";
import pdfParse from "pdf-parse-fork";
import { generateInterviewReport } from "../services/ai.client.js";

export async function generateInterviewReportController(req, res) {
  try {
    const resumeFile = req.file;
    let resumeText = "";
    if (!resumeFile) {
      return res
        .status(400)
        .json({ message: "Resume file (PDF) is required." });
    }

    const resumeContent = await pdfParse(resumeFile.buffer);
    resumeText = resumeContent.text;

    const { selfDescription, jobDescription } = req.body;

    const generateReportByAi = await generateInterviewReport({
      resume: resumeText,
      selfDescription,
      jobDescription,
    });

    const interviewReport = await InterviewReport.create({
      user: req.user.userId,
      resume: resumeText,
      selfDescription,
      jobDescription,
      ...generateReportByAi,
    });

    return res.status(201).json({
      message: "Interview Report Generated Successfully",
      interviewReport,
    });
  } catch (error) {
    console.error("Error generating report:", error);
    return res
      .status(500)
      .json({ message: "Failed to generate report", error: error.message });
  }
}
