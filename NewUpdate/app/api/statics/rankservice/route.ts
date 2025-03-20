import Credit from '@/app/(models)/creadit';
import Invoice from '@/app/(models)/Invoice';


import { authorizedMiddleware } from '@/app/helpers/authentication';
import mongoose from 'mongoose';
import { NextRequest, NextResponse } from 'next/server';



export async function GET(request: NextRequest) {
  try {
    // Run the authorization middleware
    await authorizedMiddleware(request);

    // Aggregate services from both Invoice and Credit collections
    const invoiceStats = await Invoice.aggregate([
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.service.id',
          serviceName: { $first: '$items.service.service' },
          totalUsageCount: { $sum: '$items.quantity' },
          totalRevenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } },
        },
      },
    ]);

    const creditStats = await Credit.aggregate([
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.service.id',
          serviceName: { $first: '$items.service.service' },
          totalUsageCount: { $sum: '$items.quantity' },
          totalRevenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } },
        },
      },
    ]);

    // Combine statistics from both sources
    const combinedStats = [...invoiceStats, ...creditStats];

    // Merge statistics by service ID
    const mergedStats = combinedStats.reduce((acc, curr) => {
      const existing = acc.find(stat => stat._id.toString() === curr._id.toString());
      if (existing) {
        existing.totalUsageCount += curr.totalUsageCount;
        existing.totalRevenue += curr.totalRevenue;
      } else {
        acc.push(curr);
      }
      return acc;
    }, []);

    // Rank by usage count (Top 4)
    const rankByUsage = [...mergedStats].sort((a, b) => b.totalUsageCount - a.totalUsageCount).slice(0, 14);

    // Rank by revenue (Top 4)
    const rankByRevenue = [...mergedStats].sort((a, b) => b.totalRevenue - a.totalRevenue).slice(0, 14);

    console.log(rankByRevenue);

    // Return only the top 4 services
    return NextResponse.json({
      success: true,
      data: {
        rankByUsage,
        rankByRevenue,
      },
    });
  } catch (error) {
    // Handle errors and return a response
    return NextResponse.json(
      {
        success: false,
        message: 'Error fetching service statistics',
        error: error.message,
      },
      { status: 500 }
    );
  }
}




interface Query {
 'createdBy.id'?: string | mongoose.Types.ObjectId; 

  createdAt?: {
    $gte?: Date;
    $lte?: Date;
  };
}


export async function POST(request: NextRequest) {
  try {
    // Run the authorization middleware
    await authorizedMiddleware(request);

    // Parse the request body
    const body = await request.json();

    // Ensure required fields are in the body
    const { createdBy, startDate, endDate } = body;
    console.log(createdBy);
    if (!createdBy) {
      return NextResponse.json(
        {
          success: false,
          message: 'createdBy field is required.',
        },
        { status: 400 }
      );
    }

    // Prepare the filter object
    const filter: Query = { "createdBy.id": new mongoose.Types.ObjectId(createdBy) }; // Ensure the `createdBy.id` matches the database structure

    // If dates are provided, add them to the filter
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        const start = new Date(startDate);
        if (!isNaN(start.getTime())) {
          filter.createdAt.$gte = start;
        } else {
          return NextResponse.json(
            { success: false, message: 'Invalid startDate format.' },
            { status: 400 }
          );
        }
      }
      if (endDate) {
        const end = new Date(endDate);
        if (!isNaN(end.getTime())) {
          filter.createdAt.$lte = end;
        } else {
          return NextResponse.json(
            { success: false, message: 'Invalid endDate format.' },
            { status: 400 }
          );
        }
      }
    }

    // Aggregate services from Invoice collection
    const invoiceStats = await Invoice.aggregate([
      { $match: filter }, // Apply the filters to the invoice query
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.service.id',
          serviceName: { $first: '$items.service.service' },
          totalUsageCount: { $sum: '$items.quantity' },
          totalRevenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } },
        },
      },
    ]);

    // Aggregate services from Credit collection
    const creditStats = await Credit.aggregate([
      { $match: filter }, // Apply the filters to the credit query
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.service.id',
          serviceName: { $first: '$items.service.service' },
          totalUsageCount: { $sum: '$items.quantity' },
          totalRevenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } },
        },
      },
    ]);

    console.log('Credit Stats:', creditStats);
    console.log('Invoice Stats:', invoiceStats);

    // Combine statistics from both sources
    const combinedStats = [...invoiceStats, ...creditStats];

    // Merge statistics by service ID
    const mergedStats = combinedStats.reduce((acc, curr) => {
      const existing = acc.find(stat => stat._id.toString() === curr._id.toString());
      if (existing) {
        existing.totalUsageCount += curr.totalUsageCount;
        existing.totalRevenue += curr.totalRevenue;
      } else {
        acc.push(curr);
      }
      return acc;
    }, []);

    // Rank by usage count
    const rankByUsage = [...mergedStats].sort((a, b) => b.totalUsageCount - a.totalUsageCount);

    // Rank by revenue
    const rankByRevenue = [...mergedStats].sort((a, b) => b.totalRevenue - a.totalRevenue);

    // Return the rankings
    return NextResponse.json({
      success: true,
      data: {
        rankByUsage,
        rankByRevenue,
      },
    });
  } catch (error) {
    // Handle errors and return a response
    console.error('Error:', error.message);
    return NextResponse.json(
      {
        success: false,
        message: 'Error fetching service statistics',
        error: error.message,
      },
      { status: 500 }
    );
  }
}





