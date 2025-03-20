import { NextRequest, NextResponse } from 'next/server';
import Patient from "@/app/(models)/Patient";
import User from "@/app/(models)/User";
import Order from "@/app/(models)/Order";
import { authorizedMiddleware } from "@/app/helpers/authentication";
import { connect } from '@/app/lib/mongodb';
connect();


export async function POST(request: NextRequest) {
  // Middleware check for authorization
 await authorizedMiddleware(request);
 

  try {
    if (typeof request === 'object' && request !== null && 'user' in request) {
      const user = (request as { user: { id: string; username: string } }).user; // Type assertion for user
      console.log("User Data:", user);

      const reqBody = await request.json();
      const { patientId, assignedDoctorId, status } = reqBody;

      reqBody.createdBy = {
        id: user.id,       // Set from user
        username: user.username,
      };

      // Fetch the patient
      const patient = await Patient.findById(patientId).exec();
      if (!patient) {
        console.error(`Patient not found: ${patientId}`);
        return NextResponse.json({ error: "Patient not found" }, { status: 404 });
      }

      // Fetch the assigned doctor
      const assignedDoctor = await User.findById(assignedDoctorId);
      if (!assignedDoctor) {
        console.error(`Doctor not found: ${assignedDoctorId}`);
        return NextResponse.json({ error: "Doctor not found" }, { status: 404 });
      }

      // Check if the patient already has an order
      if (patient.Order && patient.Order.length > 0) {
        // If an order exists, update the first order (or find specific logic to update)
        const existingOrder = await Order.findById(patient.Order[0]).exec(); // Assuming you want to update the first order

        if (existingOrder) {
          // Update the existing order with new information
          existingOrder.assignedDoctorTo = {
            id: assignedDoctor._id,
            username: assignedDoctor.username,
          };
          existingOrder.status = status;
          existingOrder.updatedAt = new Date(); // Optional: Update the timestamp for the order

          const updatedOrder = await existingOrder.save();

          return NextResponse.json({
            message: "Order updated successfully",
            success: true,
            updatedOrder,
          });
        }
      }

      // If no order exists, create a new order
      const newOrder = new Order({
        assignedDoctorTo: {
          id: assignedDoctor._id,
          username: assignedDoctor.username,
        },
        patientId: {
          id: patient._id,
        },
        createdBy: {
          id: user.id,
          username: user.username,
        },
        status,
      });

      // Save the new order
      const savedOrder = await newOrder.save();

      // Attach the new order to the patient
      if (!patient.Order) {
        patient.Order = [];
      }
      patient.Order.push(savedOrder._id);
      await patient.save();

      return NextResponse.json({
        message: "Order created successfully",
        success: true,
        savedOrder,
      });
    }
  } catch (error) {
    console.error("Error in POST /api/patient/order", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}















export async function GET() {
 
  try {
    // Find users with the role of 'doctor'
    const doctors = await User.find({ role: 'doctor' }, { username: 1, _id: 1 }).exec();

    return NextResponse.json(doctors);
  } catch (error) {
    console.error("Error fetching doctors:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}