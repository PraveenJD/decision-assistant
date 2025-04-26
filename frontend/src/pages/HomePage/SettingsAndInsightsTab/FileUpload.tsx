import React, { useState, DragEvent } from "react";

import { FiUpload } from "react-icons/fi";
import { FaRegFileAlt } from "react-icons/fa";
import { IoIosArrowDown } from "react-icons/io";
import { Button } from "@mui/material";
import { FaRegFilePdf } from "react-icons/fa6";
import { FaRegFileWord } from "react-icons/fa";

const FileUpload: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [isOpen, setIsOpen] = useState(true);

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const uploadedFiles = Array.from(event.dataTransfer.files);
    setFiles((prevFiles) => [...prevFiles, ...uploadedFiles]);
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const uploadedFiles = Array.from(event.target.files);
      setFiles((prevFiles) => [...prevFiles, ...uploadedFiles]);
    }
  };

  const handleIsOpen = () => setIsOpen((prevVal) => !prevVal);

  return (
    <div className="p-2 bg-white rounded border border-gray-200">
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center font-semibold gap-2">
          <FaRegFileAlt size={15} />
          <h6 className="">File Management</h6>
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
        <div>
          <div
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className="border-2 border-dashed border-gray-400 rounded-lg px-6 py-6 text-center cursor-pointer hover:border-blue-500 transition text-gray-400 flex flex-col items-center"
            onClick={() => document.getElementById("fileInput")?.click()}
          >
            <FiUpload size={26} />
            <p className="text-gray-600 font-medium">
              Drag and drop files here, or click to upload
            </p>
          </div>
          <input
            id="fileInput"
            type="file"
            accept=".pdf,.doc,.docx"
            multiple
            className="hidden"
            onChange={handleFileChange}
          />

          {files.length > 0 ? (
            <div className="mt-6">
              <h3 className="text-lg font-semibold">Uploaded Files:</h3>
              <ul className="mt-2 space-y-2">
                {files.map((file, index) => (
                  <li
                    key={index}
                    className="flex items-center justify-between mb-5 rounded-lg"
                  >
                    <div className="flex items-center gap-1">
                      {file.type === "application/pdf" ? (
                        <FaRegFilePdf className="text-red-600" />
                      ) : (
                        <FaRegFileWord className="text-blue-600" />
                      )}
                      <span className="text-gray-700">{file.name}</span>
                    </div>
                    {/* <span className="text-sm text-gray-500">
                    {(file.size / 1024).toFixed(2)} KB
                  </span> */}
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
                      Index
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};

export default FileUpload;
