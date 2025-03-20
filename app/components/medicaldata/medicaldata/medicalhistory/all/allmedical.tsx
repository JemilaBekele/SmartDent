"use client";

import React, { useState, useEffect, useMemo } from "react";
import PatientComponent from "@/app/components/patient/PatientComponent";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import axios from "axios";
import { useRouter } from "next/navigation";
  // Adjust the path based on your file structure

import Link from "next/link";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useSession } from "next-auth/react";


type TreatmentDetails = {
  Extraction?: boolean; // Optional
  Scaling?: boolean;    // Optional
  Rootcanal?: boolean;  // Optional
  Filling?: boolean;    // Optional
  Bridge?: boolean;     // Optional
  Crown?: boolean;      // Optional
  Apecectomy?: boolean; // Optional
  Fixedorthodonticappliance?: boolean; // Optional
  Removableorthodonticappliance?: boolean; // Optional
  Removabledenture?: boolean; // Optional
  other?: string;
  ToothNumber?: string;
  Plan?: string;
  Done?: string;

};
type disease = {
  _id: string;
  disease: string;
};
type MedicalRecordData = {
  _id: string;
  ChiefCompliance: string;
  Historypresent: string;
  DrugAllergy: string;
  Diagnosis: string;
  Pastmedicalhistory: string;
  Pastdentalhistory: string;
  IntraoralExamination: string;
  ExtraoralExamination: string;
  Investigation: string;
  Assessment: string;
  NextProcedure:string;
  TreatmentPlan: TreatmentDetails[] | null;
  TreatmentDone: TreatmentDetails[] | null;
  diseases: disease[] |null;
  createdAt?: string;
  changeHistory?: { updatedBy: { username: string }; updateTime: string }[];
  updatedAt?: string;
  createdBy?: { username: string };
};

type MedicalFindingFormProps = {
  params: {
    id: string;
  };
};

export default function MedicalFindingForm({ params }: MedicalFindingFormProps) {
  const patientId = params.id;
  const [existingMedicalFindings, setExistingMedicalFindings] = useState<MedicalRecordData[]>([]);
  const { data: session } = useSession();
  const role = useMemo(() => session?.user?.role || "", [session]);
  const router = useRouter();
  useEffect(() => {
    async function fetchMedicalFindings() {
      try {
        const response = await fetch(`/api/patient/MedicalHistory/${patientId}`);
        if (response.ok) {
          const result = await response.json();
          console.log("Fetched data:", result);
          setExistingMedicalFindings(result.data);
        } else {
          console.error("Failed to fetch medical findings");
        }
      } catch (error) {
        console.error("Error fetching medical findings:", error);
      }
    }

    fetchMedicalFindings();
  }, [patientId]);





 

 

  const handleDelete = async (recordId: string) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this medical finding? This action cannot be undone."
    );
  
    if (!confirmDelete) {
      return; // Exit if the user cancels the action
    }
  
    const toastId = toast.loading("Deleting record...");
  
    try {
      const response = await axios.delete(`/api/patient/MedicalHistory/detail/${recordId}`, {
        headers: {
          "Content-Type": "application/json",
        },
      });
  
      if (response.data.success) {
        setExistingMedicalFindings((prevFindings) =>
          prevFindings.filter((finding) => finding._id !== recordId)
        );
        toast.update(toastId, {
          render: "Dental Record deleted successfully!",
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });
      } else {
        toast.update(toastId, {
          render: "Failed to delete the record.",
          type: "error",
          isLoading: false,
          autoClose: 3000,
        });
        console.error("Failed to delete the record:", response.data.error);
      }
    } catch (err) {
      toast.update(toastId, {
        render: "Error deleting record.",
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
      console.error("Error deleting record:", err);
    }
  };
  
  
  const renderTreatment = (
    treatmentPlan: TreatmentDetails[] | null,
    treatmentDone: TreatmentDetails[] | null,
    diseases: disease[] | null 
  ) => {
    const formatTreatment = (treatments: TreatmentDetails[] | null) => {
      if (!treatments || treatments.length === 0) return "No Treatment";
  
      return treatments
        .map((treatment, index) => {
          const trueTreatments = Object.keys(treatment)
            .filter((key) => treatment[key as keyof TreatmentDetails] === true)
            .map((key) => key.replace(/([A-Z])/g, " $1").trim());
  
          // Add 'other' if it exists
          if (treatment.other) {
            trueTreatments.push(`Other: ${treatment.other}`);
          }
  
          // Replace specific treatment names for better readability
          const formattedTreatments = trueTreatments.map((item) =>
            item
              .replace("Fixedorthodonticappliance", "Fixed orthodontic appliance")
              .replace("Removableorthodonticappliance", "Removable orthodontic appliance")
              .replace("Removabledenture", "Removable denture")
          );
  
          // Format the output string with ToothNumber if it exists
          const toothNumberInfo = treatment.ToothNumber
            ? ` (Tooth Number: ${treatment.ToothNumber})`
            : "";
            const Plan = treatment.Plan
            ? ` Plan: ${treatment.Plan}`
            : "";
            const Done = treatment.Done
            ? ` Done: ${treatment.Done}`
            : "";
          // Numbered treatment with index, starting from 1
          return `<strong>${index + 1}.</strong> ${formattedTreatments.join(", ")}${toothNumberInfo}${Plan}${Done}`;
        })
        .join("<br>");
    };
    const formatDiseases = (diseases: disease[] | null) => {
      console.log('Diseases:', diseases);
    
      if (!diseases || diseases.length === 0) return "No diseases listed";
    
      return diseases
        .map((disease, index) => `<strong>${index + 1}.</strong> ${disease}`)
        .join("<br>");
    };
   
  
    const plan = formatTreatment(treatmentPlan);
    const done = formatTreatment(treatmentDone);
  
    const diseaseList = formatDiseases(diseases);
  
    return `
       <div class="bg-white  shadow-sm rounded-md mt-3">
          <h3 class="text-base font-bold text-gray-800 border-l-4 border-blue-500 pl-2 mt-2 mb-1">Diseases</h3>
      <p class="text-sm">
        ${diseaseList || "No diseases available"}
      </p>
      <h3 class="text-base text-gray-800 font-bold border-l-4 border-blue-500 pl-2 mt-2 mb-1">Treatment Plan</h3>
     
      <p class="text-sm">
        ${plan || "No Treatment"}
      </p>
      <h3 class="text-base text-gray-800 font-bold border-l-4 border-blue-500 pl-2 mt-4 mb-1">Treatment Done</h3>
      <p class="text-sm">
        ${done || "No Treatment"}
      </p>
    </div>
    `;
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
          <strong> {update.updatedBy.username}</strong><br />
           
           {new Date(update.updateTime).toLocaleString()}</div><br />
         </li>
         
          ))}
        </ul>
      </div>
    );
  };
  
  const handleEdit = (patientId: string, findingId: string) => {
    if (role === "doctor") {
      router.push(`/doctor/medicaldata/medicalhistory/edit?findingId=${findingId}&patientId=${patientId}`);
    } else if (role === "admin") {
      router.push(`/admin/medicaldata/medicalhistory/edit?findingId=${findingId}&patientId=${patientId}`);
    }
  
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
              <h1 className="text-2xl font-bold">Dental Record</h1>
              {role === "admin" && (
                <Link
                  href={`/admin/medicaldata/medicalhistory/add/${patientId}`}
                  className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
                >
                  New Record +
                </Link>
              )}
              {role === "doctor" && (
                <Link
                  href={`/doctor/medicaldata/medicalhistory/add/${patientId}`}
                  className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
                >
                  New Record +
                </Link>
              )}
            </div>

            {existingMedicalFindings.length === 0 ? (
              <p className="text-gray-500">No medical findings available.</p>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {existingMedicalFindings.map((finding) => (
                  <div
                    key={finding._id}
                    className="border p-4 rounded-lg shadow-md flex items-start justify-between"
                  >
                    <div className="flex flex-col space-y-1">
                    <div className="text-gray-600 text-sm p-1 font-bold">
                        {finding.createdBy?.username || "Unknown"}
                        
                      </div>
                      <div className="text-gray-600 text-sm p-1">
                      {new Date(finding.createdAt|| "") .toLocaleString()}
                        
                      </div>
                    
                      <div className="text-gray-600 text-sm p-2"> {renderUpdates(finding.changeHistory)}</div>
                    </div>
                    <div className="flex-grow px-2">
  {finding.ChiefCompliance && (
    <div className="bg-white  shadow-sm rounded-md">
      <h3 className="text-base text-gray-800 border-l-4 font-bold  border-blue-500 pl-2 mt-2 mb-1">Complaint</h3>
      <p className="text-base">
        {finding.ChiefCompliance.split('\n').map((line, index) => (
          <React.Fragment key={index}>
            {line}
            <br />
          </React.Fragment>
        ))}
      </p>
    </div>
  )}

  {finding.Historypresent && (
    <div className="bg-white  shadow-sm rounded-md">
      <h3 className="text-base text-gray-800 border-l-4 font-bold  border-blue-500 pl-2 mt-2 mb-1">History Present</h3>
      <p className="text-base">
        {finding.Historypresent.split('\n').map((line, index) => (
          <React.Fragment key={index}>
            {line}
            <br />
          </React.Fragment>
        ))}
      </p>
    </div>
  )}



  {finding.DrugAllergy && (
    <div className="bg-white shadow-sm rounded-md">
      <h3 className="text-base text-gray-800 border-l-4 font-bold  border-blue-500 pl-2 mt-2 mb-1">Drug Allergy</h3>
      <p className="text-base">
        {finding.DrugAllergy.split('\n').map((line, index) => (
          <React.Fragment key={index}>
            {line}
            <br />
          </React.Fragment>
        ))}
      </p>
    </div>
  )}

  {finding.Diagnosis && (
    <div className="bg-white  shadow-sm rounded-md">
      <h3 className="text-base text-gray-800 border-l-4 font-bold  border-blue-500 pl-2 mt-2 mb-1">Diagnosis</h3>
      <p className="text-base">
        {finding.Diagnosis.split('\n').map((line, index) => (
          <React.Fragment key={index}>
            {line}
            <br />
          </React.Fragment>
        ))}
      </p>
    </div>
  )}

  {finding.Pastmedicalhistory && (
    <div className="bg-white shadow-sm rounded-md">
      <h3 className="text-base text-gray-800 border-l-4 font-bold  border-blue-500 pl-2 mt-2 mb-1">Past Medical History</h3>
      <p className="text-base">
        {finding.Pastmedicalhistory.split('\n').map((line, index) => (
          <React.Fragment key={index}>
            {line}
            <br />
          </React.Fragment>
        ))}
      </p>
    </div>
  )}

  {finding.Pastdentalhistory && (
    <div className="bg-white  shadow-sm rounded-md">
      <h3 className="text-base text-gray-800 border-l-4 font-bold  border-blue-500 pl-2 mt-2 mb-1">Past Dental History</h3>
      <p className="text-base">
        {finding.Pastdentalhistory.split('\n').map((line, index) => (
          <React.Fragment key={index}>
            {line}
            <br />
          </React.Fragment>
        ))}
      </p>
    </div>
  )}

  {finding.IntraoralExamination && (
    <div className="bg-white shadow-sm rounded-md">
      <h3 className="text-base text-gray-800 border-l-4 font-bold  border-blue-500 pl-2 mt-2 mb-1">Intraoral Examination</h3>
      <p className="text-base">
        {finding.IntraoralExamination.split('\n').map((line, index) => (
          <React.Fragment key={index}>
            {line}
            <br />
          </React.Fragment>
        ))}
      </p>
    </div>
  )}

  {finding.ExtraoralExamination && (
    <div className="bg-white shadow-sm rounded-md">
      <h3 className="text-base text-gray-800 border-l-4 font-bold  border-blue-500 pl-2 mt-2 mb-1">Extraoral Examination</h3>
      <p className="text-base">
        {finding.ExtraoralExamination.split('\n').map((line, index) => (
          <React.Fragment key={index}>
            {line}
            <br />
          </React.Fragment>
        ))}
      </p>
    </div>
  )}

  {finding.Investigation && (
    <div className="bg-white  shadow-sm rounded-md">
      <h3 className="text-base text-gray-800 border-l-4 font-bold  border-blue-500 pl-2 mt-2 mb-1">Investigation</h3>
      <p className="text-base">
        {finding.Investigation.split('\n').map((line, index) => (
          <React.Fragment key={index}>
            {line}
            <br />
          </React.Fragment>
        ))}
      </p>
    </div>
  )}

  {finding.Assessment && (
    <div className="bg-white  shadow-sm rounded-md">
      <h3 className="text-base text-gray-800 border-l-4 font-bold  border-blue-500 pl-2 mt-2 mb-1">Assessment</h3>
      <p className="text-base">
        {finding.Assessment.split('\n').map((line, index) => (
          <React.Fragment key={index}>
            {line}
            <br />
          </React.Fragment>
        ))}
      </p>
    </div>
  )}



  <div
    dangerouslySetInnerHTML={{
      __html: renderTreatment(finding.TreatmentPlan, finding.TreatmentDone, finding.diseases),
    }}
  />
  {finding.NextProcedure && (
    <div className="bg-white  shadow-sm rounded-md">
      <h3 className="text-base text-gray-800 border-l-4 font-bold  border-blue-500 pl-2 mt-2 mb-1">Next Procedure</h3>
      <p className="text-base">
        {finding.NextProcedure.split('\n').map((line, index) => (
          <React.Fragment key={index}>
            {line}
            <br />
          </React.Fragment>
        ))}
      </p>
    </div>
  )}
</div>


                    <div className="flex flex-col space-y-2">
                    {(role === "doctor" || role === "admin") && (
                      <>
                      <button
                        className="hover:bg-blue-300 p-2 rounded-full"
                        onClick={() => handleEdit(patientId, finding._id)}
                      >
                        <EditOutlined className="text-xl text-blue-500" />
                      </button>
                      <button
                        className="hover:bg-red-300 p-2 rounded-full"
                        onClick={() => handleDelete(finding._id)}
                      >
                        <DeleteOutlined className="text-xl text-red-500" />
                      </button></>)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
       
        <ToastContainer />
      </div>
    </div>
  );
}
