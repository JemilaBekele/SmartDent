
import Credit from '@/app/(models)/creadit';
import Invoice from '@/app/(models)/Invoice';
import MedicalFinding from '@/app/(models)/MedicalFinding';
import Patient from '@/app/(models)/Patient';
import { authorizedMiddleware } from '@/app/helpers/authentication';
import { connect } from '@/app/lib/mongodb';
import { NextRequest, NextResponse } from 'next/server';


connect();

export async function GET(request: NextRequest) {
    await authorizedMiddleware(request);
    try {
        MedicalFinding.find({})
        Credit.find({})
        Invoice.find({})
      // Query for patients with specific medical history and unpaid invoices or credits
      const patients = await Patient.find({})
        .populate({
          path: 'MedicalFinding',
          match: {
            $or: [
              { "TreatmentPlan.Bridge": true },
              { "TreatmentPlan.Crown": true },
              { "TreatmentDone.Bridge": true }, // Include completed treatments for Bridge
              { "TreatmentDone.Crown": true }  // Include completed treatments for Crown
            ],
          }, // Match treatment plans or treatments done for Bridge or Crown
        })
       
  
      // Filter out patients that do not have matching treatment plans/treatments done or outstanding payments
      const filteredPatients = patients.filter(
        (patient) => patient.MedicalFinding.length > 0       );
  
      // Map to include only relevant patient data
      const patientData = filteredPatients.map((patient) => ({
        _id: patient._id,
        cardno: patient.cardno,
        firstname: patient.firstname,
        age: patient.age,
        sex: patient.sex,
        MedicalFinding: patient.MedicalFinding,
      
      }));
  
      return NextResponse.json({
        success: true,
        data: patientData,
      }, { status: 200 });
    } catch (error) {
      console.error('Error fetching data:', error);
      return NextResponse.json({
        success: false,
        error: 'Server Error',
      }, { status: 500 });
    }
  }
  