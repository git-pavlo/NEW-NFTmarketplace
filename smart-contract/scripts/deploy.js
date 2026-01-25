import hre from "hardhat";

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying contracts with account:", deployer.address);

  // NFT contract
  const NFT = await hre.ethers.getContractFactory("NFT");
  const nft = await NFT.deploy();
  await nft.waitForDeployment();
  console.log("NFT deployed to:", nft.target);

  // Marketplace contract
  const Marketplace = await hre.ethers.getContractFactory("Marketplace");

  // ✅ Pass deployer.address or any valid wallet
  const market = await Marketplace.deploy(deployer.address);
  await market.waitForDeployment();
  console.log("Marketplace deployed to:", market.target);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
