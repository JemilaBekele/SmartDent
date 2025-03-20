import { NextRequest, NextResponse } from 'next/server';
import MedicalFinding from '@/app/(models)/MedicalFinding';
import Patient from '@/app/(models)/Patient';
import { authorizedMiddleware } from '@/app/helpers/authentication';
import { connect } from '@/app/lib/mongodb';
import Disease from '@/app/(models)/disease';
connect();
interface MedicalFinding {
  createdAt: string; // or Date, depending on how you store it
  // Add other fields as needed
}
// Create a new medical finding 
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
 await authorizedMiddleware(request);
  
  

  try {
    const { id } = params;
    if (!id) {
      return NextResponse.json({ error: "patient ID is required" }, { status: 400 });
    }

    if (typeof request === 'object' && request !== null && 'user' in request) {
      const user = (request as { user: { id: string; username: string } }).user; // Type assertion for user
      

      const {
        ChiefCompliance,
  Historypresent,
  DrugAllergy,
  Diagnosis,
  Pastmedicalhistory,
  Pastdentalhistory,
  IntraoralExamination,
  ExtraoralExamination,
  Investigation,
  Assessment,
  NextProcedure,
  TreatmentPlan,
  TreatmentDone,
  diseases
      } = await request.json();

      const createdBy = {
        id: user.id,
        username: user.username,
      };
     
      // Validate patient existence
      const patient = await Patient.findById(id).exec();
      if (!patient) {
        return NextResponse.json({ error: "Patient not found" }, { status: 404 });
      }

      // Create new MedicalFinding
      const newMedicalFinding = new MedicalFinding({
        ChiefCompliance,
        Historypresent,
        DrugAllergy,
        Diagnosis,
        Pastmedicalhistory,
        Pastdentalhistory,
        IntraoralExamination,
        ExtraoralExamination,
        Investigation,
        Assessment,
        NextProcedure,
        TreatmentPlan,
        TreatmentDone,
        patientId: { id: patient._id },
        createdBy,
        diseases: diseases.map(diseaseId => ({
          disease: diseaseId,  // Assuming diseaseId is an ObjectId string
          diseaseime: Date.now(),  // Or use `new Date()` to store the current date-time
        })),
      });

      const savedFinding = await newMedicalFinding.save();
      if (!patient.MedicalFinding) {
        patient.MedicalFinding = [];
      }

      patient.MedicalFinding.push(savedFinding._id);
      await patient.save();

      return NextResponse.json({
        message: "Medical finding created successfully",
        success: true,
        data: savedFinding,
      });
    } else {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  } catch (error) {
    console.error("Error creating medical finding:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}


export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    if (!id) {
      return NextResponse.json({ error: "Patient ID is required" }, { status: 400 });
    }
    await Disease.find({});
    // Find the patient by ID and populate MedicalFinding
    const patient = await Patient.findById(id)
      .populate({
        path: 'MedicalFinding',
        populate: {
          path: 'diseases.disease', // Populate the 'disease' field in the diseases array
          model: 'Disease', // Reference to the Disease model
          select: 'disease', // Select only the 'disease' name field from the Disease model
        },
      })
      .exec();

    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    // If the patient has no medical findings, return an empty array
    if (!patient.MedicalFinding || patient.MedicalFinding.length === 0) {
      return NextResponse.json({ message: "No medical findings available for this patient", data: [] });
    }

    // Sort medical findings by createdAt field in descending order
    const sortedFindings = patient.MedicalFinding.sort((a: MedicalFinding, b: MedicalFinding) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    // Map the medical findings to include only the necessary details, such as disease names
    const formattedFindings = sortedFindings.map((finding: any) => ({
      ...finding.toObject(),
      diseases: finding.diseases.map((disease: any) =>
        disease.disease?.disease || "Unknown disease" // Fallback to "Unknown disease" if disease name is missing
      ),
    }));

    // Return the sorted and formatted medical findings
    return NextResponse.json({
      message: "Medical findings retrieved successfully",
      success: true,
      data: formattedFindings,
    });
  } catch (error) {
    console.error("Error retrieving medical findings:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

