SHELL := /bin/bash

.PHONY: deploy-sepolia

deploy-sepolia:
	@set -a && . .env && \
	forge script script/DeployStakingWeb.s.sol:DeployStakingWeb \
		--rpc-url $$SEPOLIA_RPC_URL \
		--private-key $$PRIVATE_KEY \
		--broadcast \
		--verify \
		--etherscan-api-key $$ETHERSCAN_API_KEY \
		-vvvv
