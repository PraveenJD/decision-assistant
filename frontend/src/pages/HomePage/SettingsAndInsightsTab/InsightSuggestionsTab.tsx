import { useState } from "react";

import { MdInsights } from "react-icons/md";
import { IoIosArrowDown } from "react-icons/io";
import { FaRegArrowAltCircleLeft } from "react-icons/fa";

import { useHomePageContext } from "../../../hooks/HomePageContext";

const InsightSuggestionsTab = () => {
  const { homePageData, setHomePageData } = useHomePageContext();

  const { insightQuestions = [] } = homePageData || {};

  const [isOpen, setIsOpen] = useState(true);

  const handleIsOpen = () => setIsOpen((prevVal) => !prevVal);

  const handleSuggestion = (val: string) =>
    setHomePageData?.((prevVal) => ({
      ...prevVal,
      suggestedQuestion: val,
    }));

  return (
    <>
      {insightQuestions.length > 0 ? (
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
              {insightQuestions?.map((data, index) => (
                <div
                  className="flex flex-col gap-1 p-2 bg-blue-100 rounded cursor-pointer border border-blue-300 hover:border-blue-500 transition-colors duration-150 hover:bg-blue-200"
                  onClick={() => handleSuggestion(data.text)}
                  key={index}
                >
                  <FaRegArrowAltCircleLeft className="text-xl text-blue-600" />
                  <p>{data.text}</p>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </>
  );
};

export default InsightSuggestionsTab;
