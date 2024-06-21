import {task} from 'hardhat/config';
import {getRexGovernanceV2} from '../../helpers/contracts-getters';
import {waitForTx} from '../../helpers/misc-utils';
import {getEthersSigners} from '../../helpers/contracts-helpers';

task(`init:gov`, `Deploy governance for tests and development purposes`)
  .addParam('governance', '')
  .addParam('executor', '')
  .addParam('executorAsOwner', '', 'true')
  .setAction(async ({executorAsOwner, governance, executor}, _DRE) => {
    _DRE.run('set-DRE');
    const gov = await getRexGovernanceV2(governance);
    const signer = (await getEthersSigners())[0];
    await waitForTx(await gov.authorizeExecutors([executor]));
    if (executorAsOwner == 'true') {
      return await waitForTx(await gov.connect(signer).transferOwnership(executor));
    }
  });
