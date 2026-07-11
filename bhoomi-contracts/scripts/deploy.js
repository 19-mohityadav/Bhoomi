const hre = require("hardhat");

async function main() {
  console.log("Deploying Bhoomi contract to Sepolia testnet...");

  // 1. Explicitly grab the authenticated wallet signer from your hardhat config
  const [deployer] = await hre.ethers.getSigners();
  console.log(`Using deployer wallet address: ${deployer.address}`);

  // 2. Pass the compiled "Bhoomi" contract factory structure
  const BhoomiFactory = await hre.ethers.getContractFactory("Bhoomi");

  // 3. Connect your wallet signer directly to the factory before calling deploy
  const bhoomi = await BhoomiFactory.connect(deployer).deploy();

  console.log("Waiting for block confirmations...");
  await bhoomi.waitForDeployment();

  const contractAddress = await bhoomi.getAddress();
  console.log("==================================================");
  console.log(`🎉 SUCCESS! Bhoomi deployed to: ${contractAddress}`);
  console.log("==================================================");
}

main().catch((error) => {
  console.error("Deployment failed:", error);
  process.exitCode = 1;
});