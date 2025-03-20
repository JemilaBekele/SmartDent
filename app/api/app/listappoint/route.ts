import { NextRequest, NextResponse } from 'next/server';
import Appointment from '@/app/(models)/appointment';
import { connect } from '@/app/lib/mongodb';
import Patient from '@/app/(models)/Patient';
import { authorizedMiddleware } from '@/app/helpers/authentication';
connect();
interface Query {
  appointmentDate?: {
    $gte?: Date;
    $lt?: Date;
  };
}

export async function POST(req: NextRequest) {
      authorizedMiddleware(req);
  try {
    // Extract and parse the body
    const body = await req.json();
    const { startDate } = body;
    await Patient.find({});
    // Check if the required parameter (startDate) is provided
    if (!startDate) {
      return NextResponse.json({
        message: 'Start date is required.',
        success: false,
      }, { status: 400 });
    }

    // Initialize the query object
    const query: Query = {};

    // Process the startDate
    const startDateObj = new Date(startDate);
    
    // Validate the date
    if (isNaN(startDateObj.getTime())) {
      return NextResponse.json({
        message: 'Invalid date format.',
        success: false,
      }, { status: 400 });
    }

    // Create a range for the appointment date filter
    const startOfDay = new Date(startDateObj);
    startOfDay.setHours(0, 0, 0, 0); // Set to the start of the day (midnight)

    const endOfDay = new Date(startDateObj);
    endOfDay.setHours(23, 59, 59, 999); // Set to the end of the day (just before midnight of the next day)

    // Add the appointment date filter (from startOfDay to endOfDay)
    query.appointmentDate = { $gte: startOfDay, $lt: endOfDay };

    // Find appointments that match the query and status
    const appointments = await Appointment.find({
      ...query, // Spread the existing query for appointmentDate
      status: 'Scheduled' // Add the status condition
    }).populate('patientId.id').exec();

    // Return the response with the found appointments
    return NextResponse.json({
      message: 'Appointments retrieved successfully',
      success: true,
      data: appointments,
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return NextResponse.json({
      message: 'Failed to retrieve appointments.',
      success: false,
    }, { status: 500 });
  }
}


export async function GET(req: NextRequest) {
  // Call the authorization middleware to check the request
  const authrtoResponse = await authorizedMiddleware(req);
  if (authrtoResponse) {
    return authrtoResponse;
  }

  try {
    // Find all appointments that are "Scheduled"
    const appointments = await Appointment.find({
      status: 'Scheduled', // Filter by "Scheduled" status
    })
    .populate('patientId.id') // Populate the patient data
    .sort({ appointmentDate: 1 }) // Sort appointments by appointmentDate (ascending)
    .exec();

    // Return the response with the found appointments
    return NextResponse.json({
      message: 'Appointments retrieved successfully',
      success: true,
      data: appointments,
    }, { status: 200 });

  } catch (error) {
    console.error('Error fetching appointments:', error);
    return NextResponse.json({
      message: 'Failed to retrieve appointments.',
      success: false,
    }, { status: 500 });
  }
}