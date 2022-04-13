/**
 * nftCtrtSpec tests module contract/nftCtrt
 * @module nftCtrtSpec
 */

'use strict';

import * as jv from '../../src/index.js';

describe('Test class NFTCtrt', function () {
  beforeAll(async function () {
    this.nc = await jv.NFTCtrt.register(this.acnt0);
    await this.waitForBlock();
  });

  describe('Test method register', function () {
    it('should register an instance of NFT Contract', async function () {
      const issuer = await this.nc.getIssuer();
      expect(issuer.equal(this.acnt0.addr)).toBeTrue();

      const maker = await this.nc.getMaker();
      expect(maker.equal(this.acnt0.addr)).toBeTrue();
    });
  });

  describe('Test method supersede', function () {
    it('should supersede the issuer role to another account', async function () {
      const curIssuer = this.acnt0;
      const newIssuer = this.acnt1;

      const curIssuerAddr = await this.nc.getIssuer();
      expect(curIssuerAddr.equal(curIssuer.addr)).toBeTrue();

      const resp = await this.nc.supersede(curIssuer, newIssuer.addr.data);
      await this.waitForBlock();
      await this.assertTxSuccess(resp.id);

      const newIssuerAddr = await this.nc.getIssuer();
      expect(newIssuerAddr.equal(newIssuer.addr)).toBeTrue();
    });
  });

  describe('Test method issue', function () {
    it('should issue a new NFT to the issuer', async function () {
      const resp = await this.nc.issue(this.acnt0);
      await this.waitForBlock();
      await this.assertTxSuccess(resp.id);

      const tokId = await this.nc.getTokId(0);
      const bal = await this.getTokBal(this.acnt0.addr.data, tokId.data);
      expect(bal).toBe(1);
    });
  });
});
