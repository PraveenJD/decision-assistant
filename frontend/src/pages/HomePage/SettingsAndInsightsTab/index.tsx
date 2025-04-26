import FileUpload from "./FileUpload";
import InsightSuggestionsTab from "./InsightSuggestionsTab";

const SettingsAndInsightsTab = () => {
  return (
    <div className="h-full w-1/4 bg-gray-50 p-3 flex flex-col gap-3 overflow-auto">
      <h3 className="font-semibold">Settings & Insights</h3>
      <FileUpload />
      <InsightSuggestionsTab />
    </div>
  );
};

export default SettingsAndInsightsTab;
