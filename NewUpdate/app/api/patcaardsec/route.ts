import {connect} from "@/app/lib/mongodb";
import Patient from "@/app/(models)/Patient";
import { NextRequest, NextResponse } from "next/server";
// Adjust the checkAuthenticationpath as needed
import {authorizedMiddleware} from "@/app/helpers/authentication"
connect();



export async function GET(request: NextRequest) {
    const authrtoResponse = await authorizedMiddleware(request);
    if (authrtoResponse) {
      return authrtoResponse;
    }
  
    try {
      // Find the patient with the highest card number (assuming cardno is numeric)
      const highestPatient = await Patient.findOne()
        .sort({ cardno: -1 }) // Sort in descending order
        .select("cardno") // Select only the cardno field
  
      if (!highestPatient) {
        return NextResponse.json(
          { error: "No patients found" },
          { status: 404 }
        );
      }
  
      return NextResponse.json({ highestCardNumber: highestPatient.cardno });
    } catch (error: unknown) {
      console.error("Error in GET /api/patient/highest-card", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  }
  