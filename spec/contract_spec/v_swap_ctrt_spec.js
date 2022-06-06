/**
 * module VSwapCtrtSpec tests module contract/VSwapCtrt
 * @module VSwapCtrtSpec
 */

'use strict';

import * as jv from '../../src/index.js';

describe('Test class VSwapCtrt', function () {
  beforeEach(async function () {
    const TOK_MAX = 1_000_000_000;
    const HALF_TOK_MAX = TOK_MAX / 2;
    const TOK_UNIT = 1_000;
    const MIN_LIQ = 10;
    const INIT_AMOUNT = 10_000;

    const [tca, tcb, tcLiq] = await Promise.all([
      jv.TokCtrtWithoutSplit.register(this.acnt0, TOK_MAX, TOK_UNIT),
      jv.TokCtrtWithoutSplit.register(this.acnt0, TOK_MAX, TOK_UNIT),
      jv.TokCtrtWithoutSplit.register(this.acnt0, TOK_MAX, TOK_UNIT),
    ]);
    await this.waitForBlock();

    await Promise.all([
      tca.issue(this.acnt0, TOK_MAX),
      tcb.issue(this.acnt0, TOK_MAX),
      tcLiq.issue(this.acnt0, TOK_MAX),
    ]);
    await this.waitForBlock();

    await Promise.all([
      tca.send(this.acnt0, this.acnt1.addr.data, HALF_TOK_MAX),
      tcb.send(this.acnt0, this.acnt1.addr.data, HALF_TOK_MAX),
    ]);
    await this.waitForBlock();

    this.vc = await jv.VSwapCtrt.register(
      this.acnt0,
      tca.tokId.data,
      tcb.tokId.data,
      tcLiq.tokId.data,
      MIN_LIQ
    );
    await this.waitForBlock();

    await Promise.all([
      tca.deposit(this.acnt0, this.vc.ctrtId.data, HALF_TOK_MAX),
      tcb.deposit(this.acnt0, this.vc.ctrtId.data, HALF_TOK_MAX),
      tcLiq.deposit(this.acnt0, this.vc.ctrtId.data, TOK_MAX),
      tca.deposit(this.acnt1, this.vc.ctrtId.data, HALF_TOK_MAX),
      tcb.deposit(this.acnt1, this.vc.ctrtId.data, HALF_TOK_MAX),
    ]);
    await this.waitForBlock();

    await this.vc.setSwap(this.acnt0, INIT_AMOUNT, INIT_AMOUNT);
    await this.waitForBlock();
  });

  describe('Test method register', function () {
    it('should register an instance of V Swap Contract', async function () {
      const ctrtMakerActual = await this.vc.getMaker();
      const ctrtMakerExpected = await this.acnt0.addr;
      expect(ctrtMakerActual.equal(ctrtMakerExpected)).toBeTrue();
    });
  });

  describe('Test method setSwap', function () {
    it('should create a swap and deposit initial amounts into the pool', async function () {
      const swapStatus = await this.vc.getSwapStatus();
      expect(swapStatus).toBeTrue();
    });
  });

  describe('Test method addLiquidity', function () {
    it('should add liquidity to the pool', async function () {
      const DELTA = 10_000;
      const DELTA_MIN = 9_000;

      const [tokAResOld, tokBResOld, liqTokLeftOld] = await Promise.all([
        this.vc.getTokARes(),
        this.vc.getTokBRes(),
        this.vc.getLiqTokLeft(),
      ]);

      const tenSec = Date.now() + 10 * 1000;

      const addLiqTxInfo = await this.vc.addLiquidity(
        this.acnt0,
        DELTA,
        DELTA,
        DELTA_MIN,
        DELTA_MIN,
        tenSec
      );
      await this.waitForBlock();
      const addLiqTxId = addLiqTxInfo.id;
      await this.assertTxSuccess(addLiqTxId);

      const [tokARes, tokBRes, liqTokLeft] = await Promise.all([
        this.vc.getTokARes(),
        this.vc.getTokBRes(),
        this.vc.getLiqTokLeft(),
      ]);

      const tokAResNum = tokARes.amount.toNumber();
      const tokBResNum = tokBRes.amount.toNumber();
      const liqTokResNum = liqTokLeft.amount.toNumber();

      expect(tokAResNum).toBe(tokAResOld.amount.toNumber() + DELTA);
      expect(tokBResNum).toBe(tokBResOld.amount.toNumber() + DELTA);
      expect(liqTokResNum).toBe(liqTokLeftOld.amount.toNumber() - DELTA);
    });
  });

  describe('Test method removeLiquidity', function () {
    it('should remove liquidity from the pool', async function () {
      const DELTA = 1000;

      const [tokAResOld, tokBResOld, liqTokLeftOld] = await Promise.all([
        this.vc.getTokARes(),
        this.vc.getTokBRes(),
        this.vc.getLiqTokLeft(),
      ]);

      const tenSec = Date.now() + 10 * 1000;

      const removeLiqTxinfo = await this.vc.removeLiquidity(
        this.acnt0,
        DELTA,
        DELTA,
        DELTA,
        tenSec
      );
      await this.waitForBlock();
      const removeLiqTxId = removeLiqTxinfo.id;
      await this.assertTxSuccess(removeLiqTxId);

      const [tokARes, tokBRes, liqTokLeft] = await Promise.all([
        this.vc.getTokARes(),
        this.vc.getTokBRes(),
        this.vc.getLiqTokLeft(),
      ]);

      expect(liqTokLeft.amount.toNumber()).toBe(
        liqTokLeftOld.amount.toNumber() + DELTA
      );

      const tokARedeemed =
        tokAResOld.amount.toNumber() - tokARes.amount.toNumber();
      const tokBRedeemed =
        tokBResOld.amount.toNumber() - tokBRes.amount.toNumber();

      expect(tokARedeemed).toBeGreaterThanOrEqual(DELTA);
      expect(tokBRedeemed).toBeGreaterThanOrEqual(DELTA);
    });
  });

  describe('Test method swapBForExactA', function () {
    it('should swap token B for fix amount of token A', async function () {
      const amountA = 10;
      const amountBMax = 20;

      const [balAOld, balBOld] = await Promise.all([
        this.vc.getTokABal(this.acnt1.addr.data),
        this.vc.getTokBBal(this.acnt1.addr.data),
      ]);

      const tenSec = Date.now() + 10 * 1000;

      const respInfo = await this.vc.swapBForExactA(
        this.acnt1,
        amountA,
        amountBMax,
        tenSec
      );
      await this.waitForBlock();
      const swapTxId = respInfo.id;
      await this.assertTxSuccess(swapTxId);

      const [balA, balB] = await Promise.all([
        this.vc.getTokABal(this.acnt1.addr.data),
        this.vc.getTokBBal(this.acnt1.addr.data),
      ]);

      expect(balA.amount.toNumber()).toBe(balAOld.amount.toNumber() + amountA);
      expect(
        balBOld.amount.toNumber() - balB.amount.toNumber()
      ).toBeLessThanOrEqual(amountBMax);
    });
  });

  describe('Test method swapExactBForA', function () {
    it('should swap fix amount of token B for token A', async function () {
      const amountAMin = 10;
      const amountB = 20;

      const [balAOld, balBOld] = await Promise.all([
        this.vc.getTokABal(this.acnt1.addr.data),
        this.vc.getTokBBal(this.acnt1.addr.data),
      ]);

      const tenSec = Date.now() + 10 * 1000;

      const respInfo = await this.vc.swapExactBForA(
        this.acnt1,
        amountAMin,
        amountB,
        tenSec
      );
      await this.waitForBlock();
      const swapTxId = respInfo.id;
      await this.assertTxSuccess(swapTxId);

      const [balA, balB] = await Promise.all([
        this.vc.getTokABal(this.acnt1.addr.data),
        this.vc.getTokBBal(this.acnt1.addr.data),
      ]);

      expect(
        balA.amount.toNumber() - balAOld.amount.toNumber()
      ).toBeGreaterThanOrEqual(amountAMin);
      expect(balB.amount.toNumber()).toBe(balBOld.amount.toNumber() - amountB);
    });
  });

  describe('Test method swapAForExactB', function () {
    it('should swap token A for fix amount of token B', async function () {
      const amountAMax = 20;
      const amountB = 10;

      const [balAOld, balBOld] = await Promise.all([
        this.vc.getTokABal(this.acnt1.addr.data),
        this.vc.getTokBBal(this.acnt1.addr.data),
      ]);

      const tenSec = Date.now() + 10 * 1000;

      const respInfo = await this.vc.swapAForExactB(
        this.acnt1,
        amountAMax,
        amountB,
        tenSec
      );
      await this.waitForBlock();
      const swapTxId = respInfo.id;
      await this.assertTxSuccess(swapTxId);

      const [balA, balB] = await Promise.all([
        this.vc.getTokABal(this.acnt1.addr.data),
        this.vc.getTokBBal(this.acnt1.addr.data),
      ]);

      expect(
        balAOld.amount.toNumber() - balA.amount.toNumber()
      ).toBeLessThanOrEqual(amountAMax);
      expect(balB.amount.toNumber()).toBe(balBOld.amount.toNumber() + amountB);
    });
  });

  describe('Test method swapExactAForB', function () {
    it('should swap fix amount of token A for token B', async function () {
      const amountA = 20;
      const amountBMin = 10;

      const [balAOld, balBOld] = await Promise.all([
        this.vc.getTokABal(this.acnt1.addr.data),
        this.vc.getTokBBal(this.acnt1.addr.data),
      ]);

      const tenSec = Date.now() + 10 * 1000;

      const respInfo = await this.vc.swapExactAForB(
        this.acnt1,
        amountA,
        amountBMin,
        tenSec
      );
      await this.waitForBlock();
      const swapTxId = respInfo.id;
      await this.assertTxSuccess(swapTxId);

      const [balA, balB] = await Promise.all([
        this.vc.getTokABal(this.acnt1.addr.data),
        this.vc.getTokBBal(this.acnt1.addr.data),
      ]);

      expect(balA.amount.toNumber()).toBe(balAOld.amount.toNumber() - amountA);
      expect(
        balB.amount.toNumber() - balBOld.amount.toNumber()
      ).toBeGreaterThanOrEqual(amountBMin);
    });
  });
});
