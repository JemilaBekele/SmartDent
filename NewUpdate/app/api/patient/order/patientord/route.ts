import { NextRequest, NextResponse } from 'next/server';
import Patient from "@/app/(models)/Patient";
import { connect } from '@/app/lib/mongodb';
import { authorizedMiddleware } from '@/app/helpers/authentication';
connect();
export async function POST(request: NextRequest) {

     await authorizedMiddleware(request);
  try {
    const body = await request.json();
    const { phoneNumber, cardno } = body;

    console.log('Received Body Parameters:', { phoneNumber, cardno });

    if (!phoneNumber && !cardno) {
      return NextResponse.json({ error: 'phoneNumber or Card ID is required' }, { status: 400 });
    }

    const query = phoneNumber ? { phoneNumber } : { cardno };
    const patient = await Patient.findOne(query).exec();

    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    return NextResponse.json(patient);
  } catch (error: unknown) {
    console.error("Error fetching patient:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
