import { useHomePageContext } from "../../../../hooks/HomePageContext";
import MindMapChart from "./MindMapChart";

export type MindmapNode = {
  name: string;
  children: { name: string }[];
};

const MindMapTab = () => {
  const { homePageData } = useHomePageContext();
  const { experts = [] } = homePageData || {};

  console.log(experts);

  const parseMindmap = (input: string): MindmapNode => {
    const lines = input
      .trim()
      .split("\n")
      .map((line) => line.trim());

    if (lines.length < 2) {
      throw new Error(
        "Invalid input format. Second line must contain the root name."
      );
    }

    // Extract name from second line and strip any wrapping (( ))
    const rawName = lines[1];
    const name = rawName.replace(/^\(\(+|\)+$/g, "").trim();

    // Remaining lines become children (starting from index 2)
    const children = lines
      .slice(2)
      .filter(Boolean)
      .map((line) => ({ name: line }));

    return {
      name,
      children,
    };
  };

  return (
    <div className="flex-1 flex flex-col gap-3 overflow-auto p-3 bg-gray-100">
      {experts?.map((expert, index) => (
        <div
          className="bg-white border border-gray-200 rounded p-3"
          key={index}
        >
          <h6 className="font-semibold">{`Mind Map: ${expert.title}`}</h6>
          <MindMapChart data={parseMindmap(expert.mindmap || "")} />
        </div>
      ))}
    </div>
  );
};

export default MindMapTab;
