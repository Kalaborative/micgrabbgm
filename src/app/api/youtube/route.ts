import { NextRequest, NextResponse } from "next/server";
import { execFile } from "child_process";
import { promisify } from "util";
import { readFile, unlink } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";
import { randomUUID } from "crypto";

const execFileAsync = promisify(execFile);

function isYouTubeUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return (
      parsed.hostname === "www.youtube.com" ||
      parsed.hostname === "youtube.com" ||
      parsed.hostname === "youtu.be" ||
      parsed.hostname === "m.youtube.com"
    );
  } catch {
    return false;
  }
}

async function generateSignature(folder: string, timestamp: string, apiSecret: string): Promise<string> {
  const signatureStr = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
  const encoder = new TextEncoder();
  const data = encoder.encode(signatureStr);
  const hashBuffer = await crypto.subtle.digest("SHA-1", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function POST(req: NextRequest) {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    return NextResponse.json(
      { error: "Cloudinary credentials not configured" },
      { status: 500 }
    );
  }

  let body: { url?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { url } = body;
  if (!url || !isYouTubeUrl(url)) {
    return NextResponse.json(
      { error: "Please provide a valid YouTube URL" },
      { status: 400 }
    );
  }

  const tempId = randomUUID();
  const tempPath = join(tmpdir(), `yt-audio-${tempId}`);

  try {
    // Get video title
    const { stdout: titleRaw } = await execFileAsync("yt-dlp", [
      "--print", "title",
      "--no-warnings",
      url,
    ], { timeout: 30000 });
    const title = titleRaw.trim();

    // Download best opus audio stream (YouTube stores audio natively as Opus)
    // Falls back to best audio if opus isn't available
    await execFileAsync("yt-dlp", [
      "-f", "bestaudio[acodec=opus]",
      "-o", `${tempPath}.%(ext)s`,
      "--no-warnings",
      "--no-playlist",
      url,
    ], { timeout: 120000 });

    // yt-dlp appends the extension — find the actual file
    const { stdout: filenameRaw } = await execFileAsync("yt-dlp", [
      "-f", "bestaudio[acodec=opus]",
      "--print", "filename",
      "-o", `${tempPath}.%(ext)s`,
      "--no-warnings",
      "--no-playlist",
      url,
    ], { timeout: 30000 });
    const actualPath = filenameRaw.trim();

    // Read the downloaded file
    const fileBuffer = await readFile(actualPath);

    // Determine extension from the actual file path
    const ext = actualPath.split(".").pop() || "opus";

    // Upload to Cloudinary
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const folder = "micgrabbgm";
    const signature = await generateSignature(folder, timestamp, apiSecret);

    const uploadForm = new FormData();
    uploadForm.append("file", new Blob([fileBuffer]), `youtube-audio.${ext}`);
    uploadForm.append("api_key", apiKey);
    uploadForm.append("timestamp", timestamp);
    uploadForm.append("signature", signature);
    uploadForm.append("folder", folder);
    uploadForm.append("resource_type", "auto");

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
      { method: "POST", body: uploadForm }
    );

    // Clean up temp file
    try {
      await unlink(actualPath);
    } catch {
      // Ignore cleanup errors
    }

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json(
        { error: "Cloudinary upload failed", details: err },
        { status: 500 }
      );
    }

    const result = await res.json();
    return NextResponse.json({
      url: result.secure_url,
      publicId: result.public_id,
      duration: result.duration,
      title,
    });
  } catch (err) {
    // Clean up on error
    try {
      await unlink(`${tempPath}.opus`);
    } catch {
      // Ignore
    }

    const message = err instanceof Error ? err.message : "YouTube extraction failed";
    const isFormatError = message.includes("Requested format is not available");
    return NextResponse.json(
      { error: isFormatError ? "This video has no Opus audio stream available" : message },
      { status: isFormatError ? 422 : 500 }
    );
  }
}
