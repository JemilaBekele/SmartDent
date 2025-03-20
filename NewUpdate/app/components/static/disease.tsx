"use client";

import { useState,useMemo } from "react";
import axios from "axios";
import DataTable from "@/app/components/ui/TableComponent";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
interface DiseaseStat {
  _id: string; // Disease name
  stats: {
    gender: string;
    ageGroup: string;
    count: number;
  }[];
}

const DiseaseStatistics = () => {
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [statistics, setStatistics] = useState<DiseaseStat[]>([]);
  const { data: session } = useSession();
  const role = useMemo(() => session?.user?.role || "", [session]);
 
  const handleFetchStatistics = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!startDate || !endDate) {
      setErrorMessage("Both start date and end date are required.");
      return;
    }

    try {
      const response = await axios.post("/api/statics/disease", {
        startDate,
        endDate,
      });

      if (response.data.success) {
        setStatistics(response.data.data);
        console.log(response.data.data)
      } else {
        setErrorMessage(response.data.message || "Invalid data.");
      }
    } catch (error) {
      console.error("Error fetching statistics:", error);
      setErrorMessage("Failed to fetch data. Please try again.");
    }
  };

  const handleExportToExcel = () => {
    if (statistics.length === 0) {
      alert("No data available for export.");
      return;
    }
  
    // Define header row based on the format
    const headerRow = [
      "Disease Name",
      "Male, <1 year",
      "Male, 1-4 years",
      "Male, 5-14 years",
      "Male, 15-29 years",
      "Male, 30-64 years",
      "Female, <1 year",
      "Female, 1-4 years",
      "Female, 5-14 years",
      "Female, 15-29 years",
      "Female, 30-64 years",
    ];
  
    type DiseaseRow = {
        [key: string]: string | number; // Keys are dynamic, values are either string or number
      };
    
      const excelData: DiseaseRow[] = [];
  
    statistics.forEach((disease) => {
      // Initialize a row for the current disease
      const diseaseRow: DiseaseRow = {
        "Disease Name": disease._id,
        "Male, <1 year": 0,
        "Male, 1-4 years": 0,
        "Male, 5-14 years": 0,
        "Male, 15-29 years": 0,
        "Male, 30-64 years": 0,
        "Female, <1 year": 0,
        "Female, 1-4 years": 0,
        "Female, 5-14 years": 0,
        "Female, 15-29 years": 0,
        "Female, 30-64 years": 0,
      };
  
      disease.stats.forEach((stat) => {
        // Format ageGroup to match keys in diseaseRow
        const formattedAgeGroup =
          stat.ageGroup === "<1" ? "<1 year" : `${stat.ageGroup} years`;
  
        // Construct the column key
        const columnKey = `${stat.gender.charAt(0).toUpperCase() + stat.gender.slice(1)}, ${formattedAgeGroup}`;
  
        // Assign the count to the correct column if it exists
        if (diseaseRow[columnKey] !== undefined) {
          diseaseRow[columnKey] = stat.count;
        } else {
          console.warn(`Column key not found in diseaseRow: ${columnKey}`);
        }
      });
  
      console.log("Updated Row:", diseaseRow); // Debugging: Check each row
      excelData.push(diseaseRow);
    });
  
    console.log("Final Excel Data:", excelData); // Debugging: Check the final data
  
    // Create worksheet and workbook
    const worksheet = XLSX.utils.json_to_sheet(excelData, { header: headerRow });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Disease Statistics");
  
    // Export to Excel file
    XLSX.writeFile(workbook, "Disease_Statistics.xlsx");
  };
  
  
  
  
  return (
    <div className="flex mt-7">
      <div className="flex-grow md:ml-60 container mx-auto">
      {["admin"].includes(role) && (
      <a
    href= {`/${role}/Disease/all`}
     className="mt-5  py-2 px-4 inline-block"
  >
    <Button type="button"  className="bg-gray-300 px-4 py-2 rounded">All Disease</Button>
  </a>)}
        <div className="p-6 bg-white rounded shadow-md">
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
            Disease Statistics Report
          </h1>
          <form onSubmit={handleFetchStatistics} className="mb-4">
            <div className="flex gap-4 mb-4">
              <div className="flex-1">
                <label htmlFor="startDate">Start Date:</label>
                <input
                  type="date"
                  className="border rounded-md w-full p-2"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="flex-1">
                <label htmlFor="endDate">End Date:</label>
                <input
                  type="date"
                  className="border rounded-md w-full p-2"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
            <button type="submit" className="bg-gray-500 text-white rounded-md py-2 px-4">
              Fetch Statistics
            </button>
          </form>
          {errorMessage && <p className="text-red-500">{errorMessage}</p>}

          {/* Render Statistics */}
          {statistics.length > 0 && (
            <div className="mt-6">
              {statistics.map((disease) => (
                <div key={disease._id} className="mb-6">
                  <h2 className="font-bold text-xl">{disease._id}</h2>
                  <DataTable
                    data={disease.stats}
                    columns={[
                      {
                        key: "gender",
                        header: "Gender",
                        render: (stat) => stat.gender,
                      },
                      {
                        key: "ageGroup",
                        header: "Age Group",
                        render: (stat) => stat.ageGroup,
                      },
                      {
                        key: "count",
                        header: "Count",
                        render: (stat) => stat.count,
                      },
                    ]}
                  />
                </div>
              ))}
               <button
                className="bg-green-500 text-white mt-4 py-2 px-4 rounded-md"
                onClick={handleExportToExcel}
              >
                Export to Excel
              </button>
            </div>
            
          )}
        </div>
      </div>
    </div>
  );
};

export default DiseaseStatistics;
