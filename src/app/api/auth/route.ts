import { NextRequest, NextResponse } from "next/server";
import { dummyUsers } from "@/lib/dummyData";
import { v4 as uuidv4 } from "uuid"; // Untuk menghasilkan UUID

export async function POST(req: NextRequest) {
  try {
    const { username, password, role, action } = await req.json();

    if (action === "register") {
      // Validasi input
      if (!username || !password || !role) {
        return NextResponse.json(
          { error: "Username, password, dan role harus diisi" },
          { status: 400 }
        );
      }

      // Cek apakah username sudah ada
      const existingUser = dummyUsers.find(
        (u) => u.username.toLowerCase() === username.toLowerCase()
      );
      if (existingUser) {
        return NextResponse.json(
          { error: "Username sudah digunakan" },
          { status: 409 }
        );
      }

      // Buat user baru dengan id bertipe string (UUID)
      const newUser = {
        id: uuidv4(), // Menghasilkan UUID sebagai string
        username,
        password, // Dalam produksi, hash password terlebih dahulu
        role: role.toLowerCase(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      dummyUsers.push(newUser);

      // Jangan kembalikan password di respons
      const { password: _, ...userWithoutPassword } = newUser;

      return NextResponse.json({
        success: true,
        data: userWithoutPassword,
        message: "Pengguna berhasil dibuat",
      });
    }

    if (action === "login") {
      const user = dummyUsers.find(
        (u) => u.username === username && u.password === password
      );
      if (!user) {
        return NextResponse.json(
          { error: "Kredensial tidak valid" },
          { status: 401 }
        );
      }

      return NextResponse.json({
        success: true,
        data: {
          token: "dummy-token",
          role: user.role,
          user: { id: user.id, username: user.username },
        },
        message: "Login berhasil",
      });
    }

    return NextResponse.json({ error: "Aksi tidak valid" }, { status: 400 });
  } catch (error) {
    console.error("Error di POST /api/auth:", error);
    return NextResponse.json({ error: "Kesalahan server" }, { status: 500 });
  }
}
