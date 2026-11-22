import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    let signedRequest = "";

    const contentType = req.headers.get("content-type") || "";
    if (contentType.includes("application/x-www-form-urlencoded") || contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      signedRequest = (formData.get("signed_request") as string) || "";
    } else if (contentType.includes("application/json")) {
      const body = await req.json().catch(() => ({}));
      signedRequest = body.signed_request || "";
    }

    const confirmationCode = crypto.randomBytes(12).toString("hex");
    const statusUrl = `https://actumoto.tn/suppression-donnees?code=${confirmationCode}`;

    return NextResponse.json({
      url: statusUrl,
      confirmation_code: confirmationCode,
    });
  } catch (error) {
    console.error("Facebook data deletion callback error:", error);
    return NextResponse.json(
      {
        url: "https://actumoto.tn/suppression-donnees",
        confirmation_code: "generic_request",
      },
      { status: 200 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: "ok",
    message: "Facebook data deletion endpoint is active.",
    instructions_url: "https://actumoto.tn/suppression-donnees",
  });
}
