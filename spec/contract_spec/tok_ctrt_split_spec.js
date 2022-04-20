/**
 * tokCtrtSplitSpec tests module contract/TokCtrtWithSplit
 * @module tokCtrtSplitSpec
 */

'use strict';

import * as jv from '../../src/index.js';


describe('Test class TokCtrtWithoutSplit', function () {
  beforeAll(async function () {
    this.nc = await jv.TokCtrtWithoutSplit.register(this.acnt0,100,1);
    await this.waitForBlock();
  });

  describe('Test method register', function () {
    it('should register an instance of Token Contract with split', async function () {
      const issuer = await this.nc.getIssuer();
      expect(issuer.equal(this.acnt0.addr)).toBeTrue();

      const maker = await this.nc.getMaker();
      expect(maker.equal(this.acnt0.addr)).toBeTrue();

      const unit = await this.nc.getUnit();
      expect(unit).toBe(1);
    });
  });

  describe('Test method split', function () {
    it('should change to a new unit', async function () {
      const maker = this.acnt0;
      const unitBefore = await this.nc.getUnit();
      expect(unitBefore).toBe(1);

      const resp = await this.nc.split(maker, 2);
      await this.waitForBlock();
      await this.assertTxSuccess(resp.id);

      const unitAfter = await this.nc.getUnit();
      expect(unitAfter).toBe(2);
    });
  });

});