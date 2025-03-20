"use client";

import React, { useState, useEffect ,useMemo} from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import PatientComponent from "@/app/components/patient/PatientComponent";
import { DeleteOutlined } from "@ant-design/icons";
import Image from "next/image";
import axios from "axios";
import { MedicalRecordData } from "../add/addmedical";
type MedicalFindingFormProps = {
  params: {
    patientId: string; // Patient ID
    findingId: string; // Medical Finding ID
  };
};

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
type diseaseInfo = {
 
  id: string;
  _id: string;
  disease: string;
 
};
type FormData = {
  ChiefCompliance: string;
  Historypresent: string;
  diseases: string[];
  DrugAllergy: string;
  Diagnosis: string;
  Pastmedicalhistory: string;
  Pastdentalhistory: string;
  IntraoralExamination: string;
  ExtraoralExamination: string;
  Investigation: string;
  Assessment: string;
  NextProcedure:string;
  TreatmentPlan: TreatmentDetails[];
  TreatmentDone: TreatmentDetails[];
};

const InputField = ({
  label,
  id,
  name,
  value = "", // Default value is an empty string if value is not provided
  onChange,
  isTextArea = false,
  error = "",
}: {
  label: string;
  id: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  isTextArea?: boolean;
  rows?: number;
  error?: string;
}) => (
  <div className="mt-4">
    <label htmlFor={id} className="block font-bold mb-2">
      {label}
    </label>
    {isTextArea ? (
      <textarea
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        className={`border p-2 rounded-md w-full ${error ? "border-red-500" : ""}`}
        rows={Math.max(3, Math.ceil(value.length / 100))}
      />
    ) : (
      <input
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        className={`border p-2 rounded-md w-full ${error ? "border-red-500" : ""}`}
      />
    )}
    {error && <p className="text-red-500">{error}</p>}
  </div>
);


const CheckboxField = ({
  label,
  name,
  checked,
  onChange,
}: {
  label: string;
  name: string;
  checked?: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => (
  <div className="flex items-center mb-2">
    <input
      type="checkbox"
      name={name}
      checked={checked}
      onChange={onChange}
      className="mr-2"
    />
    <label>{label}</label>
  </div>
);
export default function EditMedicalFindingForm({ params }: MedicalFindingFormProps) {
  const { patientId, findingId } = params;
  const router = useRouter();
 const { data: session } = useSession();
  const role = useMemo(() => session?.user?.role || "", [session]);
   const [showAll, setShowAll] = useState(false);
  
    const toggleShow = () => {
      setShowAll(!showAll);
    };
        const [existingMedicalFindings, setExistingMedicalFindings] = useState<MedicalRecordData[]>([]);
    
  const [formData, setFormData] = useState<FormData>({
    ChiefCompliance: "",
    Historypresent: "",
    diseases: [],
    DrugAllergy: "",
    Diagnosis: "",
    Pastmedicalhistory: "",
    Pastdentalhistory: "",
    IntraoralExamination: "",
    ExtraoralExamination: "",
    Investigation: "",
    Assessment: "",
    NextProcedure:"",
    TreatmentPlan: [],
    TreatmentDone: [],
  });

  const [diseases, setDiseases] = useState<diseaseInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [formMessage, setFormMessage] = useState<string | null>(null);

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
  
  useEffect(() => {
    const fetchDiseases = async () => {
      try {
        const response = await axios.get("/api/Disease/findall");
        console.log("Disease Data:", response.data); // Debugging
        if (response.status === 200) {
          setDiseases(response.data.data);
        } else {
          console.error("Error fetching Disease:", response.statusText);
        
        }
      } catch (err) {
        console.error("Error fetching Disease:", err);
    
      }
    };
  
    fetchDiseases();
  }, []);


  // Fetch existing medical finding data
  useEffect(() => {
    async function fetchFinding() {
      try {
        const response = await fetch(`/api/patient/MedicalHistory/detail/${findingId}`);
        if (response.ok) {
          const result = await response.json();
          setFormData(result.data);
        } else {
          console.error("Failed to fetch medical finding");
        }
      } catch (error) {
        console.error("Error fetching medical finding:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchFinding();
  }, [findingId]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };
  const handleCheckbox = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
  
    console.log("Checkbox clicked:", name, checked); // Debugging
    setFormData((prevData) => {
      // Ensure diseases is always an array
      const diseases = Array.isArray(prevData.diseases) ? prevData.diseases : [];
  
      const updatedDiseases = checked
        ? [...diseases, name] // Add the new disease ID
        : diseases.filter((id) => id !== name); // Remove the disease ID
  
      return { ...prevData, diseases: updatedDiseases };
    });
  };
  
    
  const handleCheckboxChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    key: keyof TreatmentDetails,
    index: number,
    field: "TreatmentPlan" | "TreatmentDone"
  ) => {
    const { checked } = e.target;
  
    setFormData((prevData) => ({
      ...prevData,
      [field]: prevData[field].map((entry, i) =>
        i === index ? { ...entry, [key]: checked } : entry
      ),
    }));
  };
  const handleDynamicInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    index: number,
    field: "TreatmentPlan" | "TreatmentDone"
  ) => {
    const { name, value } = e.target;

    setFormData((prevData) => ({
      ...prevData,
      [field]: prevData[field].map((entry, i) =>
        i === index ? { ...entry, [name]: value } : entry
      ),
    }));
  };

  const handleAddEntry = (field: "TreatmentPlan" | "TreatmentDone") => {
    setFormData((prevData) => ({
      ...prevData,
      [field]: [
        ...(prevData[field] || []),
        { ToothNumber: "", Plan: "", Done: "",other: "" }, 
      ],
    }));
  };

  const handleRemoveEntry = (index: number, field: "TreatmentPlan" | "TreatmentDone") => {
    setFormData((prevData) => ({
      ...prevData,
      [field]: prevData[field].filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/patient/MedicalHistory/detail/${findingId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setFormMessage("Medical finding updated successfully!");
        {role === "admin" && (
        router.push(`/admin/medicaldata/medicalhistory/all/${patientId}`))}
        {role === "doctor" && (
          router.push(`/doctor/medicaldata/medicalhistory/all/${patientId}`))}
      } else {
        setFormMessage("Failed to update medical finding.");
      }
    } catch (error) {
      console.error("Error updating medical finding:", error);
      setFormMessage("An error occurred while updating the medical finding.");
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="flex m-7">
      <div className="flex-grow md:ml-60 container mx-auto p-4">
        <div className="flex space-x-8">
          <div className="w-1/3 p-4">
            <PatientComponent params={{ id: patientId }} />
          </div>
          <div className="w-2/3 bg-white p-6 rounded-lg shadow-md">
            <h1 className="text-2xl font-bold mb-4">Edit Medical Findings</h1>
             <Image
                                              src="/assets/dentalreco.png" // Path to your image
                                              alt="Example Image"
                                              width={500}  // Desired width
                                              height={50} // Desired height
                                              priority  
                                              className="rounded-lg shadow-md object-cover"
                                            />
            <form onSubmit={handleSubmit}>
              {/* Add all the fields */}
              <InputField
  label="Chief Complaint"
  id="ChiefCompliance"
  name="ChiefCompliance"
  value={formData.ChiefCompliance}
  onChange={handleInputChange}
  isTextArea={true}
  rows={3}
/>
<InputField
  label="History Present"
  id="Historypresent"
  name="Historypresent"
  value={formData.Historypresent}
  onChange={handleInputChange}
  isTextArea={true}
  rows={3}
/>

<InputField
  label="Drug Allergy"
  id="DrugAllergy"
  name="DrugAllergy"
  value={formData.DrugAllergy}
  onChange={handleInputChange}
  isTextArea={true}
  rows={3}
/>
<InputField
  label="Diagnosis"
  id="Diagnosis"
  name="Diagnosis"
  value={formData.Diagnosis}
  onChange={handleInputChange}
  isTextArea={true}
  rows={3}
/>
<label className="block font-bold mt-2 mb-2">Past Medical History</label>
              <div>
      {existingMedicalFindings.length === 0 ? (
        <p className="text-gray-500">No medical findings available.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {existingMedicalFindings.map((finding) => (
            <div key={finding._id} className="border p-4 flex items-start justify-between">
              <div className="flex-grow px-4">
                {finding.userinfo && finding.userinfo.length > 0 && (
                  <div className="grid grid-cols-2 gap-1 mt-2">
                    {Object.entries(finding.userinfo[0])
                      .filter(([key, value]) => key !== "_id" && key !== "IfanyotherDiseases" && value) // Filter out falsy values
                      .map(([key, ]) => (
                        <div key={key} className="p-1 rounded-lg">
                          <p className="font-bold">
                            {key === "Tuberculosis" ? "Tuberculosis / Pneumonia" : key.replace(/([A-Z])/g, ' $1').trim()}
                          </p>
                          <div className="text-sm text-green-500">True</div>
                        </div>
                      ))}
                    {finding.userinfo[0].IfanyotherDiseases && (
                      <div className="p-3 rounded-lg">
                        <p className="font-bold">If any other diseases:</p>
                        <div className="text-sm">{finding.userinfo[0].IfanyotherDiseases}</div>
                      </div>
                    )}
                  </div>
                )}

                {/* Conditionally show all details when 'showAll' is true */}
                {showAll && (
                  <>
                    {finding.bloodgroup && <p>Blood Group: {finding.bloodgroup}</p>}
                    {finding.weight && <p>Weight: {finding.weight}</p>}
                    {finding.height && <p>Height: {finding.height}</p>}
                    {finding.Medication && <p>Medication: {finding.Medication}</p>}
                    {finding.allergies && <p>Allergies: {finding.allergies}</p>}
                    {finding.habits && <p>Habits: {finding.habits}</p>}

                    {finding.Blood_Pressure && (
                      <>
                        <p><strong>Vital Signs:</strong></p>
                        <ul className="list-disc ml-4">
                          {finding.Core_Temperature && <li>Core Temperature: {finding.Core_Temperature}</li>}
                          {finding.Respiratory_Rate && <li>Respiratory Rate: {finding.Respiratory_Rate}</li>}
                          {finding.Blood_Oxygen && <li>Blood Oxygen: {finding.Blood_Oxygen}</li>}
                          {finding.Blood_Pressure && <li>Blood Pressure: {finding.Blood_Pressure}</li>}
                          {finding.heart_Rate && <li>Heart Rate: {finding.heart_Rate}</li>}
                        </ul>
                      </>
                    )}

                    {finding.Hypotension && <p>Hypotension: {finding.Hypotension}</p>}
                    {finding.Tuberculosis && <p>Tuberculosis or Pneumonia: {finding.Tuberculosis}</p>}
                    {finding.Astema && <p>Astema: {finding.Astema}</p>}
                    {finding.Hepatitis && <p>Hepatitis: {finding.Hepatitis}</p>}
                    {finding.Diabetics && <p>Diabetics: {finding.Diabetics}</p>}
                    {finding.BleedingTendency && <p>Bleeding Tendency: {finding.BleedingTendency}</p>}
                    {finding.Epilepsy && <p>Epilepsy: {finding.Epilepsy}</p>}
                    {finding.description && <p>Description: {finding.description}</p>}
                  </>
                )}

                {/* Show the button to toggle visibility */}
                <button

type="button"  
                  onClick={toggleShow}
                  className="mt-4 text-blue-500"
                >
                  {showAll ? "Hide Details" : "Show Details"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
 
<InputField
  label=""
  id="Pastmedicalhistory"
  name="Pastmedicalhistory"
  value={formData.Pastmedicalhistory}
  onChange={handleInputChange}
  isTextArea={true}
  rows={3}
/>
<InputField
  label="Past Dental History"
  id="Pastdentalhistory"
  name="Pastdentalhistory"
  value={formData.Pastdentalhistory}
  onChange={handleInputChange}
  isTextArea={true}
  rows={3}
/>
<InputField
  label="Intraoral Examination"
  id="IntraoralExamination"
  name="IntraoralExamination"
  value={formData.IntraoralExamination}
  onChange={handleInputChange}
  isTextArea={true}
  rows={3}
/>
<InputField
  label="Extraoral Examination"
  id="ExtraoralExamination"
  name="ExtraoralExamination"
  value={formData.ExtraoralExamination}
  onChange={handleInputChange}
  isTextArea={true}
  rows={3}
/>
<InputField
  label="Investigation"
  id="Investigation"
  name="Investigation"
  value={formData.Investigation}
  onChange={handleInputChange}
  isTextArea={true}
  rows={3}
/>
<InputField
  label="Assessment"
  id="Assessment"
  name="Assessment"
  value={formData.Assessment}
  onChange={handleInputChange}
  isTextArea={true}
  rows={3}
/>


 {/* Diseases Checkboxes */}

 {diseases?.length > 0 && (
  <div className="mt-4">
    <h2 className="font-bold mb-2">Diseases</h2>
    {diseases.map((disease) => (
      <CheckboxField
        key={disease._id}
        label={disease.disease}
        name={disease._id}
        checked={formData.diseases?.includes(disease._id) || false} // Safe fallback
        onChange={handleCheckbox}
      />
    ))}
  </div>
)}


              {/* Add other fields here... */}
              <div className="mt-4">
                <h2 className="font-bold mb-2">Treatment Plan</h2>
                {formData.TreatmentPlan.map((plan, index) => (
                  <div key={index} className="mb-4 border p-4 rounded-md shadow-sm">
                     <CheckboxField
                  label="Extraction"
                  name="TreatmentPlan.Exrtaction"
                  checked={plan.Extraction || false}
                  onChange={(e) => handleCheckboxChange(e, "Extraction", index, "TreatmentPlan")}
                />
                <CheckboxField
                  label="Scaling"
                  name="TreatmentPlan.Scaling"
                  checked={plan.Scaling || false}
                  onChange={(e) => handleCheckboxChange(e, "Scaling", index, "TreatmentPlan")}
                />
                <CheckboxField
                  label="Root Canal"
                  name="TreatmentPlan.Rootcanal"
                  checked={plan.Rootcanal|| false}
                  onChange={(e) => handleCheckboxChange(e, "Rootcanal", index, "TreatmentPlan")}
                />
                <CheckboxField
                  label="Filling"
                  name="TreatmentPlan.Filling"
                  checked={plan.Filling || false}
                  onChange={(e) => handleCheckboxChange(e, "Filling", index, "TreatmentPlan")}
                />
                <CheckboxField
                  label="Bridge"
                  name="TreatmentPlan.Bridge"
                  checked={plan.Bridge || false}
                  onChange={(e) => handleCheckboxChange(e, "Bridge", index, "TreatmentPlan")}
                />
                <CheckboxField
                  label="Crown"
                  name="TreatmentPlan.Crown"
                  checked={plan.Crown || false}
                  onChange={(e) => handleCheckboxChange(e, "Crown", index, "TreatmentPlan")}
                />
                <CheckboxField
                  label="Apecectomy"
                  name="TreatmentPlan.Apecectomy"
                  checked={plan.Apecectomy || false}
                  onChange={(e) => handleCheckboxChange(e, "Apecectomy", index, "TreatmentPlan")}
                />
                <CheckboxField
                  label="Fixed Orthodontic Appliance"
                  name="TreatmentPlan.Fixedorthodonticappliance"
                  checked={plan.Fixedorthodonticappliance || false}
                  onChange={(e) => handleCheckboxChange(e, "Fixedorthodonticappliance", index, "TreatmentPlan")}
                />
                <CheckboxField
                  label="Removable Orthodontic Appliance"
                  name="TreatmentPlan.Removableorthodonticappliance"
                  checked={plan.Removableorthodonticappliance || false}
                  onChange={(e) => handleCheckboxChange(e, "Removableorthodonticappliance", index, "TreatmentPlan")}
                />
                <CheckboxField
                  label="Removable Denture"
                  name="TreatmentPlan.Removabledenture"
                  checked={plan.Removabledenture || false}
                  onChange={(e) => handleCheckboxChange(e, "Removabledenture", index, "TreatmentPlan")}
                />
                <InputField
      label="Other"
      id={`other-${index}`}
      name="other"
      value={plan.other || ""} // Default to an empty string
      isTextArea={true}
      onChange={(e) => handleDynamicInputChange(e, index, "TreatmentPlan")}
    />
                    <InputField
                      label="Tooth Number"
                      id={`TreatmentPlan[${index}].ToothNumber`}
                      name="ToothNumber"
                      value={plan.ToothNumber|| ""}
                      onChange={(e) => handleDynamicInputChange(e, index, "TreatmentPlan")}
                    />
                    <InputField
                      label="Plan"
                      id={`TreatmentPlan[${index}].Plan`}
                      name="Plan"
                      value={plan.Plan || ""}
                      onChange={(e) => handleDynamicInputChange(e, index, "TreatmentPlan")}
                      isTextArea={true}
                      rows={3}
                    />
                    <button
                      type="button"
                      className="text-red-500 mt-2"
                      onClick={() => handleRemoveEntry(index, "TreatmentPlan")}
                    >
                      <DeleteOutlined/>
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className="bg-gray-500 text-white px-2 py-2 rounded-md mt-2"
                  onClick={() => handleAddEntry("TreatmentPlan")}
                >
                  + Add
                </button>
              </div>

              {/* Treatment Done Section */}
<div className="mt-4">
  <h2 className="font-bold mb-2">Treatment Done</h2>
  {formData.TreatmentDone.map((done, index) => (
    <div key={index} className="mb-4 border p-4 rounded-md shadow-sm">
         <CheckboxField
                  label="Extraction"
                  name="TreatmentDone.Exrtaction"
                  checked={done.Extraction || false}
                  onChange={(e) => handleCheckboxChange(e, "Extraction", index, "TreatmentDone")}
                />
                <CheckboxField
                  label="Scaling"
                  name="TreatmentDone.Scaling"
                  checked={done.Scaling || false}
                  onChange={(e) => handleCheckboxChange(e, "Scaling", index, "TreatmentDone")}
                />
                <CheckboxField
                  label="Root Canal"
                  name="TreatmentDone.Rootcanal"
                  checked={done.Rootcanal || false}
                  onChange={(e) => handleCheckboxChange(e, "Rootcanal", index, "TreatmentDone")}
                />
                <CheckboxField
                  label="Filling"
                  name="TreatmentDone.Filling"
                  checked={done.Filling || false}
                  onChange={(e) => handleCheckboxChange(e, "Filling", index, "TreatmentDone")}
                />
                <CheckboxField
                  label="Bridge"
                  name="TreatmentDone.Bridge"
                  checked={done.Bridge || false}
                  onChange={(e) => handleCheckboxChange(e, "Bridge", index, "TreatmentDone")}
                />
                <CheckboxField
                  label="Crown"
                  name="TreatmentDone.Crown"
                  checked={done.Crown || false}
                  onChange={(e) => handleCheckboxChange(e, "Crown", index, "TreatmentDone")}
                />
                <CheckboxField
                  label="Apecectomy"
                  name="TreatmentDone.Apecectomy"
                  checked={done.Apecectomy || false}
                  onChange={(e) => handleCheckboxChange(e, "Apecectomy", index, "TreatmentDone")}
                />
                <CheckboxField
                  label="Fixed Orthodontic Appliance"
                  name="TreatmentDone.Fixedorthodonticappliance"
                  checked={done.Fixedorthodonticappliance || false}
                  onChange={(e) => handleCheckboxChange(e, "Fixedorthodonticappliance", index, "TreatmentDone")}
                />
                <CheckboxField
                  label="Removable Orthodontic Appliance"
                  name="TreatmentDone.Removableorthodonticappliance"
                  checked={done.Removableorthodonticappliance || false}
                  onChange={(e) => handleCheckboxChange(e, "Removableorthodonticappliance", index, "TreatmentDone")}
                />
                <CheckboxField
                  label="Removable Denture"
                  name="TreatmentDone.Removabledenture"
                  checked={done.Removabledenture || false}
                  onChange={(e) => handleCheckboxChange(e, "Removabledenture", index, "TreatmentDone")}
                />
                 <InputField
      label="Other"
      id={`other-${index}`}
      name="other"
      value={done.other || ""}
      isTextArea={true} // Default to an empty string
      onChange={(e) => handleDynamicInputChange(e, index, "TreatmentDone")}
    />
      <InputField
        label="Tooth Number"
        id={`TreatmentDone[${index}].ToothNumber`}
        name="ToothNumber"
        value={done.ToothNumber|| ""}
        onChange={(e) => handleDynamicInputChange(e, index, "TreatmentDone")}
      />
      <InputField
        label="Done"
        id={`TreatmentDone[${index}].Done`}
        name="Done"
        value={done.Done || ""}
        onChange={(e) => handleDynamicInputChange(e, index, "TreatmentDone")}
        isTextArea={true}
        rows={3}
      />
      <button
        type="button"
        className="text-red-500 mt-2"
        onClick={() => handleRemoveEntry(index, "TreatmentDone")}
      >
        <DeleteOutlined />
      </button>
    </div>
  ))}
  <button
    type="button"
    className="bg-gray-500 text-white px-2 py-2 rounded-md mt-2"
    onClick={() => handleAddEntry("TreatmentDone")}
  >
    + Add
  </button>
</div>
<InputField
  label="Next Procedure"
  id="NextProcedure"
  name="NextProcedure"  // Update this to match your state key
  value={formData.NextProcedure}
  onChange={handleInputChange}
  isTextArea={true}
  rows={3}
/>
              <button
                type="submit"
                className="bg-green-500 text-white px-4 py-2 rounded-md mt-4 hover:bg-green-600"
              >
                Save Changes
              </button>
            </form>
            {formMessage && <p className="mt-4 text-green-500">{formMessage}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
