import { NextRequest, NextResponse } from "next/server";
import { dummyUsers } from "@/lib/dummyData";

export async function POST(req: NextRequest) {
  const { username, password, role, action } = await req.json();

  if (action === "register") {
    if (!username || !password || !role) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
    const newUser = {
      id: dummyUsers.length + 1,
      username,
      password, // In production, hash this password
      role: role.toLowerCase(), // Pastikan role disimpan dalam format lowercase
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    dummyUsers.push(newUser);
    return NextResponse.json(newUser);
  }

  if (action === "login") {
    const user = dummyUsers.find(
      (u) => u.username === username && u.password === password
    );
    if (!user)
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    return NextResponse.json({
      token: "dummy-token",
      role: user.role, // Pastikan role dikembalikan dalam format yang konsisten
      user: { id: user.id, username: user.username },
    });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
