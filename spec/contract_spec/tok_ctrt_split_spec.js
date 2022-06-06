/**
 * tokCtrtSplitSpec tests module contract/TokCtrtWithSplit
 * @module tokCtrtSplitSpec
 */

'use strict';

import * as jv from '../../src/index.js';

describe('Test class TokCtrtWithSplit', function () {
  beforeEach(async function () {
    this.tc = await jv.TokCtrtWithSplit.register(this.acnt0, 100, 1);
    await this.waitForBlock();
  });

  describe('Test method register', function () {
    it('should register an instance of Token Contract with split', async function () {
      const issuer = await this.tc.getIssuer();
      expect(issuer.equal(this.acnt0.addr)).toBeTrue();

      const maker = await this.tc.getMaker();
      expect(maker.equal(this.acnt0.addr)).toBeTrue();

      const unit = await this.tc.getUnit();
      expect(unit).toBe(1);
    });
  });

  describe('Test method split', function () {
    it('should change to a new unit', async function () {
      const maker = this.acnt0;
      const unitBefore = await this.tc.getUnit();
      expect(unitBefore).toBe(1);

      const resp = await this.tc.split(maker, 2);
      await this.waitForBlock();
      await this.assertTxSuccess(resp.id);

      const unitAfter = await this.tc.getUnit();
      expect(unitAfter).toBe(2);
    });
  });
});
