"use client";

import React, { useState, useEffect , useMemo } from "react";
import { useRouter } from "next/navigation";
import PatientComponent from "@/app/components/patient/PatientComponent";
import { useSession } from 'next-auth/react';
type AppointmentFormProps = {
  params: {
    id: string;
  };
};

type Doctor = {
  _id: string;
  username: string;
};

export default function AppointmentForm({ params }: AppointmentFormProps) {
  const { data: session } = useSession(); 
  const patientId = params.id;
  const router = useRouter();
  const [, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    appointmentDate: "",
    appointmentTime: "", // Add appointmentTime to the state
    reasonForVisit: "",
    status: "",
    doctorId: "", 
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const role = useMemo(() => session?.user?.role || '', [session]);
  // Fetch doctors
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await fetch(`/api/patient/doctor`);
        const data = await response.json();
        if (response.ok) {
          setDoctors(data);
        } else {
          setError("Failed to fetch doctors");
        }
      } catch (err) {
        setError("An error occurred while fetching doctors");
      }
    };

    fetchDoctors();
  }, []);

  // Validate form data
  const validateForm = () => {
    const formErrors: { [key: string]: string } = {};


    setErrors(formErrors);
    return Object.keys(formErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const response = await fetch(`/api/patient/Appointment/${patientId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Failed to submit form: ${response.status} - ${errorText}`);
      } else {
        console.log("Appointment created successfully");
        setFormSubmitted(true);
        {role === 'admin' && (
        router.push(`/admin/medicaldata/appointment/all/${patientId}`))}
        {role === 'doctor' && (
          router.push(`/doctor/medicaldata/appointment/all/${patientId}`))}

                {role === 'reception' && (
          router.push(`/reception/appointment/all/${patientId}`))}
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle doctor selection
  const handleDoctorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    setFormData({ ...formData, doctorId: selectedId });
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
              <h1 className="text-2xl font-bold">Create New Appointment</h1>
            </div>

            <form onSubmit={handleSubmit}>
              <div>
                <label htmlFor="appointmentDate" className="block font-bold mb-2">
                  Appointment Date
                </label>
                <input
                  id="appointmentDate"
                  name="appointmentDate"
                  type="date"
                  value={formData.appointmentDate}
                  onChange={handleInputChange}
                  className={`border p-2 rounded-md w-full ${errors.appointmentDate ? "border-red-500" : ""}`}
                />
                {errors.appointmentDate && <p className="text-red-500">{errors.appointmentDate}</p>}
              </div>

              <div className="mt-4">
                <label htmlFor="appointmentTime" className="block font-bold mb-2">
                  Appointment Time
                </label>
                <input
                  id="appointmentTime"
                  name="appointmentTime"
                  type="time"
                  value={formData.appointmentTime}
                  onChange={handleInputChange}
                  className={`border p-2 rounded-md w-full ${errors.appointmentTime ? "border-red-500" : ""}`}
                />
                {errors.appointmentTime && <p className="text-red-500">{errors.appointmentTime}</p>}
              </div>

              <div className="mt-4">
                <label htmlFor="reasonForVisit" className="block font-bold mb-2">
                  Reason for Visit
                </label>
                <textarea
                  id="reasonForVisit"
                  name="reasonForVisit"
                  value={formData.reasonForVisit}
                  onChange={handleInputChange}
                  className="border p-2 rounded-md w-full"
                  rows={3}
                />
              </div>

              <div className="mt-4">
                <label htmlFor="status" className="block font-bold mb-2">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className={`border p-2 rounded-md w-full ${errors.status ? "border-red-500" : ""}`}
                >
                  <option value="">Select status</option>
                  <option value="Scheduled">Scheduled</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
                {errors.status && <p className="text-red-500">{errors.status}</p>}
              </div>

              <div className="mt-4">
                <label htmlFor="doctorId" className="block font-bold mb-2">
                  Select Doctor
                </label>
                <select
                  id="doctorId"
                  name="doctorId"
                  value={formData.doctorId}
                  onChange={handleDoctorChange}
                  className={`border p-2 rounded-md w-full ${errors.doctorId ? "border-red-500" : ""}`}
                >
                  <option value="">Select a doctor</option>
                  {doctors.map((doctor) => (
                    <option key={doctor._id} value={doctor._id}>
                     {doctor.username}
                    </option>
                  ))}
                </select>
                {errors.doctorId && <p className="text-red-500">{errors.doctorId}</p>}
              </div>

              <button type="submit" className="bg-green-500 hover:bg-green-300 text-white px-4 py-2 rounded-md mt-4">
                Create Appointment
              </button>
            </form>

            {formSubmitted && <p className="bg-green-300 text-green-600 mt-4">Appointment created successfully!</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
