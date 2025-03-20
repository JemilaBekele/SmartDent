"use client";

import UserComponent from "@/app/components/patient/user";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

type HealthinfoFormProps = {
  params: {
    id: string;
  };
};

interface HealthInfoFormData {
  userinfo: {
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
    IfanyotherDiseases?: string;
  };
}
const Checkbox = ({ label, name, checked, onChange }) => (
  <label className="flex items-center space-x-3">
    <input
      type="checkbox"
      name={name}
      checked={checked}
      onChange={onChange}
      className="form-checkbox h-5 w-5 text-green-500"
    />
    <span className="text-gray-700">{label}</span>
  </label>
);
export default function HealthFindingForm({ params }: HealthinfoFormProps) {
  const patientId = params.id;
  const router = useRouter();
  const [formData, setFormData] = useState<HealthInfoFormData>({
    userinfo: {
      BloodPressure: false,
      Hypotension: false,
      Diabetics: false,
      BleedingTendency: false,
      Tuberculosis: false,
      Epilepsy: false,
      Hepatitis: false,
      Allergies: false,
      Asthma: false,
      IfAnydrugstaking: false,
      Pregnancy: false,
      IfanyotherDiseases: "",
    },
  });

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      userinfo: {
        ...prevData.userinfo,
        [name]: checked,
      },
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      userinfo: {
        ...prevData.userinfo,
        [name]: value,
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formattedData = {
        userinfo: [formData.userinfo],
      };

      const response = await fetch(`/api/patient/healthInfo/user/${patientId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formattedData),
      });

      if (response.ok) {
        router.push('/user/thank'); // Redirect on success
      } else {
        throw new Error("Failed to submit form");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  return (
    <div className="mx-4 md:mx-10 lg:mx-20">
        <div className="flex flex-col items-center py-6">
                   
                      <h2 className="mt-3 text-2xl font-bold text-black-900">Dr Tedla Specialized Dental Clinic</h2>
                  </div>
      <div className="grid grid-cols-1 md:grid-cols-[30%_70%] gap-8 mt-6">
        {/* User Component Section */}
        <div className="order-2 md:order-1">
          <UserComponent params={params} />
        </div>
  
        {/* Form Section */}
        <div className="order-1 md:order-2 bg-white p-6 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold mb-6">Health Information</h1>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Checkbox Group */}
              <div className="space-y-4">
                <Checkbox 
                  label="ደም ግፊት (Blood Pressure)"
                  name="BloodPressure"
                  checked={formData.userinfo.BloodPressure}
                  onChange={handleCheckboxChange}
                />
                <Checkbox 
                  label="ደም ማነስ (Hypotension)"
                  name="Hypotension"
                  checked={formData.userinfo.Hypotension}
                  onChange={handleCheckboxChange}
                />
                <Checkbox 
                  label="ስኳር በሽታ (Diabetes)"
                  name="Diabetics"
                  checked={formData.userinfo.Diabetics}
                  onChange={handleCheckboxChange}
                />
                <Checkbox 
                  label="ደም ያለመቆም (Bleeding Tendency)"
                  name="BleedingTendency"
                  checked={formData.userinfo.BleedingTendency}
                  onChange={handleCheckboxChange}
                />
              </div>
  
              <div className="space-y-4">
                <Checkbox 
                  label="የሳንባ በሽታ,ነቀርሳ (Tuberculosis, Pneumonia)"
                  name="Tuberculosis"
                  checked={formData.userinfo.Tuberculosis}
                  onChange={handleCheckboxChange}
                />
                <Checkbox 
                  label="የሚጥል በሽታ (Epilepsy)"
                  name="Epilepsy"
                  checked={formData.userinfo.Epilepsy}
                  onChange={handleCheckboxChange}
                />
                <Checkbox 
                  label="የጉበት በሽታ (Hepatitis)"
                  name="Hepatitis"
                  checked={formData.userinfo.Hepatitis}
                  onChange={handleCheckboxChange}
                />
                <Checkbox 
                  label="አለርጂክ (Allergies)"
                  name="Allergies"
                  checked={formData.userinfo.Allergies}
                  onChange={handleCheckboxChange}
                />
              </div>
  
              {/* Full Width Elements */}
              <div className="col-span-full space-y-4">
                <Checkbox 
                  label="አስም (Asthma)"
                  name="Asthma"
                  checked={formData.userinfo.Asthma}
                  onChange={handleCheckboxChange}
                />
                <Checkbox 
                  label="የሚወስዱት መድሃኒት ካለ (If Any drugs taking)"
                  name="IfAnydrugstaking"
                  checked={formData.userinfo.IfAnydrugstaking}
                  onChange={handleCheckboxChange}
                />
                <Checkbox 
                  label="ለሴት ብቻ (only for female) እርግዝና (Pregnancy)"
                  name="Pregnancy"
                  checked={formData.userinfo.Pregnancy}
                  onChange={handleCheckboxChange}
                />
                
                <div>
                  <label className="block font-semibold mb-2">
                    ሌላ ያልጠቀሰ በሽታ ካለ (If any other Diseases)
                  </label>
                  <textarea
                    name="IfanyotherDiseases"
                    placeholder="Specify other diseases"
                    value={formData.userinfo.IfanyotherDiseases}
                    onChange={handleInputChange}
                    className="border p-3 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-green-200"
                    rows={4}
                  />
                </div>
              </div>
            </div>
  
            <button
              type="submit"
              className="mt-6 bg-green-500 text-white px-6 py-3 rounded-md 
                        hover:bg-green-600 focus:outline-none focus:ring-2 
                        focus:ring-green-300 w-full md:w-auto"
            >
              Submit
            </button>
          </form>
        </div>
      </div>
    </div>
  );
  
  // Checkbox Component
 
}
