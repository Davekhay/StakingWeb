// SPDX-License-Identifier: MIT 
pragma solidity ^0.8.18;

import {AggregatorV3Interface} from "chainlink/AggregatorV3Interface.sol";
import {PriceConverter} from "./PriceConverter.sol";

contract StakingWeb {
    using PriceConverter for uint256;

    AggregatorV3Interface private immutable i_priceFeed;
    address public immutable i_owner;

    uint256 public constant MINIMUM_USD = 5 * 1e18;
    uint256 public rewardRatePerSecond = 1e15; // 0.001 ETH/sec

    mapping(address => uint256) public s_balances;
    mapping(address => uint256) public s_stakedAt;
    mapping(address => uint256) public s_rewards;

    mapping(address => bool) public hasStakedBefore;
    uint256 public totalUsers;
    uint256 public totalStaked;

    // EVENTS
    event Staked(address indexed user, uint256 amount);
    event RewardsClaimed(address indexed user, uint256 reward);
    event Withdrawn(address indexed user, uint256 amount);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    // CONSTRUCTOR
    constructor(address priceFeed) {
        i_priceFeed = AggregatorV3Interface(priceFeed);
        i_owner = msg.sender;
    }

    // MODIFIER
    modifier onlyOwner() {
        require(msg.sender == i_owner, "Not owner");
        _;
    }

    // --- STAKE ---
    function stake() external payable {
        require(msg.value.getConversionRate(i_priceFeed) >= MINIMUM_USD, "Stake >= $5 in ETH");

        if (s_balances[msg.sender] > 0) {
            _updateRewards(msg.sender);
        }

        if (!hasStakedBefore[msg.sender]) {
            hasStakedBefore[msg.sender] = true;
            totalUsers++;
        }

        s_balances[msg.sender] += msg.value;
        totalStaked += msg.value;
        s_stakedAt[msg.sender] = block.timestamp;

        emit Staked(msg.sender, msg.value);
    }

    // --- UPDATE REWARDS ---
    function _updateRewards(address user) internal {
        uint256 lastTime = s_stakedAt[user];
        if (lastTime == 0 || s_balances[user] == 0) return;

        uint256 duration = block.timestamp - lastTime;
        uint256 earned = duration * rewardRatePerSecond;
        s_rewards[user] += earned;
        s_stakedAt[user] = block.timestamp;
    }

    // --- CLAIM REWARDS ---
    function claimRewards() external {
        _updateRewards(msg.sender);

        uint256 reward = s_rewards[msg.sender];
        require(reward > 0, "No rewards yet");

        s_rewards[msg.sender] = 0;
        (bool sent,) = payable(msg.sender).call{value: reward}("");
        require(sent, "Reward transfer failed");

        emit RewardsClaimed(msg.sender, reward);
    }

    // --- WITHDRAW STAKE ---
    function withdrawStake() external {
        _updateRewards(msg.sender);

        uint256 amount = s_balances[msg.sender];
        require(amount > 0, "No stake");

        s_balances[msg.sender] = 0;
        s_stakedAt[msg.sender] = 0;

        (bool sent,) = payable(msg.sender).call{value: amount}("");
        require(sent, "Withdraw failed");

        emit Withdrawn(msg.sender, amount);
    }

    // --- VIEW FUNCTIONS FOR FRONTEND ---
    function getUserInfo(address user) external view returns (
        uint256 balance,
        uint256 rewards,
        uint256 lastStakedAt
    ) {
        return (s_balances[user], s_rewards[user], s_stakedAt[user]);
    }
    
     function getUserBalance(address user) external view returns (uint256) {
    return s_balances[user];
   }

    function getUserRewards(address user) external view returns (uint256) {
    return s_rewards[user];
   }

     function getStakedAt(address user) external view returns (uint256) {
    return s_stakedAt[user];
   }

    function getContractStats() external view returns (
        uint256 _totalStaked,
        uint256 _totalUsers,
        uint256 _rewardRate,
        uint256 _contractBalance
    ) {
        return (
            totalStaked,
            totalUsers,
            rewardRatePerSecond,
            address(this).balance
        );
    }

    function getPriceFeed() external view returns (address) {
        return address(i_priceFeed);
    }

    // --- OWNER FUNCTIONS ---
    function setRewardRate(uint256 newRate) external onlyOwner {
        rewardRatePerSecond = newRate;
    }

    function fundRewards() external payable onlyOwner {}

    // --- FALLBACKS ---
    receive() external payable {}
    fallback() external payable {}
}
