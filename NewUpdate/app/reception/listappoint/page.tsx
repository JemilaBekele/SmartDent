"use client";

import React, { useState } from "react";
import {
  Table,
  TableCaption,
  TableHead,
  TableHeader,
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table";
import { useRouter } from "next/navigation";

interface Appointment {
  id: string;
  appointmentDate: string;
  appointmentTime: string;
  doctorId: { id: string; username: string };
  status: string;
  patientId: {
    id: {
      _id: string;
      firstname: string;
      phoneNumber: string;
    };
    username: string;
    cardno: string;
  };
}

const TodayAppointments: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedDoctor, setSelectedDoctor] = useState<string | null>(null); // Filter by doctor ID
  const router = useRouter();

  const fetchAppointmentsByDate = async (date: string) => {
    try {
      setLoading(true);
      const response = await fetch("/api/app/listappoint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startDate: date }),
      });
      if (!response.ok) {
        throw new Error("Failed to fetch filtered appointments");
      }
      const data = await response.json();
      if (data.success) {
        setAppointments(data.data);
      } else {
        setError(data.message || "Unknown error occurred");
      }
    } catch (err) {
      setError("Error fetching appointments.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedDate) {
      fetchAppointmentsByDate(selectedDate);
    }
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${ampm}`;
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case "Scheduled":
        return "bg-blue-200 text-blue-800";
      case "Completed":
        return "bg-green-200 text-green-800";
      case "Cancelled":
        return "bg-red-200 text-red-800";
      case "Pending":
        return "bg-yellow-200 text-yellow-800";
      default:
        return "bg-gray-200 text-gray-800";
    }
  };

  // Extract unique doctors by ID to prevent duplicates
  const uniqueDoctors = Array.from(
    new Map(appointments.map((appt) => [appt.doctorId.id, appt.doctorId])).values()
  );

  // Filter appointments by selected doctor ID
  const filteredAppointments = selectedDoctor
    ? appointments.filter((appt) => appt.doctorId.id === selectedDoctor)
    : appointments;

  return (
    <div className="mt-24 ml-0 lg:ml-60 w-full max-w-4xl lg:max-w-[calc(100%-15rem)] mx-auto p-5 rounded-lg">
      <h1 className="text-2xl font-bold mb-6 text-center">Appointments</h1>

      {/* Form for filtering by date */}
      <form onSubmit={handleSubmit} className="mb-4 text-center">
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="px-4 py-2 border rounded"
        />
        <button
          type="submit"
          className="ml-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
        >
          Filter
        </button>
      </form>

      <button
        type="button"
        className="ml-4 mb-8 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
        onClick={() => router.push(`/reception/listappoint/all`)}
      >
        All Appointments
      </button>

      {/* Doctor Filter */}
      <div className="mb-6 text-center">
        <h2 className="text-lg font-bold mb-2">Filter by Doctor</h2>
        <select
          value={selectedDoctor || ""}
          onChange={(e) => setSelectedDoctor(e.target.value || null)}
          className="px-4 py-2 border rounded w-1/3"
        >
          <option value="">All Doctors</option>
          {uniqueDoctors.map((doctor) => (
            <option key={doctor.id} value={doctor.id}>
              {doctor.username}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div>Loading appointments...</div>
      ) : error ? (
        <div className="text-center bg-red-100 text-red-500">{error}</div>
      ) : filteredAppointments.length > 0 ? (
        <Table>
          <TableCaption>Filtered Appointments</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Appointment Date</TableHead>
              <TableHead>Appointment Time</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Phone Number</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Doctor</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAppointments.map((appointment) => (
              <TableRow key={appointment.id}>
                <TableCell>
                  {new Date(appointment.appointmentDate).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </TableCell>
                <TableCell>{formatTime(appointment.appointmentTime)}</TableCell>
                <TableCell>{appointment.patientId.id.firstname}</TableCell>
                <TableCell>{appointment.patientId.id.phoneNumber}</TableCell>
                <TableCell>
                  <p
                    className={`flex items-center justify-center px-1 py-1 rounded-full ${getStatusClass(
                      appointment.status
                    )}`}
                  >
                    {appointment.status}
                  </p>
                </TableCell>
                <TableCell>{appointment.doctorId.username}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="text-center text-gray-500">No appointments found.</div>
      )}
    </div>
  );
};

export default TodayAppointments;
