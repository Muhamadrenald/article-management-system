import { NextRequest, NextResponse } from "next/server";
import { dummyUsers } from "@/lib/dummyData";

export async function GET(req: NextRequest) {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.split(" ")[1];

    // Validate token
    if (!token || token !== "dummy-token") {
      return NextResponse.json({ error: "Tidak diizinkan" }, { status: 401 });
    }

    // Untuk implementasi dummy, kita akan return user pertama yang ada
    // Dalam implementasi nyata, Anda akan decode token untuk mendapatkan user ID
    const user = dummyUsers.length > 0 ? dummyUsers[0] : null;

    if (!user) {
      return NextResponse.json(
        { error: "Pengguna tidak ditemukan" },
        { status: 404 }
      );
    }

    // Menghilangkan password dari respons
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
      message: "Profil berhasil diambil",
    });
  } catch (error) {
    console.error("Error di GET /api/auth/profile:", error);
    return NextResponse.json({ error: "Kesalahan server" }, { status: 500 });
  }
}
