/**
 * module payChanCtrtSpec tests module contract/payChanCtrt
 * @module payChanCtrtSpec
 */

'use strict';

import * as jv from '../../src/index.js';
import * as bn from '../../src/utils/big_number.js';

describe('Test class PayChanCtrt', function () {
  beforeEach(async function () {
    this.TOK_MAX = 100;
    this.INIT_LOAD = this.TOK_MAX / 2;
    this.TOK_UNIT = 1;

    const tc = await jv.TokCtrtWithoutSplit.register(
      this.acnt0,
      this.TOK_MAX,
      this.TOK_UNIT
    );
    await this.waitForBlock();

    await tc.issue(this.acnt0, this.TOK_MAX);
    await this.waitForBlock();

    this.pc = await jv.PayChanCtrt.register(this.acnt0, tc.tokId.data);
    await this.waitForBlock();

    await tc.deposit(this.acnt0, this.pc.ctrtId.data, this.TOK_MAX);
    await this.waitForBlock();

    this.later = Date.now() + 600 * 1000;
    const resp = await this.pc.createAndLoad(
      this.acnt0,
      this.acnt1.addr.data,
      this.INIT_LOAD,
      this.later
    );
    await this.waitForBlock();
    this.chanId = resp.id;
  });

  describe('Test method register', function () {
    it('should creates an instance and loads an amount into it.', async function () {
      const ctrtMakerActual = await this.pc.getMaker();
      const ctrtMakerExpected = await this.acnt0.addr;
      expect(ctrtMakerActual.equal(ctrtMakerExpected)).toBeTrue();
    });
  });

  describe('Test method createAndLoad', function () {
    it('should create a swap and deposit initial amounts into the pool', async function () {
      const chanStatus = await this.pc.getChanStatus(this.chanId);
      expect(chanStatus).toBeTrue();

      const chanCreator = await this.pc.getChanCreator(this.chanId);
      expect(chanCreator).toEqual(this.acnt0.addr);
    });
  });

  describe('Test method extendExpTime', function () {
    it('should extend the expired time', async function () {
      const newLater = this.later + 300 * 1000;
      const resp = await this.pc.extendExpTime(
        this.acnt0,
        this.chanId,
        newLater
      );
      await this.waitForBlock();
      const txId = resp.id;
      await this.assertTxSuccess(txId);

      const chanExpTime = await this.pc.getChanExpTime(this.chanId);
      expect(chanExpTime.unixTs).toBe(newLater);
    });
  });

  describe('Test method load', function () {
    it('should loads more tokens into the channel', async function () {
      const moreLoad = this.INIT_LOAD / 2;
      const resp = await this.pc.load(this.acnt0, this.chanId, moreLoad);
      await this.waitForBlock();
      const txId = resp.id;
      await this.assertTxSuccess(txId);

      const chanLoad = await this.pc.getChanAccumLoad(this.chanId);
      expect(chanLoad.data).toEqual(
        new bn.BigNumber(this.INIT_LOAD + moreLoad)
      );
    });
  });

  describe('Test method abort', function () {
    it('should aborts the channel', async function () {
      const chanStatus = await this.pc.getChanStatus(this.chanId);
      expect(chanStatus).toBeTrue();

      const resp = await this.pc.abort(this.acnt0, this.chanId);
      await this.waitForBlock();
      const txId = resp.id;
      await this.assertTxSuccess(txId);

      const chanStatusNew = await this.pc.getChanStatus(this.chanId);
      expect(chanStatusNew).toBeFalse();
    });
  });

  describe('Test method offchain pay and collect payments', function () {
    it('should pay offchain and collect payments', async function () {
      const sig = await this.pc.offchainPay(
        this.acnt0.keyPair,
        this.chanId,
        this.INIT_LOAD
      );

      const resp = await this.pc.collectPayment(
        this.acnt1,
        this.chanId,
        this.INIT_LOAD,
        sig
      );
      await this.waitForBlock();
      const txId = resp.id;
      await this.assertTxSuccess(txId);

      const acnt1Bal = await this.pc.getCtrtBal(this.acnt1.addr.data);
      expect(
        acnt1Bal.amount.isEqualTo(new bn.BigNumber(this.INIT_LOAD))
      ).toBeTrue();

      const accPay = await this.pc.getChanAccumPay(this.chanId);
      expect(
        accPay.amount.isEqualTo(new bn.BigNumber(this.INIT_LOAD))
      ).toBeTrue();
    });
  });
});
