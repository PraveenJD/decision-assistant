import ReasonAndScriptsTab from "./ReasonAndScriptsTab";
import SettingsAndInsightsTab from "./SettingsAndInsightsTab";
import WorkspaceTab from "./WorkspaceTab";
import { HomePageProvider } from "../../hooks/HomePageContext/HomePageProvider";

const HomePage = () => {
  return (
    <HomePageProvider>
      <div className="h-full p-5 relative">
        <div className="h-full border border-gray-300 rounded shadow flex">
          <ReasonAndScriptsTab />
          <WorkspaceTab />
          <SettingsAndInsightsTab />
        </div>
      </div>
    </HomePageProvider>
  );
};

export default HomePage;
