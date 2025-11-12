// import { createWalletClient, http } from "viem";
// import { privateKeyToAccount } from "viem/accounts";

// import { predictionRegistryAbi } from "@/abis/predictionRegistry";
// import { bscTestnet } from "viem/chains";
// const account = privateKeyToAccount(
  
// );

// const client = createWalletClient({
//   account,
//   chain: bscTestnet,
//   transport: http("https://bnb-testnet.g.alchemy.com/v2/"),
// });

// async function main() {
//     const deadline = BigInt(Math.floor(Date.now() / 1000) + 7200);

//     const hash = await client.writeContract({
//       address: "0x09E10ac18B55faBb5ac37022EF35ecDd42594EDc",
//       abi: predictionRegistryAbi,
//       functionName: "createPrediction",
//       args: ["testcid", 0, "crypto", deadline, 250],
//     });
  
//   console.log("Tx Hash:", hash);
// }

// main();
