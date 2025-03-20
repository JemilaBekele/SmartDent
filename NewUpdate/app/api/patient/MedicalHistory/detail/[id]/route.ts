import { NextRequest, NextResponse } from 'next/server';
import MedicalFinding from '@/app/(models)/MedicalFinding';
import Patient from "@/app/(models)/Patient";
import { authorizedMiddleware } from '@/app/helpers/authentication';
import { connect } from '@/app/lib/mongodb';
import { Types } from 'mongoose';
connect();
interface MedicalFinding {
  createdAt: string; // or Date, depending on how you store it
  // Add other fields as needed
}


interface MedicalFindingType {
  _id: Types.ObjectId;
  ChiefCompliance: string;
  Historypresent: string;
  DrugAllergy: string;
  Diagnosis: string;
  Pastmedicalhistory: string;
  Pastdentalhistory: string;
  IntraoralExamination: string;
  ExtraoralExamination: string;
  Investigation: string;
  Assessment: string;
  TreatmentPlan: Array<Record<string, unknown>>;
  TreatmentDone: Array<Record<string, unknown>>;
  diseases: Array<{ disease: Types.ObjectId }>;
  patientId: { id: Types.ObjectId };
  createdBy: Record<string, unknown>;
  changeHistory: Array<Record<string, unknown>>;
  createdAt: Date;
  updatedAt: Date;
}

// Create a new medical finding
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  await authorizedMiddleware(request);
  try {
    const { id } = params; // Treatment Plan ID

    if (!id) {
      return NextResponse.json({ error: "Treatment Plan ID is required" }, { status: 400 });
    }

    // Fetch the medical finding without populating `disease`
    const finding = await MedicalFinding.findById(id).lean<MedicalFindingType>(); // Use lean for a plain JavaScript object

    if (!finding) {
      return NextResponse.json({ error: "Medical finding not found" }, { status: 404 });
    }

    // Ensure diseases only include the `disease` field as an ID
    if (finding.diseases && Array.isArray(finding.diseases)) {
      finding.diseases = finding.diseases.map((d: any) => d.disease); // Extract only the disease ID
    }

    return NextResponse.json({
      message: "Medical finding retrieved successfully",
      success: true,
      data: finding,
    });
  } catch (error) {
    console.error("Error retrieving medical finding:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}






  
  
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResponse = await authorizedMiddleware(request);
  if (authResponse) return authResponse;

  try {
    const { id } = params; // Medical Finding ID
    if (!id) {
      return NextResponse.json({ error: "Finding ID is required" }, { status: 400 });
    }

    const body = await request.json(); // Parse the request body
    const { diseases, ...data } = body; // Separate `diseases` from other data

    const user = (request as { user: { id: string; username: string } }).user;

    if (!user) {
      return NextResponse.json({ error: "Unauthorized user" }, { status: 401 });
    }

    // Step 1: Prepare the updated data
    const updateData = {
      ...data,
      updatedBy: { id: user.id, username: user.username },
      updateTime: new Date(),
      // Handle diseases: map diseases to the desired structure
      diseases: diseases.map((diseaseId: string) => ({
        disease: diseaseId,
        diseaseTime: new Date(), // Current timestamp
      })),
    };

    // Update the document and return the updated data
    const updatedFinding = await MedicalFinding.findByIdAndUpdate(
      id,
      updateData,
      { new: true } // Return the updated document
    );

    if (!updatedFinding) {
      return NextResponse.json({ error: "Medical finding not found" }, { status: 404 });
    }

    // Step 2: Append to `changeHistory`
    const changeHistoryData = {
      changeTime: new Date(),
      updatedBy: { id: user.id, username: user.username },
      changes: data, // Track changes (except diseases since they were mapped separately)
    };

    await MedicalFinding.findByIdAndUpdate(
      id,
      { $push: { changeHistory: changeHistoryData } },
      { new: true }
    );

    return NextResponse.json(
      {
        success: true,
        message: "Medical finding updated successfully",
        data: updatedFinding,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating medical finding:", error);
    return NextResponse.json({ error: "Error updating medical finding" }, { status: 500 });
  }
}









  

  

 







  





















  

  export async function DELETE(request: NextRequest,
    { params }: { params: { id: string } }) {
    // Authorization check
     authorizedMiddleware(request);
    
  
    try {
      const { id } = params; // Treatment Plan ID


      if (!id) {
        return NextResponse.json({ error: "Treatment Plan ID is required" }, { status: 400 });
      }
  
      
  
      // Find and delete the medical finding by ID
      const deletedFinding = await MedicalFinding.findByIdAndDelete(id).exec();
      if (!deletedFinding) {
        return NextResponse.json({ error: "Medical finding not found" }, { status: 404 });
      }
  
      // Remove the MedicalFinding reference from the associated patient's record
      const patient = await Patient.findOneAndUpdate(
        { MedicalFinding: id }, // Find patient with this MedicalFinding ID
        { $pull: { MedicalFinding: id } }, // Remove the MedicalFinding ID from the array
        { new: true } // Return the updated patient document
      );
  
      if (!patient) {
        console.warn(`No patient found with MedicalFinding ID: ${id}`);
      }
      return NextResponse.json({
        message: "Medical finding deleted successfully",
        success: true,
      });
    } catch (error) {
      console.error("Error deleting medical finding:", error);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
  }