"use client";

import { useState, useEffect } from "react";
import DataTable from "@/app/components/ui/TableComponent";
import axios from "axios";

interface Doctor {
  _id: string;
  username: string;
}

interface ServiceStat {
  _id: string;
  serviceName: string;
  totalUsageCount: number;
  totalRevenue: number;
}

const FetchStatic = () => {
  const [createdBy, setCreatedBy] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [rankByUsage, setRankByUsage] = useState<ServiceStat[]>([]);
  const [rankByRevenue, setRankByRevenue] = useState<ServiceStat[]>([]);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await axios.get("/api/Doctor");
        if (response.data && Array.isArray(response.data)) {
          setDoctors(response.data);
        } else {
          console.error("Invalid doctor data format");
        }
      } catch (error) {
        console.error("Error fetching doctors:", error);
      }
    };

    fetchDoctors();
  }, []);

  const handleFetchTransactions = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!createdBy && (!startDate || !endDate)) {
      setErrorMessage("Either a doctor or both start and end dates are required.");
      return;
    }

    try {
      const response = await fetch("/api/statics/rankservice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          createdBy,
          startDate,
          endDate,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setRankByUsage(data.data.rankByUsage);
        console.log(data.data.rankByUsage)
        setRankByRevenue(data.data.rankByRevenue);
        console.log(data.data.rankByRevenue)
      } else {
        setErrorMessage(data.message || "Invalid data.");
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
      setErrorMessage("Failed to fetch transactions. Please try again.");
    }
  };

  return (
    <div className="flex mt-7">
      <div className="flex-grow md:ml-60 container mx-auto">
        <div className="p-6 bg-white rounded shadow-md">
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">Transaction Report</h1>
          <form onSubmit={handleFetchTransactions} className="mb-4">
            <div className="mb-4">
              <label htmlFor="doctor" className="block text-sm font-medium text-gray-700">
                Doctor Name:
              </label>
              <select
                id="doctor"
                className="border rounded-md w-full p-2"
                value={createdBy}
                onChange={(e) => setCreatedBy(e.target.value)}
              >
                <option value="">-- Select Doctor --</option>
                {doctors.map((doctor) => (
                  <option key={doctor._id} value={doctor._id}>
                    {doctor.username}
                  </option>
                ))}
              </select>
            </div>
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
              Fetch Transactions
            </button>
          </form>
          {errorMessage && <p className="text-red-500">{errorMessage}</p>}
          
          {/* Render Rank by Usage */}
          {rankByUsage.length > 0 && (
            <div className="mb-4">
              <h2 className="font-bold text-lg">Services Ranked by Usage</h2>
              <DataTable
                data={rankByUsage}
                columns={[
                  {
                    key: "serviceName",
                    header: "Service Name",
                    render: (stat: ServiceStat) => stat.serviceName, // render function added
                  },
                  {
                    key: "totalUsageCount",
                    header: "Total Usage Count",
                    render: (stat: ServiceStat) => stat.totalUsageCount, // render function added
                  },
                ]}
              />
            </div>
          )}

          {/* Render Rank by Revenue */}
          {rankByRevenue.length > 0 && (
            <div className="mb-4">
              <h2 className="font-bold text-lg">Services Ranked by Revenue</h2>
              <DataTable
                data={rankByRevenue}
                columns={[
                  {
                    key: "serviceName",
                    header: "Service Name",
                    render: (stat: ServiceStat) => stat.serviceName, // render function added
                  },
                  {
                    key: "totalRevenue",
                    header: "Total Revenue",
                    render: (stat: ServiceStat) => `${stat.totalRevenue.toFixed(2)}`, // render function added
                  },
                ]}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FetchStatic;
