// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console2} from "forge-std/Script.sol";
import {TokenRegistry} from "../contracts/TokenRegistry.sol";
import {PairRegistry} from "../contracts/PairRegistry.sol";
import {VerifiedSwapRouter} from "../contracts/VerifiedSwapRouter.sol";
import {PaymentProcessor} from "../contracts/PaymentProcessor.sol";

contract DeployAntiFake is Script {
    function run() external returns (TokenRegistry registry, PairRegistry pairs, VerifiedSwapRouter router, PaymentProcessor payments) {
        uint256 deployerKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerKey);

        vm.startBroadcast(deployerKey);
        registry = new TokenRegistry(deployer);
        pairs = new PairRegistry(deployer, address(registry));
        router = new VerifiedSwapRouter(address(registry), address(pairs));
        payments = new PaymentProcessor(address(registry));
        vm.stopBroadcast();

        console2.log("TokenRegistry:", address(registry));
        console2.log("PairRegistry:", address(pairs));
        console2.log("VerifiedSwapRouter:", address(router));
        console2.log("PaymentProcessor:", address(payments));
    }
}
