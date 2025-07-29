// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title MetaMaskDelegator
 * @dev A contract that implements delegation functionality compatible with MetaMask's EIP-7702 features
 * This contract can be delegated to by EOAs to enable smart account functionality
 */
contract MetaMaskDelegator is ReentrancyGuard {
    using ECDSA for bytes32;
    using MessageHashUtils for bytes32;

    // Struct to represent a single call
    struct Call {
        address to;
        uint256 value;
        bytes data;
    }

    // Struct for session keys
    struct SessionKey {
        address key;
        uint256 expiry;
        uint256 limit; // spending limit in wei
        uint256 spent; // amount already spent
        bool active;
    }

    // Events
    event BatchExecuted(address indexed account, uint256 nonce, Call[] calls);
    event CallExecuted(address indexed sender, address indexed to, uint256 value, bytes data);
    event SessionKeyCreated(address indexed account, address indexed sessionKey, uint256 expiry, uint256 limit);
    event SessionKeyUsed(address indexed account, address indexed sessionKey, uint256 amount);
    event GasSponsored(address indexed sponsor, address indexed account, uint256 gasUsed);

    // Storage
    mapping(address => uint256) public nonces;
    mapping(address => mapping(address => SessionKey)) public sessionKeys;
    mapping(address => bool) public authorizedSponsors;

    // Modifiers
    modifier onlyValidCaller() {
        require(msg.sender == address(this), "MetaMaskDelegator: Invalid caller");
        _;
    }

    modifier onlyAuthorizedSponsor() {
        require(authorizedSponsors[msg.sender], "MetaMaskDelegator: Unauthorized sponsor");
        _;
    }

    /**
     * @dev Execute a batch of calls directly (when called by the delegated EOA)
     * @param calls Array of calls to execute
     */
    function executeBatch(Call[] calldata calls) external payable onlyValidCaller nonReentrant {
        _executeBatch(calls);
    }

    /**
     * @dev Execute a batch of calls with signature verification (for sponsored transactions)
     * @param calls Array of calls to execute
     * @param signature Signature from the EOA authorizing the execution
     */
    function executeBatchWithSignature(
        Call[] calldata calls,
        bytes calldata signature
    ) external payable nonReentrant {
        address account = address(this);
        uint256 currentNonce = nonces[account];
        
        // Create message hash
        bytes32 messageHash = keccak256(abi.encodePacked(
            account,
            currentNonce,
            block.chainid,
            abi.encode(calls)
        ));
        
        // Verify signature
        bytes32 ethSignedMessageHash = messageHash.toEthSignedMessageHash();
        address recovered = ethSignedMessageHash.recover(signature);
        require(recovered == account, "MetaMaskDelegator: Invalid signature");
        
        _executeBatch(calls);
        
        emit GasSponsored(msg.sender, account, gasleft());
    }

    /**
     * @dev Execute a call using a session key
     * @param to Target address
     * @param value Amount of ETH to send
     * @param data Call data
     * @param sessionKeyAddr Address of the session key
     */
    function executeWithSessionKey(
        address to,
        uint256 value,
        bytes calldata data,
        address sessionKeyAddr
    ) external payable nonReentrant {
        address account = address(this);
        SessionKey storage sessionKey = sessionKeys[account][sessionKeyAddr];
        
        require(sessionKey.active, "MetaMaskDelegator: Session key not active");
        require(block.timestamp <= sessionKey.expiry, "MetaMaskDelegator: Session key expired");
        require(sessionKey.spent + value <= sessionKey.limit, "MetaMaskDelegator: Session key limit exceeded");
        
        // Update spent amount
        sessionKey.spent += value;
        
        // Execute the call
        Call[] memory calls = new Call[](1);
        calls[0] = Call(to, value, data);
        _executeBatch(calls);
        
        emit SessionKeyUsed(account, sessionKeyAddr, value);
    }

    /**
     * @dev Create a session key for limited delegation
     * @param sessionKeyAddr Address of the session key
     * @param expiry Expiration timestamp
     * @param limit Spending limit in wei
     */
    function createSessionKey(
        address sessionKeyAddr,
        uint256 expiry,
        uint256 limit
    ) external onlyValidCaller {
        address account = address(this);
        
        sessionKeys[account][sessionKeyAddr] = SessionKey({
            key: sessionKeyAddr,
            expiry: expiry,
            limit: limit,
            spent: 0,
            active: true
        });
        
        emit SessionKeyCreated(account, sessionKeyAddr, expiry, limit);
    }

    /**
     * @dev Revoke a session key
     * @param sessionKeyAddr Address of the session key to revoke
     */
    function revokeSessionKey(address sessionKeyAddr) external onlyValidCaller {
        address account = address(this);
        sessionKeys[account][sessionKeyAddr].active = false;
    }

    /**
     * @dev Authorize a sponsor for gasless transactions
     * @param sponsor Address to authorize as sponsor
     */
    function authorizeSponsor(address sponsor) external onlyValidCaller {
        authorizedSponsors[sponsor] = true;
    }

    /**
     * @dev Revoke sponsor authorization
     * @param sponsor Address to revoke sponsor authorization
     */
    function revokeSponsor(address sponsor) external onlyValidCaller {
        authorizedSponsors[sponsor] = false;
    }

    /**
     * @dev Internal function to execute a batch of calls
     * @param calls Array of calls to execute
     */
    function _executeBatch(Call[] memory calls) internal {
        address account = address(this);
        uint256 currentNonce = nonces[account];
        nonces[account]++;

        for (uint256 i = 0; i < calls.length; i++) {
            Call memory call = calls[i];
            
            (bool success, ) = call.to.call{value: call.value}(call.data);
            require(success, "MetaMaskDelegator: Call failed");
            
            emit CallExecuted(msg.sender, call.to, call.value, call.data);
        }

        emit BatchExecuted(account, currentNonce, calls);
    }

    /**
     * @dev Transfer ERC20 tokens
     * @param token Token contract address
     * @param to Recipient address
     * @param amount Amount to transfer
     */
    function transferToken(
        address token,
        address to,
        uint256 amount
    ) external onlyValidCaller {
        require(IERC20(token).transfer(to, amount), "MetaMaskDelegator: Token transfer failed");
    }

    /**
     * @dev Approve ERC20 token spending
     * @param token Token contract address
     * @param spender Spender address
     * @param amount Amount to approve
     */
    function approveToken(
        address token,
        address spender,
        uint256 amount
    ) external onlyValidCaller {
        require(IERC20(token).approve(spender, amount), "MetaMaskDelegator: Token approval failed");
    }

    /**
     * @dev Get session key information
     * @param account Account address
     * @param sessionKeyAddr Session key address
     */
    function getSessionKey(
        address account,
        address sessionKeyAddr
    ) external view returns (SessionKey memory) {
        return sessionKeys[account][sessionKeyAddr];
    }

    /**
     * @dev Get current nonce for an account
     * @param account Account address
     */
    function getNonce(address account) external view returns (uint256) {
        return nonces[account];
    }

    /**
     * @dev Check if a sponsor is authorized
     * @param sponsor Sponsor address
     */
    function isSponsorAuthorized(address sponsor) external view returns (bool) {
        return authorizedSponsors[sponsor];
    }

    /**
     * @dev Receive function to accept ETH
     */
    receive() external payable {}

    /**
     * @dev Fallback function
     */
    fallback() external payable {}
}