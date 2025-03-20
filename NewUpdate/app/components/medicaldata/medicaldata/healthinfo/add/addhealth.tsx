"use client";

import React, { useState, useMemo } from "react";
import PatientComponent from "@/app/components/patient/PatientComponent";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

type HealthinfoFormProps = {
  params: {
    id: string;
  };
};

// Make all fields optional by adding `?` after each key
interface HealthInfoFormData {
  bloodgroup?: string;
  weight?: string;
  height?: string;
  allergies?: string;
  Medication?: string;
  Core_Temperature?: string;
  Respiratory_Rate?: string;
  Blood_Oxygen?: string;
  Blood_Pressure?: string;
  heart_Rate?: string;
  habits?: string;
  Hypotension:string;
  Tuberculosis:string;
  Hepatitis:string
  Diabetics:string;
  BleedingTendency:string;
  Epilepsy:string
  Astema:string;
  description:string;
  [key: string]: string | undefined;
}

export default function HealthFindingForm({ params }: HealthinfoFormProps) {
  const patientId = params.id;
  const router = useRouter();
  const { data: session } = useSession();

  const [formData, setFormData] = useState<HealthInfoFormData>({
    bloodgroup: "",
    weight: "",
    height: "",
    Medication: "",
    allergies: "",
    Core_Temperature: "",
    Respiratory_Rate: "",
    Blood_Oxygen: "",
    Blood_Pressure: "",
    heart_Rate: "",
    habits: "",
    Hypotension: "",
    Hepatitis:"",
    Tuberculosis: "",
    Diabetics:"",
    BleedingTendency:"",
    Epilepsy:"",
    Astema: "",
    description: "",
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [formMessage, setFormMessage] = useState<string | null>(null);
  const [formType, setFormType] = useState<"success" | "error" | null>(null);
const role = useMemo(() => session?.user?.role || '', [session]);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormMessage(null);
    setFormType(null);

    // Validate required fields (Blood_Pressure and heart_Rate)
    const newErrors: { [key: string]: string } = {};
    if (!formData.Blood_Pressure) {
      newErrors.Blood_Pressure = "Blood Pressure is required";
    }
    if (!formData.heart_Rate) {
      newErrors.heart_Rate = "Heart Rate is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return; // Stop form submission if there are validation errors
    }

    try {
      const response = await fetch(`/api/patient/healthInfo/${patientId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Failed to submit form: ${response.status} - ${errorText}`);
        setFormMessage("An error occurred while submitting the form.");
        setFormType("error");
      } else {
        console.log("Form submitted successfully");
        setFormMessage("Form submitted successfully!");
        setFormType("success");
        role === "doctor"
          ? router.push(`/doctor/medicaldata/healthinfo/all/${patientId}`)
          : router.push(`/admin/medicaldata/healthinfo/all/${patientId}`);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setFormMessage("An unexpected error occurred. Please try again.");
      setFormType("error");
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  return (
    <div className="flex m-7">
      <div className="flex-grow md:ml-60 container mx-auto p-4">
        <div className="flex space-x-8">
          {/* Patient Details */}
          <div className="w-1/3 p-4">
            <PatientComponent params={params} />
          </div>

          {/* Medical Findings Form */}
          <div className="w-2/3 bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-2xl font-bold">Health Information</h1>
            </div>

            {/* Form Submission */}
            <form onSubmit={handleSubmit}>
              <div>
                <label htmlFor="bloodgroup" className="block font-bold mb-2">
                  Blood Group
                </label>
                <select
                  id="bloodgroup"
                  name="bloodgroup"
                  value={formData.bloodgroup || ""}
                  onChange={handleInputChange}
                  className={`border p-2 rounded-md w-full ${
                    errors.bloodgroup ? "border-red-500" : ""
                  }`}
                >
                  <option value="" disabled>
                    Select Blood Group
                  </option>
                  <option value="A+">A-positive</option>
                  <option value="A-">A-negative</option>
                  <option value="B+">B-positive</option>
                  <option value="B-">B-negative</option>
                  <option value="AB+">AB-positive</option>
                  <option value="AB-">AB-negative</option>
                  <option value="O+">O-positive</option>
                  <option value="O-">O-negative</option>
                </select>
                {errors.bloodgroup && (
                  <p className="text-red-500">{errors.bloodgroup}</p>
                )}
              </div>

              {/* Vital Signs Section */}
              <label htmlFor="vitals" className="block font-bold mb-2">
                Vital Signs
              </label>

              {[...[   
                { id: "weight", label: "Weight", placeholder: "60kg" },
                { id: "height", label: "Height", placeholder: "5.5ft" },
                { id: "Medication", label: "Medication", placeholder: "Medications" },
                { id: "allergies", label: "Allergies", placeholder: "beans, nuts" },
                { id: "habits", label: "Habits", placeholder: "smoking, drinking" },
                { id: "Hypotension", label: "Hypotension", placeholder: "" },
                { id: "Tuberculosis", label: "Tuberculosis, Pneumonia", placeholder: "" },
                { id: "Hepatitis", label: "Hepatitis", placeholder: "" },
                { id: "Astema", label: "Astema", placeholder: "" },
              
                { id: "Core_Temperature", label: "Core Temperature", placeholder: "" },
                { id: "Respiratory_Rate", label: "Respiratory Rate", placeholder: "" },
                { id: "Blood_Oxygen", label: "Blood Oxygen", placeholder: "" },
                { id: "Diabetics", label: " Diabetics", placeholder: "" },
                { id: "BleedingTendency", label: "Bleeding Tendency", placeholder: "" },
                { id: "Epilepsy", label: "Epilepsy", placeholder: "" },
                { id: "description", label: "Description", placeholder: "" },
              ], ...[
                { id: "Blood_Pressure", label: "Blood Pressure", placeholder: "", require: true },
                { id: "heart_Rate", label: "Heart Rate", placeholder: "", require: true },
              ]].map((field) => (
                <div key={field.id} className="mt-4">
                  <label htmlFor={field.id} className="block font-bold mb-2">
                    {field.label}
                  </label>
                  <input
                    id={field.id}
                    name={field.id}
                    type="text"
                    value={formData[field.id] || ""}
                    onChange={handleInputChange}
                    className={`border p-2 rounded-md w-full ${errors[field.id] ? "border-red-500" : ""}`}
                    placeholder={field.placeholder}
                  />
                  {errors[field.id] && (
                    <p className="text-red-500">{errors[field.id]}</p>
                  )}
                </div>
              ))}

              <button
                type="submit"
                className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-300 mt-4"
              >
                Submit
              </button>
            </form>

            {formMessage && (
              <p
                className={`mt-4 ${
                  formType === "success"
                    ? "bg-green-300 text-green-600"
                    : "bg-red-300 text-red-600"
                }`}
              >
                {formMessage}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

