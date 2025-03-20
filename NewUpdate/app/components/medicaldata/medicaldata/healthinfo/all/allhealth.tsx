"use client";

import React, { useState, useEffect, useMemo } from "react";
import PatientComponent from "@/app/components/patient/PatientComponent";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import axios from "axios";
import EditHealthRecordModal from "@/app/components/patient/EditHealthRecordModal";
import Link from "next/link";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useSession } from 'next-auth/react';
// Align the types for consistency
 export type MedicalRecordData = {
  _id: string;
  bloodgroup: string;
  weight: string;
  Medication:string;
  height: string;
  allergies: string;
  habits: string;
  Core_Temperature: string;
  Respiratory_Rate: string;
  Blood_Oxygen: string;
  Blood_Pressure: string;
  heart_Rate: string;
  createdAt?: string;
  updatedAt?: string;
  Hypotension:string;
  Tuberculosis:string;
  Astema:string;
  Diabetics:string;
  Hepatitis:string;
  BleedingTendency:string;
  Epilepsy:string
  description:string;
  userinfo: Array<{
    BloodPressure: boolean;
    Hypotension: boolean;
    Diabetics: boolean;
    BleedingTendency: boolean;
    Tuberculosis: boolean;
    Epilepsy: boolean;
    Hepatitis: boolean;
    Allergies: boolean;
    Asthma: boolean;
    IfAnydrugstaking: boolean;
    Pregnancy: boolean;
    IfanyotherDiseases: string;
  }>;
  changeHistory?: { updatedBy: { username: string }; updateTime: string }[];
  createdBy?: { username: string };
};

type MedicalFindingFormProps = {
  params: {
    id: string;
  };
};

export default function MedicalFindingForm({ params }: MedicalFindingFormProps) {
  const patientId = params.id;
  const { data: session } = useSession();
  const [existingMedicalFindings, setExistingMedicalFindings] = useState<MedicalRecordData[]>([]);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedFinding, setSelectedFinding] = useState<MedicalRecordData | null>(null);
  const role = useMemo(() => session?.user?.role || '', [session]);
  useEffect(() => {
    async function fetchMedicalFindings() {
      try {
        const response = await fetch(`/api/patient/healthInfo/${patientId}`);
        
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const result = await response.json();
        if (result.success) {
          console.log(result.data)
          setExistingMedicalFindings(result.data);
        } else {
          console.error("No data found:", result.message);
        }
      } catch (error) {
        console.error("Error fetching medical findings:", error);
      }
    }

    fetchMedicalFindings();
  }, [patientId]);

  const handleEdit = (finding: MedicalRecordData) => {
    const updatedFinding = { ...finding };
    setSelectedFinding(updatedFinding);
    setIsEditOpen(true);
  };

  const handleCloseModal = () => {
    setIsEditOpen(false);
    setSelectedFinding(null);
  };

  const handleUpdate = async (data: MedicalRecordData) => {
    if (!data._id) return;

    try {
      const payload = { recordId: data._id, ...data };
      const response = await axios.patch(`/api/patient/healthInfo/detail/${data._id}`, payload, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.data.success) {
        setExistingMedicalFindings((prevFindings) =>
          prevFindings.map((finding) => (finding._id === data._id ? response.data.data : finding))
        );
        toast.success("Record updated successfully!");
      } else {
        toast.error(response.data.error || "Failed to update the record.");
      }
    } catch (err) {
      console.error("Error updating record:", err);
      toast.error("An unexpected error occurred while updating the record.");
    } finally {
 
      handleCloseModal();

    }
  };

 

  const handleDelete = async (recordId: string) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this health information? This action cannot be undone."
    );
  
    if (!confirmDelete) {
      return; // Exit if the user cancels the action
    }
  
    const toastId = toast.loading("Deleting health information...");
  
    try {
      const response = await axios.delete(`/api/patient/healthInfo/detail/${recordId}`, {
        headers: {
          "Content-Type": "application/json",
        },
        data: { recordId }, // Send recordId in the request body
      });
  
      if (response.data.success) {
        setExistingMedicalFindings((prevFindings) =>
          prevFindings.filter((finding) => finding._id !== recordId)
        );
        toast.update(toastId, {
          render: "Health Information deleted successfully!",
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });
      } else {
        toast.update(toastId, {
          render: response.data.error || "Failed to delete health information.",
          type: "error",
          isLoading: false,
          autoClose: 3000,
        });
        console.error("Failed to delete health information:", response.data.error);
      }
    } catch (err) {
      toast.update(toastId, {
        render: "An unexpected error occurred while deleting the record.",
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
      console.error("Error deleting record:", err);
    }
  };
  const renderUpdates = (updates: { updatedBy: { username: string }; updateTime: string }[] | undefined) => {
    if (!updates || updates.length === 0) return <div></div>;
  
    return (
      <div>
        <h3>Update:</h3>
        <ul>
          {updates.map((update, index) => (
           <li key={index}>
            <div>
          <strong>{update.updatedBy.username}</strong><br />
           
           {new Date(update.updateTime).toLocaleString()}</div><br />
         </li>
         
          ))}
        </ul>
      </div>
    );
  };
  return (
    <div className="flex m-7">
      <div className="flex-grow md:ml-60 container mx-auto p-4">
        <div className="flex space-x-8">
          <div className="w-1/3 p-4">
            <PatientComponent params={params} />
          </div>
          <div className="w-2/3 bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-2xl font-bold">Health Information</h1>
              {role === 'admin' && (
                <>
                 <Link
                href={`/admin/medicaldata/healthinfo/add/${patientId}`}
                className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
              >
                New Health Information +
              </Link>
                </>
              )}
              {role === 'doctor' && (
                <>
              <Link
                href={`/doctor/medicaldata/healthinfo/add/${patientId}`}
                className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
              >
                New Health Information +
              </Link></>
              )}
            </div>

            {existingMedicalFindings.length === 0 ? (
              <p className="text-gray-500">No medical findings available.</p>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {existingMedicalFindings.map((finding) => (
                  <div key={finding._id} className="border p-4 rounded-lg shadow-md flex items-start justify-between">
                    <div className="flex flex-col space-y-2">
                      <div className="text-gray-600 text-sm p-2">
                        {new Date(finding.createdAt || "").toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </div>
                      <div className="text-gray-600 font-bold text-sm ">
                        {finding.createdBy?.username || "Unknown"}
                      </div>
                      <div className="text-gray-600 text-sm "> {renderUpdates(finding.changeHistory)}</div>
                    </div>
                    <div className="flex-grow px-4">
                    {finding.userinfo && finding.userinfo.length > 0 && (
                      <div className="grid grid-cols-2 gap-1 mt-2">
                        {Object.entries(finding.userinfo[0]).map(([key, value]) => {
                          if (key === "_id" || key === "IfanyotherDiseases") return null; // Exclude _id and IfanyotherDiseases
                          return (
                            <div key={key} className="p-1 rounded-lg">
                              <p className="font-bold">{key === "Tuberculosis" ? "Tuberculosis / Pneumonia" : key.replace(/([A-Z])/g, ' $1').trim()}</p>
                              <div className={`text-sm ${value ? "text-green-500" : "text-red-500"}`}>
                                {value ? "True" : "False"}
                              </div>
                            </div>
                          );
                        })}
                        <div className="p-3 rounded-lg">
                          <p className="font-bold">If any other diseases:</p>
                          <div className="text-sm">{finding.userinfo[0].IfanyotherDiseases || ""}</div>
                        </div>
                      </div>
                    )}
                      {finding.bloodgroup && <p>Blood Group: {finding.bloodgroup}</p>}
                      {finding.weight && <p>Weight: {finding.weight}</p>}
                      {finding.height && <p>Height: {finding.height}</p>}
                      {finding.Medication && <p>Medication:{finding.Medication}</p>}
                      {finding.allergies && <p>Allergies: {finding.allergies}</p>}
                      {finding.habits && <p>Habits: {finding.habits}</p>}
                      {finding.Blood_Pressure &&
                      <>
                      <p><strong>Vital Signs:</strong></p>
                      <ul className="list-disc ml-4">
                        <li>Core Temperature: {finding.Core_Temperature}</li>
                        <li>Respiratory Rate: {finding.Respiratory_Rate}</li>
                        <li>Blood Oxygen: {finding.Blood_Oxygen}</li>
                        <li>Blood Pressure:{finding.Blood_Pressure}</li>
                        <li>Heart Rate: {finding.heart_Rate}</li>
                      </ul></>}
                      {finding.Hypotension && <p>Hypotension: {finding.Hypotension}</p>}
                      {finding.Tuberculosis && <p>Tuberculosis or Pneumonia:{finding.Tuberculosis}</p>}
                      {finding.Astema && <p>Astema: {finding.Astema}</p>}
                      {finding.Hepatitis && <p>Hepatitis: {finding.Hepatitis}</p>}
                      {finding.Diabetics && <p>Diabetics:{finding.Diabetics}</p>}
                      {finding.BleedingTendency && <p>BleedingTendency: {finding.BleedingTendency}</p>}
                      {finding.Epilepsy && <p>BleedingTendency: {finding.Epilepsy}</p>}
                      {finding.description && <p>Description: {finding.description}</p>}
                    </div>
                    <div className="flex flex-col space-y-2">
                      <button
                        className="hover:bg-blue-300 p-2 rounded-full"
                        onClick={() => handleEdit(finding)}
                        aria-label="Edit medical record"
                        title="Edit medical record"
                      >
                        <EditOutlined className="text-xl text-blue-500" />
                      </button>
                      <button
                        className="hover:bg-red-300 p-2 rounded-full"
                        onClick={() => handleDelete(finding._id)}
                        aria-label="Delete medical record"
                        title="Delete medical record"
                      >
                        <DeleteOutlined className="text-xl text-red-500" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <EditHealthRecordModal
          isOpen={isEditOpen}
          formData={selectedFinding}
          onClose={handleCloseModal}
          onUpdate={handleUpdate}
        />
        <ToastContainer />
      </div>
    </div>
  );
}
