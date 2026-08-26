// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";

/// @notice Canonical allowlist for tokens accepted by the DEX/payment layer.
/// Never identify an asset by symbol/name/logo; the contract address is canonical.
contract TokenRegistry is AccessControl {
    bytes32 public constant TOKEN_ADMIN_ROLE = keccak256("TOKEN_ADMIN_ROLE");

    enum Status { UNKNOWN, PENDING, VERIFIED, PAUSED, BLACKLISTED }

    struct TokenInfo {
        Status status;
        uint8 decimals;
        string symbol;
    }

    mapping(address => TokenInfo) private _tokens;

    event TokenStatusChanged(address indexed token, Status status);
    event TokenConfigured(address indexed token, uint8 decimals, string symbol);

    constructor(address admin) {
        require(admin != address(0), "zero admin");
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(TOKEN_ADMIN_ROLE, admin);
    }

    function configureToken(address token, uint8 decimals_, string calldata symbol_)
        external onlyRole(TOKEN_ADMIN_ROLE)
    {
        require(token != address(0), "zero token");
        _tokens[token] = TokenInfo(Status.PENDING, decimals_, symbol_);
        emit TokenConfigured(token, decimals_, symbol_);
        emit TokenStatusChanged(token, Status.PENDING);
    }

    function setStatus(address token, Status status)
        external onlyRole(TOKEN_ADMIN_ROLE)
    {
        require(token != address(0), "zero token");
        _tokens[token].status = status;
        emit TokenStatusChanged(token, status);
    }

    function isSupported(address token) public view returns (bool) {
        return _tokens[token].status == Status.VERIFIED;
    }

    function getToken(address token) external view returns (TokenInfo memory) {
        return _tokens[token];
    }
}
