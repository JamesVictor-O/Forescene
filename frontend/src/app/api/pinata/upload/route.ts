import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const pinataJwt = process.env.PINATA_JWT;

  if (!pinataJwt) {
    return NextResponse.json(
      { error: "Server missing PINATA_JWT configuration." },
      { status: 500 }
    );
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const metadataRaw = formData.get("metadata");

  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: "Invalid request: expected file upload." },
      { status: 400 }
    );
  }

  const pinataForm = new FormData();
  pinataForm.append("file", file, file.name || "upload");

  if (typeof metadataRaw === "string" && metadataRaw.trim().length > 0) {
    try {
      const parsed = JSON.parse(metadataRaw) as {
        name?: string;
        keyvalues?: Record<string, string>;
      };
      const metadata = {
        name: parsed.name ?? file.name ?? "prediction-content",
        keyvalues: parsed.keyvalues ?? {},
      };
      pinataForm.append(
        "pinataMetadata",
        new Blob([JSON.stringify(metadata)], {
          type: "application/json",
        })
      );
    } catch {
      // Ignore invalid metadata payloads.
    }
  }

  pinataForm.append(
    "pinataOptions",
    new Blob([JSON.stringify({ cidVersion: 1 })], { type: "application/json" })
  );

  const response = await fetch(
    "https://api.pinata.cloud/pinning/pinFileToIPFS",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${pinataJwt}`,
      },
      body: pinataForm,
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    return NextResponse.json(
      {
        error: "Pinata upload failed",
        status: response.status,
        details: errorText,
      },
      { status: response.status }
    );
  }

  const data = await response.json();

  return NextResponse.json({
    cid: data.IpfsHash,
    size: data.PinSize,
    timestamp: data.Timestamp,
  });
}
