# MetaMask Delegation Toolkit Demo

This project demonstrates how to build applications that leverage MetaMask's EIP-7702 delegation functionality. With EIP-7702, EOAs (Externally Owned Accounts) can temporarily delegate to smart contracts, unlocking powerful features like:

- **Batch Transactions**: Execute multiple operations in a single transaction
- **Gas Abstraction**: Pay gas fees in any token or have them sponsored
- **Session Keys**: Authorize specific operations for a limited time
- **Smart Contract Logic**: Add programmable functionality to regular wallets

## What's Included

- Smart contracts that work with MetaMask's delegation framework
- React frontend with MetaMask integration
- Examples of batch transactions and sponsored gas
- Comprehensive documentation and tutorials

## Quick Start

```bash
# Install dependencies
npm install

# Start local blockchain
npm run node

# Deploy contracts
npm run deploy

# Start frontend
npm run dev
```

## Features Demonstrated

1. **EOA Enhancement**: Transform regular MetaMask wallets into smart accounts
2. **Batch Operations**: Bundle multiple transactions together
3. **Gasless Transactions**: Enable sponsored transactions
4. **Session Management**: Create temporary authorizations

## Learn More

- [EIP-7702 Specification](https://eips.ethereum.org/EIPS/eip-7702)
- [MetaMask Smart Accounts Documentation](https://docs.metamask.io/snaps/)
- [Delegation Framework](https://github.com/MetaMask/delegation-framework) 
