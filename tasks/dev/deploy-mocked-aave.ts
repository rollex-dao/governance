import {isAddress} from 'ethers/lib/utils';
import {task} from 'hardhat/config';
import {ZERO_ADDRESS} from '../../helpers/constants';
import {deployMockedRexV2} from '../../helpers/contracts-deployments';

task(`deploy:mocked-rex`, `Deploy mocked REX V2`)
  .addFlag('verify')
  .addParam('minter', 'Minter to mint all the supply of mock REX v2 token')
  .setAction(async ({minter, verify}, _DRE) => {
    _DRE.run('set-DRE');
    if (!isAddress(minter)) {
      throw Error('minter param must be an Ethereum address');
    }

    return await deployMockedRexV2(minter, verify);
  });
