import { useState } from "react";

import { WorkspaceEnum } from "./WorkspaceEnum";
import DataViewTab from "./DataViewTab";
import MindMapTab from "./MindMapTab";
import ChatTab from "./ChatTab";

const tabs = Object.values(WorkspaceEnum);

const WorkspaceTab = () => {
  const [activeTab, setActiveTab] = useState(WorkspaceEnum.chat);

  const handleTab = (val: WorkspaceEnum) => setActiveTab(val);

  return (
    <div className="h-full w-1/2 border-x border-gray-300 shadow overflow-auto p-3 flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold">Main Workspace</h3>
        <div className="flex bg-gray-200 px-5 py-3 rounded-xl">
          {tabs.map((tab, index) => (
            <button
              className={`px-3 py-2 cursor-pointer font-semibold text-gray-800  rounded-xl transition-all duration-100 ${
                activeTab === tab ? "bg-white" : ""
              }`}
              onClick={() => handleTab(tab)}
              key={index}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>
      {activeTab === WorkspaceEnum.chat ? <ChatTab /> : null}
      {activeTab === WorkspaceEnum.mindMap ? <MindMapTab /> : null}
      {activeTab === WorkspaceEnum.dataView ? <DataViewTab /> : null}
    </div>
  );
};

export default WorkspaceTab;
