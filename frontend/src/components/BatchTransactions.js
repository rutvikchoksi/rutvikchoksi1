import React, { useState } from 'react';
import { ethers } from 'ethers';

const BatchTransactions = ({ account, signer, contractAddresses, isMetaMaskSmartAccount }) => {
  const [calls, setCalls] = useState([
    { to: '', value: '0', data: '0x' }
  ]);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState([]);

  const addCall = () => {
    setCalls([...calls, { to: '', value: '0', data: '0x' }]);
  };

  const removeCall = (index) => {
    setCalls(calls.filter((_, i) => i !== index));
  };

  const updateCall = (index, field, value) => {
    const updatedCalls = [...calls];
    updatedCalls[index][field] = value;
    setCalls(updatedCalls);
  };

  const addPresetCall = (type) => {
    const newCalls = [...calls];
    
    switch (type) {
      case 'eth-transfer':
        newCalls.push({
          to: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8', // Test address
          value: '0.1',
          data: '0x'
        });
        break;
      case 'token-transfer':
        if (contractAddresses.MockERC20) {
          const tokenInterface = new ethers.Interface([
            'function transfer(address to, uint256 amount) returns (bool)'
          ]);
          newCalls.push({
            to: contractAddresses.MockERC20,
            value: '0',
            data: tokenInterface.encodeFunctionData('transfer', [
              '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
              ethers.parseUnits('10', 18)
            ])
          });
        }
        break;
      case 'token-approve':
        if (contractAddresses.MockERC20) {
          const tokenInterface = new ethers.Interface([
            'function approve(address spender, uint256 amount) returns (bool)'
          ]);
          newCalls.push({
            to: contractAddresses.MockERC20,
            value: '0',
            data: tokenInterface.encodeFunctionData('approve', [
              '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
              ethers.parseUnits('100', 18)
            ])
          });
        }
        break;
      default:
        break;
    }
    
    setCalls(newCalls);
  };

  const executeBatchTransaction = async () => {
    if (!contractAddresses.MetaMaskDelegator) {
      setStatus('❌ Delegator contract not available');
      return;
    }

    if (calls.length === 0 || calls.some(call => !call.to)) {
      setStatus('❌ Please fill in all call details');
      return;
    }

    setLoading(true);
    setStatus('Processing batch transaction...');

    try {
      // Convert calls to the right format
      const formattedCalls = calls.map(call => ({
        to: call.to,
        value: ethers.parseEther(call.value || '0'),
        data: call.data || '0x'
      }));

      // In a real EIP-7702 implementation, this would call the delegated contract
      // For demonstration, we'll show what the batch would look like
      const batchInfo = {
        timestamp: new Date().toISOString(),
        calls: formattedCalls.length,
        totalValue: formattedCalls.reduce((sum, call) => sum + call.value, 0n),
        gasEstimate: '~150,000' // Estimated
      };

      // Simulate successful execution
      const newTransaction = {
        id: Date.now(),
        hash: '0x' + Math.random().toString(16).substr(2, 64),
        timestamp: batchInfo.timestamp,
        calls: formattedCalls,
        status: 'success',
        gasUsed: batchInfo.gasEstimate
      };

      setTransactions(prev => [newTransaction, ...prev]);
      setStatus(`✅ Batch transaction simulated successfully! ${formattedCalls.length} calls executed.`);

      // In real implementation, this would be:
      // const delegatorContract = new ethers.Contract(contractAddresses.MetaMaskDelegator, ABI, signer);
      // const tx = await delegatorContract.executeBatch(formattedCalls);
      // await tx.wait();

    } catch (error) {
      console.error('Error executing batch transaction:', error);
      setStatus(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const clearCalls = () => {
    setCalls([{ to: '', value: '0', data: '0x' }]);
    setStatus('');
  };

  return (
    <div>
      <h3>📦 Batch Transactions</h3>
      
      <p>
        Combine multiple transactions into a single batch, saving gas and ensuring 
        atomic execution (all succeed or all fail).
      </p>

      <div style={{ marginBottom: '16px' }}>
        <h4>Quick Presets:</h4>
        <button onClick={() => addPresetCall('eth-transfer')} className="button secondary">
          Add ETH Transfer
        </button>
        <button onClick={() => addPresetCall('token-transfer')} className="button secondary">
          Add Token Transfer
        </button>
        <button onClick={() => addPresetCall('token-approve')} className="button secondary">
          Add Token Approval
        </button>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <h4>Batch Calls ({calls.length}):</h4>
        
        {calls.map((call, index) => (
          <div key={index} style={{ 
            border: '1px solid #ddd', 
            padding: '12px', 
            margin: '8px 0', 
            borderRadius: '8px',
            backgroundColor: '#f9f9f9'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <strong>Call #{index + 1}</strong>
              {calls.length > 1 && (
                <button 
                  onClick={() => removeCall(index)}
                  className="button secondary"
                  style={{ fontSize: '12px', padding: '4px 8px' }}
                >
                  Remove
                </button>
              )}
            </div>
            
            <div className="form-group">
              <label>To Address:</label>
              <input
                type="text"
                className="input"
                placeholder="0x..."
                value={call.to}
                onChange={(e) => updateCall(index, 'to', e.target.value)}
              />
            </div>
            
            <div className="form-group">
              <label>Value (ETH):</label>
              <input
                type="text"
                className="input"
                placeholder="0.0"
                value={call.value}
                onChange={(e) => updateCall(index, 'value', e.target.value)}
              />
            </div>
            
            <div className="form-group">
              <label>Data (hex):</label>
              <input
                type="text"
                className="input"
                placeholder="0x"
                value={call.data}
                onChange={(e) => updateCall(index, 'data', e.target.value)}
              />
            </div>
          </div>
        ))}
        
        <button onClick={addCall} className="button secondary">
          Add Another Call
        </button>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <button 
          onClick={executeBatchTransaction}
          disabled={loading || !contractAddresses.MetaMaskDelegator}
          className="button"
        >
          {loading ? <span className="loading"></span> : null}
          Execute Batch Transaction
        </button>
        
        <button onClick={clearCalls} className="button secondary" style={{ marginLeft: '8px' }}>
          Clear All
        </button>
      </div>

      {status && (
        <div className={`status ${status.includes('✅') ? 'success' : status.includes('❌') ? 'error' : 'info'}`}>
          {status}
        </div>
      )}

      {!isMetaMaskSmartAccount && (
        <div className="status warning">
          <strong>Note:</strong> Batch transactions require EIP-7702 delegation to be enabled. 
          Enable delegation first to use this feature.
        </div>
      )}

      {transactions.length > 0 && (
        <div style={{ marginTop: '20px' }}>
          <h4>Recent Batch Transactions:</h4>
          <div className="transaction-list">
            {transactions.slice(0, 5).map(tx => (
              <div key={tx.id} className="transaction-item">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong>Hash:</strong> <code>{tx.hash.slice(0, 20)}...</code>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      {tx.calls.length} calls • {tx.gasUsed} gas • {new Date(tx.timestamp).toLocaleString()}
                    </div>
                  </div>
                  <span className={`badge ${tx.status}`}>
                    {tx.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <details style={{ marginTop: '16px' }}>
        <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>
          📚 About Batch Transactions
        </summary>
        <div style={{ marginTop: '12px', fontSize: '14px' }}>
          <h4>Benefits of Batch Transactions:</h4>
          <ul>
            <li><strong>Gas Savings:</strong> Pay for one transaction instead of multiple</li>
            <li><strong>Atomicity:</strong> All operations succeed or all fail together</li>
            <li><strong>Better UX:</strong> One confirmation for multiple actions</li>
            <li><strong>Complex Operations:</strong> Chain multiple smart contract calls</li>
          </ul>

          <h4>Common Use Cases:</h4>
          <ul>
            <li>Approve and swap tokens in one transaction</li>
            <li>Transfer multiple tokens to different addresses</li>
            <li>Interact with multiple DeFi protocols atomically</li>
            <li>Batch NFT transfers or marketplace operations</li>
          </ul>

          <h4>Technical Details:</h4>
          <p>
            Each call in the batch specifies a target address, value (ETH to send), 
            and data (function call). The delegated contract executes all calls 
            sequentially, reverting the entire batch if any call fails.
          </p>
        </div>
      </details>
    </div>
  );
};

export default BatchTransactions;