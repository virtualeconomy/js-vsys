/**
 * module atomicSwapCtrtSpec tests module contract/atomicSwapCtrtSpec
 * @module atomicSwapCtrtSpec
 */

'use strict';

import * as jv from '../../src/index.js';

describe('Test class AtomicSwapCtrt', function () {
  beforeAll(async function () {
    this.maker = this.acnt0;
    this.taker = this.acnt1;

    [this.makerNc, this.takerNc] = await Promise.all([
      jv.NFTCtrt.register(this.maker),
      jv.NFTCtrt.register(this.taker),
    ]);
    await this.waitForBlock();

    await Promise.all([
      this.makerNc.issue(this.maker),
      this.takerNc.issue(this.taker),
    ]);
    await this.waitForBlock();

    this.makerNcTokId = this.makerNc.getTokId(0);
    this.takerNcTokId = this.takerNc.getTokId(0);

    [this.makerAc, this.takerAc] = await Promise.all([
      jv.AtomicSwapCtrt.register(this.maker, this.makerNcTokId.data),
      jv.AtomicSwapCtrt.register(this.taker, this.takerNcTokId.data),
    ]);
    await this.waitForBlock();

    await Promise.all([
      this.makerNc.deposit(this.maker, this.makerAc.ctrtId.data, 0),
      this.takerNc.deposit(this.taker, this.takerAc.ctrtId.data, 0),
    ]);
    await this.waitForBlock();
  });

  describe('Test method register', function () {
    it('should register an instance of Atomic Swap Contract', async function () {
      const ctrtMakerActual = await this.makerAc.getMaker();
      const ctrtMakerExpected = this.maker.addr;
      expect(ctrtMakerActual.equal(ctrtMakerExpected)).toBeTrue();
    });
  });
});
