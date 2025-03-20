import { NextResponse ,NextRequest} from "next/server";

import Expense from "@/app/(models)/expense"; // Adjust the path if necessary

import { authorizedMiddleware } from '@/app/helpers/authentication';

// POST method to create a new expense
export async function POST(request: NextRequest) {
  await authorizedMiddleware(request);
  try {
    if (typeof request === 'object' && request !== null && 'user' in request) {
      const user = (request as { user: { id: string; username: string } }).user; 

      const reqBody = await request.json();
    const { discription, amount } = reqBody // Parse the request body
    reqBody.createdBy = {
      id: user.id,       // Set from user
      username: user.username,
    };

    // Validate required fields
    if (!discription || !amount ) {
      return NextResponse.json(
        { message: "Please provide all required fields: discription, amount, and createdBy" },
        { status: 400 }
      );
    }

    // Create a new Expense entry
    const newExpense = new Expense({
      discription,
      amount,
      createdBy: {
        id: user.id,
        username: user.username,
      },
    });

    // Save the expense to the database
    await newExpense.save();

    // Return the saved expense data
    return NextResponse.json(newExpense, { status: 201 });
  }} catch (error) {
    console.error("Error creating expense:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET() {
    try {

  
      // Fetch all expense records
      const expenses = await Expense.find({}).sort({ createdAt: -1 }); // Sort by createdAt (most recent first)
  
      // Return the expenses in JSON format
      return NextResponse.json(expenses, { status: 200 });
    } catch (error) {
      console.error("Error fetching expenses:", error);
      return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
  }