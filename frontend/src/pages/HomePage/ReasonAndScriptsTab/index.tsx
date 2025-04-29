import { useEffect, useRef } from "react";

import { useHomePageContext } from "../../../hooks/HomePageContext";

const ReasonAndScriptsTab = () => {
  const { homePageData } = useHomePageContext();
  const { experts = [] } = homePageData || {};

  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [experts]);

  return (
    <div className="h-full w-1/4 bg-gray-50 p-3 flex flex-col">
      <h3 className="font-semibold mb-3">Raw Reasoning & Scripts</h3>
      <div className="flex-1 bg-white rounded border border-gray-200 overflow-auto py-2 px-3">
        {experts?.map((expert, index) => (
          <div
            className="border-b border-gray-400 pb-3 mb-3 flex flex-col gap-2"
            key={index}
          >
            <p className="text-sm">
              <span className="font-semibold">Background: </span>
              {expert.background}
            </p>
            <div className="border-l-4 border-amber-500">
              {expert?.questionsAndAnswers?.map((data, qaIndex) => (
                <p className="text-sm pl-2" key={qaIndex}>
                  <span className="font-semibold">{data.question}</span>
                  <br />
                  {data.answer}
                </p>
              ))}
            </div>
            <p className="text-sm pl-5">
              <span className="font-semibold">Summary: </span>
              {expert.summary}
            </p>
          </div>
        ))}
        <div ref={endRef} />
        {/* dummy div ensures scrolling to bottom */}
      </div>
    </div>
  );
};

export default ReasonAndScriptsTab;
