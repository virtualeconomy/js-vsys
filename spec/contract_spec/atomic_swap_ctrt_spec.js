/**
 * module atomicSwapCtrtSpec tests module contract/atomicSwapCtrtSpec
 * @module atomicSwapCtrtSpec
 */

'use strict';

import bs58 from 'bs58';
import * as ut from '../helpers/utils.js';
import * as jv from '../../src/index.js';
import * as hs from '../../src/utils/hashes.js';

describe('Test class AtomicSwapCtrt', function () {
  beforeEach(async function () {
    this.maker = this.acnt0;
    this.taker = this.acnt1;

    [this.makerNc, this.takerNc] = await Promise.all([
      jv.NFTCtrt.register(this.maker),
      jv.NFTCtrt.register(this.taker),
    ]);
    await this.waitForBlock();

    await Promise.all([
      this.makerNc.issue(this.maker),
      this.takerNc.issue(this.taker),
    ]);
    await this.waitForBlock();

    this.makerNcTokId = this.makerNc.getTokId(0);
    this.takerNcTokId = this.takerNc.getTokId(0);

    [this.makerAc, this.takerAc] = await Promise.all([
      jv.AtomicSwapCtrt.register(this.maker, this.makerNcTokId.data),
      jv.AtomicSwapCtrt.register(this.taker, this.takerNcTokId.data),
    ]);
    await this.waitForBlock();

    await Promise.all([
      this.makerNc.deposit(this.maker, this.makerAc.ctrtId.data, 0),
      this.takerNc.deposit(this.taker, this.takerAc.ctrtId.data, 0),
    ]);
    await this.waitForBlock();
  });

  describe('Test method register', function () {
    it('should register an instance of Atomic Swap Contract', async function () {
      const ctrtMakerActual = await this.makerAc.getMaker();
      const ctrtMakerExpected = this.maker.addr;
      expect(ctrtMakerActual.equal(ctrtMakerExpected)).toBeTrue();
    });
  });

  describe('Test method makerLock & takerLock', function () {
    it('should be able to lock for maker & taker', async function () {
      const makerBalInit = await this.makerAc.getCtrtBal(this.maker.addr.data);
      const takerBalInit = await this.takerAc.getCtrtBal(this.taker.addr.data);

      const makerLockAmount = 1;
      const makerLockTimestamp = Date.now() + 1800 * 1000;
      const makerPuzzlePlain = 'abc';

      const makerLockTxInfo = await this.makerAc.makerLock(
        this.maker,
        makerLockAmount,
        this.taker.addr.data,
        makerPuzzlePlain,
        makerLockTimestamp
      );
      await this.waitForBlock();
      const makerLockTxId = makerLockTxInfo.id;
      await this.assertTxSuccess(makerLockTxId);

      const makerSwapOwner = await this.makerAc.getSwapOwner(makerLockTxId);
      expect(makerSwapOwner.equal(this.maker.addr)).toBeTrue();

      const makerSwapRcpt = await this.makerAc.getSwapRecipient(makerLockTxId);
      expect(makerSwapRcpt.equal(this.taker.addr)).toBeTrue();

      const makerSwapAmount = await this.makerAc.getSwapAmount(makerLockTxId);
      expect(makerSwapAmount.amount.toNumber()).toBe(makerLockAmount);

      const makerSwapExp = await this.makerAc.getSwapExpiredTime(makerLockTxId);
      expect(makerSwapExp.unixTs).toBe(makerLockTimestamp);

      const makerSwapStatus = await this.makerAc.getSwapStatus(makerLockTxId);
      expect(makerSwapStatus).toBeTrue();

      const makerPuzzleActual = await this.makerAc.getSwapPuzzle(makerLockTxId);
      const makerPuzzleExpected = bs58.encode(
        hs.sha256Hash(Buffer.from(makerPuzzlePlain, 'latin1'))
      );
      expect(makerPuzzleActual).toBe(makerPuzzleExpected);

      const makerBalAfterLockActual = (
        await this.makerAc.getCtrtBal(this.maker.addr.data)
      ).data;
      const makerBalAfterLockExpected =
        makerBalInit.amount.minus(makerLockAmount);
      expect(
        makerBalAfterLockActual.isEqualTo(makerBalAfterLockExpected)
      ).toBeTrue();

      // taker lock
      const takerLockAmount = 1;
      const takerLockTimestamp = Date.now() + 1500 * 1000;

      const takerLockTxInfo = await this.takerAc.takerLock(
        this.taker,
        takerLockAmount,
        this.makerAc.ctrtId.data,
        this.maker.addr.data,
        makerLockTxId,
        takerLockTimestamp
      );
      await this.waitForBlock();
      await this.assertTxSuccess(takerLockTxInfo.id);

      const takerBalAfterLockActual = (
        await this.takerAc.getCtrtBal(this.taker.addr.data)
      ).data;
      const takerBalAfterLockExpected =
        takerBalInit.amount.minus(takerLockAmount);
      expect(takerBalAfterLockActual.isEqualTo(takerBalAfterLockExpected));
    });
  });

  describe('Test method makerSolve & takerSolve', function () {
    it('should be able to lock for maker & taker', async function () {
      // maker lock
      const makerLockAmount = 1;
      const makerLockTimestamp = Date.now() + 1800 * 1000;
      const makerPuzzlePlain = 'abc';

      const makerLockTxInfo = await this.makerAc.makerLock(
        this.maker,
        makerLockAmount,
        this.taker.addr.data,
        makerPuzzlePlain,
        makerLockTimestamp
      );
      await this.waitForBlock();
      const makerLockTxId = makerLockTxInfo.id;
      await this.assertTxSuccess(makerLockTxId);

      // taker lock
      const takerLockAmount = 1;
      const takerLockTimestamp = Date.now() + 1500 * 1000;

      const takerLockTxInfo = await this.takerAc.takerLock(
        this.taker,
        takerLockAmount,
        this.makerAc.ctrtId.data,
        this.maker.addr.data,
        makerLockTxId,
        takerLockTimestamp
      );
      await this.waitForBlock();
      const takerLockTxId = takerLockTxInfo.id;
      await this.assertTxSuccess(takerLockTxId);

      // maker solve
      const makerSolveTxInfo = await this.makerAc.makerSolve(
        this.maker,
        this.takerAc.ctrtId.data,
        takerLockTxId,
        makerPuzzlePlain
      );
      await this.waitForBlock();
      const makerSolveTxId = makerSolveTxInfo.id;
      await this.assertTxSuccess(makerSolveTxId);

      const makerSolveTxInfoResp = await this.maker.api.tx.getInfo(
        makerSolveTxId
      );
      const funcData = makerSolveTxInfoResp.functionData;
      const ds = jv.de.DataStack.deserialize(
        Buffer.from(bs58.decode(funcData))
      );
      const revealedSecret = ds.entries[1].data.data.toString('latin1');
      expect(revealedSecret).toBe(makerPuzzlePlain);

      // taker solve
      const takerSolveTxInfo = await this.takerAc.takerSolve(
        this.taker,
        this.makerAc.ctrtId.data,
        makerLockTxId,
        makerSolveTxId
      );
      await this.waitForBlock();
      const takerSolveTxId = takerSolveTxInfo.id;
      await this.assertTxSuccess(takerSolveTxId);
    });
  });

  describe('Test method expWithdraw', function () {
    it('should be able to withdraw tokens on expiration', async function () {
      // maker lock
      const makerLockAmount = 1;
      const makerLockTimestamp = Date.now() + 8 * 1000;
      const makerPuzzlePlain = 'abc';

      const makerLockTxInfo = await this.makerAc.makerLock(
        this.maker,
        makerLockAmount,
        this.taker.addr.data,
        makerPuzzlePlain,
        makerLockTimestamp
      );
      await this.waitForBlock();
      const makerLockTxId = makerLockTxInfo.id;
      await this.assertTxSuccess(makerLockTxId);

      const balOld = await this.makerAc.getCtrtBal(this.maker.addr.data);
      await ut.sleep(10 * 1000);

      // expire withdraw
      const expWithdrawTxInfo = await this.makerAc.expWithdraw(
        this.maker,
        makerLockTxId
      );
      await this.waitForBlock();
      const expWithdrawTxId = expWithdrawTxInfo.id;
      await this.assertTxSuccess(expWithdrawTxId);

      const bal = await this.makerAc.getCtrtBal(this.maker.addr.data);
      expect(bal.amount.isEqualTo(balOld.amount.plus(1))).toBeTrue();
    });
  });
});
