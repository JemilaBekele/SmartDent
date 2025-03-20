import User from "@/app/(models)/User";
import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/app/lib/mongodb";
import { authorizedMiddleware } from "@/app/helpers/authentication";

connect();

export async function GET(request:NextRequest) {
   authorizedMiddleware(request);
  try {
 // Use aggregation to count users for each role
    const roleCounts = await User.aggregate([
      {
        $group: {
          _id: "$role", // Group by the 'role' field
          count: { $sum: 1 }, // Sum up the number of users in each role
        },
      },
      {
        $project: {
          _id: 0, // Do not show the '_id' field in the result
          role: "$_id", // Rename '_id' to 'role'
          count: 1, // Include the count in the result
        },
      },
    ]);

    return NextResponse.json(roleCounts, { status: 200 });
  } catch (error: unknown) {
    console.error("Error in GET /api/role-counts:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
