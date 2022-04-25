/**
 * tokCtrtNoSplitSpec tests module contract/tokCtrtNoSplit
 * @module tokCtrtNoSplitSpec
 */

'use strict';

import * as jv from '../../src/index.js';

describe('Test class TokCtrtWithoutSplit', function () {
  beforeAll(async function () {
    this.max = 1000;
    this.unit = 1;

    this.tc = await jv.TokCtrtWithoutSplit.register(
      this.acnt0,
      this.max,
      this.unit
    );
    await this.waitForBlock();

    const resp = await this.tc.issue(this.acnt0, this.max);
    await this.waitForBlock();
    await this.assertTxSuccess(resp.id);

    const tokBal = await this.getTokBal(
      this.acnt0.addr.data,
      this.tc.tokId.data
    );

    expect(tokBal).toBe(this.max);
  });

  describe('Test method register', function () {
    it('should register an instance of Token Contract', async function () {
      const issuer = await this.tc.getIssuer();
      expect(issuer.equal(this.acnt0.addr)).toBeTrue();

      const maker = await this.tc.getMaker();
      expect(maker.equal(this.acnt0.addr)).toBeTrue();

      const unit = await this.tc.getUnit();
      expect(unit).toBe(this.unit);
    });
  });

  describe('Test method supersede', function () {
    it('should supersede the issuer role to another account', async function () {
      const maker = this.acnt0;
      const oldIssuer = this.acnt0;
      const newIssuer = this.acnt1;

      const oldIssuerAddr = await this.tc.getIssuer();
      expect(oldIssuerAddr.equal(oldIssuer.addr)).toBeTrue();

      const resp = await this.tc.supersede(maker, newIssuer.addr.data);
      await this.waitForBlock();
      await this.assertTxSuccess(resp.id);

      const newIssuerAddr = await this.tc.getIssuer();
      expect(newIssuerAddr.equal(newIssuer.addr)).toBeTrue();

      await this.tc.supersede(maker, oldIssuer.addr.data);
      await this.waitForBlock();
    });
  });

  describe('Test method send', function () {
    it('should send tokens to the recipient', async function () {
      const sender = this.acnt0;
      const recipient = this.acnt1;
      const tokId = this.tc.tokId;
      const amount = 50;

      const senderBalBefore = await this.getTokBal(
        sender.addr.data,
        tokId.data
      );
      const recipientBalBefore = await this.getTokBal(
        recipient.addr.data,
        tokId.data
      );

      const resp = await this.tc.send(sender, recipient.addr.data, amount);
      await this.waitForBlock();
      await this.assertTxSuccess(resp.id);

      const senderBalAfter = await this.getTokBal(sender.addr.data, tokId.data);
      const recipientBalAfter = await this.getTokBal(
        recipient.addr.data,
        tokId.data
      );

      const senderLoss = senderBalBefore - senderBalAfter;
      expect(senderLoss).toBe(amount);

      const rcptGain = recipientBalAfter - recipientBalBefore;
      expect(rcptGain).toBe(amount);
    });
  });

  describe('Test method transfer', function () {
    it('should send tokens to the recipient', async function () {
      const sender = this.acnt0;
      const recipient = this.acnt1;
      const tokId = this.tc.tokId;
      const amount = 50;

      const senderBalBefore = await this.getTokBal(
        sender.addr.data,
        tokId.data
      );
      const recipientBalBefore = await this.getTokBal(
        recipient.addr.data,
        tokId.data
      );

      const resp = await this.tc.transfer(
        sender,
        sender.addr.data,
        recipient.addr.data,
        amount
      );
      await this.waitForBlock();
      await this.assertTxSuccess(resp.id);

      const senderBalAfter = await this.getTokBal(sender.addr.data, tokId.data);
      const recipientBalAfter = await this.getTokBal(
        recipient.addr.data,
        tokId.data
      );

      const senderLoss = senderBalBefore - senderBalAfter;
      expect(senderLoss).toBe(amount);

      const rcptGain = recipientBalAfter - recipientBalBefore;
      expect(rcptGain).toBe(amount);
    });
  });

  describe('Test method deposit & withdraw', function () {
    beforeAll(async function () {
      this.lc = await jv.LockCtrt.register(this.acnt0, this.tc.tokId.data);
      await this.waitForBlock();
    });

    it('should be able to deposit into and withdraw from a contract', async function () {
      const amount = 100;
      const acnt = this.acnt0;

      const ctrtBalInit = await this.lc.getCtrtBal(acnt.addr.data);
      const acntBalInit = await this.getTokBal(
        acnt.addr.data,
        this.tc.tokId.data
      );

      // deposit
      const depResp = await this.tc.deposit(acnt, this.lc.ctrtId.data, amount);
      await this.waitForBlock();
      await this.assertTxSuccess(depResp.id);

      const ctrtBalDep = await this.lc.getCtrtBal(acnt.addr.data);
      const ctrtBalGainActual = ctrtBalDep.data.minus(ctrtBalInit.data);
      const ctrtBalGainExpected = jv.Token.forAmount(amount, this.unit).data;
      expect(ctrtBalGainActual.isEqualTo(ctrtBalGainExpected)).toBeTrue();

      const acntBalDep = await this.getTokBal(
        acnt.addr.data,
        this.tc.tokId.data
      );

      // withdraw
      const withResp = await this.tc.withdraw(
        acnt,
        this.lc.ctrtId.data,
        amount
      );
      await this.waitForBlock();
      await this.assertTxSuccess(withResp.id);

      const ctrtBalWith = await this.lc.getCtrtBal(acnt.addr.data);
      const ctrtBalLossActual = ctrtBalDep.data.minus(ctrtBalWith.data);
      const ctrtBalLossExpected = jv.Token.forAmount(amount, this.unit).data;
      expect(ctrtBalLossActual.isEqualTo(ctrtBalLossExpected)).toBeTrue();
    });
  });
});
