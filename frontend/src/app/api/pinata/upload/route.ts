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

  let metadata:
    | {
        name?: string;
        keyvalues?: Record<string, string>;
      }
    | undefined;

  const pinataForm = new FormData();
  pinataForm.append("file", file, file.name || "upload");

  if (typeof metadataRaw === "string" && metadataRaw.trim().length > 0) {
    try {
      const parsed = JSON.parse(metadataRaw) as {
        name?: string;
        keyvalues?: Record<string, string>;
      };
      metadata = {
        name: parsed.name ?? file.name ?? "prediction-content",
        keyvalues: parsed.keyvalues ?? {},
      };
      pinataForm.append("pinataMetadata", JSON.stringify(metadata));
    } catch {
      // Ignore invalid metadata payloads.
    }
  }

  pinataForm.append("pinataOptions", JSON.stringify({ cidVersion: 1 }));

  const pinataFileEndpoint = "https://api.pinata.cloud/pinning/pinFileToIPFS";
  const pinataJsonEndpoint = "https://api.pinata.cloud/pinning/pinJSONToIPFS";

  let response: Response;

  const isJsonFile =
    (file.type && file.type.includes("json")) ||
    file.name?.toLowerCase().endsWith(".json");

  if (isJsonFile) {
    try {
      const jsonText = await file.text();
      const jsonPayload = JSON.parse(jsonText);
      response = await fetch(pinataJsonEndpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${pinataJwt}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pinataContent: jsonPayload,
          pinataMetadata: metadata ?? {
            name: file.name ?? "prediction-json",
          },
          pinataOptions: { cidVersion: 1 },
        }),
      });
    } catch (error) {
      return NextResponse.json(
        {
          error: "Failed to prepare JSON payload for Pinata.",
          details:
            error instanceof Error
              ? error.message
              : "Unknown JSON parsing error",
        },
        { status: 500 }
      );
    }
  } else {
    response = await fetch(pinataFileEndpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${pinataJwt}`,
      },
      body: pinataForm,
    });
  }

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

  return NextResponse.json(
    {
      cid: data.IpfsHash ?? data.IpfsHash ?? data.cid,
      size: data.PinSize ?? data.size,
      timestamp: data.Timestamp ?? data.timestamp,
    },
    { status: 200 }
  );
}
