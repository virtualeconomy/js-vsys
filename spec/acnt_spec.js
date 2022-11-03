/**
 * acntSpec tests module account.
 * @module acntSpec
 */

'use strict';

import * as jv from '../src/index.js';

describe('Test class Account', function () {
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

  describe('Test instantiating', function () {
    beforeAll(function () {
      this.priKey = 'EV5stVcWZ1kEQhrS7qcfYQdHpMHM5jwkyRxi9n9kXteZ';
      this.pubKey = '4EyuJtDzQH15qAfnTPgqa8QB4ZU1dzqihdCs13UYEiV4';
      this.addr = 'ATuQXbkZV4dCKsoFtXSCH5eKw92dMXQdUYU';
    });
    it('should instantiate class Account with private key string', function () {
      const acnt = jv.Account.fromPriKeyStr(this.chain, this.priKey);
      expect(acnt.keyPair.pri.data).toBe(this.priKey);
      expect(acnt.keyPair.pub.data).toBe(this.pubKey);
      expect(acnt.addr.data).toBe(this.addr);
    });

    it('should instantiate with the given correct private key & public key', function () {
      const acnt = new jv.Account(this.chain, new jv.PriKey(this.priKey), new jv.PubKey(this.pubKey));
      expect(acnt.keyPair.pri.data).toBe(this.priKey);
      expect(acnt.keyPair.pub.data).toBe(this.pubKey);
      expect(acnt.addr.data).toBe(this.addr);
    });

    it('should check if the given private key & public key match', function () {
      const wrongPubKey = '4EyuJtDzQH15qAfnTPgqa8QB4ZU1dzqihdCs13U12345'
      const chain = this.chain;
      const priKey = this.priKey;

      expect(
        function () {
          new jv.Account(chain, new jv.PriKey(priKey), new jv.PubKey(wrongPubKey));
        }
      ).toThrow(new Error('Public key & private key do not match'));
    });
  });

  describe('Test db put', function() {
      it('should put and get data from vsys db', async function() {
          const db_key = "func_test";
          const data = "testdata";

          let resp = await this.acnt0.dbPut(db_key, data);
          await this.waitForBlock();
          await this.assertTxSuccess(resp.id);

          resp = await this.api.database.getDB(this.acnt0.addr.data, db_key);
          console.log(resp);
          expect(resp.data).toBe(data);
      });
  });
});
