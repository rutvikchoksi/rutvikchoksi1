const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Deploying MetaMask Delegation Toolkit Demo...\n");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying contracts with account:", deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)), "ETH\n");

  // Deploy MockERC20 token
  console.log("🪙 Deploying MockERC20 token...");
  const MockERC20 = await ethers.getContractFactory("MockERC20");
  const token = await MockERC20.deploy();
  await token.waitForDeployment();
  const tokenAddress = await token.getAddress();
  console.log("✅ MockERC20 deployed to:", tokenAddress);

  // Deploy MetaMaskDelegator
  console.log("\n🔐 Deploying MetaMaskDelegator...");
  const MetaMaskDelegator = await ethers.getContractFactory("MetaMaskDelegator");
  const delegator = await MetaMaskDelegator.deploy();
  await delegator.waitForDeployment();
  const delegatorAddress = await delegator.getAddress();
  console.log("✅ MetaMaskDelegator deployed to:", delegatorAddress);

  // Get additional test accounts
  const [, account1, account2, sponsor] = await ethers.getSigners();

  // Fund test accounts with ETH
  console.log("\n💸 Funding test accounts...");
  await deployer.sendTransaction({
    to: account1.address,
    value: ethers.parseEther("10.0")
  });
  await deployer.sendTransaction({
    to: account2.address,
    value: ethers.parseEther("10.0")
  });
  await deployer.sendTransaction({
    to: sponsor.address,
    value: ethers.parseEther("10.0")
  });

  // Mint tokens to test accounts
  console.log("🪙 Minting tokens to test accounts...");
  await token.mint(account1.address, ethers.parseUnits("1000", 18));
  await token.mint(account2.address, ethers.parseUnits("1000", 18));

  console.log("\n🎉 Deployment completed successfully!");
  console.log("\n📋 Contract Addresses:");
  console.log("├── MockERC20:", tokenAddress);
  console.log("└── MetaMaskDelegator:", delegatorAddress);

  console.log("\n👥 Test Accounts:");
  console.log("├── Deployer:", deployer.address);
  console.log("├── Account 1:", account1.address, "(10 ETH, 1000 TEST)");
  console.log("├── Account 2:", account2.address, "(10 ETH, 1000 TEST)");
  console.log("└── Sponsor:", sponsor.address, "(10 ETH)");

  console.log("\n🔧 Next Steps:");
  console.log("1. Start the frontend: npm run dev");
  console.log("2. Connect MetaMask to http://localhost:8545");
  console.log("3. Import test accounts using these private keys:");
  
  // Note: These are test accounts, never use in production
  const testAccounts = [
    "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d", // account1
    "0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a", // account2
    "0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6", // sponsor
  ];
  
  testAccounts.forEach((pk, i) => {
    console.log(`   Account ${i + 1}: ${pk}`);
  });

  console.log("\n⚠️  WARNING: These are test private keys only! Never use in production.");

  // Save deployment info
  const deploymentInfo = {
    network: "localhost",
    chainId: 31337,
    contracts: {
      MockERC20: tokenAddress,
      MetaMaskDelegator: delegatorAddress
    },
    accounts: {
      deployer: deployer.address,
      account1: account1.address,
      account2: account2.address,
      sponsor: sponsor.address
    },
    testPrivateKeys: testAccounts
  };

  // Write deployment info to file
  const fs = require('fs');
  const path = require('path');
  
  const deploymentPath = path.join(__dirname, '..', 'deployment.json');
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
  console.log(`\n📄 Deployment info saved to: ${deploymentPath}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });