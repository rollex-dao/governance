import {task} from 'hardhat/config';
import {ZERO_ADDRESS} from '../../helpers/constants';
import {deployGovernanceStrategy} from '../../helpers/contracts-deployments';

task(`deploy:strategy`, `Deploy governance for tests and development purposes`)
  .addFlag('verify')
  .addParam('rex', '', ZERO_ADDRESS)
  .addParam('stkRex', '', ZERO_ADDRESS)
  .setAction(async ({rex, stkRex, verify}, _DRE) => {
    _DRE.run('set-DRE');
    return await deployGovernanceStrategy(rex, stkRex, verify);
  });
