import { Button } from "@mui/material";

import { FaRegFileAlt } from "react-icons/fa";
import { TbAntennaBars5 } from "react-icons/tb";
import Table from "./Table";

const columns = [
  { header: "Header1", accessor: "header1" },
  { header: "Header2", accessor: "header2" },
  { header: "Header3", accessor: "header3" },
  { header: "Header4", accessor: "header4" },
  { header: "Header5", accessor: "header5" },
];

const data = [
  {
    header1: "Sample1",
    header2: "Sample1",
    header3: "Sample1",
    header4: "Sample1",
    header5: "Sample1",
  },
  {
    header1: "Sample2",
    header2: "Sample1",
    header3: "Sample1",
    header4: "Sample1",
    header5: "Sample1",
  },
  {
    header1: "Sample3",
    header2: "Sample1",
    header3: "Sample1",
    header4: "Sample1",
    header5: "Sample1",
  },
  {
    header1: "Sample4",
    header2: "Sample1",
    header3: "Sample1",
    header4: "Sample1",
    header5: "Sample1",
  },
  {
    header1: "Sample5",
    header2: "Sample1",
    header3: "Sample1",
    header4: "Sample1",
    header5: "Sample1",
  },
];

const DataViewTab = () => {
  return (
    <div className="flex-1 flex flex-col gap-3 overflow-auto p-3 bg-gray-100">
      <div className="bg-white border border-gray-200 rounded p-3">
        <div className="flex justify-between">
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
        <Table columns={columns} data={data} />
      </div>
      <div className="bg-white border border-gray-200 rounded p-3">
        <h6 className="font-semibold">Dose Response Visualization:</h6>
      </div>
    </div>
  );
};

export default DataViewTab;
