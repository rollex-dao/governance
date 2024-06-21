import {expect, use} from 'chai';
import {solidity} from 'ethereum-waffle';
import {BigNumber} from 'ethers';
import {MAX_UINT_AMOUNT} from '../helpers/constants';
import {DRE} from '../helpers/misc-utils';
import {buildDelegateByTypeParams, buildDelegateParams} from './helpers/delegation';
import {calculateUserTotalPowers, setTokenBalance} from './helpers/gov-utils';
import {deployGovernance, makeSuite, TestEnv} from './helpers/make-suite';
import {getSignatureFromTypedData} from './helpers/permit';

enum DelegationType {
  VOTING_POWER = 0,
  PROPOSITION_POWER,
}

use(solidity);

makeSuite('Rex Governance V2 Helpers tests', deployGovernance, (testEnv: TestEnv) => {
  const expiry = MAX_UINT_AMOUNT;
  const USER1_REX_BALANCE = BigNumber.from(1000);
  const USER1_STKREX_BALANCE = BigNumber.from(2000);
  const USER2_REX_BALANCE = BigNumber.from(3000);
  const USER2_STKREX_BALANCE = BigNumber.from(4000);

  beforeEach(async () => {
    const {
      users: [user1, user2],
    } = testEnv;

    await setTokenBalance(user1, USER1_REX_BALANCE, testEnv.rex, testEnv);
    await setTokenBalance(user1, USER1_STKREX_BALANCE, testEnv.stkRex, testEnv);

    await setTokenBalance(user2, USER2_REX_BALANCE, testEnv.rex, testEnv);
    await setTokenBalance(user2, USER2_STKREX_BALANCE, testEnv.stkRex, testEnv);
  });

  describe('Testing delegateTokensBySig function', () => {
    it('should revert with INCONSISTENT_PARAMS_LENGTH if length of tokens is different than params', async () => {
      const {
        govHelper,
        rex,
        users: [user1],
      } = testEnv;
      await expect(
        govHelper.connect(user1.signer).delegateTokensBySig([rex.address], [])
      ).to.revertedWith('INCONSISTENT_PARAMS_LENGTH');
    });
    it('should delegate both VOTING and PROPOSITION power from both REX and stkREX', async () => {
      const {chainId} = await DRE.ethers.provider.getNetwork();
      const {
        govHelper,
        rex,
        stkRex,
        users: [user1, user2],
      } = testEnv;
      const user1PrivateKey = require('../test-wallets.js').accounts[2].secretKey;

      // building rex signature
      const rexNonce = (await rex.connect(user1.signer)._nonces(user1.address)).toString();
      const rexTypedData = buildDelegateParams(
        chainId,
        rex.address,
        await rex.connect(user1.signer).name(),
        user2.address,
        rexNonce,
        expiry
      );
      const {v, r, s} = getSignatureFromTypedData(user1PrivateKey, rexTypedData);
      const rexParams = {
        delegatee: user2.address,
        nonce: rexNonce,
        expiry,
        v,
        r,
        s,
      };

      // building stkRex signature
      const stkRexNonce = (await stkRex.connect(user1.signer)._nonces(user1.address)).toString();
      const stkRexTypedData = buildDelegateParams(
        chainId,
        stkRex.address,
        await stkRex.connect(user1.signer).name(),
        user2.address,
        stkRexNonce,
        expiry
      );
      const {v: v1, r: r1, s: s1} = getSignatureFromTypedData(user1PrivateKey, stkRexTypedData);
      const stkRexParams = {
        delegatee: user2.address,
        nonce: stkRexNonce,
        expiry,
        v: v1,
        r: r1,
        s: s1,
      };

      const user2Powers = await calculateUserTotalPowers(
        user2,
        [rex.address, stkRex.address],
        testEnv
      );

      expect(
        await govHelper
          .connect(user1.signer)
          .delegateTokensBySig([rex.address, stkRex.address], [rexParams, stkRexParams])
      );

      const user2NewPowers = await calculateUserTotalPowers(
        user2,
        [rex.address, stkRex.address],
        testEnv
      );

      expect(user2NewPowers.propositionPower).to.eq(
        user2Powers.propositionPower.add(USER1_REX_BALANCE).add(USER1_STKREX_BALANCE)
      );
      expect(user2NewPowers.votingPower).to.eq(
        user2Powers.votingPower.add(USER1_REX_BALANCE).add(USER1_STKREX_BALANCE)
      );
    });
  });

  describe('Testing delegateTokensByTypeBySig function', () => {
    it('should revert with INCONSISTENT_PARAMS_LENGTH if length of tokens is different than params', async () => {
      const {
        govHelper,
        rex,
        users: [user1],
      } = testEnv;
      await expect(
        govHelper.connect(user1.signer).delegateTokensByTypeBySig([rex.address], [])
      ).to.revertedWith('INCONSISTENT_PARAMS_LENGTH');
    });
    it('should delegate VOTING power from both REX and stkREX', async () => {
      const {chainId} = await DRE.ethers.provider.getNetwork();
      const {
        govHelper,
        rex,
        stkRex,
        users: [user1, user2],
      } = testEnv;
      const user1PrivateKey = require('../test-wallets.js').accounts[2].secretKey;

      const powerType = DelegationType.VOTING_POWER;

      // building rex signature
      const rexNonce = (await rex.connect(user1.signer)._nonces(user1.address)).toString();
      const rexTypedData = buildDelegateByTypeParams(
        chainId,
        rex.address,
        await rex.connect(user1.signer).name(),
        user2.address,
        powerType.toString(),
        rexNonce,
        expiry
      );
      const {v, r, s} = getSignatureFromTypedData(user1PrivateKey, rexTypedData);
      const rexParams = {
        delegatee: user2.address,
        delegationType: powerType,
        nonce: rexNonce,
        expiry,
        v,
        r,
        s,
      };

      // building stkRex signature
      const stkRexNonce = (await stkRex.connect(user1.signer)._nonces(user1.address)).toString();
      const stkRexTypedData = buildDelegateByTypeParams(
        chainId,
        stkRex.address,
        await stkRex.connect(user1.signer).name(),
        user2.address,
        powerType.toString(),
        stkRexNonce,
        expiry
      );
      const {v: v1, r: r1, s: s1} = getSignatureFromTypedData(user1PrivateKey, stkRexTypedData);
      const stkRexParams = {
        delegatee: user2.address,
        delegationType: powerType,
        nonce: stkRexNonce,
        expiry,
        v: v1,
        r: r1,
        s: s1,
      };
      const user2Powers = await calculateUserTotalPowers(
        user2,
        [rex.address, stkRex.address],
        testEnv
      );

      expect(
        await govHelper
          .connect(user1.signer)
          .delegateTokensByTypeBySig([rex.address, stkRex.address], [rexParams, stkRexParams])
      );

      const user2NewPowers = await calculateUserTotalPowers(
        user2,
        [rex.address, stkRex.address],
        testEnv
      );

      expect(user2NewPowers.propositionPower).to.eq(user2Powers.propositionPower);
      expect(user2NewPowers.votingPower).to.eq(
        user2Powers.votingPower.add(USER1_REX_BALANCE).add(USER1_STKREX_BALANCE)
      );
    });

    it('should delegate PROPOSITION power from both REX and stkREX', async () => {
      const {chainId} = await DRE.ethers.provider.getNetwork();
      const {
        govHelper,
        rex,
        stkRex,
        users: [user1, user2],
      } = testEnv;
      const user1PrivateKey = require('../test-wallets.js').accounts[2].secretKey;

      const powerType = DelegationType.PROPOSITION_POWER;

      // building rex signature
      const rexNonce = (await rex.connect(user1.signer)._nonces(user1.address)).toString();
      const rexTypedData = buildDelegateByTypeParams(
        chainId,
        rex.address,
        await rex.connect(user1.signer).name(),
        user2.address,
        powerType.toString(),
        rexNonce,
        expiry
      );
      const {v, r, s} = getSignatureFromTypedData(user1PrivateKey, rexTypedData);
      const rexParams = {
        delegatee: user2.address,
        delegationType: powerType,
        nonce: rexNonce,
        expiry,
        v,
        r,
        s,
      };

      // building stkRex signature

      const stkRexNonce = (await stkRex.connect(user1.signer)._nonces(user1.address)).toString();
      const stkRexTypedData = buildDelegateByTypeParams(
        chainId,
        stkRex.address,
        await stkRex.connect(user1.signer).name(),
        user2.address,
        powerType.toString(),
        stkRexNonce,
        expiry
      );
      const {v: v1, r: r1, s: s1} = getSignatureFromTypedData(user1PrivateKey, stkRexTypedData);
      const stkRexParams = {
        delegatee: user2.address,
        delegationType: powerType,
        nonce: stkRexNonce,
        expiry,
        v: v1,
        r: r1,
        s: s1,
      };

      const user2Powers = await calculateUserTotalPowers(
        user2,
        [rex.address, stkRex.address],
        testEnv
      );

      expect(
        await govHelper
          .connect(user1.signer)
          .delegateTokensByTypeBySig([rex.address, stkRex.address], [rexParams, stkRexParams])
      );

      const user2NewPowers = await calculateUserTotalPowers(
        user2,
        [rex.address, stkRex.address],
        testEnv
      );

      expect(user2NewPowers.votingPower).to.eq(user2Powers.votingPower);
      expect(user2NewPowers.propositionPower).to.eq(
        user2Powers.propositionPower.add(USER1_REX_BALANCE).add(USER1_STKREX_BALANCE)
      );
    });
  });
});
