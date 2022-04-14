/**
 * module lockCtrtSpec tests module contract/lockCtrtSpec
 * @module lockCtrtSpec
 */

'use strict';

import * as jv from '../../src/index.js';

describe('Test class LockCtrt', function () {
  beforeAll(async function () {
    this.sc = jv.SysCtrt.forTestnet(this.chain);

    this.lc = await jv.LockCtrt.register(this.acnt0, this.sc.tokId.data);

    this.depositAmount = 1;
    const resp = await this.sc.deposit(
      this.acnt0,
      this.lc.ctrtId.data,
      this.depositAmount
    );
    await this.waitForBlock();
    await this.assertTxSuccess(resp.id);
  });

  describe('Test method register', function () {
    it('should register an instance of Lock Contract', async function () {
      const maker = await this.lc.getMaker();
      expect(maker.equal(this.acnt0.addr)).toBeTrue();

      const tokId = await this.lc.getTokId();
      expect(tokId.equal(this.sc.tokId)).toBeTrue();

      // TODO: uncomment this test when token factory is availble.
      // because unit of VSYS coin cannot be fetched by token id.
      //
      // const unit = await this.lc.getUnit();
      // expect(unit).toBe(this.sc.unit);

      const unit = this.sc.unit;

      const ctrtBalActual = await this.lc.getCtrtBal(this.acnt0.addr.data);
      const ctrtBalExpected = jv.Token.forAmount(this.depositAmount, unit);
      expect(ctrtBalActual.equal(ctrtBalExpected)).toBeTrue();
    });
  });

  describe('Test mehtod lock', function () {
    it('should lock all deposited tokens of user until the expiration time', async function () {
      const tenSecsLater = Date.now() + 1000 * 10;
      const resp = await this.lc.lock(this.acnt0, tenSecsLater);
      await this.waitForBlock();
      await this.assertTxSuccess(resp.id);

      const lockTimeActual = await this.lc.getCtrtLockTime(
        this.acnt0.addr.data
      );
      const lockTimeExpected = jv.VSYSTimestamp.fromUnixTs(tenSecsLater);
      expect(lockTimeActual.equal(lockTimeExpected)).toBeTrue();
    });
  });
});
