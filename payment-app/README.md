# 💰 USDC Payment App

A simple, secure USDC payment application that allows users to send USDC tokens between Externally Owned Accounts (EOAs) using MetaMask.

## ✨ Features

- **💸 Send USDC Payments**: Transfer USDC between any Ethereum addresses
- **🔒 Balance Protection**: Prevents sending more than available balance
- **🎯 Real-time Validation**: Instant feedback on payment validity
- **📱 Mobile Responsive**: Works on desktop and mobile devices
- **🔗 MetaMask Integration**: Seamless wallet connection
- **⚡ Fast Transactions**: Direct EOA-to-EOA transfers
- **🧪 Test Environment**: Complete local testing setup

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v16 or later)
- **MetaMask** browser extension
- **Git** for cloning the repository

### 1. Clone and Install

```bash
git clone <repository-url>
cd payment-app
npm install
cd frontend && npm install && cd ..
```

### 2. Start Local Blockchain

```bash
# Terminal 1: Start Hardhat node
npm run node
```

This starts a local Ethereum network on `http://localhost:8545` with pre-funded test accounts.

### 3. Deploy Contracts

```bash
# Terminal 2: Deploy USDC contract
npm run deploy
```

This deploys the MockUSDC contract and funds test accounts with USDC tokens.

### 4. Start Frontend

```bash
# Terminal 3: Start React app
npm run start
```

Visit `http://localhost:3000` to access the payment app.

### 5. Configure MetaMask

1. **Add Local Network** to MetaMask:
   - Network Name: `Localhost 8545`
   - RPC URL: `http://localhost:8545`
   - Chain ID: `31337`
   - Currency Symbol: `ETH`

2. **Import Test Accounts** (private keys provided in deployment output):
   - Alice: 1000 USDC balance
   - Bob: 500 USDC balance
   - Charlie: 250 USDC balance

## 🎪 How It Works

### For Senders

1. **Connect Wallet**: Connect your MetaMask wallet
2. **Check Balance**: Your USDC balance is displayed prominently
3. **Enter Recipient**: Paste the recipient's Ethereum address
4. **Set Amount**: Enter the amount to send (with quick amount buttons)
5. **Send Payment**: Click "Send Payment" and confirm in MetaMask
6. **Instant Feedback**: Get immediate confirmation of the transaction

### Balance Protection

The app implements multiple layers of balance protection:

- **Frontend Validation**: Real-time checks prevent overspending
- **Smart Contract Validation**: `hasSufficientBalance()` function verifies on-chain
- **ERC20 Protection**: Standard ERC20 `transfer()` function prevents overdrafts
- **User Feedback**: Clear error messages for insufficient balance

## 🏗️ Architecture

### Smart Contracts

**MockUSDC.sol**: A comprehensive USDC token implementation featuring:
- 6 decimal precision (like real USDC)
- Balance checking utilities
- Payment event logging
- Batch minting for testing
- Utility functions for amount conversion

### Frontend

**React Application** with:
- MetaMask integration using ethers.js
- Real-time balance updates
- Form validation and error handling
- Responsive design for all devices
- Quick amount selection buttons

### Key Components

```
payment-app/
├── contracts/           # Smart contracts
│   └── MockUSDC.sol    # USDC token contract
├── frontend/           # React application
│   ├── src/
│   │   ├── App.js     # Main application component
│   │   ├── index.js   # Entry point
│   │   └── index.css  # Styles
│   └── public/        # Static assets
├── scripts/           # Deployment scripts
├── test/             # Contract tests
└── hardhat.config.js # Hardhat configuration
```

## 🔧 Available Commands

| Command | Description |
|---------|-------------|
| `npm run node` | Start local Hardhat network |
| `npm run compile` | Compile smart contracts |
| `npm run deploy` | Deploy contracts to local network |
| `npm run test` | Run contract tests |
| `npm run start` | Start React frontend |
| `npm run setup` | Install all dependencies |

## 💡 Smart Contract Features

### Balance Checking

```solidity
// Check if account has sufficient balance
function hasSufficientBalance(address account, uint256 amount) 
    external view returns (bool)

// Get balance in human-readable format
function getBalanceFormatted(address account) 
    external view returns (uint256)
```

### Payment Events

```solidity
// Emitted on every payment
event PaymentSent(address indexed from, address indexed to, uint256 amount)
```

### Utility Functions

```solidity
// Convert between human amounts and token units
function toSmallestUnit(uint256 humanAmount) external pure returns (uint256)
function toHumanAmount(uint256 smallestUnitAmount) external pure returns (uint256)
```

## 🧪 Testing

### Run Contract Tests

```bash
npm run test
```

The test suite covers:
- ✅ Basic transfers between accounts
- ✅ Balance validation and insufficient funds
- ✅ Edge cases (zero amounts, exact balance)
- ✅ Multiple payment scenarios
- ✅ Error handling and validation

### Test Scenarios

1. **Happy Path**: Alice sends 100 USDC to Bob
2. **Insufficient Balance**: Alice tries to send 2000 USDC (more than her balance)
3. **Invalid Address**: Sending to an invalid Ethereum address
4. **Zero Amount**: Handling zero-value transfers
5. **Exact Balance**: Sending the entire balance

## 🔒 Security Features

### Balance Protection

- **Multi-layer Validation**: Frontend, contract, and ERC20 level checks
- **Real-time Feedback**: Immediate validation before sending
- **Gas Estimation**: Prevents failed transactions due to insufficient gas

### Input Validation

- **Address Validation**: Ensures valid Ethereum addresses
- **Amount Validation**: Prevents negative or invalid amounts
- **Self-Transfer Prevention**: Cannot send to your own address

### Error Handling

- **User-Friendly Messages**: Clear error descriptions
- **Transaction Status**: Real-time transaction updates
- **Network Detection**: Warns if on wrong network

## 🎯 User Interface

### Payment Form

- **Recipient Address**: Full Ethereum address input with validation
- **Amount Input**: Large, clear input with currency symbol
- **Quick Amounts**: Preset buttons for common amounts ($10, $25, $50, etc.)
- **Balance Display**: Prominent display of current USDC balance
- **Send Button**: Disabled when invalid inputs or insufficient balance

### Status Updates

- **Real-time Feedback**: Instant validation messages
- **Transaction Progress**: Step-by-step transaction status
- **Success Confirmation**: Clear confirmation of successful payments
- **Error Messages**: Helpful error descriptions with solutions

## 🚧 Limitations & Considerations

### Current Limitations

- **Test Network Only**: Currently works on localhost network
- **Single Token**: Only supports USDC transfers
- **No Transaction History**: Doesn't store payment history
- **Basic UI**: Simple interface focused on core functionality

### Production Considerations

For production deployment, consider:

- **Mainnet Integration**: Configure for Ethereum mainnet
- **Real USDC Contract**: Use official USDC contract address
- **Security Audits**: Professional smart contract auditing
- **Gas Optimization**: Optimize for lower transaction costs
- **User Experience**: Enhanced UI/UX for better user experience

## 🐛 Troubleshooting

### Common Issues

**MetaMask Not Connecting**
- Ensure MetaMask is installed and unlocked
- Check you're on the localhost network (Chain ID: 31337)
- Try refreshing the page

**No USDC Balance**
- Ensure contracts are deployed (`npm run deploy`)
- Import test accounts with provided private keys
- Check you're using the correct account

**Transactions Failing**
- Ensure sufficient ETH for gas fees
- Check USDC balance is sufficient
- Verify recipient address is valid

**Contract Not Found**
- Run `npm run deploy` to deploy contracts
- Check `deployment.json` file exists
- Restart the frontend application

## 📊 Test Accounts

After deployment, you'll have these pre-funded test accounts:

| Account | USDC Balance | ETH Balance | Purpose |
|---------|-------------|-------------|---------|
| Alice | 1,000 USDC | 10 ETH | Primary sender |
| Bob | 500 USDC | 10 ETH | Receiver/sender |
| Charlie | 250 USDC | 10 ETH | Additional receiver |

**⚠️ Important**: These are test accounts only. Never use these private keys in production.

## 🎯 Example Usage

### Typical Payment Flow

1. **Alice wants to pay Bob $100 USDC**
2. Alice connects her MetaMask wallet
3. App shows Alice has 1,000 USDC balance
4. Alice enters Bob's address: `0x70997970C51812dc3A010C7d01b50e0d17dc79C8`
5. Alice enters amount: `100`
6. Alice clicks "Send Payment"
7. MetaMask prompts for confirmation
8. Transaction completes successfully
9. Alice's new balance: 900 USDC
10. Bob receives 100 USDC in his account

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **OpenZeppelin**: For secure ERC20 implementation
- **Hardhat**: For excellent development environment
- **MetaMask**: For seamless wallet integration
- **React**: For powerful frontend framework

---

**Ready to send your first USDC payment? Follow the Quick Start guide above!** 🚀