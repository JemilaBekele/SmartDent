import User from "@/app/(models)/User";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { connect } from "@/app/lib/mongodb";

import { uploadImage } from '@/app/helpers/imageUploader';

connect();

// Define the request body type
interface UserData {
  username: string;
  password: string;
  role: string;
  phone: string;
  image?: string; // Optional image field
}



export async function POST(request: NextRequest) {
  try {
    

    // Use FormData in client-side to send the image along with the user data
    const data = await request.formData();

    const userData: UserData = {
      username: data.get("username") as string,
      password: data.get("password") as string,
      role: data.get("role") as string,
      phone: data.get("phone") as string,
      image: undefined, // Initialize image field
    };

    // Confirm data exists
    if (!userData.username || !userData.password || !userData.role || !userData.phone) {
      return NextResponse.json({ message: "All fields are required." }, { status: 400 });
    }

    // Check for duplicate phone
    const duplicate = await User.findOne({ phone: userData.phone }).lean().exec();
    if (duplicate) {
      return NextResponse.json({ message: "Duplicate phone" }, { status: 409 });
    }

    // Hash the password
    const hashPassword = await bcrypt.hash(userData.password, 10);
    userData.password = hashPassword;

    // Handle image upload if exists
    const imageFile = data.get("image");
    if (imageFile && imageFile instanceof File) {
      // Use the uploadImage helper to handle the image file
      const imagePath = await uploadImage(imageFile);
      userData.image = imagePath; // Set the relative path of the uploaded image
    }

    // Create new user
    await User.create(userData);
    return NextResponse.json({ message: "User Created." }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Error", error }, { status: 500 });
  }
}

export async function GET() {
  try {
    const users = await User.find({});
    return NextResponse.json(users);
  } catch (error) {
    console.error("Error in GET /api/REGISTER:", error);
    return NextResponse.json({ error: "Internal server error" });
  }
}
