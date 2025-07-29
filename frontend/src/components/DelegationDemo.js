import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

const DelegationDemo = ({ account, signer, contractAddresses, isMetaMaskSmartAccount }) => {
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [delegationInfo, setDelegationInfo] = useState(null);

  useEffect(() => {
    if (signer && contractAddresses.MetaMaskDelegator) {
      checkDelegationStatus();
    }
  }, [signer, contractAddresses, account]);

  const checkDelegationStatus = async () => {
    try {
      if (!contractAddresses.MetaMaskDelegator) return;

      // Check if account has delegated code
      const code = await signer.provider.getCode(account);
      const isDelegated = code !== '0x';

      const delegatorContract = new ethers.Contract(
        contractAddresses.MetaMaskDelegator,
        [
          'function getNonce(address account) view returns (uint256)',
          'function isSponsorAuthorized(address sponsor) view returns (bool)'
        ],
        signer
      );

      const nonce = await delegatorContract.getNonce(account);

      setDelegationInfo({
        isDelegated,
        nonce: nonce.toString(),
        contractAddress: contractAddresses.MetaMaskDelegator
      });

    } catch (error) {
      console.error('Error checking delegation status:', error);
      setStatus(`Error: ${error.message}`);
    }
  };

  const enableDelegation = async () => {
    setLoading(true);
    setStatus('');

    try {
      // Note: This is a simplified demonstration
      // In real EIP-7702, this would involve signing an authorization
      // and including it in a transaction's authorizationList

      setStatus('⚠️ EIP-7702 delegation requires special transaction types that are not yet fully supported in standard MetaMask. This demo shows the contract interface.');

      // For demonstration, we'll show what the delegation process would look like
      const delegationExample = {
        chainId: 31337,
        address: contractAddresses.MetaMaskDelegator,
        nonce: 0
      };

      setStatus(`
        📝 Delegation Authorization Example:
        
        Chain ID: ${delegationExample.chainId}
        Delegate to: ${delegationExample.address}
        Nonce: ${delegationExample.nonce}
        
        In production, this would be signed and included in an EIP-7702 transaction.
      `);

    } catch (error) {
      console.error('Error enabling delegation:', error);
      setStatus(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testDelegatedCall = async () => {
    setLoading(true);
    setStatus('');

    try {
      if (!contractAddresses.MetaMaskDelegator) {
        throw new Error('Delegator contract not available');
      }

      // Simulate a delegated call
      // In real EIP-7702, this would call the delegated contract functions directly on the EOA
      const delegatorContract = new ethers.Contract(
        contractAddresses.MetaMaskDelegator,
        [
          'function getNonce(address account) view returns (uint256)'
        ],
        signer
      );

      const currentNonce = await delegatorContract.getNonce(account);
      
      setStatus(`✅ Successfully called delegated function! Current nonce: ${currentNonce}`);
      
      // Refresh delegation info
      await checkDelegationStatus();

    } catch (error) {
      console.error('Error testing delegated call:', error);
      setStatus(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h3>🔗 EIP-7702 Delegation Demo</h3>
      
      {delegationInfo && (
        <div className={`status ${delegationInfo.isDelegated ? 'success' : 'warning'}`}>
          <strong>Delegation Status:</strong> {delegationInfo.isDelegated ? '✅ Active' : '❌ Not Active'}
          <br />
          <strong>Current Nonce:</strong> {delegationInfo.nonce}
          <br />
          <strong>Delegate Contract:</strong> 
          <div className="address" style={{ fontSize: '12px', marginTop: '4px' }}>
            {delegationInfo.contractAddress}
          </div>
        </div>
      )}

      <div style={{ marginBottom: '16px' }}>
        <p>
          EIP-7702 allows your EOA to temporarily delegate to a smart contract, 
          giving you smart account capabilities without changing your address.
        </p>
      </div>

      <div>
        <button 
          onClick={enableDelegation}
          disabled={loading}
          className="button"
        >
          {loading ? <span className="loading"></span> : null}
          {isMetaMaskSmartAccount ? 'Update Delegation' : 'Enable Delegation'}
        </button>

        <button 
          onClick={testDelegatedCall}
          disabled={loading || !contractAddresses.MetaMaskDelegator}
          className="button secondary"
          style={{ marginLeft: '8px' }}
        >
          Test Delegated Call
        </button>

        <button 
          onClick={checkDelegationStatus}
          disabled={loading}
          className="button secondary"
          style={{ marginLeft: '8px' }}
        >
          Refresh Status
        </button>
      </div>

      {status && (
        <div className="status info" style={{ whiteSpace: 'pre-line', marginTop: '16px' }}>
          {status}
        </div>
      )}

      <div className="status warning" style={{ marginTop: '16px' }}>
        <strong>Note:</strong> Full EIP-7702 support requires specific wallet and network implementations. 
        This demo shows the contract interfaces and explains the delegation process. For complete 
        functionality, use a compatible EIP-7702 wallet and network.
      </div>

      <details style={{ marginTop: '16px' }}>
        <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>
          📚 Learn More About EIP-7702
        </summary>
        <div style={{ marginTop: '12px', fontSize: '14px' }}>
          <h4>What is EIP-7702?</h4>
          <p>
            EIP-7702 introduces a new transaction type that allows EOAs to temporarily 
            set contract code for their address, enabling smart account functionality 
            without migrating funds or changing addresses.
          </p>
          
          <h4>Key Benefits:</h4>
          <ul>
            <li>Batch multiple transactions into one</li>
            <li>Enable gasless transactions through sponsors</li>
            <li>Create session keys for limited automation</li>
            <li>Add custom logic to your wallet</li>
          </ul>

          <h4>How It Works:</h4>
          <ol>
            <li>Sign an authorization to delegate to a smart contract</li>
            <li>Include the authorization in an EIP-7702 transaction</li>
            <li>Your EOA now has the delegated contract's functionality</li>
            <li>Delegation can be revoked at any time</li>
          </ol>
        </div>
      </details>
    </div>
  );
};

export default DelegationDemo;