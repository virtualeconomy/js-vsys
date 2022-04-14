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
});
