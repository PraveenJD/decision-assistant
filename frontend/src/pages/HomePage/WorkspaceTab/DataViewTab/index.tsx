import { Button } from "@mui/material";

import { FaRegFileAlt } from "react-icons/fa";
import { TbAntennaBars5 } from "react-icons/tb";
import Table from "./Table";
import { useHomePageContext } from "../../../../hooks/HomePageContext";

const DataViewTab = () => {
  const { homePageData } = useHomePageContext();
  const { tableData = [] } = homePageData || {};

  return (
    <div className="flex-1 flex flex-col gap-3 overflow-auto p-3 bg-gray-100">
      <div className="bg-white border border-gray-200 rounded p-3">
        <div className="flex justify-between mb-5">
          <h6 className="font-semibold">Cohort B Data Summary</h6>
          <div className="flex gap-3">
            <Button
              color="inherit"
              style={{
                textTransform: "none",
                fontWeight: 600,
                fontFamily: `"Poppins", sans-serif`,
              }}
              size="small"
              variant="contained"
            >
              <FaRegFileAlt />
              View raw
            </Button>
            <Button
              color="inherit"
              style={{
                textTransform: "none",
                fontWeight: 600,
                fontFamily: `"Poppins", sans-serif`,
              }}
              size="small"
              variant="contained"
            >
              <TbAntennaBars5 size={18} />
              Visualize
            </Button>
          </div>
        </div>
        {tableData.length > 0 ? (
          <div className="flex flex-col gap-5">
            {tableData?.map((data, index) =>
              data.data.length > 0 ? (
                <Table
                  columns={data.columns}
                  data={data.data}
                  tableHeader={data.fileName}
                  key={index}
                />
              ) : null
            )}
          </div>
        ) : null}
      </div>
      {/* <div className="bg-white border border-gray-200 rounded p-3">
        <h6 className="font-semibold">Dose Response Visualization:</h6>
      </div> */}
    </div>
  );
};

export default DataViewTab;
