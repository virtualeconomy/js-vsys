/**
 * module VEscrowCtrtSpec tests module contract/VEscrowCtrt
 * @module VEscrowCtrtSpec
 */

'use strict';

import * as jv from '../../src/index.js';
import * as bn from '../../src/utils/big_number.js';
import * as ut from '../helpers/utils.js';

describe('Test class VEscrowCtrt', function () {
  beforeEach(async function () {
    const TOK_EACH = 1_000_000_000;
    const TOK_TOTAL = TOK_EACH * 3;
    const TOK_UNIT = 100;

    const CTRT_DEPOSIT_AMOUNT = 100;
    const DURATION = this.AVG_BLOCK_DELAY * 2;

    this.maker = this.acnt0;
    this.judge = this.acnt0;
    this.payer = this.acnt1;
    this.recipient = this.acnt2;

    this.tc = await jv.TokCtrtWithoutSplit.register(
      this.acnt0,
      TOK_TOTAL,
      TOK_UNIT
    );
    await this.waitForBlock();

    await this.tc.issue(this.acnt0, TOK_TOTAL);
    await this.waitForBlock();

    await Promise.all([
      this.tc.send(this.acnt0, this.acnt1.addr.data, TOK_EACH),
      this.tc.send(this.acnt0, this.acnt2.addr.data, TOK_EACH),
    ]);
    await this.waitForBlock();

    this.vc = await jv.VEscrowCtrt.register(
      this.acnt0,
      this.tc.tokId.data,
      DURATION,
      DURATION
    );
    await this.waitForBlock();

    await Promise.all([
      this.tc.deposit(this.acnt0, this.vc.ctrtId.data, CTRT_DEPOSIT_AMOUNT),
      this.tc.deposit(this.acnt1, this.vc.ctrtId.data, CTRT_DEPOSIT_AMOUNT),
      this.tc.deposit(this.acnt2, this.vc.ctrtId.data, CTRT_DEPOSIT_AMOUNT),
    ]);
    await this.waitForBlock();

    this.expTime = Date.now() + 45 * 1000;

    const resp = await this.vc.create(
      this.payer,
      this.recipient.addr.data,
      10,
      2,
      3,
      4,
      5,
      this.expTime
    );
    await this.waitForBlock();
    this.orderId = resp.id;
    await this.assertTxSuccess(this.orderId);
  });

  describe('Test method register', function () {
    it('should register an instance of V Swap Contract', async function () {
      const ctrtMakerActual = await this.vc.getMaker();
      const ctrtMakerExpected = await this.acnt0.addr;
      const ctrtJudgeActual = await this.vc.getJudge();
      const ctrtJudgeExpected = await this.acnt0.addr;
      expect(ctrtMakerActual.equal(ctrtMakerExpected)).toBeTrue();
      expect(ctrtJudgeActual.equal(ctrtJudgeExpected)).toBeTrue();

      expect(await this.vc.getUnit()).toBe(await this.tc.getUnit());
    });
  });

  describe('Test method create', function () {
    it('should create an escrow order', async function () {
      const ORDER_AMOUNT = 10;
      const RCPT_DEPOSIT_AMOUNT = 2;
      const JUDGE_DEPOSIT_AMOUNT = 3;
      const ORDER_FEE = 4;
      const REFUND_AMOUNT = 5;

      const orderAmount = await this.vc.getOrderAmount(this.orderId);
      const orderRcptDeposit = await this.vc.getOrderRcptDeposit(this.orderId);
      const orderJudgeDeposit = await this.vc.getOrderJudgeDeposit(
        this.orderId
      );
      const orderFee = await this.vc.getOrderFee(this.orderId);
      const orderRcptAmount = await this.vc.getOrderRcptAmount(this.orderId);
      const orderRefund = await this.vc.getOrderRefund(this.orderId);

      expect(await this.vc.getOrderPayer(this.orderId)).toEqual(
        this.payer.addr
      );
      expect(await this.vc.getOrderRcpt(this.orderId)).toEqual(
        this.recipient.addr
      );
      expect(orderAmount.amount).toEqual(new bn.BigNumber(ORDER_AMOUNT));
      expect(orderRcptDeposit.amount).toEqual(
        new bn.BigNumber(RCPT_DEPOSIT_AMOUNT)
      );
      expect(orderJudgeDeposit.amount).toEqual(
        new bn.BigNumber(JUDGE_DEPOSIT_AMOUNT)
      );
      expect(orderFee.amount).toEqual(new bn.BigNumber(ORDER_FEE));
      expect(orderRcptAmount.amount).toEqual(
        new bn.BigNumber(ORDER_AMOUNT - ORDER_FEE)
      );
      expect(orderRefund.amount).toEqual(new bn.BigNumber(REFUND_AMOUNT));
    });
  });

  describe('Test method recipientDeposit', function () {
    it('should deposit tokens the recipient deposited into the contract into the order', async function () {
      expect(await this.vc.getOrderRcptDepositStatus(this.orderId)).toBeFalse();
      const amount = await this.vc.getOrderRcptLockedAmount(this.orderId);
      expect(amount.amount).toEqual(new bn.BigNumber(0));

      const resp = await this.vc.recipientDeposit(this.recipient, this.orderId);
      await this.waitForBlock();
      const txId = resp.id;
      await this.assertTxSuccess(txId);

      const lockAmount = await this.vc.getOrderRcptLockedAmount(this.orderId);

      expect(await this.vc.getOrderRcptDepositStatus(this.orderId)).toBeTrue();
      expect(lockAmount.amount).toEqual(new bn.BigNumber(2));
    });
  });

  describe('Test method judgeDeposit', function () {
    it('should deposit tokens the judge deposited into the contract into the order', async function () {
      expect(
        await this.vc.getOrderJudgeDepositStatus(this.orderId)
      ).toBeFalse();
      const amount = await this.vc.getOrderRcptLockedAmount(this.orderId);
      expect(amount.amount).toEqual(bn.BigNumber(0));

      const resp = await this.vc.judgeDeposit(this.judge, this.orderId);
      await this.waitForBlock();
      const txId = resp.id;
      await this.assertTxSuccess(txId);

      const judgeLocked = await this.vc.getOrderJudgeLockedAmount(this.orderId);

      expect(await this.vc.getOrderJudgeDepositStatus(this.orderId)).toBeTrue();
      expect(judgeLocked.amount).toEqual(new bn.BigNumber(3));
    });
  });

  describe('Test method payerCancel', function () {
    it('should cancel the order by the payer', async function () {
      expect(await this.vc.getOrderStatus(this.orderId)).toBeTrue();

      const resp = await this.vc.payerCancel(this.payer, this.orderId);
      await this.waitForBlock();
      const txId = resp.id;
      await this.assertTxSuccess(txId);

      expect(await this.vc.getOrderStatus(this.orderId)).toBeFalse();
    });
  });

  describe('Test method recipientCancel', function () {
    it('should cancel the order by the recipient', async function () {
      expect(await this.vc.getOrderStatus(this.orderId)).toBeTrue();

      const resp = await this.vc.recipientCancel(this.recipient, this.orderId);
      await this.waitForBlock();
      const txId = resp.id;
      await this.assertTxSuccess(txId);

      expect(await this.vc.getOrderStatus(this.orderId)).toBeFalse();
    });
  });

  describe('Test method judgeCancel', function () {
    it('should cancel the order by the judge', async function () {
      expect(await this.vc.getOrderStatus(this.orderId)).toBeTrue();

      const resp = await this.vc.judgeCancel(this.judge, this.orderId);
      await this.waitForBlock();
      const txId = resp.id;
      await this.assertTxSuccess(txId);

      expect(await this.vc.getOrderStatus(this.orderId)).toBeFalse();
    });
  });

  describe('Test method submitWork', function () {
    it('should submit the work by the recipient', async function () {
      const resp1 = await this.vc.judgeDeposit(this.judge, this.orderId);
      const resp2 = await this.vc.recipientDeposit(
        this.recipient,
        this.orderId
      );
      await this.waitForBlock();
      const txId1 = resp1.id;
      const txId2 = resp2.id;
      await Promise.all([
        this.assertTxSuccess(txId1),
        this.assertTxSuccess(txId2),
      ]);

      expect(await this.vc.getOrderSubmitStatus(this.orderId)).toBeFalse();

      const resp = await this.vc.submitWork(this.recipient, this.orderId);
      await this.waitForBlock();
      const txId = resp.id;
      await this.assertTxSuccess(txId);

      expect(await this.vc.getOrderSubmitStatus(this.orderId)).toBeTrue();
    });
  });

  describe('Test method approveWork', function () {
    it('should approve the work and agrees the amounts are paid by the payer', async function () {
      const resp1 = await this.vc.judgeDeposit(this.judge, this.orderId);
      const resp2 = await this.vc.recipientDeposit(
        this.recipient,
        this.orderId
      );
      await this.waitForBlock();
      const resp3 = await this.vc.submitWork(this.recipient, this.orderId);
      await this.waitForBlock();

      const txId1 = resp1.id;
      const txId2 = resp2.id;
      const txId3 = resp3.id;

      await Promise.all([
        this.assertTxSuccess(txId1),
        this.assertTxSuccess(txId2),
        this.assertTxSuccess(txId3),
      ]); // the above is to submit work.

      const [rcptBalOld, judgeBalOld] = await Promise.all([
        this.vc.getCtrtBal(this.recipient.addr.data),
        this.vc.getCtrtBal(this.judge.addr.data),
      ]);

      expect(await this.vc.getOrderStatus(this.orderId)).toBeTrue();

      const resp = await this.vc.approveWork(this.payer, this.orderId);
      await this.waitForBlock();
      const txId = resp.id;
      await this.assertTxSuccess(txId);

      expect(await this.vc.getOrderStatus(this.orderId)).toBeFalse();
      const [rcptAmt, fee, rcptDep, judgeDep, rcptBal, judgeBal] =
        await Promise.all([
          this.vc.getOrderRcptAmount(this.orderId),
          this.vc.getOrderFee(this.orderId),
          this.vc.getOrderRcptDeposit(this.orderId),
          this.vc.getOrderJudgeDeposit(this.orderId),
          this.vc.getCtrtBal(this.recipient.addr.data),
          this.vc.getCtrtBal(this.judge.addr.data),
        ]);

      expect(rcptBal.amount.minus(rcptBalOld.amount)).toEqual(
        rcptAmt.amount.plus(rcptDep.amount)
      );
      expect(judgeBal.amount.minus(judgeBalOld.amount)).toEqual(
        fee.amount.plus(judgeDep.amount)
      );
    });
  });

  describe('Test method applyToJudge and doJudge', function () {
    it('should apply for the help from judge by the payer and do judge', async function () {
      const resp1 = await this.vc.judgeDeposit(this.judge, this.orderId);
      const resp2 = await this.vc.recipientDeposit(
        this.recipient,
        this.orderId
      );
      await this.waitForBlock();
      const resp3 = await this.vc.submitWork(this.recipient, this.orderId);
      await this.waitForBlock();

      const txId1 = resp1.id;
      const txId2 = resp2.id;
      const txId3 = resp3.id;

      await Promise.all([
        this.assertTxSuccess(txId1),
        this.assertTxSuccess(txId2),
        this.assertTxSuccess(txId3),
      ]); // the above is to submit work.

      const [payerBalOld, rcptBalOld, judgeBalOld] = await Promise.all([
        this.vc.getCtrtBal(this.payer.addr.data),
        this.vc.getCtrtBal(this.recipient.addr.data),
        this.vc.getCtrtBal(this.judge.addr.data),
      ]);

      expect(await this.vc.getOrderStatus(this.orderId)).toBeTrue();

      const resp4 = await this.vc.applyToJudge(this.payer, this.orderId);
      await this.waitForBlock();
      const txId4 = resp4.id;
      await this.assertTxSuccess(txId4);

      const toPayer = 3;
      const toRcpt = 5;

      const resp5 = await this.vc.doJudge(
        this.judge,
        this.orderId,
        toPayer,
        toRcpt
      );
      await this.waitForBlock();
      const txId5 = resp5.id;
      await this.assertTxSuccess(txId5);

      expect(await this.vc.getOrderStatus(this.orderId)).toBeFalse();

      const [fee, judgeDep, payerBal, rcptBal, judgeBal] = await Promise.all([
        this.vc.getOrderFee(this.orderId),
        this.vc.getOrderJudgeDeposit(this.orderId),
        this.vc.getCtrtBal(this.payer.addr.data),
        this.vc.getCtrtBal(this.recipient.addr.data),
        this.vc.getCtrtBal(this.judge.addr.data),
      ]);
      expect(payerBal.amount.minus(payerBalOld.amount)).toEqual(
        bn.BigNumber(toPayer)
      );
      expect(rcptBal.amount.minus(rcptBalOld.amount)).toEqual(
        bn.BigNumber(toRcpt)
      );
      expect(judgeBal.amount.minus(judgeBalOld.amount)).toEqual(
        fee.amount.plus(judgeDep.amount)
      );
    });
  });

  describe('Test method submit penalty', function () {
    it('should submit penalty', async function () {
      const expTime = Date.now() + 5 * 1000;
      const newOrderTx = await this.vc.create(
        this.payer,
        this.recipient.addr.data,
        10,
        2,
        3,
        4,
        5,
        expTime
      );
      await this.waitForBlock();
      const newOrderId = newOrderTx.id;
      await this.assertTxSuccess(newOrderId);

      const resp1 = await this.vc.judgeDeposit(this.judge, newOrderId);
      const resp2 = await this.vc.recipientDeposit(this.recipient, newOrderId);
      await this.waitForBlock();

      const txId1 = resp1.id;
      const txId2 = resp2.id;

      await Promise.all([
        this.assertTxSuccess(txId1),
        this.assertTxSuccess(txId2),
      ]); // the above is to submit work.

      const [payerBalOld, judgeBalOld, expireAt] = await Promise.all([
        this.vc.getCtrtBal(this.payer.addr.data),
        this.vc.getCtrtBal(this.judge.addr.data),
        this.vc.getOrderExpTime(newOrderId),
      ]);

      expect(await this.vc.getOrderStatus(newOrderId)).toBeTrue();

      const now = Date.now();
      await ut.sleep(expireAt.unitTs - now + this.AVG_BLOCK_DELAY);

      const resp3 = await this.vc.submitPenalty(this.payer, newOrderId);
      await this.waitForBlock();
      const txId3 = resp3.id;
      await this.assertTxSuccess(txId3);

      expect(await this.vc.getOrderStatus(newOrderId)).toBeFalse();

      const [rcptAmt, rcptDep, fee, judgeDep, payerBal, judgeBal] =
        await Promise.all([
          this.vc.getOrderRcptAmount(newOrderId),
          this.vc.getOrderRcptDeposit(newOrderId),
          this.vc.getOrderFee(newOrderId),
          this.vc.getOrderJudgeDeposit(newOrderId),
          this.vc.getCtrtBal(this.payer.addr.data),
          this.vc.getCtrtBal(this.judge.addr.data),
        ]);

      expect(payerBal.amount.minus(payerBalOld.amount)).toEqual(
        rcptAmt.amount.plus(rcptDep.amount)
      );
      expect(judgeBal.amount.minus(judgeBalOld.amount)).toEqual(
        fee.amount.plus(judgeDep.amount)
      );
    });
  });

  describe('Test method payerRefund', function () {
    it('should make the refund action by the payer', async function () {
      const resp1 = await this.vc.judgeDeposit(this.judge, this.orderId);
      const resp2 = await this.vc.recipientDeposit(
        this.recipient,
        this.orderId
      );
      await this.waitForBlock();
      const resp3 = await this.vc.submitWork(this.recipient, this.orderId);
      await this.waitForBlock();

      const txId1 = resp1.id;
      const txId2 = resp2.id;
      const txId3 = resp3.id;

      await Promise.all([
        this.assertTxSuccess(txId1),
        this.assertTxSuccess(txId2),
        this.assertTxSuccess(txId3),
      ]); // the above is to submit work.

      const [payerBalOld, rcptBalOld, expireAt] = await Promise.all([
        this.vc.getCtrtBal(this.payer.addr.data),
        this.vc.getCtrtBal(this.recipient.addr.data),
        this.vc.getOrderExpTime(this.orderId),
      ]);

      expect(await this.vc.getOrderStatus(this.orderId)).toBeTrue();

      const resp4 = await this.vc.applyToJudge(this.payer, this.orderId);
      await this.waitForBlock();
      const txId4 = resp4.id;
      await this.assertTxSuccess(txId4);

      const now = Date.now();
      await ut.sleep(
        expireAt.unixTs / 1000000 - now + this.AVG_BLOCK_DELAY * 1000
      );

      const resp5 = await this.vc.payerRefund(this.payer, this.orderId);
      await this.waitForBlock();
      const txId5 = resp5.id;
      await this.assertTxSuccess(txId5);

      expect(await this.vc.getOrderStatus(this.orderId)).toBeFalse();

      const [payerRefund, rcptRefund, payerBal, rcptBal] = await Promise.all([
        this.vc.getOrderRefund(this.orderId),
        this.vc.getOrderRcptRefund(this.orderId),
        this.vc.getCtrtBal(this.payer.addr.data),
        this.vc.getCtrtBal(this.recipient.addr.data),
      ]);

      expect(payerBal.amount.minus(payerBalOld.amount)).toEqual(
        payerRefund.amount
      );
      expect(rcptBal.amount.minus(rcptBalOld.amount)).toEqual(
        rcptRefund.amount
      );
    });
  });

  describe('Test method rcptRefund', function () {
    it('should make the refund action by the recipient', async function () {
      const resp1 = await this.vc.judgeDeposit(this.judge, this.orderId);
      const resp2 = await this.vc.recipientDeposit(
        this.recipient,
        this.orderId
      );
      await this.waitForBlock();
      const resp3 = await this.vc.submitWork(this.recipient, this.orderId);
      await this.waitForBlock();

      const txId1 = resp1.id;
      const txId2 = resp2.id;
      const txId3 = resp3.id;

      await Promise.all([
        this.assertTxSuccess(txId1),
        this.assertTxSuccess(txId2),
        this.assertTxSuccess(txId3),
      ]); // the above is to submit work.

      const [payerBalOld, rcptBalOld, expireAt] = await Promise.all([
        this.vc.getCtrtBal(this.payer.addr.data),
        this.vc.getCtrtBal(this.recipient.addr.data),
        this.vc.getOrderExpTime(this.orderId),
      ]);

      expect(await this.vc.getOrderStatus(this.orderId)).toBeTrue();

      const resp4 = await this.vc.applyToJudge(this.payer, this.orderId);
      await this.waitForBlock();
      const txId4 = resp4.id;
      await this.assertTxSuccess(txId4);

      const now = Date.now();
      await ut.sleep(
        expireAt.unixTs / 1000000 - now + this.AVG_BLOCK_DELAY * 1000
      );

      const resp5 = await this.vc.rcptRefund(this.recipient, this.orderId);
      await this.waitForBlock();
      const txId5 = resp5.id;
      await this.assertTxSuccess(txId5);

      expect(await this.vc.getOrderStatus(this.orderId)).toBeFalse();

      const [payerRefund, rcptRefund, payerBal, rcptBal] = await Promise.all([
        this.vc.getOrderRefund(this.orderId),
        this.vc.getOrderRcptRefund(this.orderId),
        this.vc.getCtrtBal(this.payer.addr.data),
        this.vc.getCtrtBal(this.recipient.addr.data),
      ]);

      expect(payerBal.amount.minus(payerBalOld.amount)).toEqual(
        payerRefund.amount
      );
      expect(rcptBal.amount.minus(rcptBalOld.amount)).toEqual(
        rcptRefund.amount
      );
    });
  });

  describe('Test method collect', function () {
    it('should collect the order amount & recipient deposited amount by the recipient', async function () {
      const resp1 = await this.vc.judgeDeposit(this.judge, this.orderId);
      const resp2 = await this.vc.recipientDeposit(
        this.recipient,
        this.orderId
      );
      await this.waitForBlock();
      const resp3 = await this.vc.submitWork(this.recipient, this.orderId);
      await this.waitForBlock();

      const txId1 = resp1.id;
      const txId2 = resp2.id;
      const txId3 = resp3.id;

      await Promise.all([
        this.assertTxSuccess(txId1),
        this.assertTxSuccess(txId2),
        this.assertTxSuccess(txId3),
      ]); // the above is to submit work.

      const [rcptBalOld, judgeBalOld, expireAt] = await Promise.all([
        this.vc.getCtrtBal(this.recipient.addr.data),
        this.vc.getCtrtBal(this.judge.addr.data),
        this.vc.getOrderExpTime(this.orderId),
      ]);

      expect(await this.vc.getOrderStatus(this.orderId)).toBeTrue();

      const now = Date.now();
      await ut.sleep(
        expireAt.unixTs / 1000000 - now + this.AVG_BLOCK_DELAY * 1000
      );

      const resp4 = await this.vc.collect(this.recipient, this.orderId);
      await this.waitForBlock();
      const txId4 = resp4.id;
      await this.assertTxSuccess(txId4);

      expect(await this.vc.getOrderStatus(this.orderId)).toBeFalse();

      const [rcptBal, rcptAmt, rcptDep, judgeBal, fee, judgeDep] =
        await Promise.all([
          this.vc.getCtrtBal(this.recipient.addr.data),
          this.vc.getOrderRcptAmount(this.orderId),
          this.vc.getOrderRcptDeposit(this.orderId),
          this.vc.getCtrtBal(this.judge.addr.data),
          this.vc.getOrderFee(this.orderId),
          this.vc.getOrderJudgeDeposit(this.orderId),
        ]);

      expect(rcptBal.amount.minus(rcptBalOld.amount)).toEqual(
        rcptAmt.amount.plus(rcptDep.amount)
      );
      expect(judgeBal.amount.minus(judgeBalOld.amount)).toEqual(
        fee.amount.plus(judgeDep.amount)
      );
    });
  });
});
