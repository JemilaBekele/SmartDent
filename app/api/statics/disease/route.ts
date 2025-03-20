import MedicalFinding from '@/app/(models)/MedicalFinding';
import { authorizedMiddleware } from '@/app/helpers/authentication';
import { connect } from '@/app/lib/mongodb';
import { NextRequest, NextResponse } from 'next/server';

connect();

export async function POST(request: NextRequest) {
  await authorizedMiddleware(request);
  try {
    const body = await request.json();
    const { startDate, endDate } = body;

    if (!startDate || !endDate) {
      return NextResponse.json({
        message: 'Start date and end date are required',
        success: false,
      }, { status: 400 });
    }

    // Parse and validate date range
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return NextResponse.json({
        message: 'Invalid date format',
        success: false,
      }, { status: 400 });
    }

    // Define age groups
    const ageGroups = {
      '<1': { min: 0, max: 1 },
      '1-4': { min: 1, max: 4 },
      '15-29': { min: 15, max: 29 },
      '30-64': { min: 30, max: 64 },
    };

    // Aggregation to get disease statistics
    const diseaseStatistics = await MedicalFinding.aggregate([
      {
        $match: {
          diseases: { $exists: true, $ne: [] },
          'diseases.diseaseTime': { $gte: start, $lte: end },
        },
      },
      {
        $lookup: {
          from: 'patients', // Name of the Patient collection
          localField: 'patientId.id',
          foreignField: '_id',
          as: 'patientInfo',
        },
      },
      {
        $unwind: '$patientInfo',
      },
      {
        $lookup: {
          from: 'diseases', // Name of the Disease collection
          localField: 'diseases.disease',
          foreignField: '_id',
          as: 'diseaseInfo',
        },
      },
      {
        $unwind: '$diseaseInfo',
      },
      {
        $addFields: {
          age: { $toInt: '$patientInfo.age' }, // Convert age to integer
          gender: '$patientInfo.sex',
          disease: '$diseaseInfo.disease',
        },
      },
      {
        $group: {
          _id: {
            disease: '$disease',
            gender: '$gender',
            ageGroup: {
              $cond: [
                { $lte: ['$age', ageGroups['<1'].max] },
                '<1',
                {
                  $cond: [
                    { $lte: ['$age', ageGroups['1-4'].max] },
                    '1-4',
                    {
                      $cond: [
                        { $lte: ['$age', ageGroups['15-29'].max] },
                        '15-29',
                        '30-64',
                      ],
                    },
                  ],
                },
              ],
            },
          },
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: '$_id.disease',
          stats: {
            $push: {
              gender: '$_id.gender',
              ageGroup: '$_id.ageGroup',
              count: '$count',
            },
          },
        },
      },
    ]);

    return NextResponse.json({
      message: 'Data retrieved successfully',
      success: true,
      data: diseaseStatistics,
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching data:', error);
    return NextResponse.json({
      message: 'Failed to retrieve data',
      success: false,
    }, { status: 500 });
  }
}
