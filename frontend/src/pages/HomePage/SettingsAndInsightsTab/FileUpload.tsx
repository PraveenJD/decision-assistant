import React, { useState, DragEvent } from "react";

import { FiUpload } from "react-icons/fi";
import { FaRegFileAlt } from "react-icons/fa";
import { IoIosArrowDown } from "react-icons/io";
// import { Button } from "@mui/material";
import { FaRegFilePdf } from "react-icons/fa6";
import { FaRegFileWord } from "react-icons/fa";
import * as XLSX from "xlsx";
import mammoth from "mammoth";
import { useHomePageContext } from "../../../hooks/HomePageContext";
import { ExtractedFilesData } from "../../../hooks/HomePageContext/HomePageProvider";
import { Column } from "../WorkspaceTab/DataViewTab/Table";

export type ExtractedFileData = {
  fileName: string;
  columns: Column[];
  data: Record<string, any>[];
};

const FileUpload = () => {
  const { homePageData, setHomePageData } = useHomePageContext();

  const { extractedFilesData } = homePageData || {};

  const [files, setFiles] = useState<File[]>([]);
  const [isOpen, setIsOpen] = useState(true);

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const uploadedFiles = Array.from(event.dataTransfer.files);
    handleFileUpload(uploadedFiles);
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const uploadedFiles = Array.from(event.target.files);
      handleFileUpload(uploadedFiles);
    }
  };

  const handleIsOpen = () => setIsOpen((prevVal) => !prevVal);

  const hasData = (data: ExtractedFilesData) => {
    return (
      data.pdfs.length > 0 ||
      data.excel.length > 0 ||
      data.csv.length > 0 ||
      data.docx.length > 0
    );
  };

  const extractExcelColumnsAndData = (workbook: XLSX.WorkBook) => {
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(sheet, {
      header: 1,
    }) as string[][]; // Assert the type here

    const columns = jsonData[0].map((col: string, idx: number) => ({
      header: col,
      accessor: idx.toString(),
    }));

    const data = jsonData.slice(1).map((row: string[]) =>
      row.reduce((acc: Record<string, any>, val: string, idx: number) => {
        acc[idx.toString()] = val;
        return acc;
      }, {})
    );

    return { columns, data };
  };

  const extractCsvColumnsAndData = (csvData: any) => {
    const columns = csvData[0].map((col: string, idx: number) => ({
      header: col,
      accessor: idx.toString(),
    }));

    const data = csvData.slice(1).map((row: any) =>
      row.reduce((acc: Record<string, any>, val: any, idx: number) => {
        acc[idx.toString()] = val;
        return acc;
      }, {})
    );

    return { columns, data };
  };

  const handleFileUpload = async (uploadedFiles: File[]) => {
    const updatedFiles = [...files, ...uploadedFiles];
    setFiles(updatedFiles);

    const newExtractedData: ExtractedFilesData = {
      pdfs: [],
      excel: [],
      csv: [],
      docx: [],
    };

    const newExtractedFileData: ExtractedFileData[] = [];

    for (const file of uploadedFiles) {
      const ext = file.name.split(".").pop()?.toLowerCase();
      try {
        if (["xlsx", "xls"].includes(ext || "")) {
          const workbook = await extractExcelData(file);
          const extractedFileData = extractExcelColumnsAndData(workbook);

          newExtractedData.excel.push({
            filename: file.name,
            content: workbook,
          });
          newExtractedFileData.push({
            fileName: file.name,
            columns: extractedFileData.columns,
            data: extractedFileData.data,
          });
        } else if (ext === "csv") {
          const csvData = await extractCsvData(file);
          const extractedFileData = extractCsvColumnsAndData(csvData);

          newExtractedData.csv.push({ filename: file.name, content: csvData });
          newExtractedFileData.push({
            fileName: file.name,
            columns: extractedFileData.columns,
            data: extractedFileData.data,
          });
        } else if (ext === "pdf") {
          const pdfText = await extractPdfData(file);
          newExtractedData.pdfs.push({ filename: file.name, content: pdfText });
        } else if (ext === "docx") {
          const docxText = await extractDocxData(file);
          newExtractedData.docx.push({
            filename: file.name,
            content: docxText,
          });
        } else {
          console.warn(`Unsupported file type: ${ext}`);
        }
      } catch (error) {
        console.error(`Error processing file ${file.name}:`, error);
      }
    }

    setHomePageData?.((prevData) => {
      const mergedData: ExtractedFilesData = {
        pdfs: [...(extractedFilesData?.pdfs || []), ...newExtractedData.pdfs],
        excel: [
          ...(extractedFilesData?.excel || []),
          ...newExtractedData.excel,
        ],
        csv: [...(extractedFilesData?.csv || []), ...newExtractedData.csv],
        docx: [...(extractedFilesData?.docx || []), ...newExtractedData.docx],
      };

      return {
        ...prevData,
        tableData: newExtractedFileData,
        hasExtractedFiles: hasData(mergedData),
        extractedFilesData: mergedData,
      };
    });
  };

  // Function to convert file to base64
  const fileToBase64 = (file: File) => {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  // Function to extract text from PDF using Gemini
  const extractPdfData = async (file: File) => {
    try {
      const base64Data = await fileToBase64(file);
      const response = await fetch(
        "https://llmfoundry.straive.com/gemini/v1beta/models/gemini-2.0-flash:generateContent",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InByYXZlZW4ua3VtYXJAZ3JhbWVuZXIuY29tIn0.x396P1tXJBjZaji4y4SFwsWdbiHfcpzNXOfKM64k4qs`,
          },
          body: JSON.stringify({
            system_instruction: {
              parts: [
                { text: "Extract the text content from the provided PDF." },
              ],
            },
            contents: [
              {
                role: "user",
                parts: [
                  {
                    inlineData: {
                      mimeType: "application/pdf",
                      data: base64Data,
                    },
                  },
                ],
              },
            ],
          }),
        }
      );
      const data = await response.json();
      return data.candidates?.[0].content.parts?.[0].text;
    } catch (error: any) {
      console.error("Error extracting PDF:", error);
      throw new Error(`Failed to extract PDF data: ${error.message}`);
    }
  };

  // Function to extract data from Excel files
  const extractExcelData = async (file: File) => {
    const workbook = XLSX.read(new Uint8Array(await file.arrayBuffer()), {
      type: "array",
    });
    return workbook;
  };

  // Function to extract data from CSV files
  const extractCsvData = async (file: File) => {
    const csvData = await file.text();
    const workbook = XLSX.read(csvData, { type: "string" });
    return workbook.SheetNames.map((sheetName) => ({
      sheetName,
      data: XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 }),
    }));
  };

  // Function to extract data from DOCX files
  const extractDocxData = async (file: File) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      return result.value;
    } catch (error: any) {
      console.error("Error extracting DOCX:", error);
      throw new Error(`Failed to extract DOCX data: ${error.message}`);
    }
  };

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
      {isOpen && (
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
            accept=".pdf,.doc,.docx,.xlsx,.xls,.csv"
            multiple
            className="hidden"
            onChange={handleFileChange}
          />

          {files.length > 0 && (
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
                    {/* <Button
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
                    </Button> */}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FileUpload;
