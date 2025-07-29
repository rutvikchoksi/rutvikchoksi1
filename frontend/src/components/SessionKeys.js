import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

const SessionKeys = ({ account, signer, contractAddresses, isMetaMaskSmartAccount }) => {
  const [sessionKeys, setSessionKeys] = useState([]);
  const [newSessionKey, setNewSessionKey] = useState({
    address: '',
    expiry: '',
    limit: '1.0'
  });
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (signer && contractAddresses.MetaMaskDelegator) {
      loadSessionKeys();
    }
  }, [signer, contractAddresses, account]);

  const loadSessionKeys = async () => {
    try {
      // In a real implementation, this would query the contract for active session keys
      // For demo purposes, we'll load from localStorage
      const storedKeys = localStorage.getItem(`sessionKeys_${account}`);
      if (storedKeys) {
        setSessionKeys(JSON.parse(storedKeys));
      }
    } catch (error) {
      console.error('Error loading session keys:', error);
    }
  };

  const generateSessionKey = () => {
    const wallet = ethers.Wallet.createRandom();
    setNewSessionKey({
      ...newSessionKey,
      address: wallet.address
    });
    
    // Store the private key securely (in production, this would be handled differently)
    const sessionKeyData = {
      address: wallet.address,
      privateKey: wallet.privateKey,
      mnemonic: wallet.mnemonic?.phrase
    };
    
    localStorage.setItem(`sessionKey_${wallet.address}`, JSON.stringify(sessionKeyData));
    setStatus(`🔑 Generated new session key: ${wallet.address}`);
  };

  const createSessionKey = async () => {
    if (!contractAddresses.MetaMaskDelegator) {
      setStatus('❌ Delegator contract not available');
      return;
    }

    if (!newSessionKey.address || !newSessionKey.expiry || !newSessionKey.limit) {
      setStatus('❌ Please fill in all session key details');
      return;
    }

    setLoading(true);
    setStatus('Creating session key...');

    try {
      const expiryTimestamp = Math.floor(new Date(newSessionKey.expiry).getTime() / 1000);
      const limitWei = ethers.parseEther(newSessionKey.limit);

      // In real implementation, this would call the delegated contract
      // For demonstration, we'll simulate the creation
      const sessionKey = {
        id: Date.now(),
        address: newSessionKey.address,
        expiry: expiryTimestamp,
        expiryDate: newSessionKey.expiry,
        limit: newSessionKey.limit,
        spent: '0',
        active: true,
        created: new Date().toISOString()
      };

      const updatedKeys = [...sessionKeys, sessionKey];
      setSessionKeys(updatedKeys);
      
      // Store in localStorage for demo
      localStorage.setItem(`sessionKeys_${account}`, JSON.stringify(updatedKeys));

      setStatus(`✅ Session key created successfully! Address: ${newSessionKey.address}`);
      
      // Reset form
      setNewSessionKey({
        address: '',
        expiry: '',
        limit: '1.0'
      });

      // In real implementation:
      // const delegatorContract = new ethers.Contract(contractAddresses.MetaMaskDelegator, ABI, signer);
      // const tx = await delegatorContract.createSessionKey(newSessionKey.address, expiryTimestamp, limitWei);
      // await tx.wait();

    } catch (error) {
      console.error('Error creating session key:', error);
      setStatus(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const revokeSessionKey = async (sessionKeyAddress) => {
    setLoading(true);
    setStatus(`Revoking session key ${sessionKeyAddress}...`);

    try {
      // Update session key status
      const updatedKeys = sessionKeys.map(key => 
        key.address === sessionKeyAddress 
          ? { ...key, active: false }
          : key
      );
      
      setSessionKeys(updatedKeys);
      localStorage.setItem(`sessionKeys_${account}`, JSON.stringify(updatedKeys));
      
      setStatus(`✅ Session key ${sessionKeyAddress} revoked successfully!`);

      // In real implementation:
      // const delegatorContract = new ethers.Contract(contractAddresses.MetaMaskDelegator, ABI, signer);
      // const tx = await delegatorContract.revokeSessionKey(sessionKeyAddress);
      // await tx.wait();

    } catch (error) {
      console.error('Error revoking session key:', error);
      setStatus(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const useSessionKey = async (sessionKeyAddress) => {
    setLoading(true);
    setStatus(`Using session key for transaction...`);

    try {
      // Simulate using the session key
      const sessionKey = sessionKeys.find(key => key.address === sessionKeyAddress);
      if (!sessionKey || !sessionKey.active) {
        throw new Error('Session key not found or not active');
      }

      const currentTime = Math.floor(Date.now() / 1000);
      if (currentTime > sessionKey.expiry) {
        throw new Error('Session key has expired');
      }

      // Simulate a transaction using the session key
      const spentAmount = 0.1; // ETH
      const newSpent = parseFloat(sessionKey.spent) + spentAmount;
      
      if (newSpent > parseFloat(sessionKey.limit)) {
        throw new Error('Transaction would exceed session key limit');
      }

      // Update spent amount
      const updatedKeys = sessionKeys.map(key => 
        key.address === sessionKeyAddress 
          ? { ...key, spent: newSpent.toString() }
          : key
      );
      
      setSessionKeys(updatedKeys);
      localStorage.setItem(`sessionKeys_${account}`, JSON.stringify(updatedKeys));
      
      setStatus(`✅ Transaction executed using session key! Spent: ${spentAmount} ETH`);

    } catch (error) {
      console.error('Error using session key:', error);
      setStatus(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  const isExpired = (timestamp) => {
    return Math.floor(Date.now() / 1000) > timestamp;
  };

  return (
    <div>
      <h3>🔑 Session Keys</h3>
      
      <p>
        Session keys allow automated actions within defined limits and time periods, 
        perfect for recurring payments, DeFi strategies, or gaming interactions.
      </p>

      <div style={{ marginBottom: '24px' }}>
        <h4>Create New Session Key:</h4>
        
        <div className="form-group">
          <label>Session Key Address:</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              className="input"
              placeholder="0x... or generate new"
              value={newSessionKey.address}
              onChange={(e) => setNewSessionKey({...newSessionKey, address: e.target.value})}
              style={{ flex: 1 }}
            />
            <button onClick={generateSessionKey} className="button secondary">
              Generate New
            </button>
          </div>
        </div>

        <div className="form-group">
          <label>Expiry Date:</label>
          <input
            type="datetime-local"
            className="input"
            value={newSessionKey.expiry}
            onChange={(e) => setNewSessionKey({...newSessionKey, expiry: e.target.value})}
            min={new Date().toISOString().slice(0, 16)}
          />
        </div>

        <div className="form-group">
          <label>Spending Limit (ETH):</label>
          <input
            type="number"
            className="input"
            placeholder="1.0"
            value={newSessionKey.limit}
            onChange={(e) => setNewSessionKey({...newSessionKey, limit: e.target.value})}
            step="0.1"
            min="0"
          />
        </div>

        <button 
          onClick={createSessionKey}
          disabled={loading || !contractAddresses.MetaMaskDelegator}
          className="button"
        >
          {loading ? <span className="loading"></span> : null}
          Create Session Key
        </button>
      </div>

      {status && (
        <div className={`status ${status.includes('✅') ? 'success' : status.includes('❌') ? 'error' : 'info'}`}>
          {status}
        </div>
      )}

      {!isMetaMaskSmartAccount && (
        <div className="status warning">
          <strong>Note:</strong> Session keys require EIP-7702 delegation to be enabled. 
          Enable delegation first to use this feature.
        </div>
      )}

      {sessionKeys.length > 0 && (
        <div style={{ marginTop: '24px' }}>
          <h4>Your Session Keys ({sessionKeys.length}):</h4>
          
          <div style={{ display: 'grid', gap: '12px' }}>
            {sessionKeys.map(key => (
              <div key={key.id} style={{ 
                border: '1px solid #ddd', 
                padding: '16px', 
                borderRadius: '8px',
                backgroundColor: key.active && !isExpired(key.expiry) ? '#f0f8f0' : '#f8f8f8'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div><strong>Address:</strong></div>
                    <div className="address" style={{ fontSize: '12px', marginBottom: '8px' }}>
                      {key.address}
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '14px' }}>
                      <div>
                        <strong>Limit:</strong> {key.limit} ETH<br />
                        <strong>Spent:</strong> {key.spent} ETH<br />
                        <strong>Remaining:</strong> {(parseFloat(key.limit) - parseFloat(key.spent)).toFixed(4)} ETH
                      </div>
                      <div>
                        <strong>Expires:</strong> {formatDate(key.expiry)}<br />
                        <strong>Status:</strong> 
                        <span className={`badge ${
                          !key.active ? 'failed' : 
                          isExpired(key.expiry) ? 'failed' : 
                          'success'
                        }`}>
                          {!key.active ? 'Revoked' : isExpired(key.expiry) ? 'Expired' : 'Active'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginLeft: '16px' }}>
                    {key.active && !isExpired(key.expiry) && (
                      <>
                        <button 
                          onClick={() => useSessionKey(key.address)}
                          disabled={loading}
                          className="button secondary"
                          style={{ fontSize: '12px', padding: '6px 12px' }}
                        >
                          Use Key
                        </button>
                        <button 
                          onClick={() => revokeSessionKey(key.address)}
                          disabled={loading}
                          className="button secondary"
                          style={{ fontSize: '12px', padding: '6px 12px' }}
                        >
                          Revoke
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <details style={{ marginTop: '16px' }}>
        <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>
          📚 About Session Keys
        </summary>
        <div style={{ marginTop: '12px', fontSize: '14px' }}>
          <h4>What are Session Keys?</h4>
          <p>
            Session keys are temporary keys with limited permissions that can perform 
            specific actions on behalf of your account without requiring your main 
            private key signature for each transaction.
          </p>
          
          <h4>Benefits:</h4>
          <ul>
            <li><strong>Automation:</strong> Enable recurring payments or DeFi strategies</li>
            <li><strong>Gaming:</strong> Allow games to make microtransactions automatically</li>
            <li><strong>Security:</strong> Limit exposure of your main private key</li>
            <li><strong>User Experience:</strong> Reduce transaction confirmation fatigue</li>
          </ul>

          <h4>Use Cases:</h4>
          <ul>
            <li>Automated DeFi yield farming or rebalancing</li>
            <li>Gaming transactions and in-app purchases</li>
            <li>Subscription payments and recurring transfers</li>
            <li>Trading bot operations with spending limits</li>
          </ul>

          <h4>Security Features:</h4>
          <ul>
            <li><strong>Time Limits:</strong> Keys automatically expire</li>
            <li><strong>Spending Limits:</strong> Maximum amount that can be spent</li>
            <li><strong>Revocable:</strong> Can be disabled at any time</li>
            <li><strong>Scoped:</strong> Limited to specific functions or contracts</li>
          </ul>
        </div>
      </details>
    </div>
  );
};

export default SessionKeys;