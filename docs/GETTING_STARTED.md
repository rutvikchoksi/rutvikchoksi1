# Getting Started with MetaMask Delegation Toolkit Demo

This guide will help you set up and run the MetaMask Delegation Toolkit demo, which showcases EIP-7702 smart account features.

## 🎯 What You'll Learn

- How EIP-7702 enables smart account functionality for EOAs
- MetaMask's delegation framework implementation
- Batch transactions and gas optimization
- Session keys for automated operations
- Sponsored transactions and gasless UX

## 📋 Prerequisites

- **Node.js** (v16 or later)
- **npm** or **yarn** package manager
- **MetaMask** browser extension
- Basic understanding of Ethereum and smart contracts

## 🚀 Quick Setup

### 1. Clone and Install

```bash
git clone <repository-url>
cd metamask-delegation-toolkit-demo
npm install
```

### 2. Start Local Blockchain

```bash
# Terminal 1: Start Hardhat node
npm run node
```

This starts a local Ethereum network on `http://localhost:8545` with EIP-7702 support enabled.

### 3. Deploy Contracts

```bash
# Terminal 2: Deploy contracts
npm run deploy
```

This deploys:
- **MetaMaskDelegator**: The main delegation contract
- **MockERC20**: Test token for demonstrations

### 4. Start Frontend

```bash
# Terminal 3: Start React app
npm run dev
```

Visit `http://localhost:3000` to access the demo interface.

### 5. Configure MetaMask

1. **Add Local Network** to MetaMask:
   - Network Name: `Localhost 8545`
   - RPC URL: `http://localhost:8545`
   - Chain ID: `31337`
   - Currency Symbol: `ETH`

2. **Import Test Accounts** (these are included in your deployment output):
   - Use the private keys provided by the deployment script
   - **⚠️ Never use these keys in production**

## 🏗️ Project Structure

```
metamask-delegation-toolkit-demo/
├── contracts/                 # Smart contracts
│   ├── MetaMaskDelegator.sol # Main delegation contract
│   └── MockERC20.sol         # Test token
├── frontend/                 # React application
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── App.js           # Main application
│   │   └── index.js         # Entry point
│   └── public/              # Static assets
├── scripts/                 # Deployment scripts
├── test/                    # Contract tests
├── docs/                    # Documentation
└── hardhat.config.js        # Hardhat configuration
```

## 🔧 Available Commands

| Command | Description |
|---------|-------------|
| `npm run node` | Start local Hardhat network |
| `npm run compile` | Compile smart contracts |
| `npm run deploy` | Deploy contracts to local network |
| `npm run test` | Run contract tests |
| `npm run dev` | Start React frontend |
| `npm run setup` | Install all dependencies |

## 🎪 Demo Features

### 1. Wallet Connection
- Connect MetaMask to local network
- Check smart account status
- View account information

### 2. EIP-7702 Delegation
- Enable delegation to smart contracts
- View delegation status
- Test delegated functionality

### 3. Batch Transactions
- Create multiple transactions
- Execute atomically in one batch
- Save gas and improve UX

### 4. Session Keys
- Generate time-limited keys
- Set spending limits
- Automate transactions safely

## 🔍 Understanding EIP-7702

EIP-7702 is a major Ethereum upgrade that allows EOAs (your regular MetaMask accounts) to temporarily "delegate" to smart contracts, gaining smart account capabilities without:

- Changing your wallet address
- Moving your funds
- Losing control of your account

### Key Benefits

1. **Backward Compatibility**: Your existing EOA works as before
2. **Enhanced Functionality**: Gain smart contract capabilities
3. **Reversible**: Can enable/disable delegation anytime
4. **Secure**: You retain full control of your account

### How It Works

1. **Authorization**: Sign a delegation authorization
2. **Transaction**: Include authorization in EIP-7702 transaction
3. **Execution**: Your EOA now has delegated contract functionality
4. **Revocation**: Can revoke delegation at any time

## 🛠️ Development Guide

### Adding New Features

1. **Smart Contract**: Add functions to `MetaMaskDelegator.sol`
2. **Frontend**: Create new components in `frontend/src/components/`
3. **Integration**: Update `App.js` to include new features

### Testing

```bash
# Run contract tests
npm run test

# Test specific contract
npx hardhat test test/MetaMaskDelegator.test.js
```

### Deployment to Other Networks

1. Update `hardhat.config.js` with network configuration
2. Set environment variables for private keys
3. Deploy: `npx hardhat run scripts/deploy.js --network <network-name>`

## 🔒 Security Considerations

### For Development
- Use only test networks and test funds
- Never commit private keys to version control
- Test thoroughly before mainnet deployment

### For Production
- Use hardware wallets for deployment
- Audit smart contracts professionally
- Implement proper access controls
- Monitor contract interactions

## 🐛 Troubleshooting

### Common Issues

**MetaMask Connection Fails**
- Ensure MetaMask is connected to `http://localhost:8545`
- Check that Hardhat node is running
- Verify chain ID is `31337`

**Contracts Not Found**
- Run `npm run deploy` to deploy contracts
- Check `deployment.json` file is created
- Verify contract addresses in frontend

**Transactions Failing**
- Ensure account has sufficient ETH for gas
- Check contract addresses are correct
- Verify network configuration

**Smart Account Features Not Working**
- EIP-7702 requires specific wallet/network support
- This demo shows interfaces and simulations
- For full functionality, use compatible implementations

### Getting Help

1. Check the [troubleshooting guide](./TROUBLESHOOTING.md)
2. Review [FAQ](./FAQ.md)
3. Open an issue on GitHub
4. Join our Discord community

## 📚 Additional Resources

- [EIP-7702 Specification](https://eips.ethereum.org/EIPS/eip-7702)
- [MetaMask Developer Documentation](https://docs.metamask.io/)
- [Hardhat Documentation](https://hardhat.org/docs)
- [React Documentation](https://reactjs.org/docs)

## 🎯 Next Steps

1. **Explore the Demo**: Try all features in the web interface
2. **Read the Code**: Understand how EIP-7702 delegation works
3. **Experiment**: Modify contracts and add new features
4. **Build**: Create your own delegation-enabled applications

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.

---

**⚠️ Disclaimer**: This is a demonstration project for educational purposes. Do not use in production without proper security audits and testing.