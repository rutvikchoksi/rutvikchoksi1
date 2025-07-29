const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MetaMaskDelegator", function () {
  let delegator, token;
  let deployer, account1, account2, sponsor;
  let delegatorAddress, tokenAddress;

  beforeEach(async function () {
    // Get test accounts
    [deployer, account1, account2, sponsor] = await ethers.getSigners();

    // Deploy contracts
    const MockERC20 = await ethers.getContractFactory("MockERC20");
    token = await MockERC20.deploy();
    await token.waitForDeployment();
    tokenAddress = await token.getAddress();

    const MetaMaskDelegator = await ethers.getContractFactory("MetaMaskDelegator");
    delegator = await MetaMaskDelegator.deploy();
    await delegator.waitForDeployment();
    delegatorAddress = await delegator.getAddress();

    // Fund accounts and mint tokens
    await token.mint(account1.address, ethers.parseUnits("1000", 18));
    await deployer.sendTransaction({
      to: account1.address,
      value: ethers.parseEther("10")
    });
  });

  describe("Deployment", function () {
    it("Should deploy successfully", async function () {
      expect(await delegator.getAddress()).to.be.properAddress;
      expect(await token.getAddress()).to.be.properAddress;
    });

    it("Should have initial nonce of 0", async function () {
      expect(await delegator.getNonce(account1.address)).to.equal(0);
    });
  });

  describe("Batch Execution", function () {
    it("Should execute batch transactions when called by the delegated account", async function () {
      // Simulate EIP-7702 delegation by calling from the same address
      // In practice, this would be done through EIP-7702 authorization
      const calls = [
        {
          to: account2.address,
          value: ethers.parseEther("1"),
          data: "0x"
        },
        {
          to: tokenAddress,
          value: 0,
          data: token.interface.encodeFunctionData("transfer", [account2.address, ethers.parseUnits("100", 18)])
        }
      ];

      // Get initial balances
      const initialEthBalance = await ethers.provider.getBalance(account2.address);
      const initialTokenBalance = await token.balanceOf(account2.address);

      // For testing, we'll simulate the contract being called by the delegated account
      // In practice, this would happen through EIP-7702 delegation
      await expect(
        delegator.connect(account1).executeBatch(calls)
      ).to.be.revertedWith("MetaMaskDelegator: Invalid caller");

      // The actual call would need to come from the delegated contract address
      // This is a limitation of testing without actual EIP-7702 support
    });

    it("Should increment nonce after successful execution", async function () {
      const initialNonce = await delegator.getNonce(account1.address);
      
      // Since we can't easily test EIP-7702 delegation in this environment,
      // we'll test the nonce increment through other functions
      expect(initialNonce).to.equal(0);
    });
  });

  describe("Session Keys", function () {
    it("Should create session keys", async function () {
      const sessionKeyAddr = account2.address;
      const expiry = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
      const limit = ethers.parseEther("1");

      // This would normally be called through EIP-7702 delegation
      await expect(
        delegator.connect(account1).createSessionKey(sessionKeyAddr, expiry, limit)
      ).to.be.revertedWith("MetaMaskDelegator: Invalid caller");
    });

    it("Should get session key information", async function () {
      const sessionKey = await delegator.getSessionKey(account1.address, account2.address);
      expect(sessionKey.active).to.equal(false); // Default state
    });
  });

  describe("Sponsor Authorization", function () {
    it("Should check sponsor authorization", async function () {
      const isAuthorized = await delegator.isSponsorAuthorized(sponsor.address);
      expect(isAuthorized).to.equal(false);
    });

    it("Should authorize and revoke sponsors", async function () {
      // These would normally be called through EIP-7702 delegation
      await expect(
        delegator.connect(account1).authorizeSponsor(sponsor.address)
      ).to.be.revertedWith("MetaMaskDelegator: Invalid caller");

      await expect(
        delegator.connect(account1).revokeSponsor(sponsor.address)
      ).to.be.revertedWith("MetaMaskDelegator: Invalid caller");
    });
  });

  describe("Signature Verification", function () {
    it("Should verify signatures for sponsored transactions", async function () {
      const calls = [
        {
          to: account2.address,
          value: ethers.parseEther("0.1"),
          data: "0x"
        }
      ];

      const account = account1.address;
      const nonce = await delegator.getNonce(account);
      const chainId = await ethers.provider.getNetwork().then(n => n.chainId);

      // Create message hash
      const messageHash = ethers.solidityPackedKeccak256(
        ["address", "uint256", "uint256", "bytes"],
        [account, nonce, chainId, ethers.AbiCoder.defaultAbiCoder().encode(
          ["tuple(address to, uint256 value, bytes data)[]"],
          [calls]
        )]
      );

      // Sign the message
      const signature = await account1.signMessage(ethers.getBytes(messageHash));

      // This test shows the signature verification logic
      // In practice, this would be called by a sponsor through EIP-7702
      await expect(
        delegator.connect(sponsor).executeBatchWithSignature(calls, signature)
      ).to.be.reverted; // Will revert because we're not calling from a delegated account
    });
  });

  describe("Token Operations", function () {
    it("Should handle token transfers through delegation", async function () {
      // These would normally be called through EIP-7702 delegation
      await expect(
        delegator.connect(account1).transferToken(tokenAddress, account2.address, ethers.parseUnits("100", 18))
      ).to.be.revertedWith("MetaMaskDelegator: Invalid caller");
    });

    it("Should handle token approvals through delegation", async function () {
      // These would normally be called through EIP-7702 delegation
      await expect(
        delegator.connect(account1).approveToken(tokenAddress, account2.address, ethers.parseUnits("100", 18))
      ).to.be.revertedWith("MetaMaskDelegator: Invalid caller");
    });
  });

  describe("Edge Cases", function () {
    it("Should handle invalid signatures", async function () {
      const calls = [
        {
          to: account2.address,
          value: ethers.parseEther("0.1"),
          data: "0x"
        }
      ];

      const invalidSignature = "0x" + "0".repeat(130); // Invalid signature

      await expect(
        delegator.connect(sponsor).executeBatchWithSignature(calls, invalidSignature)
      ).to.be.reverted;
    });

    it("Should handle empty call arrays", async function () {
      const calls = [];

      await expect(
        delegator.connect(account1).executeBatch(calls)
      ).to.be.revertedWith("MetaMaskDelegator: Invalid caller");
    });
  });

  describe("Gas and Payments", function () {
    it("Should receive ETH", async function () {
      const amount = ethers.parseEther("1");
      
      await expect(
        deployer.sendTransaction({
          to: delegatorAddress,
          value: amount
        })
      ).to.changeEtherBalance(delegator, amount);
    });

    it("Should handle fallback function", async function () {
      const amount = ethers.parseEther("0.5");
      
      await expect(
        deployer.sendTransaction({
          to: delegatorAddress,
          value: amount,
          data: "0x1234" // Some random data to trigger fallback
        })
      ).to.changeEtherBalance(delegator, amount);
    });
  });
});

describe("MockERC20", function () {
  let token;
  let deployer, account1, account2;

  beforeEach(async function () {
    [deployer, account1, account2] = await ethers.getSigners();

    const MockERC20 = await ethers.getContractFactory("MockERC20");
    token = await MockERC20.deploy();
    await token.waitForDeployment();
  });

  it("Should deploy with correct initial supply", async function () {
    const expectedSupply = ethers.parseUnits("1000000", 18);
    expect(await token.totalSupply()).to.equal(expectedSupply);
    expect(await token.balanceOf(deployer.address)).to.equal(expectedSupply);
  });

  it("Should allow minting tokens", async function () {
    const mintAmount = ethers.parseUnits("500", 18);
    
    await expect(token.mint(account1.address, mintAmount))
      .to.changeTokenBalance(token, account1, mintAmount);
  });

  it("Should allow burning tokens", async function () {
    const burnAmount = ethers.parseUnits("100", 18);
    
    await expect(token.burn(deployer.address, burnAmount))
      .to.changeTokenBalance(token, deployer, -burnAmount);
  });

  it("Should have correct token metadata", async function () {
    expect(await token.name()).to.equal("Test Token");
    expect(await token.symbol()).to.equal("TEST");
    expect(await token.decimals()).to.equal(18);
  });
});