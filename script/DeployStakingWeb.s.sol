// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "forge-std/Script.sol";
import {StakingWeb} from "../src/StakingWeb.sol";

contract DeployStakingWeb is Script {
    function run() external {
        vm.startBroadcast();

        address priceFeed = 0x694AA1769357215DE4FAC081bf1f309aDC325306; // Example: Sepolia ETH/USD
       StakingWeb staking = new StakingWeb(priceFeed);

        vm.stopBroadcast();
    }
}
