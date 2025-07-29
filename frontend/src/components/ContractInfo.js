import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

const ContractInfo = ({ contractAddresses, provider }) => {
  const [balances, setBalances] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (provider && contractAddresses.MockERC20) {
      loadContractInfo();
    }
  }, [provider, contractAddresses]);

  const loadContractInfo = async () => {
    setLoading(true);
    try {
      // Load token contract info
      if (contractAddresses.MockERC20) {
        const tokenContract = new ethers.Contract(
          contractAddresses.MockERC20,
          [
            'function name() view returns (string)',
            'function symbol() view returns (string)',
            'function totalSupply() view returns (uint256)',
            'function decimals() view returns (uint8)'
          ],
          provider
        );

        const [name, symbol, totalSupply, decimals] = await Promise.all([
          tokenContract.name(),
          tokenContract.symbol(),
          tokenContract.totalSupply(),
          tokenContract.decimals()
        ]);

        setBalances({
          tokenName: name,
          tokenSymbol: symbol,
          totalSupply: ethers.formatUnits(totalSupply, decimals),
          decimals: decimals
        });
      }
    } catch (error) {
      console.error('Error loading contract info:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('Address copied to clipboard!');
    });
  };

  return (
    <div>
      <h3>📋 Contract Information</h3>
      
      {loading && <div className="loading"></div>}
      
      <div className="grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <div>
          <h4>🔐 MetaMask Delegator Contract</h4>
          {contractAddresses.MetaMaskDelegator ? (
            <div>
              <div className="address">
                {contractAddresses.MetaMaskDelegator}
              </div>
              <button 
                onClick={() => copyToClipboard(contractAddresses.MetaMaskDelegator)}
                className="button secondary"
                style={{ fontSize: '12px', padding: '6px 12px' }}
              >
                Copy Address
              </button>
              <p style={{ fontSize: '14px', color: '#666', marginTop: '8px' }}>
                This contract provides EIP-7702 delegation functionality including 
                batch transactions, session keys, and sponsored gas.
              </p>
            </div>
          ) : (
            <div className="status warning">Contract not deployed</div>
          )}
        </div>

        <div>
          <h4>🪙 Test Token Contract</h4>
          {contractAddresses.MockERC20 ? (
            <div>
              <div className="address">
                {contractAddresses.MockERC20}
              </div>
              <button 
                onClick={() => copyToClipboard(contractAddresses.MockERC20)}
                className="button secondary"
                style={{ fontSize: '12px', padding: '6px 12px' }}
              >
                Copy Address
              </button>
              
              {balances.tokenName && (
                <div style={{ marginTop: '12px', fontSize: '14px' }}>
                  <div><strong>Name:</strong> {balances.tokenName}</div>
                  <div><strong>Symbol:</strong> {balances.tokenSymbol}</div>
                  <div><strong>Total Supply:</strong> {balances.totalSupply}</div>
                  <div><strong>Decimals:</strong> {balances.decimals}</div>
                </div>
              )}
            </div>
          ) : (
            <div className="status warning">Contract not deployed</div>
          )}
        </div>
      </div>

      <div className="status info" style={{ marginTop: '16px' }}>
        <strong>Contract Deployment:</strong>
        <p>
          These contracts are deployed to your local Hardhat network. 
          To deploy them, run: <code>npm run deploy</code>
        </p>
      </div>

      <div style={{ marginTop: '16px' }}>
        <button 
          onClick={loadContractInfo}
          className="button secondary"
          disabled={loading}
        >
          {loading ? <span className="loading"></span> : null}
          Refresh Contract Info
        </button>
        
        <button 
          onClick={() => {
            const explorerUrl = `http://localhost:8545`;
            window.open(explorerUrl, '_blank');
          }}
          className="button secondary"
          style={{ marginLeft: '8px' }}
        >
          View on Block Explorer
        </button>
      </div>
    </div>
  );
};

export default ContractInfo;