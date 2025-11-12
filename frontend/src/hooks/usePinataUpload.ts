"use client";

import { useCallback, useMemo, useRef, useState } from "react";

export type UploadProgress = {
  loaded: number;
  total: number;
  percentage: number;
};

export type PinataUploadResult = {
  cid: string;
  url: string;
  size?: number;
  timestamp?: string;
};

type UploadOptions = {
  metadata?: {
    name?: string;
    keyvalues?: Record<string, string>;
  };
  signal?: AbortSignal;
};

export function usePinataUpload() {
  const [progress, setProgress] = useState<UploadProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const PINATA_API_URL = "https://api.pinata.cloud";
  const gatewayBase =
    process.env.NEXT_PUBLIC_PINATA_GATEWAY ??
    "https://gateway.pinata.cloud/ipfs";
  const usePublicIpfs = useMemo(
    () => process.env.NEXT_PUBLIC_USE_PUBLIC_IPFS === "true",
    []
  );

  const getPinataCredentials = useCallback(() => {
    const apiKey = process.env.NEXT_PUBLIC_PINATA_API;
    const secretKey = process.env.NEXT_PUBLIC_PINATA_SECRET;

    if (!apiKey || !secretKey) {
      throw new Error(
        "Pinata credentials missing. Set NEXT_PUBLIC_PINATA_API and NEXT_PUBLIC_PINATA_SECRET."
      );
    }

    return { apiKey, secretKey };
  }, []);

  const normalizeMetadata = useCallback(
    (metadata: UploadOptions["metadata"], fallbackName: string) => ({
      name: metadata?.name ?? fallbackName,
      keyvalues: metadata?.keyvalues ?? {},
    }),
    []
  );

  const uploadToPublicIpfs = useCallback(
    async (blob: Blob): Promise<PinataUploadResult> => {
      const mockHash = `Qm${Math.random().toString(36).slice(2)}`;
      return {
        cid: mockHash,
        url: `https://ipfs.io/ipfs/${mockHash}`,
        size: blob.size,
        timestamp: new Date().toISOString(),
      };
    },
    []
  );

  const reset = useCallback(() => {
    setProgress(null);
    setError(null);
    setIsUploading(false);
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
  }, []);

  const uploadBlob = useCallback(
    async (
      blob: Blob,
      fileName: string,
      options?: UploadOptions
    ): Promise<PinataUploadResult> => {
      setError(null);
      setProgress(null);

      if (usePublicIpfs) {
        setIsUploading(true);
        const result = await uploadToPublicIpfs(blob);
        setIsUploading(false);
        return result;
      }

      let apiKey: string;
      let secretKey: string;
      try {
        const credentials = getPinataCredentials();
        apiKey = credentials.apiKey;
        secretKey = credentials.secretKey;
      } catch (credentialError) {
        setError(
          credentialError instanceof Error
            ? credentialError.message
            : "Missing Pinata credentials."
        );
        throw credentialError;
      }

      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      return new Promise<PinataUploadResult>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", `${PINATA_API_URL}/pinning/pinFileToIPFS`);
        xhr.setRequestHeader("pinata_api_key", apiKey);
        xhr.setRequestHeader("pinata_secret_api_key", secretKey);

        xhr.upload.onprogress = (event) => {
          if (!event.lengthComputable) return;
          setProgress({
            loaded: event.loaded,
            total: event.total,
            percentage: Number(((event.loaded / event.total) * 100).toFixed(2)),
          });
        };

        const parseErrorResponse = () => {
          if (!xhr.responseText) return null;
          try {
            const json = JSON.parse(xhr.responseText) as {
              error?: string;
              details?: string;
              status?: number;
            };
            if (json.error || json.details) {
              return (
                json.error ??
                json.details ??
                `Pinata upload failed with status ${json.status ?? xhr.status}`
              );
            }
          } catch {
            // Ignore parse failures.
          }
          return null;
        };

        xhr.onerror = () => {
          setIsUploading(false);
          const message =
            parseErrorResponse() || xhr.statusText || "Upload failed";
          setError(message);
          reject(new Error(message));
        };

        xhr.onload = () => {
          setIsUploading(false);
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const payload = JSON.parse(xhr.responseText) as {
                cid?: string;
                IpfsHash?: string;
                size?: number;
                timestamp?: string;
              };
              const cid = payload.cid ?? payload.IpfsHash;
              if (!cid) {
                throw new Error("Pinata response missing CID.");
              }
              resolve({
                cid,
                size: payload.size,
                timestamp: payload.timestamp,
                url: `${gatewayBase.replace(/\/$/, "")}/${cid}`,
              });
            } catch (parseError) {
              const message =
                parseError instanceof Error
                  ? parseError.message
                  : "Failed to parse Pinata response";
              setError(message);
              reject(
                parseError instanceof Error ? parseError : new Error(message)
              );
            }
          } else {
            const parsedError = parseErrorResponse();
            const message =
              parsedError ||
              xhr.responseText ||
              `Pinata upload failed with status ${xhr.status}`;
            setError(message);
            reject(new Error(message));
          }
        };

        if (options?.signal) {
          options.signal.addEventListener("abort", () => {
            xhr.abort();
          });
        }

        setIsUploading(true);

        const formData = new FormData();
        formData.append("file", blob, fileName);

        if (options?.metadata) {
          formData.append(
            "pinataMetadata",
            JSON.stringify(normalizeMetadata(options.metadata, fileName))
          );
        }

        formData.append(
          "pinataOptions",
          JSON.stringify({ cidVersion: 1, wrapWithDirectory: false })
        );

        xhr.send(formData);
      });
    },
    [
      getPinataCredentials,
      gatewayBase,
      normalizeMetadata,
      uploadToPublicIpfs,
      usePublicIpfs,
    ]
  );

  const uploadFile = useCallback(
    async (file: File, options?: UploadOptions) =>
      uploadBlob(file, file.name || "upload", options),
    [uploadBlob]
  );

  const uploadJson = useCallback(
    async (payload: unknown, fileName?: string, options?: UploadOptions) => {
      const jsonString = JSON.stringify(payload);
      const blob = new Blob([jsonString], { type: "application/json" });

      if (usePublicIpfs) {
        setIsUploading(true);
        const result = await uploadToPublicIpfs(blob);
        setIsUploading(false);
        return result;
      }

      let apiKey: string;
      let secretKey: string;
      try {
        const credentials = getPinataCredentials();
        apiKey = credentials.apiKey;
        secretKey = credentials.secretKey;
      } catch (credentialError) {
        setError(
          credentialError instanceof Error
            ? credentialError.message
            : "Missing Pinata credentials."
        );
        throw credentialError;
      }

      const targetName = fileName ?? `prediction-${Date.now()}.json`;

      setIsUploading(true);
      setProgress(null);
      setError(null);

      try {
        const response = await fetch(
          `${PINATA_API_URL}/pinning/pinJSONToIPFS`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              pinata_api_key: apiKey,
              pinata_secret_api_key: secretKey,
            },
            body: JSON.stringify({
              pinataContent: payload,
              pinataMetadata: normalizeMetadata(options?.metadata, targetName),
              pinataOptions: { cidVersion: 1 },
            }),
            signal: options?.signal,
          }
        );

        if (!response.ok) {
          const errorBody = await response.text();
          const message =
            errorBody || `Pinata upload failed with status ${response.status}`;
          setError(message);
          throw new Error(message);
        }

        const data = await response.json();
        const cid = data.IpfsHash ?? data.cid;

        return {
          cid,
          size: data.PinSize ?? blob.size,
          timestamp: data.Timestamp ?? new Date().toISOString(),
          url: `${gatewayBase.replace(/\/$/, "")}/${cid}`,
        };
      } finally {
        setIsUploading(false);
      }
    },
    [
      gatewayBase,
      getPinataCredentials,
      normalizeMetadata,
      uploadToPublicIpfs,
      usePublicIpfs,
    ]
  );

  const state = useMemo(
    () => ({
      isUploading,
      progress,
      error,
    }),
    [error, isUploading, progress]
  );

  return {
    ...state,
    uploadFile,
    uploadJson,
    reset,
  };
}
