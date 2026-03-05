import { NextResponse } from "next/server";

export async function POST() {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    return NextResponse.json(
      { error: "Cloudinary credentials not configured" },
      { status: 500 }
    );
  }

  const timestamp = Math.floor(Date.now() / 1000).toString();
  const folder = "micgrabbgm";

  const signatureStr = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
  const encoder = new TextEncoder();
  const data = encoder.encode(signatureStr);
  const hashBuffer = await crypto.subtle.digest("SHA-1", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const signature = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

  return NextResponse.json({
    signature,
    timestamp,
    folder,
    apiKey,
    cloudName,
  });
}
