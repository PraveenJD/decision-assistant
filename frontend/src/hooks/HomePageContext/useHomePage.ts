import { createContext, Dispatch, SetStateAction, useContext } from "react";

import { HomePageType } from "./HomePageProvider";

type HomePageContextType = {
  homePageData?: HomePageType;
  setHomePageData?: Dispatch<SetStateAction<HomePageType>>;
};

export const HomePageContext = createContext<HomePageContextType>({});

const useHomePageContext = () => {
  const context = useContext(HomePageContext);

  if (!context) {
    throw new Error("This hook should be used inside UserProvider.");
  }
  return context;
};

export default useHomePageContext;
