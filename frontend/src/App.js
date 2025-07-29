import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import WalletConnection from './components/WalletConnection';
import DelegationDemo from './components/DelegationDemo';
import BatchTransactions from './components/BatchTransactions';
import SessionKeys from './components/SessionKeys';
import ContractInfo from './components/ContractInfo';

function App() {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isMetaMaskSmartAccount, setIsMetaMaskSmartAccount] = useState(false);

  // Contract addresses (these will be loaded from deployment.json in production)
  const [contractAddresses, setContractAddresses] = useState({
    MetaMaskDelegator: null,
    MockERC20: null
  });

  useEffect(() => {
    // Load contract addresses from deployment.json
    fetch('/deployment.json')
      .then(response => response.json())
      .then(data => {
        setContractAddresses(data.contracts);
      })
      .catch(error => {
        console.warn('Could not load deployment.json, using default addresses');
        // Fallback addresses for testing
        setContractAddresses({
          MetaMaskDelegator: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
          MockERC20: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512'
        });
      });

    // Check if already connected
    if (window.ethereum) {
      window.ethereum.request({ method: 'eth_accounts' })
        .then(accounts => {
          if (accounts.length > 0) {
            connectWallet();
          }
        });
    }
  }, []);

  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        alert('MetaMask is not installed!');
        return;
      }

      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const network = await provider.getNetwork();

      setAccount(accounts[0]);
      setProvider(provider);
      setSigner(signer);
      setChainId(network.chainId);
      setIsConnected(true);

      // Check if this is a MetaMask smart account
      await checkSmartAccountStatus(accounts[0], provider);

    } catch (error) {
      console.error('Error connecting wallet:', error);
      alert('Error connecting wallet: ' + error.message);
    }
  };

  const checkSmartAccountStatus = async (address, provider) => {
    try {
      // Check if the account has code (which would indicate EIP-7702 delegation)
      const code = await provider.getCode(address);
      setIsMetaMaskSmartAccount(code !== '0x');
    } catch (error) {
      console.error('Error checking smart account status:', error);
      setIsMetaMaskSmartAccount(false);
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setProvider(null);
    setSigner(null);
    setChainId(null);
    setIsConnected(false);
    setIsMetaMaskSmartAccount(false);
  };

  return (
    <div className="container">
      <div className="header">
        <h1>🦊 MetaMask Delegation Toolkit</h1>
        <p>Explore EIP-7702 Smart Account Features</p>
        {chainId && (
          <p>Connected to Chain ID: {chainId.toString()}</p>
        )}
      </div>

      <div className="card">
        <WalletConnection
          account={account}
          isConnected={isConnected}
          isMetaMaskSmartAccount={isMetaMaskSmartAccount}
          onConnect={connectWallet}
          onDisconnect={disconnectWallet}
        />
      </div>

      {isConnected && (
        <>
          <div className="card">
            <ContractInfo
              contractAddresses={contractAddresses}
              provider={provider}
            />
          </div>

          <div className="grid">
            <div className="feature-card">
              <DelegationDemo
                account={account}
                signer={signer}
                contractAddresses={contractAddresses}
                isMetaMaskSmartAccount={isMetaMaskSmartAccount}
              />
            </div>

            <div className="feature-card">
              <BatchTransactions
                account={account}
                signer={signer}
                contractAddresses={contractAddresses}
                isMetaMaskSmartAccount={isMetaMaskSmartAccount}
              />
            </div>

            <div className="feature-card">
              <SessionKeys
                account={account}
                signer={signer}
                contractAddresses={contractAddresses}
                isMetaMaskSmartAccount={isMetaMaskSmartAccount}
              />
            </div>
          </div>

          <div className="card">
            <h3>🔍 About EIP-7702 & MetaMask Smart Accounts</h3>
            <div className="status info">
              <strong>EIP-7702</strong> allows EOAs to temporarily delegate to smart contracts, 
              enabling features like batch transactions, gasless transactions, and session keys 
              without changing your wallet address or moving funds.
            </div>
            
            <h4>Key Features:</h4>
            <ul>
              <li><strong>Batch Transactions:</strong> Execute multiple operations in one transaction</li>
              <li><strong>Gas Sponsorship:</strong> Let others pay your gas fees</li>
              <li><strong>Session Keys:</strong> Grant limited permissions for automated actions</li>
              <li><strong>Smart Contract Logic:</strong> Add programmable functionality to your EOA</li>
            </ul>

            <h4>How It Works:</h4>
            <ol>
              <li>Your EOA signs an authorization to delegate to a smart contract</li>
              <li>The smart contract code is temporarily "attached" to your EOA</li>
              <li>You can now call smart contract functions directly from your EOA address</li>
              <li>You retain full control and can revoke delegation at any time</li>
            </ol>

            <div className="status warning">
              <strong>Note:</strong> This demo works with local test networks. For mainnet usage, 
              ensure your MetaMask wallet supports EIP-7702 smart account features.
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default App;