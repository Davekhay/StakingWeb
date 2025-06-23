const projectId = "YOUR_PROJECT_ID_HERE"; 
const contractAddress = "0x9662b7BbAFCc4c441149dc35071F38c9027489EB";  

// Paste full ABI here or import from abi.js if you prefer
const contractABI = [
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "previousOwner", "type": "address" },
      { "indexed": true, "internalType": "address", "name": "newOwner", "type": "address" }
    ],
    "name": "OwnershipTransferred",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "user", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "reward", "type": "uint256" }
    ],
    "name": "RewardsClaimed",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "user", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }
    ],
    "name": "Staked",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "user", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }
    ],
    "name": "Withdrawn",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "stake",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "claimRewards",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "withdrawStake",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "user", "type": "address"}],
    "name": "getUserRewards",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "user", "type": "address"}],
    "name": "getUserInfo",
    "outputs": [
      { "internalType": "uint256", "name": "", "type": "uint256" },
      { "internalType": "uint256", "name": "", "type": "uint256" },
      { "internalType": "uint256", "name": "", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalStaked",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "rewardRatePerSecond",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getContractStats",
    "outputs": [
      { "internalType": "uint256", "name": "totalUsers", "type": "uint256" },
      { "internalType": "uint256", "name": "totalStaked", "type": "uint256" },
      { "internalType": "uint256", "name": "rewardRate", "type": "uint256" },
      { "internalType": "uint256", "name": "availableRewards", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

const modal = new window.web3modal.default({
  projectId,
  walletConnectVersion: 2,
  metadata: {
    name: "StakingWeb",
    description: "Stake ETH and earn rewards",
    url: "https://your-site.com",
    icons: ["https://your-site.com/logo.png"]
  }
});

let provider, signer, contract;

async function connectWallet() {
  try {
    const connection = await modal.connect();
    provider = new ethers.BrowserProvider(connection);
    signer = await provider.getSigner();
    contract = new ethers.Contract(contractAddress, contractABI, signer);

    document.getElementById("status").innerText = `✅ Connected: ${await signer.getAddress()}`;
  } catch (err) {
    console.error(err);
    alert("Wallet connection failed.");
  }
}

async function stakeTokens() {
  const amount = document.getElementById("stakeAmount").value;
  if (!amount) return alert("Enter a valid amount");

  try {
    const tx = await contract.stake({ value: ethers.parseEther(amount) });
    await tx.wait();
    document.getElementById("status").innerText = `✅ Staked ${amount} ETH`;
  } catch (err) {
    console.error(err);
    document.getElementById("status").innerText = "❌ Stake failed";
  }
}

async function claimRewards() {
  try {
    const tx = await contract.claimRewards();
    await tx.wait();
    document.getElementById("status").innerText = "✅ Rewards claimed!";
  } catch (err) {
    console.error(err);
    document.getElementById("status").innerText = "❌ Claim failed";
  }
}

async function withdrawStake() {
  try {
    const tx = await contract.withdrawStake();
    await tx.wait();
    document.getElementById("status").innerText = "✅ Stake withdrawn!";
  } catch (err) {
    console.error(err);
    document.getElementById("status").innerText = "❌ Withdraw failed";
  }
}

document.getElementById("connectBtn").onclick = connectWallet;
document.getElementById("stakeBtn").onclick = stakeTokens;
document.getElementById("claimBtn").onclick = claimRewards;
document.getElementById("withdrawBtn").onclick = withdrawStake;
