import {task} from 'hardhat/config';
import {ZERO_ADDRESS} from '../../helpers/constants';
import {deployRexGovernanceV2} from '../../helpers/contracts-deployments';

task(`deploy:gov`, `Deploy governance for tests and development purposes`)
  .addFlag('verify')
  .addParam('strategy', '', ZERO_ADDRESS)
  .addParam('votingDelay', '', '15') // needed to be increase, evm_revert does not update block
  .addParam('guardian', '', ZERO_ADDRESS)
  .setAction(async ({strategy, votingDelay, guardian, verify}, _DRE) => {
    _DRE.run('set-DRE');
    return await deployRexGovernanceV2(strategy, votingDelay, guardian, [], verify);
  });
