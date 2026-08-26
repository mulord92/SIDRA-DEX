// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

interface ITokenRegistryForPool { function isSupported(address token) external view returns (bool); }

contract VerifiedLiquidityPool is ReentrancyGuard {
    using SafeERC20 for IERC20;
    ITokenRegistryForPool public immutable registry;
    address public immutable token0;
    address public immutable token1;
    uint256 public reserve0;
    uint256 public reserve1;
    uint256 public totalLiquidity;
    mapping(address => uint256) public liquidity;

    event LiquidityAdded(address indexed provider, uint256 amount0, uint256 amount1, uint256 shares);
    event Swap(address indexed trader, address indexed tokenIn, uint256 amountIn, uint256 amountOut);

    constructor(address registry_, address token0_, address token1_) {
        require(registry_ != address(0) && token0_ != address(0) && token1_ != address(0), "zero address");
        require(token0_ != token1_, "same token");
        registry = ITokenRegistryForPool(registry_);
        require(registry.isSupported(token0_) && registry.isSupported(token1_), "unverified token");
        token0 = token0_;
        token1 = token1_;
    }

    function addLiquidity(uint256 amount0, uint256 amount1) external nonReentrant returns (uint256 shares) {
        require(registry.isSupported(token0) && registry.isSupported(token1), "token disabled");
        require(amount0 > 0 && amount1 > 0, "zero liquidity");
        IERC20(token0).safeTransferFrom(msg.sender, address(this), amount0);
        IERC20(token1).safeTransferFrom(msg.sender, address(this), amount1);
        if (totalLiquidity == 0) {
            shares = _sqrt(amount0 * amount1);
        } else {
            uint256 s0 = amount0 * totalLiquidity / reserve0;
            uint256 s1 = amount1 * totalLiquidity / reserve1;
            shares = s0 < s1 ? s0 : s1;
        }
        require(shares > 0, "zero shares");
        liquidity[msg.sender] += shares;
        totalLiquidity += shares;
        reserve0 += amount0;
        reserve1 += amount1;
        emit LiquidityAdded(msg.sender, amount0, amount1, shares);
    }

    function swap(address tokenIn, uint256 amountIn, uint256 minAmountOut)
        external nonReentrant returns (uint256 amountOut)
    {
        require(registry.isSupported(tokenIn), "token disabled");
        require(tokenIn == token0 || tokenIn == token1, "invalid token");
        require(amountIn > 0, "zero input");
        bool zeroForOne = tokenIn == token0;
        uint256 reserveIn = zeroForOne ? reserve0 : reserve1;
        uint256 reserveOut = zeroForOne ? reserve1 : reserve0;
        require(reserveOut > 0, "empty pool");
        // Router transfers tokenIn to this pool before calling swap().
        uint256 amountInWithFee = amountIn * 997;
        amountOut = amountInWithFee * reserveOut / (reserveIn * 1000 + amountInWithFee);
        require(amountOut >= minAmountOut && amountOut < reserveOut, "slippage/liquidity");
        address tokenOut = zeroForOne ? token1 : token0;
        IERC20(tokenOut).safeTransfer(msg.sender, amountOut);
        if (zeroForOne) { reserve0 += amountIn; reserve1 -= amountOut; }
        else { reserve1 += amountIn; reserve0 -= amountOut; }
        emit Swap(msg.sender, tokenIn, amountIn, amountOut);
    }

    function _sqrt(uint256 x) internal pure returns (uint256 y) {
        if (x == 0) return 0;
        uint256 z = (x + 1) / 2; y = x;
        while (z < y) { y = z; z = (x / z + z) / 2; }
    }
}
