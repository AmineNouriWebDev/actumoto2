import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  const user = await prisma.user.findUnique({
    where: { email: "mohamedamine.nouri1987@gmail.com" }
  });
  return NextResponse.json({ user });
}
