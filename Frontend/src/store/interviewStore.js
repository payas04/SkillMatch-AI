import { create } from "zustand";
import { interviewService } from "../services/interviewService";

export const useInterviewStore = create((set, get) => ({
  report: null,
  reports: [],
  loading: false,
  isGeneratingResume: false,

  generateReport: async (jd, selfDesc, file) => {
    set({ loading: true });
    try {
      const data = await interviewService.generateReport(jd, selfDesc, file);
      const report = data.interviewReport || data.report || data;
      set({ report, loading: false });
      return report;
    } catch (err) {
      set({ loading: false });
      throw err;
    }
  },

  fetchReportById: async (id) => {
    if (get().report?._id === id) return get().report;

    set({ loading: true });
    try {
      const data = await interviewService.getReportById(id);
      const report = data.interviewReport || data.report || data;
      set({ report, loading: false });
      return report;
    } catch (err) {
      set({ loading: false });
      throw err;
    }
  },

  fetchAllReports: async () => {
    set({ loading: true });
    try {
      const data = await interviewService.getAllReports();
      const reports = data.interviewReports || data.report || data;
      set({ reports, loading: false });
      return reports;
    } catch (err) {
      set({ loading: false });
      throw err;
    }
  },
  getResumePdf: async (interviewReportId) => {
    set({ isGeneratingResume: true });
    try {
      const blobData =
        await interviewService.generateResumePdf(interviewReportId);

      // Ensure blobData is treated as a Blob
      const blob =
        blobData instanceof Blob
          ? blobData
          : new Blob([blobData], { type: "application/pdf" });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `resume_${interviewReportId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to download resume PDF:", err);
      throw err;
    } finally {
      set({ isGeneratingResume: false });
    }
  },
}));
