import { ReactNode, useState } from "react";

import * as XLSX from "xlsx";

import { HomePageContext } from "./useHomePage";
import { ExtractedFileData } from "../../pages/HomePage/SettingsAndInsightsTab/FileUpload";

export type Expert = {
  name: string;
  title: string;
  specialty: string;
  background: string;
  questions: string[];
  answers: string[];
  summary: string;
  questionsAndAnswers: { question: string; answer: string }[];
  mermaid: string;
  mindmap?: string;
};
export type Chat = {
  isUser: boolean;
  message: string;
};

const defaultChatVal = [
  {
    isUser: false,
    message:
      "Welcome to the Drug Development Assistant. I've loaded your clinical trial data.",
  },
];

type HomePageProviderProps = {
  children: ReactNode;
};

export type ExtractedFilesData = {
  pdfs: { filename: string; content: string }[];
  excel: { filename: string; content: XLSX.WorkBook }[];
  csv: { filename: string; content: any }[];
  docx: { filename: string; content: string }[];
};

type InsightQuestions = {
  text: string;
  context: string;
};

export type HomePageType = {
  loadingMessage?: string;
  experts?: Expert[];
  chat?: Chat[];
  suggestedQuestion?: string;
  extractedFilesData?: ExtractedFilesData;
  hasExtractedFiles?: boolean;
  insightQuestions?: InsightQuestions[];
  tableData?: ExtractedFileData[];
};

export const homePageDefaultValues = {
  loadingMessage: "",
  experts: [],
  chat: defaultChatVal,
  suggestedQuestion: "",
  extractedFilesData: {
    pdfs: [],
    excel: [],
    csv: [],
    docx: [],
  },
  hasExtractedFiles: false,
  insightQuestions: [],
  tableData: [],
};

export const HomePageProvider = ({ children }: HomePageProviderProps) => {
  const [homePageData, setHomePageData] = useState<HomePageType>(
    homePageDefaultValues
  );

  return (
    <HomePageContext.Provider value={{ homePageData, setHomePageData }}>
      {children}
    </HomePageContext.Provider>
  );
};
