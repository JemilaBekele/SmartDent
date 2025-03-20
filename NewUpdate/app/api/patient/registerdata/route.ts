import {connect} from "@/app/lib/mongodb";
import Patient from "@/app/(models)/Patient";
import { NextRequest, NextResponse } from "next/server";
// Adjust the checkAuthenticationpath as needed
import {authorizedMiddleware} from "@/app/helpers/authentication"
connect();


export async function POST(request: NextRequest) {
  // Authorization Middleware
await authorizedMiddleware(request);


  try {
    // Check if the request has a 'user' property
    if (typeof request === 'object' && request !== null && 'user' in request) {
      const user = (request as { user: { id: string; username: string } }).user; // Type assertion for user
      
      console.log("User Data:", user);

      // Parsing the request body
      const reqBody = await request.json();
      console.log("Request Body:", reqBody);

      // Extract necessary fields from the body
      const { cardno, firstname, age, sex, phoneNumber, description,Town,KK,HNo,credit,Region  ,Woreda, disablity} = reqBody;

      // Add createdBy field based on authenticated user
      reqBody.createdBy = {
        id: user.id,       // Set from user
        username: user.username,
      };

      

      // Check for existing patient by card number
      const existingCardNo = await Patient.findOne({ cardno });
      if (existingCardNo) {
        return NextResponse.json({ error: "User with this card number already exists" }, { status: 400 });
      }

     
      // Create new patient
      const newPatient = new Patient({
        cardno,
        firstname,       
        age,
        sex,
        Town,
        KK,
        HNo ,
        phoneNumber,
        description,
        credit,
        Region  ,Woreda, disablity,
        createdBy: reqBody.createdBy,
      });

      // Save new patient to database
      const savedPatient = await newPatient.save();
      return NextResponse.json({
        message: "Patient created successfully",
        success: true,
        savedPatient,
      });
    } else {
      // Handle case where user property is missing
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  } catch (error) {
    // Log and handle error
    console.error("Error in POST /api/patient/registerdata", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}



export async function GET(request: NextRequest) {
  const authrtoResponse = await authorizedMiddleware(request);
  if (authrtoResponse) {
    return authrtoResponse;
  }

 
    try {
      // Ensure the user is authenticated
   
      // Fetch all users from the database
      const patients = await Patient.find({});
      return NextResponse.json(patients);
    } catch (error: unknown) {
      console.error("Error in GET /api/patient/registerdata", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  }