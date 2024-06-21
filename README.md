[![License: AGPL v3](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)
[![Build pass](https://github.com/rex/governance-v2/actions/workflows/node.js.yml/badge.svg)](https://github.com/rex/governance-v2/actions/workflows/node.js.yml)
[![codecov](https://codecov.io/gh/rex/governance-v2/branch/master/graph/badge.svg?token=cYYgmBJQcO)](https://codecov.io/gh/rex/governance-v2)

# Rollex Governance

## Architecture

![governance-v2-architecture](./gov-v2-architecture.jpg)

## Audits

The Rex Governance V2 has been audited by Peckshied, with the final report [here](./audits/PeckShield-Audit-RexGovernance2-final.pdf)

## Planned configurations for mainnet

### RexGovernance

- voting delay: 7200 blocks (using 12s per block = 1 day) between proposal creation and proposal voting
- guardian: Rex Guardian multisig
- executors whitelisted: Executor (short) and Executor (long)
- owner (entity able to change the strategy, voting delay and authorize/unauthorize executors): Executor 2, the long timelock

### Executor (short)

It will control the whole Rex protocol v1, the token distributor used in v1, the contract collecting the fees of v1, the Reserve Ecosystem of REX and any change in this timelock itself

- admin (the only address enable to interact with this executor): Rex Governance v2
- delay (time between a proposals passes and its actions get executed): 1 day
- grace period (time after the delay during which the proposal can be executed): 5 days
- proposition threshold: 0.5%
- voting duration: 3 days
- vote differential: 0.5%
- quorum: 2%

### Executor (long)

It will control the upgradeability of the REX token, the stkREX, any change in the parameters of the Governance v2 and any change in the parameters of this timelock itself

Current configuration (voted on [Proposal 106](https://app.rex.com/governance/proposal/106/)):
Code, tests and deployement scripts can be found [here](https://github.com/bgd-labs/rex-gov-level-2-update).

- admin: Rex Governance v2
- delay: 7 days
- grace period: 5 days
- proposition threshold: 1.25%
- voting duration: 10 days
- vote differential: 6.5%
- quorum: 6.5%

Deprecated configuration:

- admin: Rex Governance v2
- delay: 7 days
- grace period: 5 days
- proposition threshold: 2%
- voting duration: 10 days
- vote differential: 15%
- quorum: 20%

### Governance strategy (the contract determining how the voting/proposition powers are calculated)

- Based on REX+stkREX
- Voting and proposition power are: balanceOfREX + delegationReceivedOfREX + balanceOfstkREX + delegationReceivedOfstkREX (with delegation being voting or proposition depending on the case)
- Total voting and proposition supply: REX supply

## Getting Started

You can install `@pollum-io/rollex-governace` as an NPM package in your Hardhat, Buidler or Truffle project to import the contracts and interfaces:

`npm install @pollum-io/rollex-governace`

Import at Solidity files:

```
import {IRexGovernanceV2} from "@pollum-io/rollex-governace/contracts/interfaces/IRexGovernanceV2.sol";

contract Misc {

  function vote(uint256 proposal, bool support) {
    IRexGovernanceV2(pool).submitVote(proposal, support);
    {...}
  }
}
```

The JSON artifacts with the ABI and Bytecode are also included into the bundled NPM package at `artifacts/` directory.

Import JSON file via Node JS `require`:

```
const GovernanceV2Artifact = require('@pollum-io/rollex-governace/artifacts/contracts/governance/RexGovernanceV2.sol/RexGovernanceV2.json');

// Log the ABI into console
console.log(GovernanceV2Artifact.abi)
```

## Setup

The repository uses Docker Compose to manage sensitive keys and load the configuration. Prior any action like test or deploy, you must run `docker-compose up` to start the `contracts-env` container, and then connect to the container console via `docker-compose exec contracts-env bash`.

Follow the next steps to setup the repository:

- Install `docker` and `docker-compose`
- Create an enviroment file named `.env` and fill the next enviroment variables

```
# Mnemonic, only first address will be used
MNEMONIC=""

# Add Alchemy or Infura provider keys, alchemy takes preference at the config level
ALCHEMY_KEY=""
INFURA_KEY=""

# Optional Etherscan key, for automatize the verification of the contracts at Etherscan
ETHERSCAN_KEY=""

# Optional, if you plan to use Tenderly scripts
TENDERLY_PROJECT=""
TENDERLY_USERNAME=""

```

## Test

For running the test suite, run:

```
docker-compose run contracts-env npm run test
```

For running coverage, run:

```
docker-compose run contracts-env npm run coverage
```
