import { NextRequest, NextResponse } from 'next/server';
// Adjust the path to your Invoice model
import Expense from '@/app/(models)/expense'; // Import Card model
import { Item } from '@/types/expens';
import { connect } from '@/app/lib/mongodb';
connect();
interface Query {
 
  createdAt?: {
    $gte?: Date;
    $lte?: Date;
  };
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {  startDate, endDate } = body;

  // Check if at least one of the required parameters is provided
  if ( (!startDate || !endDate)) {
    return NextResponse.json({ message: 'Either username or both start and end dates are required.', success: false }, { status: 400 });
  }

  try {
    const query: Query = {}; // Use the specific Query type

    // Declare startDateObj and endDateObj here
    let startDateObj: Date | null = null;
    let endDateObj: Date | null = null;

    

    // Add date range filter if both startDate and endDate are provided
    if (startDate && endDate) {
      startDateObj = new Date(startDate);
      endDateObj = new Date(endDate);

      if (isNaN(startDateObj.getTime()) || isNaN(endDateObj.getTime())) {
        return NextResponse.json({ message: 'Invalid date format.', success: false }, { status: 400 });
      }

      if (endDateObj < startDateObj) {
        return NextResponse.json({ message: 'End date must be greater than or equal to start date.', success: false }, { status: 200 });
      }

      if (startDateObj.getTime() === endDateObj.getTime()) {
        endDateObj.setHours(23, 59, 59, 999);
      } else {
        endDateObj.setHours(23, 59, 59, 999); // Include end of the day for endDate
      } // Set end date to the end of the day

      // Add date filter to query
      query.createdAt = { $gte: startDateObj, $lte: endDateObj }; // Access createdAt correctly
    }

    // Fetch history based on the query
    const expense: Item[] = await Expense.find(query);

   

    // Return the combined results
    return NextResponse.json({
      message: 'Invoices and cards retrieved successfully',
      success: true,
      data: {
        expense,
        
      },
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching invoices and cards:', error);
    return NextResponse.json({ message: 'Failed to retrieve invoices and cards.', success: false }, { status: 500 });
  }
}





