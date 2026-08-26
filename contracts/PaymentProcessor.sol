// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

interface ITokenRegistryForPayments { function isSupported(address token) external view returns (bool); }

contract PaymentProcessor is ReentrancyGuard {
    using SafeERC20 for IERC20;
    ITokenRegistryForPayments public immutable registry;
    mapping(bytes32 => bool) public paidOrders;

    event PaymentReceived(bytes32 indexed orderId, address indexed payer, address indexed merchant, address token, uint256 amount);

    constructor(address registry_) {
        require(registry_ != address(0), "zero registry");
        registry = ITokenRegistryForPayments(registry_);
    }

    function pay(bytes32 orderId, address token, address merchant, uint256 amount)
        external nonReentrant
    {
        require(!paidOrders[orderId], "order already paid");
        require(registry.isSupported(token), "token not verified");
        require(merchant != address(0), "zero merchant");
        require(amount > 0, "zero amount");
        paidOrders[orderId] = true;
        IERC20(token).safeTransferFrom(msg.sender, merchant, amount);
        emit PaymentReceived(orderId, msg.sender, merchant, token, amount);
    }
}
