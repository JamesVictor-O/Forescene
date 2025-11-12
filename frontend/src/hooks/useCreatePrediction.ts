// "use client";

// import { useMutation, useQueryClient } from "@tanstack/react-query";
// import { usePrivy, useWallets } from "@privy-io/react-auth";
// import { useAccount, usePublicClient } from "wagmi";
// import { useState } from "react";
// import { Address, decodeEventLog, Hex, encodeFunctionData } from "viem";
// import { getContract, getNetworkConfig } from "@/config/contracts";
// import { predictionRegistryAbi } from "@/abis/predictionRegistry";
// import { usePinataUpload } from "./usePinataUpload";

// type PredictionFormat = "video" | "text";

// export type CreatePredictionInput = {
//   format: PredictionFormat;
//   category: string;
//   deadline: number | Date;
//   creatorFeeBps?: number;
//   title?: string;
//   summary?: string;
//   existingCid?: string;
//   file?: File;
//   textContent?: string;
// };

// export type CreatePredictionStep =
//   | "idle"
//   | "validating"
//   | "uploading"
//   | "submitting"
//   | "waiting"
//   | "success"
//   | "error";

// export type CreatePredictionResult = {
//   hash: Hex;
//   predictionId?: number;
//   cid: string;
// };

// const FORMAT_MAP: Record<PredictionFormat, 0 | 1> = {
//   video: 0,
//   text: 1,
// };

// export function useCreatePrediction() {
//   const { ready, authenticated } = usePrivy();
//   const { wallets } = useWallets();
//   const { address, chain } = useAccount();
//   const publicClient = usePublicClient();
//   const queryClient = useQueryClient();
//   const [step, setStep] = useState<CreatePredictionStep>("idle");
//   const [txHash, setTxHash] = useState<Hex | null>(null);

//   const {
//     isUploading,
//     progress: uploadProgress,
//     error: uploadError,
//     uploadFile,
//     uploadJson,
//     reset: resetUpload,
//   } = usePinataUpload();

//   const network = getNetworkConfig();
//   const registry = getContract("predictionRegistry");

//   const mutation = useMutation<
//     CreatePredictionResult,
//     Error,
//     CreatePredictionInput
//   >({
//     mutationKey: ["create-prediction"],
//     mutationFn: async (input) => {
//       console.log("🔍 Debug - Starting transaction");
//       console.log("- Address:", address);
//       console.log("- Chain:", chain);
//       console.log("- Wallets:", wallets.length);

//       if (!ready || !authenticated) {
//         throw new Error("Connect your wallet to create a prediction.");
//       }
//       if (!address) {
//         throw new Error("Wallet address not found.");
//       }
//       if (!publicClient) {
//         throw new Error("Public client unavailable.");
//       }
//       if (chain?.id !== network.chainId) {
//         throw new Error(
//           `Wrong network. Please switch to ${network.name} (Chain ID: ${network.chainId})`
//         );
//       }

//       const activeWallet = wallets.find(
//         (wallet) => wallet.address.toLowerCase() === address.toLowerCase()
//       );
//       if (!activeWallet) {
//         throw new Error("Active wallet not found.");
//       }

//       console.log("🔑 Active wallet:", activeWallet.walletClientType);

//       setStep("validating");

//       const formatValue = FORMAT_MAP[input.format];
//       const category = input.category.trim().toLowerCase();
//       if (!category) {
//         throw new Error("Category is required.");
//       }

//       const deadlineSeconds =
//         typeof input.deadline === "number"
//           ? input.deadline
//           : Math.floor(input.deadline.getTime() / 1000);
//       const nowSeconds = Math.floor(Date.now() / 1000);
//       if (
//         !Number.isFinite(deadlineSeconds) ||
//         deadlineSeconds <= nowSeconds + 3600
//       ) {
//         throw new Error("Deadline must be at least one hour in the future.");
//       }

//       const fee = input.creatorFeeBps ?? 0;
//       if (fee < 0 || fee > 10_000) {
//         throw new Error("Creator fee must be between 0 and 10,000 bps.");
//       }

//       let cid = input.existingCid?.trim();
//       if (!cid) {
//         setStep("uploading");

//         if (input.format === "video") {
//           if (!input.file) {
//             throw new Error("Select a video file to upload.");
//           }
//           const uploadResult = await uploadFile(input.file, {
//             metadata: {
//               name: input.title ?? input.file.name,
//               keyvalues: {
//                 category,
//                 title: input.title ?? "",
//               },
//             },
//           });
//           cid = uploadResult.cid;
//         } else {
//           const textPayload = {
//             title: input.title ?? "Prediction",
//             summary: input.summary ?? "",
//             content: input.textContent ?? "",
//             author: address,
//             category,
//             createdAt: new Date().toISOString(),
//           };
//           const uploadResult = await uploadJson(
//             textPayload,
//             `${category}-prediction-${Date.now()}.json`,
//             {
//               metadata: {
//                 name: input.title ?? "prediction-text",
//                 keyvalues: {
//                   category,
//                   author: address,
//                 },
//               },
//             }
//           );
//           cid = uploadResult.cid;
//         }
//       }

//       if (!cid) {
//         throw new Error("Unable to determine content CID.");
//       }

//       console.log("📝 Transaction params:");
//       console.log("- Contract:", registry.address);
//       console.log("- CID:", cid);
//       console.log("- Format:", formatValue);
//       console.log("- Category:", category);
//       console.log("- Deadline:", deadlineSeconds);
//       console.log("- Fee:", fee);

//       setStep("submitting");

//       try {
//         const args: [string, number, string, bigint, number] = [
//           cid,
//           formatValue,
//           category,
//           BigInt(deadlineSeconds),
//           fee,
//         ];

//         const data = encodeFunctionData({
//           abi: predictionRegistryAbi,
//           functionName: "createPrediction",
//           args,
//         });

//         console.log("📤 Encoded data:", data);

//         const provider = await activeWallet.getEthereumProvider();

//         console.log("🔌 Provider obtained from wallet");

//         const txHash = (await provider.request({
//           method: "eth_sendTransaction",
//           params: [
//             {
//               from: address as Address,
//               to: registry.address,
//               data,
//             },
//           ],
//         })) as Hex;

//         console.log("✅ Transaction submitted:", txHash);

//         setTxHash(txHash);
//         setStep("waiting");

//         const receipt = await publicClient.waitForTransactionReceipt({
//           hash: txHash,
//         });
//         console.log("✅ Transaction confirmed");

//         let predictionId: number | undefined;
//         for (const log of receipt.logs) {
//           try {
//             const decoded = decodeEventLog({
//               abi: predictionRegistryAbi,
//               data: log.data,
//               topics: log.topics,
//             });
//             if (decoded.eventName === "PredictionCreated") {
//               predictionId = Number(
//                 (decoded.args as { predictionId: bigint }).predictionId
//               );
//               break;
//             }
//           } catch {
//             // ignore non-matching logs
//           }
//         }

//         await queryClient.invalidateQueries({
//           queryKey: ["predictions", network.chainId],
//         });

//         setStep("success");

//         return { hash: txHash, predictionId, cid };
//       } catch (error) {
//         console.error("❌ Transaction failed:", error);
//         throw error;
//       }
//     },
//     onError: (error) => {
//       console.error("❌ Mutation error:", error);
//       setStep("error");
//     },
//   });

//   const reset = () => {
//     setStep("idle");
//     setTxHash(null);
//     resetUpload();
//     mutation.reset();
//   };

//   return {
//     createPrediction: mutation.mutateAsync,
//     isCreating:
//       mutation.status === "pending" &&
//       (step === "submitting" || step === "waiting" || step === "validating"),
//     isSuccess: mutation.isSuccess,
//     error: mutation.error ?? (uploadError ? new Error(uploadError) : null),
//     uploadProgress,
//     isUploading,
//     currentStep: step,
//     transactionHash: txHash,
//     data: mutation.data,
//     reset,
//   };
// }

"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { usePrivy } from "@privy-io/react-auth";
import { useAccount, useWalletClient, usePublicClient } from "wagmi";
import { useState } from "react";
import { Address, decodeEventLog, Hex } from "viem";
import { getContract, getNetworkConfig } from "@/config/contracts";
import { predictionRegistryAbi } from "@/abis/predictionRegistry";
import { usePinataUpload } from "./usePinataUpload";

type PredictionFormat = "video" | "text";

export type CreatePredictionInput = {
  format: PredictionFormat;
  category: string;
  deadline: number | Date;
  creatorFeeBps?: number;
  title?: string;
  summary?: string;
  existingCid?: string;
  file?: File;
  textContent?: string;
};

export type CreatePredictionStep =
  | "idle"
  | "validating"
  | "uploading"
  | "submitting"
  | "waiting"
  | "success"
  | "error";

export type CreatePredictionResult = {
  hash: Hex;
  predictionId?: number;
  cid: string;
};

const FORMAT_MAP: Record<PredictionFormat, 0 | 1> = {
  video: 0,
  text: 1,
};

export function useCreatePrediction() {
  const { ready, authenticated } = usePrivy();
  const { address, chain } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const queryClient = useQueryClient();
  const [step, setStep] = useState<CreatePredictionStep>("idle");
  const [txHash, setTxHash] = useState<Hex | null>(null);

  const {
    isUploading,
    progress: uploadProgress,
    error: uploadError,
    uploadFile,
    uploadJson,
    reset: resetUpload,
  } = usePinataUpload();

  const network = getNetworkConfig();
  const registry = getContract("predictionRegistry");

  const mutation = useMutation({
    mutationKey: ["create-prediction"],
    mutationFn: async (
      input: CreatePredictionInput
    ): Promise<CreatePredictionResult> => {
      console.log("🔍 Debug - Starting transaction");
      console.log("- Address:", address);
      console.log("- Chain:", chain);
      console.log("- WalletClient:", !!walletClient);

      if (!ready || !authenticated) {
        throw new Error("Connect your wallet to create a prediction.");
      }
      if (!address) {
        throw new Error("Wallet address not found.");
      }
      if (!walletClient) {
        throw new Error(
          "Wallet client unavailable. Please reconnect your wallet."
        );
      }
      if (!publicClient) {
        throw new Error("Public client unavailable.");
      }
      if (chain?.id !== network.chainId) {
        throw new Error(
          `Wrong network. Please switch to ${network.name} (Chain ID: ${network.chainId})`
        );
      }

      setStep("validating");

      const formatValue = FORMAT_MAP[input.format];
      const category = input.category.trim().toLowerCase();
      if (!category) {
        throw new Error("Category is required.");
      }

      const deadlineSeconds =
        typeof input.deadline === "number"
          ? input.deadline
          : Math.floor(input.deadline.getTime() / 1000);
      const nowSeconds = Math.floor(Date.now() / 1000);
      if (
        !Number.isFinite(deadlineSeconds) ||
        deadlineSeconds <= nowSeconds + 3600
      ) {
        throw new Error("Deadline must be at least one hour in the future.");
      }

      const fee = input.creatorFeeBps ?? 0;
      if (fee < 0 || fee > 10_000) {
        throw new Error("Creator fee must be between 0 and 10,000 bps.");
      }

      let cid = input.existingCid?.trim();
      if (!cid) {
        setStep("uploading");
        if (input.format === "video") {
          if (!input.file) {
            throw new Error("Select a video file to upload.");
          }
          const videoUpload = await uploadFile(input.file, {
            metadata: {
              name: input.title ?? input.file.name,
              keyvalues: {
                category,
                title: input.title ?? "",
                format: "video",
              },
            },
          });

          const metadataPayload = {
            version: "forescene-prediction-v1",
            format: "video",
            title: input.title ?? "Prediction",
            summary: input.summary ?? "",
            category,
            creator: address,
            createdAt: new Date().toISOString(),
            media: {
              cid: videoUpload.cid,
              url: videoUpload.url,
              mimeType: input.file.type || "video/mp4",
              size: input.file.size,
            },
          };

          const metadataUpload = await uploadJson(
            metadataPayload,
            `${category}-prediction-${Date.now()}-metadata.json`,
            {
              metadata: {
                name: input.title ?? "prediction-video-metadata",
                keyvalues: {
                  category,
                  format: "video",
                },
              },
            }
          );

          cid = metadataUpload.cid;
        } else {
          const metadataPayload = {
            version: "forescene-prediction-v1",
            format: "text",
            title: input.title ?? "Prediction",
            summary: input.summary ?? "",
            content: input.textContent ?? "",
            category,
            creator: address,
            createdAt: new Date().toISOString(),
          };
          const metadataUpload = await uploadJson(
            metadataPayload,
            `${category}-prediction-${Date.now()}.json`,
            {
              metadata: {
                name: input.title ?? "prediction-text",
                keyvalues: {
                  category,
                  author: address,
                  format: "text",
                },
              },
            }
          );
          cid = metadataUpload.cid;
        }
      }

      if (!cid) {
        throw new Error("Unable to determine content CID.");
      }

      console.log("📝 Transaction params:");
      console.log("- Contract:", registry.address);
      console.log("- CID:", cid);
      console.log("- Format:", formatValue);
      console.log("- Category:", category);
      console.log("- Deadline:", deadlineSeconds);
      console.log("- Fee:", fee);

      setStep("submitting");

      try {
        const hash = await walletClient.writeContract({
          address: registry.address,
          abi: predictionRegistryAbi,
          functionName: "createPrediction",
          account: address as Address,
          args: [cid, formatValue, category, BigInt(deadlineSeconds), fee],
        });

        console.log("✅ Transaction submitted:", hash);

        setTxHash(hash);
        setStep("waiting");

        const receipt = await publicClient.waitForTransactionReceipt({
          hash,
        });
        console.log("✅ Transaction confirmed");

        let predictionId: number | undefined;
        for (const log of receipt.logs) {
          try {
            const decoded = decodeEventLog({
              abi: predictionRegistryAbi,
              data: log.data,
              topics: log.topics,
            });
            if (decoded.eventName === "PredictionCreated") {
              predictionId = Number(
                (decoded.args as { predictionId: bigint }).predictionId
              );
              break;
            }
          } catch {
            // Ignore non-matching logs.
          }
        }

        await queryClient.invalidateQueries({
          queryKey: ["predictions", network.chainId],
        });

        setStep("success");

        return { hash, predictionId, cid };
      } catch (error) {
        console.error("❌ Transaction failed:", error);
        throw error;
      }
    },
    onError: (error: Error) => {
      console.error("❌ Mutation error:", error);
      setStep("error");
    },
  });

  const reset = () => {
    setStep("idle");
    setTxHash(null);
    resetUpload();
    mutation.reset();
  };

  return {
    createPrediction: mutation.mutateAsync,
    isCreating:
      mutation.status === "pending" &&
      (step === "submitting" || step === "waiting" || step === "validating"),
    isSuccess: mutation.isSuccess,
    error: mutation.error ?? (uploadError ? new Error(uploadError) : null),
    uploadProgress,
    isUploading,
    currentStep: step,
    transactionHash: txHash,
    data: mutation.data,
    reset,
  };
}
