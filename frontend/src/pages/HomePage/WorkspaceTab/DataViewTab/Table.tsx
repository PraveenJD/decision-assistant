import React from "react";

interface Column {
  header: string;
  accessor: string;
}

interface TableProps {
  columns: Column[];
  data: Record<string, any>[];
}

const Table: React.FC<TableProps> = ({ columns, data }) => {
  return (
    <div className="container mx-auto p-4">
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse border border-gray-300 shadow-sm">
          <thead className="bg-gray-100 border-b border-gray-300">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.accessor}
                  className="px-4 py-2 text-left text-sm font-medium text-gray-700"
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className={`${
                  rowIndex % 2 === 0 ? "bg-white" : "bg-gray-50"
                } hover:bg-gray-100`}
              >
                {columns.map((column) => (
                  <td
                    key={column.accessor}
                    className="px-4 py-2 text-sm text-gray-500 border-t border-gray-300"
                  >
                    {row[column.accessor]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Table;
