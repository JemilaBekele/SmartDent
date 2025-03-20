import Patient from "@/app/(models)/Patient";
import { NextRequest, NextResponse } from "next/server";
// Adjust the checkAuthenticationpath as needed
import {authorizedMiddleware} from "@/app/helpers/authentication"
import { subMonths, startOfDay } from "date-fns";
import { connect } from '@/app/lib/mongodb';
connect();


export async function GET(request: NextRequest) {
  const authrtoResponse = await authorizedMiddleware(request);
  if (authrtoResponse) {
    return authrtoResponse;
  }

  try {
    // Get today's date and subtract 3 months to get the start of the range
    const today = startOfDay(new Date()); // Start of today (00:00:00)
    const threeMonthsAgo = subMonths(today, 3); // 3 months ago at 00:00:00

    // Fetch patients registered within the last 3 months (including today)
    const patients = await Patient.find({
      createdAt: {
        $gte: threeMonthsAgo, // Greater than or equal to 3 months ago
        $lt: new Date(),      // Less than now (to include today)
      },
    });

    return NextResponse.json(patients);
  } catch (error: unknown) {
    console.error("Error in GET /api/patient/registerdata", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}