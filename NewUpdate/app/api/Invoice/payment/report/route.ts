import { NextRequest, NextResponse } from 'next/server';
import Invoice from '@/app/(models)/Invoice';
import History from '@/app/(models)/history';
import Card from '@/app/(models)/card';
import Expense from '@/app/(models)/expense';

import { connect } from '@/app/lib/mongodb';
import { authorizedMiddleware } from '@/app/helpers/authentication';
import Patient from '@/app/(models)/Patient';

connect();

interface Query {
  'Invoice.created.id'?: string;
  'Invoice.receipt'?: boolean;
  createdAt?: {
    $gte?: Date;
    $lte?: Date;
  };
}

export async function POST(req: NextRequest) {
  await authorizedMiddleware(req);
  const body = await req.json();
  const { id, startDate, endDate, receipt } = body;

  if (!id && (!startDate || !endDate)) {
    return NextResponse.json(
      { message: 'Either username or both start and end dates are required.', success: false },
      { status: 400 }
    );
  }
  await Patient.find({});
  try {
    const query: Query = {};
    let startDateObj: Date | null = null;
    let endDateObj: Date | null = null;

    if (id) {
      query['Invoice.created.id'] = id;
    }

    if (startDate && endDate) {
      startDateObj = new Date(startDate);
      endDateObj = new Date(endDate);

      if (isNaN(startDateObj.getTime()) || isNaN(endDateObj.getTime())) {
        return NextResponse.json({ message: 'Invalid date format.', success: false }, { status: 400 });
      }

      if (endDateObj < startDateObj) {
        return NextResponse.json({ message: 'End date must be greater than or equal to start date.', success: false }, { status: 400 });
      }

      endDateObj.setHours(23, 59, 59, 999);
      query.createdAt = { $gte: startDateObj, $lte: endDateObj };
    }

    if (receipt !== undefined) {
      query['Invoice.receipt'] = receipt;
    }

    // Fetch history and populate patient name
    const history = await History.find(query)
      .populate({
        path: 'Invoice.customerName.id',
        model: 'Patient',
        select: 'firstname', // Select only the firstname for created user
      });

      let cards: Array<any> = [];  // Or use `Array<CardType>` if you have a defined type
      let Expenses: Array<any> = []; // Or use `Array<ExpenseType>` if you have a defined type
  
      if (!id) {
        cards = await Card.find({
          createdAt: { $gte: startDateObj, $lte: endDateObj },
        }).populate({
          path: 'patient.id',
          select: 'firstname', // Selecting only the firstname for created user
        });
  
        Expenses = await Expense.find({
          createdAt: { $gte: startDateObj, $lte: endDateObj },
        });
      }
  

    return NextResponse.json(
      {
        message: 'Invoices, cards, and expenses retrieved successfully',
        success: true,
        data: {
          history,
          cards,
          Expenses,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching invoices and history:', error);
    return NextResponse.json(
      { message: 'Failed to retrieve invoices and history.', success: false },
      { status: 500 }
    );
  }
}





export async function GET() {
  try {
    // Correct the typo from `falsee` to `false`
    const invoices = await Invoice.find({
      'currentpayment.confirm': false, // Use quotes around the key
    });

    // Return the success response with status 200
    return NextResponse.json({
      message: 'Invoices retrieved successfully',
      success: true,
      data: invoices,
    }, { status: 200 });
  } catch (error) {
    // Log and return an error response with status 500
    console.error('Error fetching invoices:', error);
    return NextResponse.json({
      message: 'Failed to retrieve invoices.',
      success: false,
    }, { status: 500 });
  }
}

