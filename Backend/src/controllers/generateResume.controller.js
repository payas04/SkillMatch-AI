import InterviewReport from "../models/interviewReport.model.js";
import { generateResumePdf } from "../services/ai.client.js";
import { getInterviewReportByIdController } from "./getInterviewReportById.controller.js";

export async function generateResumeController(req, res) {
  try {
    const { interviewReportId } = req.params;

    const interviewReport = await InterviewReport.findById(interviewReportId);
    if (!interviewReport) {
      return res.status(404).json({ message: "Interview report not found" });
    }

    const { resume, jobDescription } = interviewReport;
    if (!resume || !jobDescription) {
      return res.status(400).json({
        message: "Interview report is missing resume or job description",
      });
    }

    const pdfBuffer = await generateResumePdf({ resume, jobDescription });

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=resume_${interviewReportId}.pdf`,
      "Content-Length": pdfBuffer.length,
    });
    return res.send(pdfBuffer);
  } catch (err) {
    console.error("generateResumeController error:", err);
    return res.status(500).json({ message: "Failed to generate resume PDF" });
  }
}
