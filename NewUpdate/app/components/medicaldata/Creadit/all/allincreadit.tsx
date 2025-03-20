"use client"; // Ensures this component is client-side rendered

import React, { useEffect, useState, useMemo } from "react";
import PatientComponent from "@/app/components/patient/PatientComponent";
import Link from "next/link";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import axios from "axios";
import CreaditEditModal from "@/app/components/invoice/creaditEditModal";
import { Creadit } from "@/types/creadit"; 
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useSession } from 'next-auth/react';

type InvoiceFormProps = {
  params: {
    id: string;
  };
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "Paid":
      return "text-green-500 bg-green-100";
    case "Pending":
      return "text-yellow-500 bg-yellow-100";
    case "Cancel":
      return "text-red-500 bg-red-100";
    case "Credit":
      return "text-blue-500 bg-blue-100";
    default:
      return "text-gray-500 bg-gray-100";
  }
};

export default function CreaditAll({ params }: InvoiceFormProps) {
  const patientId = params.id;
  const { data: session } = useSession(); 
  const [creadit, setCreadit] = useState<Creadit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedCreadit, setSelectedCreadit] = useState<Creadit | null>(null);

  const role = useMemo(() => session?.user?.role || '', [session]);

  useEffect(() => {
    // Define the fetchInvoices function inside useEffect to avoid redeclaration on every render
    const fetchCreadit = async () => {
      try {
        const response = await fetch(`/api/Creadit/payment/${patientId}`);
        const data = await response.json();
        if (response.ok) {
          setCreadit(data.data);
        } else {
          setError(data.error || "Failed to fetch Creadit");
        }
      } catch (error) {
        setError("Failed to fetch Creadit");
      } finally {
        setLoading(false);
      }
    };

    fetchCreadit();
  }, [patientId]); // patientId is a dependency since it may change

  const handleEdit = (creadit: Creadit) => {
    setSelectedCreadit(creadit);
    setModalVisible(true);
  };

  const handleSave = (updatedInvoice: Partial<Creadit>) => {
    if (!selectedCreadit) return;

    // Update the invoice locally
    setCreadit((prevCreadit) =>
      prevCreadit.map((inv) =>
        inv._id === selectedCreadit._id ? { ...inv, ...updatedInvoice } : inv
      )
    );
    setModalVisible(false);

    // Re-fetch invoices after updating
    const fetchInvoices = async () => {
      try {
        const response = await fetch(`/api/Creadit/payment/${patientId}`);
        const data = await response.json();
        console.log(data)
        if (response.ok) {
          setCreadit(data.data);
        } else {
          setError(data.error || "Failed to fetch invoices");
        }
      } catch (error) {
        setError("Failed to fetch invoices");
      }
    };
    fetchInvoices();
  };
 


const handleDelete = async (creaditId: string) => {
  const confirmDelete = window.confirm(
    "Are you sure you want to delete this credit? This action cannot be undone."
  );

  if (!confirmDelete) {
    return; // Exit if the user cancels the action
  }

  const toastId = toast.loading("Deleting credit...");

  try {
    const response = await axios.delete(`/api/Creadit/payment/detail/${creaditId}`, {
      data: { creaditId },
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.data.success) {
      setCreadit((prevCreadit) =>
        prevCreadit.filter((credit) => credit._id !== creaditId)
      );
      toast.update(toastId, {
        render: "Credit deleted successfully!",
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });
    } else {
      toast.update(toastId, {
        render: response.data.error || "Failed to delete the credit.",
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
      console.error("Failed to delete the credit:", response.data.error);
    }
  } catch (err) {
    toast.update(toastId, {
      render: "An unexpected error occurred while deleting the credit.",
      type: "error",
      isLoading: false,
      autoClose: 3000,
    });
    console.error("Error deleting credit:", err);
  }
};


  if (loading) {
    return <div className="text-center mt-10">Loading...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500 mt-10">{error}</div>;
  }

  return (
    <div className="flex ml-7 mt-7">
      <div className="flex-grow md:ml-60 container mx-auto">
        <div className="flex space-x-4">
          <div className="w-1/3">
            <PatientComponent params={params} />
          </div>
          <div className="w-2/3 bg-white p-8 rounded-lg shadow-md">
            <header className="text-center mb-6">
              <h1 className="text-3xl font-bold">Credit</h1>
            </header>

            <div className="mt-4">
              <div className="flex justify-between">
                <h2 className="text-xl font-semibold mb-4 text-gray-700">Credit</h2>
                {role === 'admin' && (
                  <Link
                    href={`/admin/creadit/add/${patientId}`}
                    className="bg-green-500 text-white mb-4 px-4 py-2 rounded-md hover:bg-green-600"
                  >
                    New Credit +
                  </Link>
                )}
                {role === 'doctor' && (
                  <Link
                    href={`/doctor/creadit/add/${patientId}`}
                    className="bg-green-500 text-white mb-4 px-4 py-2 rounded-md hover:bg-green-600"
                  >
                    New Credit +
                  </Link>
                )}
                  
              </div>
              {creadit.length === 0 ? (
                <p className="text-center text-gray-500">No Credit available for this patient.</p>
              ) : (
                <div className="space-y-4">
                  {creadit.map((creadit) => (
                    <div
                      key={creadit._id}
                      className="p-6 border rounded-lg shadow bg-gray-50 hover:shadow-lg transition-shadow relative"
                    >
              
                        <div className="absolute top-2 right-2 space-x-2">
                        {(role === "doctor" || role === "admin")  && (
                          <EditOutlined
                            onClick={() => handleEdit(creadit)}
                            className="text-blue-500 pr-4 pl-4 cursor-pointer hover:text-blue-700"
                            aria-label="Edit creadit"
                          />)}
                                  {(role === 'admin') && (
                          <DeleteOutlined
                            onClick={() => handleDelete(creadit._id)}
                            className="text-red-500 cursor-pointer hover:text-red-700"
                            aria-label="Delete creadit"
                          />         )}
                        </div>
             

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <strong className="text-gray-700">Credit Date:</strong>{" "}
                          <span className="text-gray-900">
                            {new Date(creadit.creditDate).toLocaleDateString() || "Unknown"}
                          </span>
                        </div>
                        <div>
                          <strong className="text-gray-700">Total Amount:</strong>{" "}
                          <span className="text-gray-900">
                            {creadit.totalAmount ? creadit.totalAmount.toFixed(2) : "0.00"}
                          </span>
                        </div>
                        <div>
                          <strong className="text-gray-700">Total Paid:</strong>{" "}
                          <span className="text-gray-900">
                            {creadit.totalPaid ? creadit.totalPaid.toFixed(2) : "0.00"}
                          </span>
                        </div>
                        <div>
                          <strong className="text-gray-700">Balance:</strong>{" "}
                          <span className="text-gray-900">
                            {creadit.balance ? creadit.balance.toFixed(2) : "0.00"}
                          </span>
                        </div>
                        <div>
                          <strong className="text-gray-700">Current Payment:</strong>{" "}
                          <span className="text-gray-900">{creadit.balance ? creadit.currentPayment.amount.toFixed(2): "0.00"}</span>
                        </div>
                        
                        <div>
                          <strong className="text-gray-700">Created By:</strong>{" "}
                          <span className="text-gray-900">{creadit.createdBy?.username || "Unknown"}</span>
                        </div>
                        <div>
                          <strong className="text-gray-700">Status:</strong>{" "}
                          <span className={`text-sm font-bold py-1 px-3 rounded ${getStatusColor(creadit.status)}`}>
                            {creadit.status}
                          </span>
                        </div>
                      </div>

                      <h3 className="text-md font-semibold text-gray-800 border-b pb-2 mb-4">Items</h3>
                      <div className="overflow-y-auto h-48">
                        <ul className="space-y-3">
                          {creadit?.items.map((item, index) => (
                            <li key={index} className="flex justify-between items-start bg-gray-100 p-3 rounded-lg shadow-sm">
                              <div>
                                <div className="font-medium text-gray-800">
                                  {item.service.service} (x{item.quantity})
                                </div>
                                <div className="text-gray-600">Description: {item.description}</div>
                                <div className="text-gray-600">Price per unit: {item.price ? item.price.toFixed(2) : "0.00"}</div>
                              </div>
                              <span className="text-lg font-bold text-gray-800">
                                {item.totalPrice ? item.totalPrice.toFixed(2) : "0.00"}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <CreaditEditModal
                        visible={isModalVisible}
                        onClose={() => setModalVisible(false)}
                        credit={selectedCreadit}
                        onSave={handleSave}
                        patientId={patientId}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}