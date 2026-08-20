import { create } from 'zustand'

interface TalentStore {
  pdfFile: File | null
  analysisData: any | null // Will type strictly later
  setResumeData: (file: File, data: any) => void
  clearData: () => void
}

export const useTalentStore = create<TalentStore>((set) => ({
  pdfFile: null,
  analysisData: null,
  setResumeData: (file, data) => set({ pdfFile: file, analysisData: data }),
  clearData: () => set({ pdfFile: null, analysisData: null }),
}))
