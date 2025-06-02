import { NextRequest, NextResponse } from "next/server";
import { dummyUsers } from "@/lib/dummyData";

export async function GET(req: NextRequest) {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.split(" ")[1];

    // Validate token
    if (!token || token !== "dummy-token") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Untuk implementasi dummy, kita akan return user pertama yang ada
    // Dalam implementasi nyata, Anda akan decode token untuk mendapatkan user ID
    const user = dummyUsers.length > 0 ? dummyUsers[0] : null;

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Return user data without password
    const { password, ...userWithoutPassword } = user;

    return NextResponse.json({
      success: true,
      data: {
        id: userWithoutPassword.id.toString(), // Convert to string for consistency
        username: userWithoutPassword.username,
        role: userWithoutPassword.role,
        createdAt: userWithoutPassword.createdAt,
        updatedAt: userWithoutPassword.updatedAt,
      },
      message: "Profile retrieved successfully",
    });
  } catch (error) {
    console.error("Error in GET /auth/profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
