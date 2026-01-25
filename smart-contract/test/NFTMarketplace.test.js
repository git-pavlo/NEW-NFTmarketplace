const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("NFT Marketplace", function () {
  let nft, market, deployer, seller, buyer;

  beforeEach(async () => {
    [deployer, seller, buyer] = await ethers.getSigners();

    const NFT = await ethers.getContractFactory("NFT");
    nft = await NFT.deploy();
    await nft.waitForDeployment();

    const Marketplace = await ethers.getContractFactory("Marketplace");
    market = await Marketplace.deploy(deployer.address);
    await market.waitForDeployment();
  });

  it("mints NFT and sets royalty", async () => {
    await nft.connect(seller).mint(
      "ipfs://test",
      seller.address,
      500
    );

    expect(await nft.ownerOf(1)).to.equal(seller.address);
  });

  it("lists NFT on marketplace", async () => {
    await nft.connect(seller).mint("ipfs://test", seller.address, 500);
    await nft.connect(seller).approve(market.target, 1);

    await market.connect(seller).listItem(
      nft.target,
      1,
      ethers.parseEther("1")
    );

    const item = await market.items(1);
    expect(item.price).to.equal(ethers.parseEther("1"));
  });

  it("executes sale with royalty + fee", async () => {
    await nft.connect(seller).mint("ipfs://test", seller.address, 500);
    await nft.connect(seller).approve(market.target, 1);

    await market.connect(seller).listItem(
      nft.target,
      1,
      ethers.parseEther("1")
    );

    await market.connect(buyer).buyItem(1, {
      value: ethers.parseEther("1")
    });

    expect(await nft.ownerOf(1)).to.equal(buyer.address);
  });
});
