import { api } from "./api";
export const interviewService = {
  generateReport: async (jobDescription, selfDescription, resumeFile) => {
    const formData = new FormData();
    formData.append("jobDescription", jobDescription);
    formData.append("selfDescription", selfDescription);
    if (resumeFile) formData.append("resume", resumeFile);

    const res = await api.post("/interview", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    console.log("Backend response data:", res.data);
    return res.data;
  },

  getReportById: (id) =>
    api.get(`/interview/report/${id}`).then((res) => res.data),
  getAllReports: () =>
    api.get("/interview/report/allReports").then((res) => res.data),

  generateResumePdf: (interviewReportId) =>
    api
      .post(
        `/interview/resume/pdf/${interviewReportId}`,
        {},
        {
          responseType: "blob", //responseType: "blob" is used to handle binary data (like PDF files) in the response
        },
      )
      .then((res) => res.data),
};
