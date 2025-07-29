const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Deploying USDC Payment App...\n");

  // Get the deployer account
  const [deployer, alice, bob, charlie] = await ethers.getSigners();
  console.log("📝 Deploying contracts with account:", deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)), "ETH\n");

  // Deploy MockUSDC token
  console.log("🪙 Deploying MockUSDC token...");
  const MockUSDC = await ethers.getContractFactory("MockUSDC");
  const usdc = await MockUSDC.deploy();
  await usdc.waitForDeployment();
  const usdcAddress = await usdc.getAddress();
  console.log("✅ MockUSDC deployed to:", usdcAddress);

  // Setup test accounts with USDC balances
  console.log("\n💸 Setting up test accounts with USDC...");
  
  const testAccounts = [
    { signer: alice, name: "Alice", amount: "1000" },
    { signer: bob, name: "Bob", amount: "500" },
    { signer: charlie, name: "Charlie", amount: "250" }
  ];

  // Fund ETH for gas fees
  for (const account of testAccounts) {
    await deployer.sendTransaction({
      to: account.signer.address,
      value: ethers.parseEther("10.0")
    });
  }

  // Mint USDC to test accounts
  const recipients = testAccounts.map(acc => acc.signer.address);
  const amounts = testAccounts.map(acc => ethers.parseUnits(acc.amount, 6)); // USDC has 6 decimals

  await usdc.mintBatch(recipients, amounts);

  console.log("✅ Test accounts funded with USDC and ETH:");
  for (let i = 0; i < testAccounts.length; i++) {
    const balance = await usdc.balanceOf(testAccounts[i].signer.address);
    const formattedBalance = ethers.formatUnits(balance, 6);
    console.log(`   ${testAccounts[i].name}: ${formattedBalance} USDC (${testAccounts[i].signer.address})`);
  }

  // Get deployer USDC balance
  const deployerBalance = await usdc.balanceOf(deployer.address);
  const deployerFormatted = ethers.formatUnits(deployerBalance, 6);
  console.log(`   Deployer: ${deployerFormatted} USDC (${deployer.address})`);

  console.log("\n🎉 Deployment completed successfully!");
  console.log("\n📋 Contract Information:");
  console.log("├── MockUSDC:", usdcAddress);
  console.log("├── Token Name:", await usdc.name());
  console.log("├── Token Symbol:", await usdc.symbol());
  console.log("└── Decimals:", await usdc.decimals());

  console.log("\n👥 Test Accounts:");
  console.log("├── Deployer:", deployer.address);
  for (const account of testAccounts) {
    console.log(`├── ${account.name}:`, account.signer.address);
  }

  console.log("\n🔧 Next Steps:");
  console.log("1. Start the frontend: npm run dev");
  console.log("2. Connect MetaMask to http://localhost:8545");
  console.log("3. Import test accounts using these private keys:");
  
  // Note: These are test accounts from the hardhat mnemonic, never use in production
  const testPrivateKeys = [
    "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d", // alice
    "0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a", // bob
    "0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6", // charlie
  ];
  
  testPrivateKeys.forEach((pk, i) => {
    console.log(`   ${testAccounts[i].name}: ${pk}`);
  });

  console.log("\n⚠️  WARNING: These are test private keys only! Never use in production.");

  // Save deployment info
  const deploymentInfo = {
    network: "localhost",
    chainId: 31337,
    contracts: {
      MockUSDC: usdcAddress
    },
    accounts: {
      deployer: deployer.address,
      alice: alice.address,
      bob: bob.address,
      charlie: charlie.address
    },
    testPrivateKeys: testPrivateKeys
  };

  // Write deployment info to file
  const fs = require('fs');
  const path = require('path');
  
  const deploymentPath = path.join(__dirname, '..', 'deployment.json');
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
  console.log(`\n📄 Deployment info saved to: ${deploymentPath}`);

  // Copy deployment info to frontend public folder
  const frontendPath = path.join(__dirname, '..', 'frontend', 'public', 'deployment.json');
  try {
    fs.writeFileSync(frontendPath, JSON.stringify(deploymentInfo, null, 2));
    console.log(`📄 Deployment info copied to frontend: ${frontendPath}`);
  } catch (error) {
    console.log("⚠️  Could not copy to frontend (frontend folder may not exist yet)");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });