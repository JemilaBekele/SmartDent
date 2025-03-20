"use client";

import React, { useState, useEffect } from "react";
import {
  Table,
  TableCaption,
  TableHead,
  TableHeader,
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table";

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

// Removed the filteredUpcomingAppointments variable entirely

// Removed the filteredUpcomingAppointments variable entirely

const TodayAppointments: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<string | null>(null); // Stores the selected doctor by ID
  const [showPastAppointments, setShowPastAppointments] = useState<boolean>(false); // Toggle for past appointments

  useEffect(() => {
    fetchAppointments(); // Fetch appointments when the component mounts
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/app/listappoint", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch appointments");
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

  // Get today's date (YYYY-MM-DD)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Sort appointments by the most recent date first
  const sortedAppointments = [...appointments].sort(
    (a, b) => new Date(b.appointmentDate).getTime() - new Date(a.appointmentDate).getTime()
  );

  // Filter past and future appointments
  const upcomingAppointments = sortedAppointments.filter(
    (appt) => new Date(appt.appointmentDate) >= today
  );
  // Sort upcoming appointments by date in ascending order
  const sortedUpcomingAppointments = [...upcomingAppointments].sort(
    (a, b) => new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime()
  );

  const pastAppointments = sortedAppointments.filter(
    (appt) => new Date(appt.appointmentDate) < today
  );

  // Filter appointments for the selected doctor and whether past or upcoming are to be displayed
  const filteredAppointments = selectedDoctor
    ? (showPastAppointments ? pastAppointments : sortedUpcomingAppointments).filter(
        (appt) => appt.doctorId.id === selectedDoctor
    )
    : [];

  // Extract unique doctors by **doctor ID** (ensuring uniqueness regardless of name changes)
  const uniqueDoctors = Array.from(
    new Map(upcomingAppointments.map((appt) => [appt.doctorId.id, appt.doctorId])).values()
  );

  return (
    <div className="mt-24 ml-0 lg:ml-60 w-full max-w-6xl lg:max-w-[calc(100%-15rem)] mx-auto p-5 rounded-lg">
      <h1 className="text-2xl font-bold mb-6 text-center">Appointments</h1>

      {loading ? (
        <div>Loading appointments...</div>
      ) : error ? (
        <div className="text-center bg-red-100 text-red-500">{error}</div>
      ) : (
        <div className="flex">
          {/* Sidebar for selecting doctors by ID */}
          <div className="w-1/4 p-4 bg-gray-100 rounded-lg">
            <h2 className="text-lg font-bold mb-4">Select Doctor</h2>
            {uniqueDoctors.length > 0 ? (
              <ul className="space-y-2">
                {uniqueDoctors.map((doctor) => (
                  <li
                    key={doctor.id}
                    className={`cursor-pointer px-3 py-2 rounded-md ${
                      selectedDoctor === doctor.id
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200 hover:bg-gray-300"
                    }`}
                    onClick={() => setSelectedDoctor(doctor.id)}
                  >
                    {doctor.username}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No doctors available.</p>
            )}
          </div>

          {/* Main content - Appointments for selected doctor */}
          <div className="w-3/4 p-4">
            {selectedDoctor ? (
              <>
                <div className="flex justify-between mb-4">
                  <h2 className="text-xl font-bold">Appointments for {selectedDoctor}</h2>
                  <button
                    className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                    onClick={() => setShowPastAppointments(!showPastAppointments)}
                  >
                    {showPastAppointments ? "Show Upcoming" : "Show Past"}
                  </button>
                </div>

                <Table>
                  <TableCaption>
                    {showPastAppointments
                      ? `Past appointments for Dr. ${selectedDoctor}`
                      : `Upcoming appointments for Dr. ${selectedDoctor}`}
                  </TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Appointment Date</TableHead>
                      <TableHead>Appointment Time</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Phone Number</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAppointments.length > 0 ? (
                      filteredAppointments.map((appointment) => (
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
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-gray-500">
                          No {showPastAppointments ? "past" : "upcoming"} appointments found for this
                          doctor.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </>
            ) : (
              <p className="text-center text-gray-500">Select a doctor to view their appointments.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TodayAppointments;

