// import {
//   createPublicClient,
//   http,
//   parseUnits,
//   decodeEventLog,
//   encodeFunctionData,
// } from "viem";
// import { privateKeyToAccount } from "viem/accounts";
// import { bscTestnet } from "viem/chains";

// import { predictionRegistryAbi } from "@/abis/predictionRegistry";
// import { foreAbi } from "@/abis/fore";

// // TODO: Replace with your private key
// const PRIVATE_KEY =

// // Deployed contract addresses (from contracts.ts)
// const FORE_TOKEN = "0x5DE0b93d59D4AFd803649f5D333030b33CfddFC6" as const;
// const PREDICTION_REGISTRY =
//   "0xC46b51268B9BD8a8190B2106354415B58CF34787" as const;
// const PREDICTION_MARKET = "0x0E4830E472F90B7C2Fa271206A07B5Cc36f940bF" as const;

// // RPC URL - Use your private RPC endpoint here
// // Note: Infura doesn't support BSC testnet, use Alchemy or another provider
// const RPC_URL =
  

// const account = privateKeyToAccount(PRIVATE_KEY);

// // Public client using your private RPC
// const publicClient = createPublicClient({
//   chain: bscTestnet,
//   transport: http(RPC_URL, {
//     timeout: 30_000,
//     retryCount: 3,
//     retryDelay: 1000,
//   }),
// });

// // Helper to sign and send raw transaction using your private RPC
// async function signAndSendTransaction(
//   to: `0x${string}`,
//   data: `0x${string}`,
//   value?: bigint
// ): Promise<`0x${string}`> {
//   // Get nonce and gas price from your private RPC
//   console.log(`📡 Getting nonce and gas price from: ${RPC_URL}`);
//   const [nonceResult, gasPriceResult] = await Promise.all([
//     publicClient.getTransactionCount({ address: account.address }),
//     publicClient.getGasPrice(),
//   ]);

//   const nonce = BigInt(nonceResult);
//   const gasPrice = gasPriceResult;
//   console.log(`✅ Got nonce (${nonce}) and gas price`);

//   // Estimate gas
//   let gasEstimate: bigint;
//   try {
//     gasEstimate = await publicClient.estimateGas({
//       account: account.address,
//       to,
//       data,
//       value,
//     });
//     // Add 20% buffer
//     gasEstimate = (gasEstimate * BigInt(120)) / BigInt(100);
//     console.log(`⛽ Gas estimate: ${gasEstimate.toString()}`);
//   } catch {
//     console.warn("⚠️ Gas estimation failed, using default");
//     // Default gas if estimation fails
//     gasEstimate = BigInt(100_000);
//   }

//   // Sign transaction locally
//   console.log(`📝 Signing transaction locally...`);
//   const signedTx = await account.signTransaction({
//     to,
//     data,
//     value: value || BigInt(0),
//     gas: gasEstimate,
//     gasPrice,
//     nonce: Number(nonce),
//     chainId: bscTestnet.id,
//   });

//   // Send raw transaction to your private RPC
//   console.log(`📤 Broadcasting transaction to: ${RPC_URL}`);
//   const hash = await publicClient.sendRawTransaction({
//     serializedTransaction: signedTx,
//   });

//   console.log(`✅ Transaction broadcasted: ${hash}`);
//   return hash;
// }

// async function main() {
//   console.log("🧪 Testing Prediction Creation Flow\n");
//   console.log("Account:", account.address);
//   console.log("Chain: BSC Testnet\n");

//   // Test parameters
//   const creatorStake = "100"; // 100 FORE tokens
//   const stakeAmountWei = parseUnits(creatorStake, 18);
//   const deadline = BigInt(Math.floor(Date.now() / 1000) + 7200); // 2 hours from now
//   const testCid = "QmTest123456789";

//   console.log("📋 Test Parameters:");
//   console.log("- Creator Stake:", creatorStake, "FORE");
//   console.log("- Stake Amount (wei):", stakeAmountWei.toString());
//   console.log("- Deadline:", new Date(Number(deadline) * 1000).toISOString());
//   console.log("- CID:", testCid);
//   console.log("- Format: TEXT (1)");
//   console.log("- Category: crypto");
//   console.log("- Fee: 0 (uses default)\n");

//   try {
//     // Step 1: Check balance
//     console.log("💰 Step 1: Checking FORE token balance...");
//     const balance = await publicClient.readContract({
//       address: FORE_TOKEN,
//       abi: foreAbi,
//       functionName: "balanceOf",
//       args: [account.address],
//     });
//     console.log("Balance:", balance.toString(), "wei");
//     console.log("Balance:", (Number(balance) / 1e18).toFixed(2), "FORE\n");

//     if (balance < stakeAmountWei) {
//       throw new Error(
//         `Insufficient balance. Need ${creatorStake} FORE but have ${(
//           Number(balance) / 1e18
//         ).toFixed(2)} FORE`
//       );
//     }

//     // Step 2: Check allowance
//     console.log("🔍 Step 2: Checking token allowance...");
//     const allowance = await publicClient.readContract({
//       address: FORE_TOKEN,
//       abi: foreAbi,
//       functionName: "allowance",
//       args: [account.address, PREDICTION_MARKET],
//     });
//     console.log("Current Allowance:", allowance.toString(), "wei");
//     console.log(
//       "Current Allowance:",
//       (Number(allowance) / 1e18).toFixed(2),
//       "FORE\n"
//     );

//     // Step 3: Approve if needed
//     if (allowance < stakeAmountWei) {
//       console.log("🔑 Step 3: Approving tokens...");
//       console.log("Approving", creatorStake, "FORE to market contract...\n");

//       // Simulate first
//       console.log("🧪 Simulating approve transaction...");
//       await publicClient.simulateContract({
//         address: FORE_TOKEN,
//         abi: foreAbi,
//         functionName: "approve",
//         args: [PREDICTION_MARKET, stakeAmountWei],
//         account: account.address,
//       });
//       console.log("✅ Simulation successful\n");

//       // Sign and send transaction
//       console.log("📤 Signing and submitting approve transaction...");
//       const approveData = encodeFunctionData({
//         abi: foreAbi,
//         functionName: "approve",
//         args: [PREDICTION_MARKET, stakeAmountWei],
//       });

//       const approveHash = await signAndSendTransaction(FORE_TOKEN, approveData);
//       console.log("Approve Tx Hash:", approveHash);

//       console.log("⏳ Waiting for approval confirmation...");
//       console.log(
//         `🔗 View on BSCScan: https://testnet.bscscan.com/tx/${approveHash}\n`
//       );

//       // Wait for receipt with retry logic
//       let approveReceipt;
//       let retries = 10;
//       while (retries > 0) {
//         try {
//           approveReceipt = await publicClient.waitForTransactionReceipt({
//             hash: approveHash,
//             timeout: 30_000,
//             confirmations: 1,
//           });
//           break;
//         } catch (error: unknown) {
//           const errorMessage =
//             error instanceof Error ? error.message : String(error);
//           if (
//             errorMessage.includes("could not be found") ||
//             errorMessage.includes("Block")
//           ) {
//             retries--;
//             if (retries > 0) {
//               console.log(
//                 `⏳ Block not found yet, waiting... (${retries} attempts left)`
//               );
//               await new Promise((resolve) => setTimeout(resolve, 5000));
//               continue;
//             }
//           }
//           throw error;
//         }
//       }

//       if (!approveReceipt) {
//         throw new Error("Failed to get transaction receipt");
//       }

//       console.log(
//         "✅ Approval confirmed at block:",
//         approveReceipt.blockNumber
//       );
//       console.log("Gas used:", approveReceipt.gasUsed.toString(), "\n");
//     } else {
//       console.log("✅ Step 3: Sufficient allowance already exists\n");
//     }

//     // Step 4: Create prediction
//     console.log("📝 Step 4: Creating prediction...");

//     // Simulate first
//     console.log("🧪 Simulating createPrediction transaction...");
//     await publicClient.simulateContract({
//       address: PREDICTION_REGISTRY,
//       abi: predictionRegistryAbi,
//       functionName: "createPrediction",
//       args: [
//         testCid,
//         1, // Format: TEXT
//         "crypto",
//         deadline,
//         0, // Fee: 0 (uses default)
//         stakeAmountWei, // Creator stake
//       ],
//       account: account.address,
//     });
//     console.log("✅ Simulation successful\n");

//     // Sign and send transaction
//     console.log("📤 Signing and submitting createPrediction transaction...");
//     const createData = encodeFunctionData({
//       abi: predictionRegistryAbi,
//       functionName: "createPrediction",
//       args: [
//         testCid,
//         1, // Format: TEXT
//         "crypto",
//         deadline,
//         0, // Fee: 0 (uses default)
//         stakeAmountWei, // Creator stake
//       ],
//     });

//     const createHash = await signAndSendTransaction(
//       PREDICTION_REGISTRY,
//       createData
//     );
//     console.log("Create Tx Hash:", createHash);

//     console.log("⏳ Waiting for transaction confirmation...");
//     console.log(
//       `🔗 View on BSCScan: https://testnet.bscscan.com/tx/${createHash}\n`
//     );

//     // Wait for receipt with retry logic
//     let createReceipt;
//     let retries = 10;
//     while (retries > 0) {
//       try {
//         createReceipt = await publicClient.waitForTransactionReceipt({
//           hash: createHash,
//           timeout: 30_000,
//           confirmations: 1,
//         });
//         break;
//       } catch (error: unknown) {
//         const errorMessage =
//           error instanceof Error ? error.message : String(error);
//         if (
//           errorMessage.includes("could not be found") ||
//           errorMessage.includes("Block")
//         ) {
//           retries--;
//           if (retries > 0) {
//             console.log(
//               `⏳ Block not found yet, waiting... (${retries} attempts left)`
//             );
//             await new Promise((resolve) => setTimeout(resolve, 5000));
//             continue;
//           }
//         }
//         throw error;
//       }
//     }

//     if (!createReceipt) {
//       throw new Error("Failed to get transaction receipt");
//     }

//     console.log(
//       "✅ Transaction confirmed at block:",
//       createReceipt.blockNumber
//     );
//     console.log("Gas used:", createReceipt.gasUsed.toString());

//     // Parse events
//     console.log("\n📊 Transaction Receipt:");
//     console.log("- Status:", createReceipt.status);
//     console.log("- Block Number:", createReceipt.blockNumber.toString());
//     console.log("- Gas Used:", createReceipt.gasUsed.toString());

//     // Try to find PredictionCreated event
//     console.log("\n🔍 Parsing transaction events...");
//     for (const log of createReceipt.logs) {
//       try {
//         // Only check logs from the registry contract
//         if (log.address.toLowerCase() !== PREDICTION_REGISTRY.toLowerCase()) {
//           continue;
//         }

//         const decoded = decodeEventLog({
//           abi: predictionRegistryAbi,
//           data: log.data,
//           topics: log.topics,
//         });

//         if (decoded.eventName === "PredictionCreated") {
//           const args = decoded.args as {
//             predictionId: bigint;
//             creator: `0x${string}`;
//             contentCID: string;
//           };
//           console.log("\n🎉 Prediction Created!");
//           console.log("- Prediction ID:", args.predictionId.toString());
//           console.log("- Creator:", args.creator);
//           console.log("- Content CID:", args.contentCID);
//           break;
//         }
//       } catch {
//         // Ignore non-matching logs
//       }
//     }

//     console.log("\n✅ Test completed successfully!");
//   } catch (error) {
//     console.error("\n❌ Test failed:");
//     if (error instanceof Error) {
//       console.error("Error:", error.message);
//       console.error("Stack:", error.stack);
//     } else {
//       console.error("Unknown error:", error);
//     }
//     process.exit(1);
//   }
// }

// main();
