import { NextRequest, NextResponse } from 'next/server';
import Appointment from '@/app/(models)/appointment';
import { authorizedMiddleware } from '@/app/helpers/authentication';
import Patient from '@/app/(models)/Patient';

export async function GET(request: NextRequest) {
  await authorizedMiddleware(request);
  console.log('GET request received');
  
  try {
    // Get tomorrow's date range
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1); // Move to the next day
    const startOfTomorrow = new Date(tomorrow.setHours(0, 0, 0, 0)); // Start of tomorrow
    const endOfTomorrow = new Date(tomorrow.setHours(23, 59, 59, 999)); // End of tomorrow
    await Patient.find({});
    // Find all scheduled appointments for tomorrow
    const tomorrowAppointments = await Appointment.find({
      appointmentDate: {
        $gte: startOfTomorrow,
        $lt: endOfTomorrow,
      },
      status: 'Scheduled', // Ensure you're filtering for 'Scheduled' status
    })
      .populate('patientId.id') // Populate nested patient reference
      .exec();

    // Check if any appointments were found
    if (!tomorrowAppointments || tomorrowAppointments.length === 0) {
      return NextResponse.json({ message: "No scheduled appointments for tomorrow", data: [] });
    }

    // Return tomorrow's scheduled appointments
    return NextResponse.json({
      message: "Tomorrow's scheduled appointments retrieved successfully",
      success: true,
      data: tomorrowAppointments,
    });
  } catch (error) {
    console.error("Error retrieving tomorrow's appointments:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
