"use client";

import { useState, useEffect, useMemo } from "react";
import PatientComponent from "@/app/components/patient/PatientComponent";
import Link from "next/link";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { useSession } from 'next-auth/react';

type HealthInfo = {
  _id: string;
  cardprice: number;
  createdBy?: {
    username: string;
  };
  createdAt: string;
};

type PatientDetailsProps = {
  params: {
    id: string;
  };
};

const CardPage: React.FC<PatientDetailsProps> = ({ params }) => {
  const patientId = params.id;
  const { data: session } = useSession(); // Get session data
  const [healthInfo, setHealthInfo] = useState<HealthInfo[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedFinding, setSelectedFinding] = useState<HealthInfo | null>(null);
  const [editCardPrice, setEditCardPrice] = useState<number | null>(null);
  const role = useMemo(() => session?.user?.role || '', [session]); // Derive role

  useEffect(() => {
    const fetchHealthInfo = async () => {
      setError(null);
      try {
        const response = await fetch(`/api/Invoice/card/${patientId}`, {
          method: "GET",
        });
        const data = await response.json();
        if (response.ok) {
          setHealthInfo(data.data || []);
        } else {
          setError(data.error || "Error fetching health information");
        }
      } catch (err) {
        setError("An error occurred");
      }
    };
    fetchHealthInfo();
  }, [patientId]);

  const handleEdit = (finding: HealthInfo) => {
    setSelectedFinding(finding);
    setEditCardPrice(finding.cardprice);
  };

  const handleDeleteConfirmation = (recordId: string) => {
    toast.warn(
      <div>
        <span>Are you sure you want to delete this Health Information?</span>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "10px" }}>
          <button onClick={() => handleDelete(recordId)}>Yes</button>
          <button onClick={() => toast.dismiss()}>No</button>
        </div>
      </div>,
      {
        position: "top-right",
        autoClose: false,
        closeOnClick: false,
        draggable: false,
      }
    );
  };

  const handleDelete = async (recordId: string) => {
    try {
      const response = await axios.delete(`/api/Invoice/card/detail/${recordId}`, {
        data: { recordId },
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.data.success) {
        setHealthInfo((prevFindings) =>
          prevFindings.filter((healthInfo) => healthInfo._id !== recordId)
        );
        toast.success("Health Information deleted successfully!");
      } else {
        toast.error(response.data.error || "Error deleting Health Information");
      }
    } catch (err) {
      console.error("Error deleting record:", err);
      toast.error("An unexpected error occurred while deleting the record.");
    } finally {
      toast.dismiss();
    }
  };

  const handleUpdateCardPrice = async () => {
    if (selectedFinding && editCardPrice !== null) {
      try {
        const payload = { recordId: selectedFinding._id, cardprice: editCardPrice };
        const response = await axios.patch(`/api/Invoice/card/detail/${selectedFinding._id}`, payload, {
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.data.success) {
          setHealthInfo((prevFindings) =>
            prevFindings.map((info) =>
              info._id === selectedFinding._id ? { ...info, cardprice: editCardPrice } : info
            )
          );
          toast.success("Card price updated successfully!");
          setSelectedFinding(null);
        } else {
          toast.error(response.data.error || "Error updating card price");
        }
      } catch (err) {
        console.error("Error updating card price:", err);
        toast.error("An unexpected error occurred while updating the card price.");
      }
    }
  };

  return (
    <div className="flex m-7">
      <div className="flex-grow md:ml-60 container mx-auto p-4">
        <div className="flex space-x-8">
          <div className="w-1/3 p-4">
            <PatientComponent params={params} />
          </div>
          <div className="w-2/3 bg-white p-6 rounded-lg shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-2xl font-bold">Card Payment</h1>
              {/* Conditionally render links based on role */}
              {role === 'admin' && (
                <>
                  <Link
                    href={`/admin/card/add/${patientId}`}
                    className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
                  >
                    New Card +
                  </Link>
                  <Link
                    href={`/admin/client/edit/${patientId}`}
                    className="bg-green-500 text-white px-2 py-2 rounded-md hover:bg-green-600"
                  >
                    Update Patient Data
                  </Link>
                </>
              )}
              {role === 'reception' && (
                <>
                  <Link
                    href={`/reception/card/add/${patientId}`}
                    className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
                  >
                    New Card +
                  </Link>
                  <Link
                    href={`/reception/client/edit/${patientId}`}
                    className="bg-green-500 text-white px-2 py-2 rounded-md hover:bg-green-600"
                  >
                    Update Patient Data
                  </Link>
                </>
              )}
            </div>

            {/* Error Messages */}
            {error && (
              <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
                <strong>Error:</strong> {error}
              </div>
            )}

            {/* Display Health Information */}
            <div className="space-y-4">
              {healthInfo.length > 0 ? (
                healthInfo.map((info, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg shadow-xl">
                    <h3 className="font-semibold">Card Price: {info.cardprice}</h3>
                    
                    <p className="font-semibold">
                      Date: {new Date(info.createdAt).toLocaleDateString()}
                    </p>
                    <div className="flex justify-start space-x-4 mt-4">
                      <button
                        className="hover:bg-blue-300 p-2 rounded-full"
                        onClick={() => handleEdit(info)}
                        aria-label="Edit card price"
                        title="Edit card price"
                      >
                        <EditOutlined className="text-xl text-blue-500" />
                      </button>
                     
                        <button
                          className="hover:bg-red-300 p-2 rounded-full"
                          onClick={() => handleDeleteConfirmation(info._id)}
                          aria-label="Delete card"
                          title="Delete card"
                        >
                          <DeleteOutlined className="text-xl text-red-500" />
                        </button>
                    
                    </div>
                  </div>
                ))
              ) : (
                <p>No card available.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Card Price Section */}
      {selectedFinding && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Edit Card Price</h2>
            <label className="block text-sm font-medium text-gray-700">Card Price</label>
            <input
              type="number"
              value={editCardPrice || ""}
              onChange={(e) => setEditCardPrice(parseFloat(e.target.value))}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
            />
            <div className="mt-4 flex justify-end space-x-4">
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                onClick={handleUpdateCardPrice}
              >
                Save
              </button>
              <button
                className="bg-gray-300 text-black px-4 py-2 rounded-md hover:bg-gray-400"
                onClick={() => setSelectedFinding(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notifications */}
      <ToastContainer />
    </div>
  );
};

export default CardPage;
