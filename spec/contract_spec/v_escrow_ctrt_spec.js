/**
 * module VEscrowCtrtSpec tests module contract/VEscrowCtrt
 * @module VEscrowCtrtSpec
 */

'use strict';

import * as jv from '../../src/index.js';

describe('Test class VEscrowCtrt', function () {
  beforeEach(async function () {
    const TOK_EACH = 1_000_000_000;
    const TOK_TOTAL = TOK_EACH * 3;
    const TOK_UNIT = 100;

    const ORDER_AMOUNT = 10;
    const RCPT_DEPOSIT_AMOUNT = 2;
    const JUDGE_DEPOSIT_AMOUNT = 3;
    const ORDER_FEE = 4;
    const REFUND_AMOUNT = 5;
    const CTRT_DEPOSIT_AMOUNT = 50;
    const ORDER_PERIOD = 45; // in seconds
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
      this.tc._tokId.data,
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
  });

  describe('Test method register', function () {
    it('should register an instance of V Swap Contract', async function () {
      const ctrtMakerActual = await this.vc.getMaker();
      const ctrtMakerExpected = await this.acnt0.addr;
      const ctrtJudgeActual = await this.vc.getJudge();
      const ctrtJudgeExpected = await this.acnt0.addr;
      expect(ctrtMakerActual.equal(ctrtMakerExpected)).toBeTrue();
      expect(ctrtJudgeActual.equal(ctrtJudgeExpected)).toBeTrue();

      const duration = await this.vc.getDuration();
      expect(this.AVG_BLOCK_DELAY * 2).toBe(duration.unixTs);

      expect(await this.vc.getUnit()).toBe(await this.tc.getUnit());
    });
  });
});
