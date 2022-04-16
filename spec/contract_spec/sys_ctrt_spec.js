/**
 * sysCtrtSpec tests module contract/sysCtrt
 * @module sysCtrtSpec
 */

'use strict';

import * as jv from '../../src/index.js';

describe('Test class SysCtrt', function () {
  beforeAll(function () {
    this.sc = jv.SysCtrt.forTestnet();
  });

  describe('Test method send', function () {
    it('should send VSYS coins to the recipient', async function () {
      const sender = this.acnt0;
      const recipient = this.acnt1;
      const amount = 1;

      const senderBalBefore = await sender.getBal();
      const recipientBalBefore = await recipient.getBal();

      const resp = await this.sc.send(sender, recipient.addr.data, amount);
      await this.waitForBlock();
      await this.assertTxSuccess(resp.id);

      const senderBalAfter = await sender.getBal();
      const recipientBalAfter = await recipient.getBal();

      const senderCostActual = senderBalBefore.data.minus(senderBalAfter.data);
      const senderCostExpected = jv.VSYS.forAmount(amount).data.plus(
        jv.ExecCtrtFee.default().data
      );
      expect(senderCostActual.isEqualTo(senderCostExpected)).toBeTrue();

      const recipientGainActual = recipientBalAfter.data.minus(
        recipientBalBefore.data
      );
      const recipientGainExpected = jv.VSYS.forAmount(amount).data;
      expect(recipientGainActual.isEqualTo(recipientGainExpected)).toBeTrue();
    });
  });

  describe('Test method transfer', function () {
    it('should send VSYS coins to the recipient', async function () {
      const sender = this.acnt0;
      const recipient = this.acnt1;
      const amount = 1;

      const senderBalBefore = await sender.getBal();
      const recipientBalBefore = await recipient.getBal();

      const resp = await this.sc.transfer(
        sender,
        sender.addr.data,
        recipient.addr.data,
        amount
      );
      await this.waitForBlock();
      await this.assertTxSuccess(resp.id);

      const senderBalAfter = await sender.getBal();
      const recipientBalAfter = await recipient.getBal();

      const senderCostActual = senderBalBefore.data.minus(senderBalAfter.data);
      const senderCostExpected = jv.VSYS.forAmount(amount).data.plus(
        jv.ExecCtrtFee.default().data
      );
      expect(senderCostActual.isEqualTo(senderCostExpected)).toBeTrue();

      const recipientGainActual = recipientBalAfter.data.minus(
        recipientBalBefore.data
      );
      const recipientGainExpected = jv.VSYS.forAmount(amount).data;
      expect(recipientGainActual.isEqualTo(recipientGainExpected)).toBeTrue();
    });
  });

  describe('Test method deposit & withdraw', function () {
    beforeAll(async function () {
      this.lc = await jv.LockCtrt.register(this.acnt0, this.sc.tokId.data);
      await this.waitForBlock();
    });

    it('should be able to deposit into & withdraw from a contract', async function () {
      const amount = 1;
      const acnt = this.acnt0;

      const ctrtBalInit = await this.lc.getCtrtBal(acnt.addr.data);
      const acntBalInit = await acnt.getBal();

      // deposit
      const depResp = await this.sc.deposit(acnt, this.lc.ctrtId.data, amount);
      await this.waitForBlock();
      await this.assertTxSuccess(depResp.id);

      const ctrtBalDep = await this.lc.getCtrtBal(acnt.addr.data);
      const ctrtBalGainActual = ctrtBalDep.data.minus(ctrtBalInit.data);
      const ctrtBalGainExpected = jv.Token.forAmount(amount, this.sc.unit).data;
      expect(ctrtBalGainActual.isEqualTo(ctrtBalGainExpected)).toBeTrue();

      const acntBalDep = await acnt.getBal();
      const acntBalLossActual = acntBalInit.data.minus(acntBalDep.data);
      const acntBalLossExpected = jv.VSYS.forAmount(amount).data.plus(
        jv.ExecCtrtFee.default().data
      );
      expect(acntBalLossActual.isEqualTo(acntBalLossExpected)).toBeTrue();

      // withdraw
      const withResp = await this.sc.withdraw(
        acnt,
        this.lc.ctrtId.data,
        amount
      );
      await this.waitForBlock();
      await this.assertTxSuccess(withResp.id);

      const ctrtBalWith = await this.lc.getCtrtBal(acnt.addr.data);
      const ctrtBalLossActual = ctrtBalDep.data.minus(ctrtBalWith.data);
      const ctrtBalLossExpected = jv.Token.forAmount(amount, this.sc.unit).data;
      expect(ctrtBalLossActual.isEqualTo(ctrtBalLossExpected)).toBeTrue();

      const acntBalWith = await acnt.getBal();
      const acntBalGainActual = acntBalWith.data.minus(acntBalDep.data);
      const acntBalGainExpected = jv.VSYS.forAmount(amount).data.minus(
        jv.ExecCtrtFee.default().data
      );
      expect(acntBalGainActual.isEqualTo(acntBalGainExpected)).toBeTrue();
    });
  });
});
