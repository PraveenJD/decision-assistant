import { MdInsights } from "react-icons/md";
import { IoIosArrowDown } from "react-icons/io";
import { useState } from "react";
import { useHomePageContext } from "../../../hooks/HomePageContext";

const sampleSuggestion = [
  "This is sample1.",
  "This is sample2.",
  "This is sample3.",
  "This is sample4.",
  "This is sample5.",
  "This is sample6.",
];

const InsightSuggestionsTab = () => {
  const { setHomePageData } = useHomePageContext();

  const [isOpen, setIsOpen] = useState(true);

  const handleIsOpen = () => setIsOpen((prevVal) => !prevVal);

  const handleSuggestion = (val: string) =>
    setHomePageData?.((prevVal) => ({
      ...prevVal,
      suggestedQuestion: val,
    }));

  return (
    <div className="p-2 bg-white rounded border border-gray-200">
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center font-semibold gap-2">
          <MdInsights size={15} />
          <h6 className="">Insight Suggestion</h6>
        </div>
        <IoIosArrowDown
          size={20}
          className={`cursor-pointer transition-transform duration-50 ${
            isOpen ? "" : "rotate-180"
          }`}
          onClick={handleIsOpen}
        />
      </div>
      {isOpen ? (
        <div className="flex flex-col gap-2">
          {sampleSuggestion.map((data, index) => (
            <p
              className="p-2 bg-blue-100 rounded cursor-pointer transition-colors duration-150 hover:bg-blue-200"
              onClick={() => handleSuggestion(data)}
              key={index}
            >
              {data}
            </p>
          ))}
        </div>
      ) : null}
    </div>
  );
};

export default InsightSuggestionsTab;
