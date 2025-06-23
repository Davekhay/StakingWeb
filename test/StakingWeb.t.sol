// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "forge-std/Test.sol";
import "forge-std/console.sol";
import {StakingWeb} from "../src/StakingWeb.sol";
import {MockV3Aggregator} from "./mocks/MockV3Aggregator.sol";

contract StakingWebTest is Test {
    StakingWeb stakingWeb;
    MockV3Aggregator mockPriceFeed;

    address USER = address(1);
    uint256 constant STARTING_ETH_BALANCE = 10 ether;
    uint256 constant ETH_USD_PRICE = 2000e8; // $2000 with 8 decimals
    uint256 constant REWARD_RATE_PER_SECOND = 1e15; // 0.001 ETH/sec

    event Staked(address indexed user, uint256 amount);

    function setUp() public {
        mockPriceFeed = new MockV3Aggregator(int256(ETH_USD_PRICE));
        stakingWeb = new StakingWeb(address(mockPriceFeed));
        vm.deal(USER, STARTING_ETH_BALANCE);
    }

    function testStakeEmitsEvent() public {
        vm.prank(USER);
        vm.expectEmit(true, false, false, true);
        emit Staked(USER, 1 ether);
        stakingWeb.stake{value: 1 ether}();
    }

    function testStakeStoresBalance() public {
        vm.prank(USER);
        stakingWeb.stake{value: 1 ether}();

        uint256 balance = stakingWeb.s_balances(USER);
        assertEq(balance, 1 ether);

        uint256 stakedAt = stakingWeb.s_stakedAt(USER);
        assertGt(stakedAt, 0);
    }

    function testRewardsAccrueOverTime() public {
        vm.prank(USER);
        stakingWeb.stake{value: 1 ether}();

        skip(3600); // 1 hour later = 3600 seconds

        // Fund the contract with enough ETH to pay rewards
        uint256 expectedReward = 3600 * REWARD_RATE_PER_SECOND;
        vm.deal(address(stakingWeb), expectedReward + 1 ether); // Ensure more than enough

        uint256 userBalanceBefore = USER.balance;
        uint256 rewardBeforeClaim = stakingWeb.s_rewards(USER);

        console.log("Expected reward before claim:", rewardBeforeClaim);
        console.log("Contract balance before claim:", address(stakingWeb).balance);

        vm.prank(USER);
        stakingWeb.claimRewards();

        uint256 userBalanceAfter = USER.balance;
        uint256 rewardsPaid = userBalanceAfter - userBalanceBefore;

        console.log("User balance after claim:", userBalanceAfter);
        console.log("Rewards paid:", rewardsPaid);

        assertEq(rewardsPaid, expectedReward);
        assertEq(stakingWeb.s_rewards(USER), 0);
    }

    function testWithdrawStake() public {
        vm.prank(USER);
        stakingWeb.stake{value: 1 ether}();

        skip(3600);
        uint256 initialBalance = USER.balance;

        vm.deal(address(stakingWeb), 2 ether); // make sure it can refund stake
        vm.prank(USER);
        stakingWeb.withdrawStake();

        uint256 finalBalance = USER.balance;
        uint256 stakeBalance = stakingWeb.s_balances(USER);

        assertEq(stakeBalance, 0);
        assertGt(finalBalance, initialBalance);
    }

    function testStakeFailsBelowMinimumUSD() public {
        uint256 tooSmallAmount = 0.002 ether;
        vm.prank(USER);
        vm.expectRevert(bytes("Stake >= $5 in ETH"));
        stakingWeb.stake{value: tooSmallAmount}();
    }

    function testStakeFailsWithZeroAmount() public {
        vm.prank(USER);
        vm.expectRevert(bytes("Stake >= $5 in ETH"));
        stakingWeb.stake{value: 0}();
    }

    function testClaimRewardsWithoutStake() public {
        vm.prank(USER);
        vm.expectRevert(bytes("No rewards yet"));
        stakingWeb.claimRewards();
    }

    function testWithdrawWithoutStake() public {
        vm.prank(USER);
        vm.expectRevert(bytes("No stake"));
        stakingWeb.withdrawStake();
    }

    function testGetters() public {
        assertEq(stakingWeb.getPriceFeed(), address(mockPriceFeed));

        vm.prank(USER);
        stakingWeb.stake{value: 1 ether}();

        (uint256 bal, uint256 rewards, uint256 stakedAt) = stakingWeb.getUserInfo(USER);
        assertEq(bal, 1 ether);
        assertEq(rewards, 0);
        assertGt(stakedAt, 0);
    }
}
