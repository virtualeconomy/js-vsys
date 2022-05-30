/**
 * tokCtrtSplitSpec tests module contract/TokCtrtWithSplit
 * @module tokCtrtSplitSpec
 */

'use strict';

import * as jv from '../../src/index.js';

describe('Test class TokCtrtWithSplit', function () {
  describe('Test method register', function () {
    it('should register an instance of Token Contract with split', async function () {
      const tc = await jv.TokCtrtWithSplit.register(this.acnt0, 100, 1);
      await this.waitForBlock();

      const issuer = await tc.getIssuer();
      expect(issuer.equal(this.acnt0.addr)).toBeTrue();

      const maker = await tc.getMaker();
      expect(maker.equal(this.acnt0.addr)).toBeTrue();

      const unit = await tc.getUnit();
      expect(unit).toBe(1);
    });
  });

  describe('Test method split', function () {
    it('should change to a new unit', async function () {
      const tc = await jv.TokCtrtWithSplit.register(this.acnt0, 100, 1);
      await this.waitForBlock();

      const maker = this.acnt0;
      const unitBefore = await tc.getUnit();
      expect(unitBefore).toBe(1);

      const resp = await tc.split(maker, 2);
      await this.waitForBlock();
      await this.assertTxSuccess(resp.id);

      const unitAfter = await tc.getUnit();
      expect(unitAfter).toBe(2);
    });
  });
});
