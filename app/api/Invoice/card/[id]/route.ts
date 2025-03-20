import { NextRequest, NextResponse } from 'next/server';
import Card from '@/app/(models)/card';
import Patient from '@/app/(models)/Patient';
import { authorizedMiddleware } from '@/app/helpers/authentication';

interface Card {
  createdAt: string; // or Date, depending on how you store it
  // Add other fields as needed
}

// Create a new medical finding
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  await authorizedMiddleware(request);

  try {
    const { id } = params;
    if (!id) {
      return NextResponse.json({ error: "Patient ID is required" }, { status: 400 });
    }

    const requestBody = await request.json();
    const { cardprice } = requestBody;

    // Check if cardprice is missing
    if (!cardprice) {
      return NextResponse.json({ error: "Missing required fields: cardprice" }, { status: 400 });
    }

    const patient = await Patient.findById(id).exec();
    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    if (typeof request === 'object' && request !== null && 'user' in request) {
      const user = (request as { user: { id: string; username: string } }).user;
      console.log("User Data:", user);

      // Create new card
      const newCard = new Card({
        cardprice,
        patient: {
          id: patient._id,
          username: patient.firstname,
          cardno: patient.cardno,
        },
        createdBy: {
          id: user.id,
          username: user.username,
        },
      });

      const savedCard = await newCard.save();

      // Add the new Card to the patient's record
      patient.Card = patient.Card || [];
      patient.Card.push(savedCard._id);
      await patient.save();

      return NextResponse.json({
        message: "Card created successfully",
        success: true,
        data: savedCard,
      });
    } else {
      return NextResponse.json({ error: "Unauthorized user" }, { status: 401 });
    }
  } catch (error) {
    console.error("Error creating Card:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}



export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
 

  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json({ error: "Patient ID is required" }, { status: 400 });
    }

    // Find the patient by ID and populate Card
    const patient = await Patient.findById(id).populate('Card').exec();
    if (!patient) {
      return NextResponse.json({ error: "Patient not found" });
    }

    // Log the patient's health information
    console.log("Patient's Card:", patient.Card);

    // If the patient has no medical findings, return an empty array
    if (!patient.Card || patient.Card.length === 0) {
      return NextResponse.json({ message: "No Card available for this patient", data: [] });
    }

    // Sort medical findings by createdAt field in descending order
    const sortedFindingsCard = patient.Card.sort((a: Card, b: Card) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    // Return the sorted medical findings
    return NextResponse.json({
      message: "Card retrieved successfully",
      success: true,
      data: sortedFindingsCard,
    });
  } catch (error) {
    console.error("Error retrieving Card:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}