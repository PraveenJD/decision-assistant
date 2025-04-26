import { ReactNode, useState } from "react";

import { HomePageContext } from "./useHomePage";

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

export type HomePageType = {
  loadingMessage?: string;
  experts?: Expert[];
  chat?: Chat[];
  suggestedQuestion?: string;
};

type HomePageProviderProps = {
  children: ReactNode;
};

export const homePageDefaultValues = {
  loadingMessage: "",
  experts: [],
  chat: defaultChatVal,
  suggestedQuestion: "",
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
