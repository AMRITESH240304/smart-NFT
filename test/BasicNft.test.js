const { assert } = require("chai");
const { network, deployments } = require("hardhat");
// const { ethers } = require("ethers");
const { developmentChains } = require("../helper-hardhat-config");

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("BasicNFT test", function () {
          let basicNft, deployer;

          beforeEach(async () => {
              deployer = (await getNamedAccounts()).deployer;
              await deployments.fixture(["basicnft"]);
              const BasicNft = await ethers.getContractFactory("BasicNft");
            //   console.log(BasicNft)
              basicNft = await BasicNft.deploy();
              await basicNft.deployed();
          });

          describe("Constructor", () => {
              it("Initializes the NFT Correctly.", async () => {
                  const name = await basicNft.name();
                //   console.log(name)
                  const symbol = await basicNft.symbol();
                  const tokenCounter = await basicNft.getTokenCounter();
                  assert.equal(name, "Dogie");
                  assert.equal(symbol, "DOG");
                  assert.equal(tokenCounter.toString(), "0");
              });
          });
      });
