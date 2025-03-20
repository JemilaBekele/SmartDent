import { NextRequest, NextResponse } from 'next/server';
import Patient from "@/app/(models)/Patient";

interface Query {
  cardno?: string; // exact match for cardno
  phoneNumber?: { $regex: string; $options: string }; 
  firstname?: { $regex: string; $options: string }; // optional regex for firstName
}

import { connect } from '@/app/lib/mongodb';
import { authorizedMiddleware } from '@/app/helpers/authentication';

connect();

// Extract search parameters outside of the try-catch block
const getSearchParams = (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const cardno = searchParams.get('cardno');
  const phoneNumber = searchParams.get('phoneNumber');
  const firstname = searchParams.get('firstname'); // Match the schema field name
  return { cardno, phoneNumber, firstname };
};

export async function GET(request: NextRequest) {
  await authorizedMiddleware(request);

  // Get the search parameters
  const { cardno, phoneNumber, firstname } = getSearchParams(request);

  // Initialize the query object
  const query: Query = {};

  try {
    // Build the query based on provided parameters
    if (cardno) {
      query.cardno = cardno; // Exact match for cardno
    }
    if (phoneNumber) {
      query.phoneNumber = { $regex: phoneNumber, $options: 'i' }; // Case-insensitive search for phone number
    }
    if (firstname) {
      query.firstname = { $regex: firstname, $options: 'i' }; // Case-insensitive search for firstname
    }

    // Check if no parameters were provided
    if (!cardno && !phoneNumber && !firstname) {
      return NextResponse.json(
        { error: 'At least one search parameter (cardno, phoneNumber, or firstname) is required' },
        { status: 400 }
      );
    }

    // Query the Patient model with the constructed query
    const patients = await Patient.find(query).exec();

    // Check if patients were found
    if (!patients || patients.length === 0) {
      return NextResponse.json(
        { error: "No patients found" },
       
      );
    }

    // Return the found patients
    return NextResponse.json(patients);
  } catch (error) {
    console.error("Error fetching patients:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

