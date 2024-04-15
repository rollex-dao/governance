import { task } from 'hardhat/config';
import { BigNumber } from 'ethers';

import { ZERO_ADDRESS } from '../../helpers/constants';
import { deployExecutor } from '../../helpers/contracts-deployments';

const ONE_DAY = BigNumber.from('60').mul('60').mul('24');
const DELAY = ONE_DAY.mul('7').toString(); // 7 days
const GRACE = ONE_DAY.mul('5').toString(); // 5 days
const MAX_DELAY = ONE_DAY.mul('30').toString(); // 30 days
const VOTE_DURATION = ONE_DAY.mul('10').toString(); // 10 days
const ADMIN = '0x4894A8900D0fDB4DAAFA80383F212f03E1d0f351'; // Goverance
const minimumDelay = '10'; // 10 sec
const propositionThreshold = '125'; // 1.25%
const voteDifferential = '650'; // 6.5%
const minimumQuorum = '650'; // 6.5%

task(`deploy:executor`, `Deploy governance for tests and development purposes`)
  .addFlag('verify')
  .setAction(async ({ verify }, _DRE) => {
    _DRE.run('set-DRE');
    return await deployExecutor(
      ADMIN,
      DELAY,
      GRACE,
      minimumDelay,
      MAX_DELAY,
      propositionThreshold,
      VOTE_DURATION,
      voteDifferential,
      minimumQuorum,
      verify
    );
  });
