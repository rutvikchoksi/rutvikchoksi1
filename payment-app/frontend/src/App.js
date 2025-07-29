import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

function App() {
  // State management
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [usdcContract, setUsdcContract] = useState(null);
  const [balance, setBalance] = useState('0');
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  
  // Payment form state
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedQuickAmount, setSelectedQuickAmount] = useState(null);

  // Contract details
  const [contractAddress, setContractAddress] = useState(null);

  // USDC ABI - only the functions we need
  const USDC_ABI = [
    'function name() view returns (string)',
    'function symbol() view returns (string)',
    'function decimals() view returns (uint8)',
    'function balanceOf(address account) view returns (uint256)',
    'function transfer(address to, uint256 amount) returns (bool)',
    'function hasSufficientBalance(address account, uint256 amount) view returns (bool)',
    'event Transfer(address indexed from, address indexed to, uint256 value)',
    'event PaymentSent(address indexed from, address indexed to, uint256 amount)'
  ];

  // Quick amount options (in USDC)
  const quickAmounts = [10, 25, 50, 100, 250, 500];

  // Load deployment info and check for existing connection
  useEffect(() => {
    loadDeploymentInfo();
    checkExistingConnection();
  }, []);

  // Load contract when we have both provider and contract address
  useEffect(() => {
    if (provider && contractAddress && account) {
      loadUSDCContract();
    }
  }, [provider, contractAddress, account]);

  const loadDeploymentInfo = async () => {
    try {
      const response = await fetch('/deployment.json');
      const deploymentData = await response.json();
      setContractAddress(deploymentData.contracts.MockUSDC);
    } catch (error) {
      console.error('Could not load deployment info:', error);
      // Fallback contract address for development
      setContractAddress('0x5FbDB2315678afecb367f032d93F642f64180aa3');
    }
  };

  const checkExistingConnection = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          await connectWallet();
        }
      } catch (error) {
        console.error('Error checking existing connection:', error);
      }
    }
  };

  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        setStatus('❌ MetaMask is not installed! Please install MetaMask to use this app.');
        return;
      }

      setLoading(true);
      setStatus('Connecting to wallet...');

      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const network = await provider.getNetwork();

      // Check if we're on the correct network
      if (network.chainId !== 31337n) {
        setStatus('⚠️ Please connect to the localhost network (Chain ID: 31337)');
        setLoading(false);
        return;
      }

      setAccount(accounts[0]);
      setProvider(provider);
      setSigner(signer);
      setIsConnected(true);
      setStatus('✅ Wallet connected successfully!');

      // Listen for account changes
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

    } catch (error) {
      console.error('Error connecting wallet:', error);
      setStatus('❌ Failed to connect wallet: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadUSDCContract = async () => {
    try {
      const contract = new ethers.Contract(contractAddress, USDC_ABI, signer);
      setUsdcContract(contract);
      await loadBalance();
      setStatus('✅ USDC contract loaded successfully!');
    } catch (error) {
      console.error('Error loading USDC contract:', error);
      setStatus('❌ Failed to load USDC contract: ' + error.message);
    }
  };

  const loadBalance = async () => {
    if (!usdcContract || !account) return;

    try {
      const balanceWei = await usdcContract.balanceOf(account);
      const balanceFormatted = ethers.formatUnits(balanceWei, 6); // USDC has 6 decimals
      setBalance(balanceFormatted);
    } catch (error) {
      console.error('Error loading balance:', error);
      setBalance('0');
    }
  };

  const handleAccountsChanged = (accounts) => {
    if (accounts.length === 0) {
      disconnectWallet();
    } else {
      setAccount(accounts[0]);
      if (usdcContract) {
        loadBalance();
      }
    }
  };

  const handleChainChanged = () => {
    window.location.reload();
  };

  const disconnectWallet = () => {
    setAccount(null);
    setProvider(null);
    setSigner(null);
    setUsdcContract(null);
    setBalance('0');
    setIsConnected(false);
    setStatus('Wallet disconnected');
  };

  const handleQuickAmount = (quickAmount) => {
    setAmount(quickAmount.toString());
    setSelectedQuickAmount(quickAmount);
  };

  const handleAmountChange = (e) => {
    setAmount(e.target.value);
    setSelectedQuickAmount(null);
  };

  const validatePayment = () => {
    if (!recipient) {
      setStatus('❌ Please enter a recipient address');
      return false;
    }

    if (!ethers.isAddress(recipient)) {
      setStatus('❌ Please enter a valid Ethereum address');
      return false;
    }

    if (recipient.toLowerCase() === account.toLowerCase()) {
      setStatus('❌ Cannot send to yourself');
      return false;
    }

    if (!amount || parseFloat(amount) <= 0) {
      setStatus('❌ Please enter a valid amount');
      return false;
    }

    if (parseFloat(amount) > parseFloat(balance)) {
      setStatus('❌ Insufficient balance');
      return false;
    }

    return true;
  };

  const sendPayment = async () => {
    if (!validatePayment()) return;

    setLoading(true);
    setStatus('Processing payment...');

    try {
      // Convert amount to wei (USDC has 6 decimals)
      const amountWei = ethers.parseUnits(amount, 6);

      // Check if user has sufficient balance (double-check on contract)
      const hasSufficientBalance = await usdcContract.hasSufficientBalance(account, amountWei);
      if (!hasSufficientBalance) {
        setStatus('❌ Insufficient balance confirmed by contract');
        setLoading(false);
        return;
      }

      // Send the transaction
      const tx = await usdcContract.transfer(recipient, amountWei);
      setStatus('⏳ Transaction sent! Waiting for confirmation...');
      
      // Wait for transaction confirmation
      const receipt = await tx.wait();
      
      if (receipt.status === 1) {
        setStatus(`✅ Payment sent successfully! ${amount} USDC sent to ${recipient.slice(0, 6)}...${recipient.slice(-4)}`);
        
        // Clear form
        setRecipient('');
        setAmount('');
        setSelectedQuickAmount(null);
        
        // Reload balance
        await loadBalance();
      } else {
        setStatus('❌ Transaction failed');
      }

    } catch (error) {
      console.error('Error sending payment:', error);
      let errorMessage = 'Transaction failed';
      
      if (error.reason) {
        errorMessage = `Transaction failed: ${error.reason}`;
      } else if (error.message.includes('user rejected')) {
        errorMessage = 'Transaction cancelled by user';
      } else if (error.message.includes('insufficient funds')) {
        errorMessage = 'Insufficient funds for gas';
      }
      
      setStatus(`❌ ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Main render
  if (!isConnected) {
    return (
      <div className="container">
        <div className="header">
          <h1>💰 USDC Payment App</h1>
          <p>Send USDC between Ethereum addresses</p>
        </div>

        <div className="card">
          <h3>Connect Your Wallet</h3>
          <p>Connect your MetaMask wallet to start sending USDC payments.</p>
          
          <button 
            onClick={connectWallet}
            disabled={loading}
            className="btn"
          >
            {loading ? <span className="loading"></span> : '🦊'}
            Connect MetaMask
          </button>

          {status && (
            <div className={`status ${
              status.includes('✅') ? 'success' : 
              status.includes('❌') ? 'error' : 
              status.includes('⚠️') ? 'warning' : 'info'
            }`}>
              {status}
            </div>
          )}

          <div className="network-warning">
            <strong>⚠️ Network Requirements:</strong>
            <ul>
              <li>Connect to Localhost network (http://localhost:8545)</li>
              <li>Chain ID: 31337</li>
              <li>Make sure you have test accounts with USDC balance</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="header">
        <h1>💰 USDC Payment App</h1>
        <p>Send USDC between Ethereum addresses</p>
      </div>

      {/* Account Info */}
      <div className="card">
        <h3>Your Account</h3>
        <div className="account-info">
          <strong>Address:</strong>
          <div className="account-address">{account}</div>
          <small>{formatAddress(account)}</small>
        </div>

        <div className="balance-card">
          <p className="balance-label">Your USDC Balance</p>
          <div className="balance-amount">${balance}</div>
        </div>

        <button onClick={disconnectWallet} className="btn btn-secondary">
          Disconnect Wallet
        </button>
      </div>

      {/* Payment Form */}
      <div className="card">
        <h3>Send USDC Payment</h3>
        
        <div className="payment-form">
          <div className="form-group">
            <label>Recipient Address</label>
            <input
              type="text"
              className="form-input"
              placeholder="0x..."
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Amount (USDC)</label>
            <div className="amount-input-container">
              <span className="currency-symbol">$</span>
              <input
                type="number"
                className="form-input"
                placeholder="0.00"
                value={amount}
                onChange={handleAmountChange}
                step="0.01"
                min="0"
                max={balance}
              />
            </div>
            
            <div className="quick-amounts">
              {quickAmounts.map(quickAmount => (
                <button
                  key={quickAmount}
                  className={`quick-amount ${selectedQuickAmount === quickAmount ? 'active' : ''}`}
                  onClick={() => handleQuickAmount(quickAmount)}
                  disabled={parseFloat(balance) < quickAmount}
                >
                  ${quickAmount}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={sendPayment}
            disabled={loading || !recipient || !amount || parseFloat(amount) > parseFloat(balance)}
            className="btn"
          >
            {loading ? <span className="loading"></span> : '💸'}
            Send Payment
          </button>
        </div>

        {status && (
          <div className={`status ${
            status.includes('✅') ? 'success' : 
            status.includes('❌') ? 'error' : 
            status.includes('⚠️') ? 'warning' : 'info'
          }`}>
            {status}
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="card">
        <h3>How to Use</h3>
        <ol>
          <li><strong>Connect Wallet:</strong> Make sure MetaMask is connected to localhost:8545</li>
          <li><strong>Check Balance:</strong> Your USDC balance is displayed above</li>
          <li><strong>Enter Recipient:</strong> Paste the recipient's Ethereum address</li>
          <li><strong>Set Amount:</strong> Enter the amount to send (cannot exceed your balance)</li>
          <li><strong>Send Payment:</strong> Click "Send Payment" and confirm in MetaMask</li>
        </ol>

        <div className="status info">
          <strong>Note:</strong> This app prevents you from sending more USDC than you have in your account. 
          The balance is checked both in the UI and on the smart contract level.
        </div>
      </div>
    </div>
  );
}

export default App;