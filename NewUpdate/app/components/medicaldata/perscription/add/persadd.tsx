"use client";

import React, { useState, useMemo } from "react";
import PatientComponent from "@/app/components/patient/PatientComponent";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

type PrescriptionFormProps = {
  params: {
    id: string; // Patient ID
  };
};

export default function PrescriptionForm({ params }: PrescriptionFormProps) {
  const patientId = params.id;
  const router = useRouter();
  const { data: session } = useSession();

  const [formData, setFormData] = useState({
    name: "",
    diagnosis: "",
    description: "",
  });

  const role = useMemo(() => session?.user?.role || "", [session]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [formMessage, setFormMessage] = useState<string | null>(null);
  const [formType, setFormType] = useState<"success" | "error" | null>(null);



  // ✅ Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Reset messages
    setFormMessage(null);
    setFormType(null);


    try {
      const response = await fetch(`/api/perscription/${patientId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          Name: formData.name,
          diagnosis: formData.diagnosis,
          description: formData.description,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error submitting form:", errorText);
        setFormMessage("An error occurred while creating the prescription.");
        setFormType("error");
        return;
      }

      setFormMessage("Prescription created successfully!");
      setFormType("success");

      // Redirect based on role
      if (role === "doctor") {
        router.push(`/doctor/prescriptions/all/${patientId}`);
      } else if (role === "admin") {
        router.push(`/admin/prescriptions/all/${patientId}`);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setFormMessage("An unexpected error occurred. Please try again.");
      setFormType("error");
    }
  };

  // ✅ Handle input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  return (
    <div className="flex m-7">
      <div className="flex-grow md:ml-60 container mx-auto p-4">
        <div className="flex space-x-8">
          {/* Patient Details */}
          <div className="w-1/3 p-4">
            <PatientComponent params={params} />
          </div>

          {/* Prescription Form */}
          <div className="w-2/3 bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-2xl font-bold">Create Prescription</h1>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Name Field */}
              <div className="mt-4">
                <label htmlFor="name" className="block font-bold mb-2">
                Name of Institution
                </label>
                <input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`border p-2 rounded-md w-full ${
                    errors.name ? "border-red-500" : ""
                  }`}
                  placeholder=""
                />
                {errors.name && <p className="text-red-500">{errors.name}</p>}
              </div>

              {/* Diagnosis Field */}
              <div className="mt-4">
                <label htmlFor="diagnosis" className="block font-bold mb-2">
                  Diagnosis
                </label>
                <input
                  id="diagnosis"
                  name="diagnosis"
                  value={formData.diagnosis}
                  onChange={handleInputChange}
                  className={`border p-2 rounded-md w-full ${
                    errors.diagnosis ? "border-red-500" : ""
                  }`}
                  placeholder="e.g., Bacterial infection"
                />
                {errors.diagnosis && (
                  <p className="text-red-500">{errors.diagnosis}</p>
                )}
              </div>

              {/* Prescription Description Field */}
              <div className="mt-4">
                <label htmlFor="description" className="block font-bold mb-2">
                  Prescription Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className={`border p-2 rounded-md w-full ${
                    errors.description ? "border-red-500" : ""
                  }`}
                  placeholder="e.g., Take Amoxicillin 500mg, three times a day for 7 days"
                ></textarea>
                {errors.description && (
                  <p className="text-red-500">{errors.description}</p>
                )}
              </div>

              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 mt-4"
              >
                Submit
              </button>
            </form>

            {formMessage && (
              <p
                className={`mt-4 p-2 rounded-md ${
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
