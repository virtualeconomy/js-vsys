/**
 * module VStableSwapCtrtSpec tests module contract/VStableSwapCtrt
 * @module VStableSwapCtrtSpec
 */

'use strict';

import * as jv from '../../src/index.js';
import * as bn from '../../src/utils/big_number.js';

describe('Test class VStableSwapCtrt', function () {
  beforeEach(async function () {
    const [baseTc, targetTc] = await Promise.all([
      jv.TokCtrtWithoutSplit.register(this.acnt0, 1000, 1),
      jv.TokCtrtWithoutSplit.register(this.acnt0, 1000, 1),
    ]);
    await this.waitForBlock();

    await Promise.all([
      baseTc.issue(this.acnt0, 1000),
      targetTc.issue(this.acnt0, 1000),
    ]);
    await this.waitForBlock();

    this.vc = await jv.StableSwapCtrt.register(
      this.acnt0,
      baseTc.tokId.data,
      targetTc.tokId.data,
      5,
      1,
      1
    );
    await this.waitForBlock();

    await Promise.all([
      baseTc.deposit(this.acnt0, this.vc.ctrtId.data, 1000),
      targetTc.deposit(this.acnt0, this.vc.ctrtId.data, 1000),
    ]);
    await this.waitForBlock();

    const orderResp = await this.vc.setOrder(
      this.acnt0,
      1,
      1,
      0,
      100,
      0,
      100,
      1,
      1,
      500,
      500
    );
    await this.waitForBlock();
    this.orderId = orderResp.id;
  });

  describe('Test method register', function () {
    it('should register an instance of V Stable Swap Contract', async function () {
      const ctrtMakerActual = await this.vc.getMaker();
      const ctrtMakerExpected = await this.acnt0.addr;
      expect(ctrtMakerActual.equal(ctrtMakerExpected)).toBeTrue();
    });
  });

  describe('Test method setOrder&updateOrder', function () {
    it('should create an order', async function () {
      const orderStatus = await this.vc.getOrderStatus(this.orderId);
      expect(orderStatus).toBeTrue();

      const updateResp = await this.vc.updateOrder(
        this.acnt0,
        this.orderId,
        1,
        1,
        0,
        100,
        0,
        100,
        1,
        1
      );
      await this.waitForBlock();
      const updateTxId = updateResp.id;
      await this.assertTxSuccess(updateTxId);

      const priceBase = await this.vc.getPriceBase(this.orderId);
      expect(priceBase.data).toEqual(bn.BigNumber(1));
    });
  });

  describe('Test method orderDeposit&orderWithdraw', function () {
    it('should lock and unlock the tokens', async function () {
      const depositResp = await this.vc.orderDeposit(
        this.acnt0,
        this.orderId,
        200,
        100
      );
      await this.waitForBlock();
      const depositTxId = depositResp.id;
      await this.assertTxSuccess(depositTxId);

      const [baseTokBalOld, targetTokBalOld] = await Promise.all([
        this.vc.getBaseTokBal(this.acnt0.addr.data),
        this.vc.getTargetTokBal(this.acnt0.addr.data),
      ]);
      expect(baseTokBalOld.data).toEqual(bn.BigNumber(300));
      expect(targetTokBalOld.data).toEqual(bn.BigNumber(400));

      const withdrawResp = await this.vc.orderWithdraw(
        this.acnt0,
        this.orderId,
        200,
        100
      );
      await this.waitForBlock();
      const withdrawTxId = withdrawResp.id;
      await this.assertTxSuccess(withdrawTxId);

      const [baseTokBalNew, targetTokBalNew] = await Promise.all([
        this.vc.getBaseTokBal(this.acnt0.addr.data),
        this.vc.getTargetTokBal(this.acnt0.addr.data),
      ]);
      expect(baseTokBalNew.data).toEqual(bn.BigNumber(500));
      expect(targetTokBalNew.data).toEqual(bn.BigNumber(500));
    });
  });

  describe('Test method swap', function () {
    it('should swap base to target, and swap target to base', async function () {
      const deadline = Date.now() + 1500 * 1000;

      const swapResp1 = await this.vc.swapBaseToTarget(
        this.acnt0,
        this.orderId,
        10,
        1,
        1,
        deadline
      );
      await this.waitForBlock();
      const swapTxId1 = swapResp1.id;
      await this.assertTxSuccess(swapTxId1);

      const [baseTokBal1, targetTokBal1] = await Promise.all([
        this.vc.getBaseTokBal(this.acnt0.addr.data),
        this.vc.getTargetTokBal(this.acnt0.addr.data),
      ]);
      expect(baseTokBal1.data).toEqual(bn.BigNumber(490));
      expect(targetTokBal1.data).toEqual(bn.BigNumber(509));

      const swapResp2 = await this.vc.swapTargetToBase(
        this.acnt0,
        this.orderId,
        10,
        1,
        1,
        deadline
      );
      await this.waitForBlock();
      const swapTxId2 = swapResp2.id;
      await this.assertTxSuccess(swapTxId2);

      const [baseTokBal2, targetTokBal2] = await Promise.all([
        this.vc.getBaseTokBal(this.acnt0.addr.data),
        this.vc.getTargetTokBal(this.acnt0.addr.data),
      ]);
      expect(baseTokBal2.data).toEqual(bn.BigNumber(499));
      expect(targetTokBal2.data).toEqual(bn.BigNumber(499));
    });
  });

  describe('Test method closeOrder', function () {
    it('should close the order', async function () {
      expect(await this.vc.getOrderStatus(this.orderId)).toBeTrue();

      const respInfo = await this.vc.closeOrder(this.acnt0, this.orderId);
      await this.waitForBlock();
      const txId = respInfo.id;
      await this.assertTxSuccess(txId);

      expect(await this.vc.getOrderStatus(this.orderId)).toBeFalse();
    });
  });
});
