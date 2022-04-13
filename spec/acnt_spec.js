/**
 * acntSpec tests module account.
 * @module acntSpec
 */

'use strict';

import * as jv from '../src/index.js';

describe('Test Account', function () {
  describe('Test method pay', function () {
    it('should be able to pay from the action taker to the recipient', async function () {
      const payAmount = 1;

      const acnt0BalBefore = await this.acnt0.getBal();
      const acnt1BalBefore = await this.acnt1.getBal();

      const resp = await this.acnt0.pay(this.acnt1.addr.data, payAmount);
      await this.waitForBlock();
      await this.assertTxSuccess(resp.id);

      const acnt0BalAfter = await this.acnt0.getBal();
      const acnt1BalAfter = await this.acnt1.getBal();

      const acnt0CostActual = acnt0BalBefore.data.minus(acnt0BalAfter.data);
      const acnt0CostExpected = jv.VSYS.forAmount(payAmount).data.plus(
        jv.PaymentFee.default().data
      );
      expect(acnt0CostActual.isEqualTo(acnt0CostExpected)).toBeTrue();

      const acnt1GainActual = acnt1BalAfter.data.minus(acnt1BalBefore.data);
      const acnt1GainExpected = jv.VSYS.forAmount(payAmount).data;
      expect(acnt1GainActual.isEqualTo(acnt1GainExpected)).toBeTrue();
    });
  });
});
