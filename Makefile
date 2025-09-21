# -------------------------------------------------------------
# Project Makefile
#
# This Makefile orchestrates the local setup of the project,
# including ICP Ledger deployment, canister deployment, and
# frontend binding generation.
#
# Usage:
#   make setup-ledger   -> Deploy ICP Ledger (skip if already deployed)
#   make setup          -> Run full setup (ledger + canisters + bindings)
#   make deploy         -> Deploy project canisters
#   make generate       -> Generate frontend bindings
#   make clean          -> Reset project state
# -------------------------------------------------------------
# First of all please set up 2 names identity for local ledger
#
MINTER := minter
DEFAULT := default
#
# -------------------------------------------------------------
# Target: Setup ICP Ledger canister
# - Checks if ICP Ledger canister already exists.
# - If not deployed:
#     * Creates 'minter' and 'default' identities (if missing).
#     * Retrieves their account IDs.
#     * Deploys the ICP Ledger canister with initial balance.
# - If already deployed, skips setup safely.
# -------------------------------------------------------------
setup-ledger:
	@echo "Checking ICP Ledger canister"
	@if dfx canister id icp_ledger --network local >/dev/null 2>&1; then \
		echo "ICP Ledger already deployed. Skipping setup"; \
	else \
		echo "Deploying ICP Ledger for the first time"; \
		\
		for ID in $(MINTER) $(DEFAULT); do \
			if ! dfx identity list | grep -q "^$$ID$$"; then \
				echo "Creating new identity '$$ID'"; \
				dfx identity new $$ID || true; \
			fi; \
		done; \
		\
		dfx identity use $(MINTER); \
		MINTER_ACCOUNT_ID=$$(dfx ledger --identity $(MINTER) account-id); \
		\
		dfx identity use $(DEFAULT); \
		DEFAULT_ACCOUNT_ID=$$(dfx ledger --identity $(DEFAULT) account-id); \
		\
		echo "MINTER_ACCOUNT_ID=$$MINTER_ACCOUNT_ID"; \
		echo "DEFAULT_ACCOUNT_ID=$$DEFAULT_ACCOUNT_ID"; \
		\
		dfx deploy \
			--specified-id ryjl3-tyaaa-aaaaa-aaaba-cai icp_ledger \
			--argument "(variant { \
				Init = record { \
					minting_account = \"$$MINTER_ACCOUNT_ID\"; \
					initial_values = vec { \
						record { \
							\"$$DEFAULT_ACCOUNT_ID\"; \
							record { e8s = 10_000_000_000 : nat64 }; \
						}; \
					}; \
					send_whitelist = vec {}; \
					transfer_fee = opt record { e8s = 0 : nat64 }; \
					token_symbol = opt \"LICP\"; \
					token_name = opt \"Local ICP\"; \
				} \
			})"; \
		echo "ICP Ledger deployed. Continuing setup dfx"; \
	fi

transfer:
	dfx canister call icp_ledger icrc1_transfer "( \
		record { \
			to = record { \
				owner = principal \"caceq-nhwcf-dukri-2sqph-dxf5o-i6vf4-gujje-ocog4-appir-hul6q-qae\"; \
				subaccount = null \
			}; \
			fee = null; \
			memo = null; \
			from_subaccount = null; \
			created_at_time = null; \
			amount = 1000000; \
		} \
	)";

	@echo "Successfull transfer 1000000";

# -------------------------------------------------------------
# Target: Deploy all project canisters
# Deploys every canister defined in dfx.json.
# -------------------------------------------------------------
deploy:
	@echo "Deploying project canisters"
	@dfx deploy

# -------------------------------------------------------------
# Target: Generate frontend bindings
# Generates bindings as configured in dfx.json.
# -------------------------------------------------------------
generate:
	@echo "Generating frontend bindings"
	@dfx generate

# -------------------------------------------------------------
# Target: Clean project state
# Removes local build artifacts and resets state.
# -------------------------------------------------------------
clean:
	@echo "Cleaning project"
	@rm -rf .dfx canister_ids.json
	@echo "Clean complete!"

# -------------------------------------------------------------
# Target: copy-env
# Removes the existing frontend/.env file (if any) and copies
# the root .env file into frontend/.env to ensure the frontend
# always uses the latest environment configuration.
# -------------------------------------------------------------

FRONTEND_ENV = frontend/.env
ROOT_ENV = .env

copy-env:
	@echo "Update frontend .env file"
	@rm -f $(FRONTEND_ENV)
	@cp $(ROOT_ENV) $(FRONTEND_ENV)

# -------------------------------------------------------------
# Target: copy-declarations
# Removes the existing frontend/declarations file (if any) and copies
# the root declarations file into frontend/declarations to ensure the frontend
# always uses the latestdeclarationironments configuration.
# -------------------------------------------------------------

FRONTEND_DECLARATIONS = frontend/declarations
ROOT_DECLARATIONS = declarations

copy-declarations:
	@echo "Update frontend .env file"
	@rm -f $(FRONTEND_DECLARATIONS)
	@cp $(ROOT_DECLARATIONS) $(FRONTEND_DECLARATIONS)

# -------------------------------------------------------------
# Target: Full setup pipeline
# Runs the following in order:
#   1. Setup ICP Ledger
#   2. Deploy project canisters
#   3. Generate frontend bindings
# -------------------------------------------------------------
project: clean setup-ledger transfer deploy generate copy-env copy-declarations
	@echo "Setup done!"
