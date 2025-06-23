let provider;
let web3Modal;
let signer;
let stakingContract;

const connectButton = document.getElementById("connectButton");
const stakeBtn = document.getElementById("stakeBtn");
const withdrawBtn = document.getElementById("withdrawBtn");
const claimBtn = document.getElementById("claimBtn");
const loading = document.getElementById("loading");
const toast = document.getElementById("toast");

const contractAddress = "0x9662b7BbAFCc4c441149dc35071F38c9027489EB";
const abi = [  {
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
  }]

window.onload = async function () {
  const providerOptions = {
    walletconnect: {
      package: window.WalletConnectProvider.default,
      options: {
        rpc: {
          1: "https://sepolia.infura.io/v3/c52a3ae118ba4dc6b69dcaae19ff6be0",
        },
      },
    },
  };

  web3Modal = new window.Web3Modal.default({
    cacheProvider: false,
    providerOptions,
  });
};

connectButton.onclick = async () => {
  try {
    const instance = await web3Modal.connect();
    provider = new ethers.providers.Web3Provider(instance);
    signer = provider.getSigner();

    const { chainId } = await provider.getNetwork();

    if (chainId !== 11155111) {
      try {
        // Try to switch to Sepolia
        await provider.send("wallet_switchEthereumChain", [{ chainId: "0xaa36a7" }]);
      } catch (switchError) {
        // If Sepolia isn't added, try adding it
        if (switchError.code === 4902) {
          try {
            await provider.send("wallet_addEthereumChain", [
              {
                chainId: "0xaa36a7",
                chainName: "Sepolia Testnet",
                rpcUrls: ["https://sepolia.infura.io/v3/c52a3ae118ba4dc6b69dcaae19ff6be0"],
                nativeCurrency: {
                  name: "SepoliaETH",
                  symbol: "ETH",
                  decimals: 18
                },
                blockExplorerUrls: ["https://sepolia.etherscan.io"]
              }
            ]);
          } catch (addError) {
            showToast("❌ Failed to add Sepolia. Please add manually.");
            return;
          }
        } else {
          showToast("⚠️ Please switch to Sepolia network");
          return;
        }
      }
    }

    stakingContract = new ethers.Contract(contractAddress, abi, signer);
    const address = await signer.getAddress();
    connectButton.innerText = `${address.slice(0, 6)}...${address.slice(-4)}`;
    showToast("✅ Wallet Connected to Sepolia");
  } catch (err) {
    console.error(err);
    showToast("❌ Wallet connection failed");
  }
};


stakeBtn.onclick = async () => {
  const amount = document.getElementById("stakeAmount").value;
  if (!amount) return showToast("Enter amount first");
  try {
    loading.style.display = "block";
    const tx = await stakingContract.stake({ value: ethers.utils.parseEther(amount) });
    await tx.wait();
    showToast("✅ Staked successfully!");
  } catch (err) {
    showToast("❌ " + err.message);
  } finally {
    loading.style.display = "none";
  }
};

withdrawBtn.onclick = async () => {
  try {
    loading.style.display = "block";
    const tx = await stakingContract.withdrawStake();
    await tx.wait();
    showToast("✅ Withdrawn successfully!");
  } catch (err) {
    showToast("❌ " + err.message);
  } finally {
    loading.style.display = "none";
  }
};

claimBtn.onclick = async () => {
  try {
    loading.style.display = "block";
    const tx = await stakingContract.claimRewards();
    await tx.wait();
    showToast("✅ Rewards claimed!");
  } catch (err) {
    showToast("❌ " + err.message);
  } finally {
    loading.style.display = "none";
  }
};

function showToast(message) {
  toast.textContent = message;
  toast.style.display = "block";
  setTimeout(() => (toast.style.display = "none"), 4000);
}
