## Foundry

**Foundry is a blazing fast, portable and modular toolkit for Ethereum application development written in Rust.**

Foundry consists of:

-   **Forge**: Ethereum testing framework (like Truffle, Hardhat and DappTools).
-   **Cast**: Swiss army knife for interacting with EVM smart contracts, sending transactions and getting chain data.
-   **Anvil**: Local Ethereum node, akin to Ganache, Hardhat Network.
-   **Chisel**: Fast, utilitarian, and verbose solidity REPL.

## Documentation

https://book.getfoundry.sh/

## Usage

### Build

```shell
$ forge build
```

### Test

```shell
$ forge test
```

### Format

```shell
$ forge fmt
```

### Gas Snapshots

```shell
$ forge snapshot
```

### Anvil

```shell
$ anvil
```

### Deploy

```shell
$ forge script script/Counter.s.sol:CounterScript --rpc-url <your_rpc_url> --private-key <your_private_key>
```

### Cast

```shell
$ cast <subcommand>
```

### Help

```shell
$ forge --help
$ anvil --help
$ cast --help
```



# 🪙 StakingWeb

**StakingWeb** is a decentralized staking dApp that allows users to stake ERC-20 tokens and earn rewards based on the duration of their stake. Built with Solidity using the Foundry framework, and paired with a lightweight web frontend in HTML, CSS, and JavaScript.

---

## 🚀 Features

- ✅ Stake ERC-20 tokens securely
- ⏱️ Rewards accrue over time based on staking duration
- 💰 Claim rewards or withdraw at any time
- 🧪 Smart contract tested using Foundry
- 🌐 Web interface for interaction via MetaMask

---

## 🧰 Tech Stack

- **Smart Contracts:** Solidity, Foundry
- **Frontend:** HTML, CSS, JavaScript
- **Wallet Integration:** MetaMask
- **Network:** Ethereum Sepolia Testnet
- **Optional:** Chainlink Price Feeds

