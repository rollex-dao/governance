import {evmRevert, evmSnapshot, DRE} from '../../helpers/misc-utils';
import {Signer} from 'ethers';
import rawBRE from 'hardhat';
import chai from 'chai';
// @ts-ignore
import {solidity} from 'ethereum-waffle';
import {getEthersSigners} from '../../helpers/contracts-helpers';
import {
  getRexGovernanceV2,
  getRexV2Mocked,
  getExecutor,
  getGovernanceStrategy,
  getGovernanceV2Helper,
  getStkRexV2Mocked,
} from '../../helpers/contracts-getters';
import {tEthereumAddress} from '../../helpers/types';
import {RexGovernanceV2} from '../../types/RexGovernanceV2';
import {RexTokenV2} from '../../types/RexTokenV2';
import {Executor} from '../../types/Executor';
import {GovernanceStrategy} from '../../types/GovernanceStrategy';
import {GovernanceV2Helper} from '../../types/GovernanceV2Helper';

chai.use(solidity);

export interface SignerWithAddress {
  signer: Signer;
  address: tEthereumAddress;
}
export interface TestEnv {
  deployer: SignerWithAddress;
  minter: SignerWithAddress;
  users: SignerWithAddress[];
  rex: RexTokenV2;
  stkRex: RexTokenV2; // TODO change to a mock of stkREX
  gov: RexGovernanceV2;
  strategy: GovernanceStrategy;
  executor: Executor;
  govHelper: GovernanceV2Helper;
}

let buidlerevmSnapshotId: string = '0x1';
const setBuidlerevmSnapshotId = (id: string) => {
  buidlerevmSnapshotId = id;
};

const testEnv: TestEnv = {
  deployer: {} as SignerWithAddress,
  minter: {} as SignerWithAddress,
  users: [] as SignerWithAddress[],
  rex: {} as RexTokenV2,
  stkRex: {} as RexTokenV2,
  gov: {} as RexGovernanceV2,
  strategy: {} as GovernanceStrategy,
  govHelper: {} as GovernanceV2Helper,
  executor: {} as Executor,
} as TestEnv;

export async function initializeMakeSuite() {
  const [_deployer, _minter, ...restSigners] = await getEthersSigners();
  const deployer: SignerWithAddress = {
    address: await _deployer.getAddress(),
    signer: _deployer,
  };
  const minter: SignerWithAddress = {
    address: await _minter.getAddress(),
    signer: _minter,
  };

  testEnv.users = await Promise.all(
    restSigners.map(async (signer) => ({
      signer,
      address: await signer.getAddress(),
    }))
  );

  testEnv.deployer = deployer;
  testEnv.minter = minter;
  testEnv.rex = await getRexV2Mocked();
  testEnv.stkRex = await getStkRexV2Mocked();
  testEnv.gov = await getRexGovernanceV2();
  testEnv.strategy = await getGovernanceStrategy();
  testEnv.executor = await getExecutor();
  testEnv.govHelper = await getGovernanceV2Helper();
}

export async function deployGovernance() {
  console.log('-> Deploying governance test environment...');
  await rawBRE.run('set-DRE');
  await rawBRE.run('migrate:dev');
  await initializeMakeSuite();
  console.log('\n***************');
  console.log('Setup and snapshot finished');
  console.log('***************\n');
}

export async function deployGovernanceWithoutExecutorAsOwner() {
  console.log('-> Deploying governance test environment...');
  await rawBRE.run('set-DRE');
  await rawBRE.run('migrate:dev', {executorAsOwner: 'false'});
  await initializeMakeSuite();
  console.log('\n***************');
  console.log('Setup and snapshot finished');
  console.log('***************\n');
}

export async function deployGovernanceNoDelay() {
  console.log('-> Deploying governance test environment with no delay...');
  await rawBRE.run('set-DRE');
  await rawBRE.run('migrate:dev', {votingDelay: '0'});
  await initializeMakeSuite();
  console.log('\n***************');
  console.log('Setup and snapshot finished');
  console.log('***************\n');
}

export async function makeSuite(
  name: string,
  deployment: () => Promise<void>,
  tests: (testEnv: TestEnv) => void
) {
  beforeEach(async () => {
    setBuidlerevmSnapshotId(await evmSnapshot());
  });
  describe(name, async () => {
    before(deployment);
    tests(testEnv);
  });
  afterEach(async () => {
    await evmRevert(buidlerevmSnapshotId);
  });
}
