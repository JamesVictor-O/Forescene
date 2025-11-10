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

  const gatewayBase =
    process.env.NEXT_PUBLIC_PINATA_GATEWAY ??
    "https://gateway.pinata.cloud/ipfs";

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

      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      return new Promise<PinataUploadResult>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", "/api/pinata/upload");

        xhr.upload.onprogress = (event) => {
          if (!event.lengthComputable) return;
          setProgress({
            loaded: event.loaded,
            total: event.total,
            percentage: Number(((event.loaded / event.total) * 100).toFixed(2)),
          });
        };

        xhr.onerror = () => {
          setIsUploading(false);
          const message = xhr.statusText || "Upload failed";
          setError(message);
          reject(new Error(message));
        };

        xhr.onload = () => {
          setIsUploading(false);
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const payload = JSON.parse(xhr.responseText) as {
                cid: string;
                size?: number;
                timestamp?: string;
              };
              resolve({
                cid: payload.cid,
                size: payload.size,
                timestamp: payload.timestamp,
                url: `${gatewayBase.replace(/\/$/, "")}/${payload.cid}`,
              });
            } catch {
              const message = "Failed to parse Pinata response";
              setError(message);
              reject(new Error(message));
            }
          } else {
            const message =
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
            "metadata",
            JSON.stringify({
              name: options.metadata.name,
              keyvalues: options.metadata.keyvalues,
            })
          );
        }

        xhr.send(formData);
      });
    },
    [gatewayBase]
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
      return uploadBlob(blob, fileName ?? `prediction-${Date.now()}.json`, {
        ...options,
        metadata: {
          name: options?.metadata?.name ?? fileName ?? "prediction-metadata",
          keyvalues: options?.metadata?.keyvalues,
        },
      });
    },
    [uploadBlob]
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
