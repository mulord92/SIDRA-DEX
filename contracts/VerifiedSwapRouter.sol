// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

interface IRegistryForRouter { function isSupported(address token) external view returns (bool); }
interface IPairRegistry { function poolOf(address tokenA, address tokenB) external view returns (address); }
interface IPoolLike { function token0() external view returns (address); function token1() external view returns (address); function swap(address tokenIn, uint256 amountIn, uint256 minAmountOut) external returns (uint256); }

contract VerifiedSwapRouter is ReentrancyGuard {
    using SafeERC20 for IERC20;
    IRegistryForRouter public immutable registry;
    IPairRegistry public immutable pairRegistry;

    constructor(address registry_, address pairRegistry_) {
        require(registry_ != address(0) && pairRegistry_ != address(0), "zero address");
        registry = IRegistryForRouter(registry_);
        pairRegistry = IPairRegistry(pairRegistry_);
    }

    function swapExactTokens(address tokenIn, address tokenOut, uint256 amountIn, uint256 minAmountOut)
        external nonReentrant returns (uint256 amountOut)
    {
        require(registry.isSupported(tokenIn), "tokenIn not verified");
        require(registry.isSupported(tokenOut), "tokenOut not verified");
        require(tokenIn != tokenOut, "same token");
        address pool = pairRegistry.poolOf(tokenIn, tokenOut);
        require(pool != address(0), "pair not verified");
        require(IPoolLike(pool).token0() == tokenIn || IPoolLike(pool).token1() == tokenIn, "pool mismatch");
        require(IPoolLike(pool).token0() == tokenOut || IPoolLike(pool).token1() == tokenOut, "pool mismatch");
        IERC20(tokenIn).safeTransferFrom(msg.sender, pool, amountIn);
        amountOut = IPoolLike(pool).swap(tokenIn, amountIn, minAmountOut);
    }
}
