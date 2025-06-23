// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {AggregatorV3Interface} from "chainlink/AggregatorV3Interface.sol";


contract MockV3Aggregator is AggregatorV3Interface {
    int256 private s_price;

    constructor(int256 _initialPrice) {
        s_price = _initialPrice;
    }

    function decimals() external pure override returns (uint8) {
        return 8;
    }

    function description() external pure override returns (string memory) {
        return "Mock Price Feed";
    }

    function version() external pure override returns (uint256) {
        return 1;
    }

    function getRoundData(uint80)
        external
        view
        override
        returns (
            uint80 roundId,
            int256 answer,
            uint256,
            uint256 updatedAt,
            uint80 answeredInRound
        )
    {
        return (0, s_price, 0, block.timestamp, 0);
    }

    function latestRoundData()
        external
        view
        override
        returns (
            uint80,
            int256 answer,
            uint256,
            uint256 updatedAt,
            uint80
        )
    {
        return (0, s_price, 0, block.timestamp, 0);
    }

    function setPrice(int256 newPrice) external {
        s_price = newPrice;
    }
}
