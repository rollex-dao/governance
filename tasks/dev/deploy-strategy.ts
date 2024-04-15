import { task } from 'hardhat/config';
import { ZERO_ADDRESS } from '../../helpers/constants';
import { deployGovernanceStrategy } from '../../helpers/contracts-deployments';

const PSYS = '0x48023b16c3e81aa7f6effbdeb35bb83f4f31a8fd';
const STKPSYS = '0x7170FeE145954863ca1c456BE1b6FB1e869e3B77';

task(`deploy:strategy`, `Deploy governance for tests and development purposes`)
  .addFlag('verify')
  .addParam('psys', '', PSYS)
  .addParam('stkPSYS', '', STKPSYS)
  .setAction(async ({ psys, stkPSYS, verify }, _DRE) => {
    _DRE.run('set-DRE');
    return await deployGovernanceStrategy(psys, stkPSYS, verify);
  });
