const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MockUSDC Payment Tests", function () {
  let mockUSDC;
  let owner, alice, bob, charlie;
  let usdcAddress;

  beforeEach(async function () {
    // Get test accounts
    [owner, alice, bob, charlie] = await ethers.getSigners();

    // Deploy MockUSDC
    const MockUSDC = await ethers.getContractFactory("MockUSDC");
    mockUSDC = await MockUSDC.deploy();
    await mockUSDC.waitForDeployment();
    usdcAddress = await mockUSDC.getAddress();

    // Setup initial balances
    await mockUSDC.mint(alice.address, ethers.parseUnits("1000", 6)); // 1000 USDC
    await mockUSDC.mint(bob.address, ethers.parseUnits("500", 6));    // 500 USDC
  });

  describe("Deployment", function () {
    it("Should deploy with correct initial parameters", async function () {
      expect(await mockUSDC.name()).to.equal("Mock USDC");
      expect(await mockUSDC.symbol()).to.equal("USDC");
      expect(await mockUSDC.decimals()).to.equal(6);
    });

    it("Should mint initial supply to deployer", async function () {
      const deployerBalance = await mockUSDC.balanceOf(owner.address);
      expect(deployerBalance).to.equal(ethers.parseUnits("1000000", 6)); // 1M USDC
    });
  });

  describe("Balance Checking", function () {
    it("Should return correct balances", async function () {
      const aliceBalance = await mockUSDC.balanceOf(alice.address);
      const bobBalance = await mockUSDC.balanceOf(bob.address);
      
      expect(aliceBalance).to.equal(ethers.parseUnits("1000", 6));
      expect(bobBalance).to.equal(ethers.parseUnits("500", 6));
    });

    it("Should check sufficient balance correctly", async function () {
      const amount100 = ethers.parseUnits("100", 6);
      const amount2000 = ethers.parseUnits("2000", 6);
      
      expect(await mockUSDC.hasSufficientBalance(alice.address, amount100)).to.be.true;
      expect(await mockUSDC.hasSufficientBalance(alice.address, amount2000)).to.be.false;
    });

    it("Should return formatted balance", async function () {
      const formatted = await mockUSDC.getBalanceFormatted(alice.address);
      expect(formatted).to.equal(1000); // 1000 USDC
    });
  });

  describe("Payments", function () {
    it("Should transfer USDC between accounts", async function () {
      const transferAmount = ethers.parseUnits("100", 6);
      
      // Check initial balances
      const aliceInitial = await mockUSDC.balanceOf(alice.address);
      const bobInitial = await mockUSDC.balanceOf(bob.address);
      
      // Perform transfer
      await expect(
        mockUSDC.connect(alice).transfer(bob.address, transferAmount)
      ).to.emit(mockUSDC, "PaymentSent")
        .withArgs(alice.address, bob.address, transferAmount);
      
      // Check final balances
      const aliceFinal = await mockUSDC.balanceOf(alice.address);
      const bobFinal = await mockUSDC.balanceOf(bob.address);
      
      expect(aliceFinal).to.equal(aliceInitial - transferAmount);
      expect(bobFinal).to.equal(bobInitial + transferAmount);
    });

    it("Should prevent transfer when insufficient balance", async function () {
      const transferAmount = ethers.parseUnits("2000", 6); // More than Alice has
      
      await expect(
        mockUSDC.connect(alice).transfer(bob.address, transferAmount)
      ).to.be.revertedWithCustomError(mockUSDC, "ERC20InsufficientBalance");
    });

    it("Should prevent transfer to zero address", async function () {
      const transferAmount = ethers.parseUnits("100", 6);
      
      await expect(
        mockUSDC.connect(alice).transfer(ethers.ZeroAddress, transferAmount)
      ).to.be.revertedWithCustomError(mockUSDC, "ERC20InvalidReceiver");
    });

    it("Should handle zero amount transfers", async function () {
      const transferAmount = ethers.parseUnits("0", 6);
      
      await expect(
        mockUSDC.connect(alice).transfer(bob.address, transferAmount)
      ).to.emit(mockUSDC, "PaymentSent")
        .withArgs(alice.address, bob.address, transferAmount);
    });
  });

  describe("Payment Validation", function () {
    it("Should validate payment amounts", async function () {
      const validAmount = ethers.parseUnits("100", 6);
      const invalidAmount = ethers.parseUnits("2000", 6);
      
      // Check that Alice can pay 100 USDC
      expect(await mockUSDC.hasSufficientBalance(alice.address, validAmount)).to.be.true;
      
      // Check that Alice cannot pay 2000 USDC
      expect(await mockUSDC.hasSufficientBalance(alice.address, invalidAmount)).to.be.false;
    });

    it("Should get detailed account info", async function () {
      const [balance, formattedBalance] = await mockUSDC.getAccountInfo(alice.address);
      
      expect(balance).to.equal(ethers.parseUnits("1000", 6));
      expect(formattedBalance).to.equal(1000);
    });
  });

  describe("Multiple Payments Scenario", function () {
    it("Should handle multiple sequential payments", async function () {
      const payment1 = ethers.parseUnits("100", 6);
      const payment2 = ethers.parseUnits("200", 6);
      const payment3 = ethers.parseUnits("150", 6);
      
      // Alice starts with 1000 USDC
      let aliceBalance = await mockUSDC.balanceOf(alice.address);
      expect(aliceBalance).to.equal(ethers.parseUnits("1000", 6));
      
      // Payment 1: Alice -> Bob (100 USDC)
      await mockUSDC.connect(alice).transfer(bob.address, payment1);
      aliceBalance = await mockUSDC.balanceOf(alice.address);
      expect(aliceBalance).to.equal(ethers.parseUnits("900", 6));
      
      // Payment 2: Alice -> Charlie (200 USDC)
      await mockUSDC.connect(alice).transfer(charlie.address, payment2);
      aliceBalance = await mockUSDC.balanceOf(alice.address);
      expect(aliceBalance).to.equal(ethers.parseUnits("700", 6));
      
      // Payment 3: Alice -> Bob (150 USDC)
      await mockUSDC.connect(alice).transfer(bob.address, payment3);
      aliceBalance = await mockUSDC.balanceOf(alice.address);
      expect(aliceBalance).to.equal(ethers.parseUnits("550", 6));
      
      // Check Bob received both payments
      const bobBalance = await mockUSDC.balanceOf(bob.address);
      expect(bobBalance).to.equal(ethers.parseUnits("750", 6)); // 500 + 100 + 150
      
      // Check Charlie received payment
      const charlieBalance = await mockUSDC.balanceOf(charlie.address);
      expect(charlieBalance).to.equal(ethers.parseUnits("200", 6));
    });

    it("Should fail when trying to spend more than available", async function () {
      // Alice has 1000 USDC
      const payment1 = ethers.parseUnits("800", 6);
      const payment2 = ethers.parseUnits("300", 6); // This should fail
      
      // First payment should succeed
      await mockUSDC.connect(alice).transfer(bob.address, payment1);
      
      // Second payment should fail (Alice only has 200 USDC left)
      await expect(
        mockUSDC.connect(alice).transfer(charlie.address, payment2)
      ).to.be.revertedWithCustomError(mockUSDC, "ERC20InsufficientBalance");
    });
  });

  describe("Edge Cases", function () {
    it("Should handle payments with exact balance", async function () {
      const aliceBalance = await mockUSDC.balanceOf(alice.address);
      
      // Transfer entire balance
      await expect(
        mockUSDC.connect(alice).transfer(bob.address, aliceBalance)
      ).to.emit(mockUSDC, "PaymentSent");
      
      // Alice should have zero balance
      expect(await mockUSDC.balanceOf(alice.address)).to.equal(0);
    });

    it("Should handle very small amounts", async function () {
      const smallAmount = 1; // 0.000001 USDC (1 unit in 6 decimal token)
      
      await expect(
        mockUSDC.connect(alice).transfer(bob.address, smallAmount)
      ).to.emit(mockUSDC, "PaymentSent")
        .withArgs(alice.address, bob.address, smallAmount);
    });
  });

  describe("Utility Functions", function () {
    it("Should convert between units correctly", async function () {
      const humanAmount = 100; // 100 USDC
      const smallestUnit = await mockUSDC.toSmallestUnit(humanAmount);
      expect(smallestUnit).to.equal(ethers.parseUnits("100", 6));
      
      const backToHuman = await mockUSDC.toHumanAmount(smallestUnit);
      expect(backToHuman).to.equal(humanAmount);
    });
  });

  describe("Real-world Payment Scenarios", function () {
    it("Should simulate a typical payment flow", async function () {
      // Scenario: Alice pays Bob for a service, Bob pays Charlie for supplies
      
      const servicePayment = ethers.parseUnits("250", 6); // $250
      const suppliesPayment = ethers.parseUnits("150", 6); // $150
      
      // 1. Alice pays Bob for service
      await mockUSDC.connect(alice).transfer(bob.address, servicePayment);
      
      // 2. Bob pays Charlie for supplies
      await mockUSDC.connect(bob).transfer(charlie.address, suppliesPayment);
      
      // Check final balances
      const aliceFinal = await mockUSDC.balanceOf(alice.address);
      const bobFinal = await mockUSDC.balanceOf(bob.address);
      const charlieFinal = await mockUSDC.balanceOf(charlie.address);
      
      expect(aliceFinal).to.equal(ethers.parseUnits("750", 6));  // 1000 - 250
      expect(bobFinal).to.equal(ethers.parseUnits("600", 6));    // 500 + 250 - 150
      expect(charlieFinal).to.equal(ethers.parseUnits("150", 6)); // 0 + 150
    });
  });
});