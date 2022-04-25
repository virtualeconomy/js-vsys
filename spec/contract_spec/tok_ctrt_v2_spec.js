/**
 * tokCtrtSpecV2 tests module contract/tokCtrtV2
 * @module tokCtrtSpecV2
 */

'use strict';

import * as jv from '../../src/index.js';

describe('Test class TokCtrtV2', function () {
  beforeAll(async function () {
    this.nc = await jv.TokCtrtV2Whitelist.register(this.acnt0, 100, 1);
    await this.waitForBlock();
  });

  describe('Test method register', function () {
    it('should register an instance of token Contract', async function () {
      const issuer = await this.nc.getIssuer();
      expect(issuer.equal(this.acnt0.addr)).toBeTrue();

      const maker = await this.nc.getMaker();
      expect(maker.equal(this.acnt0.addr)).toBeTrue();

      const unit = await this.nc.getUnit();
      expect(unit).toBe(1);

      const regulator = await this.nc.getRegulator();
      expect(regulator.equal(this.acnt0.addr)).toBeTrue();
    });
  });

  describe('Test method supersede', function () {
    it('should supersede the issuer role to another account', async function () {
      const maker = this.acnt0;
      const oldIssuer = this.acnt0;
      const newIssuer = this.acnt1;
      const oldRegulator = this.acnt0;
      const newRegulator = this.acnt1;

      const oldIssuerAddr = await this.nc.getIssuer();
      expect(oldIssuerAddr.equal(oldIssuer.addr)).toBeTrue();

      const resp = await this.nc.supersede(
        maker,
        newIssuer.addr.data,
        newRegulator.addr.data
      );
      await this.waitForBlock();
      await this.assertTxSuccess(resp.id);

      const newIssuerAddr = await this.nc.getIssuer();
      expect(newIssuerAddr.equal(newIssuer.addr)).toBeTrue();
      const newRegulatorAddr = await this.nc.getRegulator();
      expect(newRegulatorAddr.equal(newRegulator.addr)).toBeTrue();

      await this.nc.supersede(
        maker,
        oldIssuer.addr.data,
        oldRegulator.addr.data
      );
      await this.waitForBlock();
    });
  });

  describe('Test method updateListUser', function () {
    it('should be able to update the presence of the user in the list', async function () {
      const acnt = this.acnt0;

      const userInListInit = await this.nc.isUserInList(acnt.addr.data);
      expect(userInListInit).toBe(false);

      const respAdd = await this.nc.updateListUser(acnt, acnt.addr.data, true);
      await this.waitForBlock();
      await this.assertTxSuccess(respAdd.id);

      const userInListAdd = await this.nc.isUserInList(acnt.addr.data);
      expect(userInListAdd).toBe(true);

      const respDel = await this.nc.updateListUser(acnt, acnt.addr.data, false);
      await this.waitForBlock();
      await this.assertTxSuccess(respDel.id);

      const userInListDel = await this.nc.isUserInList(acnt.addr.data);
      expect(userInListDel).toBe(false);
    });
  });

  describe('Test method updateListCtrt', function () {
    it('should be able to update the presence of the contract in the list', async function () {
      const acnt = this.acnt0;

      const ctrtId = 'CFCQKY6ze2oYXyoxz3uKZ721jimqoBn7KYm';

      const ctrtInListInit = await this.nc.isCtrtInList(ctrtId);
      expect(ctrtInListInit).toBe(false);

      const respAdd = await this.nc.updateListCtrt(acnt, ctrtId, true);
      await this.waitForBlock();
      await this.assertTxSuccess(respAdd.id);

      const ctrtInListAdd = await this.nc.isCtrtInList(ctrtId);
      expect(ctrtInListAdd).toBe(true);

      const respDel = await this.nc.updateListCtrt(acnt, ctrtId, false);
      await this.waitForBlock();
      await this.assertTxSuccess(respDel.id);

      const ctrtInListDel = await this.nc.isCtrtInList(ctrtId);
      expect(ctrtInListDel).toBe(false);
    });
  });
});
