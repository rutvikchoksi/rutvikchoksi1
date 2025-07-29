import React from 'react';

const WalletConnection = ({ 
  account, 
  isConnected, 
  isMetaMaskSmartAccount, 
  onConnect, 
  onDisconnect 
}) => {
  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (!isConnected) {
    return (
      <div>
        <h3>🔌 Connect Your Wallet</h3>
        <p>Connect your MetaMask wallet to explore EIP-7702 delegation features.</p>
        <button 
          onClick={onConnect}
          className="button"
        >
          Connect MetaMask
        </button>
        
        <div className="status info">
          <strong>Requirements:</strong>
          <ul>
            <li>MetaMask Extension installed</li>
            <li>Connected to Localhost network (port 8545)</li>
            <li>Test accounts with ETH for gas fees</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h3>✅ Wallet Connected</h3>
      
      <div className="status success">
        <strong>Connected Account:</strong>
        <div className="address">{account}</div>
        <small>Short: {formatAddress(account)}</small>
      </div>

      <div className={`status ${isMetaMaskSmartAccount ? 'success' : 'warning'}`}>
        <strong>Account Type:</strong> {isMetaMaskSmartAccount ? '🤖 Smart Account (EIP-7702)' : '👤 Standard EOA'}
        {!isMetaMaskSmartAccount && (
          <div>
            <small>
              This is a standard EOA. To enable smart account features, you'll need to 
              delegate to a smart contract using EIP-7702.
            </small>
          </div>
        )}
      </div>

      <div style={{ marginTop: '16px' }}>
        <button 
          onClick={onDisconnect}
          className="button secondary"
        >
          Disconnect
        </button>
        
        <button 
          onClick={() => window.open('https://metamask.io/download/', '_blank')}
          className="button secondary"
          style={{ marginLeft: '8px' }}
        >
          Get MetaMask
        </button>
      </div>

      <div className="status info" style={{ marginTop: '16px' }}>
        <strong>Network Setup:</strong>
        <p>Make sure MetaMask is connected to your local network:</p>
        <ul>
          <li><strong>Network Name:</strong> Localhost 8545</li>
          <li><strong>RPC URL:</strong> http://localhost:8545</li>
          <li><strong>Chain ID:</strong> 31337</li>
          <li><strong>Currency Symbol:</strong> ETH</li>
        </ul>
      </div>
    </div>
  );
};

export default WalletConnection;