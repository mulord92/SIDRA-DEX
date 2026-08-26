// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";

interface ITokenRegistryForPairs { function isSupported(address token) external view returns (bool); }

contract PairRegistry is AccessControl {
    bytes32 public constant PAIR_ADMIN_ROLE = keccak256("PAIR_ADMIN_ROLE");
    ITokenRegistryForPairs public immutable tokenRegistry;
    mapping(address => mapping(address => address)) public poolOf;

    event PairRegistered(address indexed tokenA, address indexed tokenB, address indexed pool);
    event PairRemoved(address indexed tokenA, address indexed tokenB, address indexed pool);

    constructor(address admin, address registry) {
        require(admin != address(0) && registry != address(0), "zero address");
        tokenRegistry = ITokenRegistryForPairs(registry);
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(PAIR_ADMIN_ROLE, admin);
    }

    function registerPair(address tokenA, address tokenB, address pool)
        external onlyRole(PAIR_ADMIN_ROLE)
    {
        require(tokenA != address(0) && tokenB != address(0), "zero token");
        require(tokenA != tokenB, "same token");
        require(pool != address(0), "zero pool");
        require(tokenRegistry.isSupported(tokenA), "tokenA not verified");
        require(tokenRegistry.isSupported(tokenB), "tokenB not verified");
        require(poolOf[tokenA][tokenB] == address(0), "pair exists");
        poolOf[tokenA][tokenB] = pool;
        poolOf[tokenB][tokenA] = pool;
        emit PairRegistered(tokenA, tokenB, pool);
    }

    function removePair(address tokenA, address tokenB)
        external onlyRole(PAIR_ADMIN_ROLE)
    {
        address pool = poolOf[tokenA][tokenB];
        require(pool != address(0), "pair missing");
        delete poolOf[tokenA][tokenB];
        delete poolOf[tokenB][tokenA];
        emit PairRemoved(tokenA, tokenB, pool);
    }
}
