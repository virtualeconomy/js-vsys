/**
 * nftCtrtSpecV2 tests module contract/nftCtrtV2
 * @module nftCtrtSpecV2
 */

'use strict';

import * as jv from '../../src/index.js';

describe('Test class NFTCtrtV2WhiteList', function () {
  beforeAll(async function () {
    this.nc = await jv.NFTCtrtV2Whitelist.register(this.acnt0);
    await this.waitForBlock();
  });

  describe('Test method register', function () {
    it('should register an instance of NFT Contract', async function () {
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

      await this.nc.supersede(maker, oldIssuer.addr.data, oldIssuer.addr.data);
      await this.waitForBlock();
    });
  });

  describe('Test method issue', function () {
    it('should issue a new NFT to the issuer', async function () {
      const resp = await this.nc.issue(this.acnt0);
      await this.waitForBlock();
      await this.assertTxSuccess(resp.id);

      const tokId = await this.nc.getTokId(await this.nc.getLastTokIdx());
      const bal = await this.getTokBal(this.acnt0.addr.data, tokId.data);
      expect(bal).toBe(1);
    });
  });

  describe('Test method send', function () {
    beforeEach(async function () {
      const resp = await this.nc.issue(this.acnt0);
      await this.waitForBlock();
      await this.assertTxSuccess(resp.id);
    });

    it('should send an NFT to the recipient', async function () {
      const sender = this.acnt0;
      const recipient = this.acnt1;

      const tokIdx = await this.nc.getLastTokIdx();
      const tokId = await this.nc.getTokId(tokIdx);

      const senderBalBefore = await this.getTokBal(
        sender.addr.data,
        tokId.data
      );
      const recipientBalBefore = await this.getTokBal(
        recipient.addr.data,
        tokId.data
      );
      expect(senderBalBefore).toBe(1);
      expect(recipientBalBefore).toBe(0);

      await this.nc.updateListUser(this.acnt0, this.acnt0.addr.data, true);
      await this.nc.updateListUser(this.acnt0, this.acnt1.addr.data, true);
      await this.waitForBlock();

      const resp = await this.nc.send(sender, recipient.addr.data, tokIdx);
      await this.waitForBlock();
      await this.assertTxSuccess(resp.id);

      const senderBalAfter = await this.getTokBal(sender.addr.data, tokId.data);
      const recipientBalAfter = await this.getTokBal(
        recipient.addr.data,
        tokId.data
      );
      expect(senderBalAfter).toBe(0);
      expect(recipientBalAfter).toBe(1);
    });
  });

  describe('Test method transfer', function () {
    beforeEach(async function () {
      const resp = await this.nc.issue(this.acnt0);
      await this.waitForBlock();
      await this.assertTxSuccess(resp.id);
    });

    it('should send an NFT to the recipient', async function () {
      const sender = this.acnt0;
      const recipient = this.acnt1;

      const tokIdx = await this.nc.getLastTokIdx();
      const tokId = await this.nc.getTokId(tokIdx);

      const senderBalBefore = await this.getTokBal(
        sender.addr.data,
        tokId.data
      );
      const recipientBalBefore = await this.getTokBal(
        recipient.addr.data,
        tokId.data
      );
      expect(senderBalBefore).toBe(1);
      expect(recipientBalBefore).toBe(0);

      await this.nc.updateListUser(this.acnt0, this.acnt0.addr.data, true);
      await this.nc.updateListUser(this.acnt0, this.acnt1.addr.data, true);
      await this.waitForBlock();

      const resp = await this.nc.transfer(
        sender,
        sender.addr.data,
        recipient.addr.data,
        tokIdx
      );
      await this.waitForBlock();
      await this.assertTxSuccess(resp.id);

      const senderBalAfter = await this.getTokBal(sender.addr.data, tokId.data);
      const recipientBalAfter = await this.getTokBal(
        recipient.addr.data,
        tokId.data
      );
      expect(senderBalAfter).toBe(0);
      expect(recipientBalAfter).toBe(1);
    });
  });

  describe('Test method deposit & withdraw', function () {
    beforeAll(async function () {
      const resp = await this.nc.issue(this.acnt0);
      await this.waitForBlock();
      await this.assertTxSuccess(resp.id);

      this.tokIdx = await this.nc.getLastTokIdx();
      this.tokId = await this.nc.getTokId(this.tokIdx);

      this.lc = await jv.LockCtrt.register(this.acnt0, this.tokId.data);
      await this.waitForBlock();
    });

    it('should be able to deposit into and withdraw from a contract', async function () {
      const amount = 1;
      const acnt = this.acnt0;
      const unit = await this.nc.getUnit();

      const ctrtBalInit = await this.lc.getCtrtBal(acnt.addr.data);
      const acntBalInit = await this.getTokBal(acnt.addr.data, this.tokId.data);
      expect(acntBalInit).toBe(1);

      await this.nc.updateListUser(this.acnt0, this.acnt0.addr.data, true);
      await this.nc.updateListCtrt(this.acnt0, this.lc.ctrtId.data, true);

      // deposit

      const depResp = await this.nc.deposit(
        acnt,
        this.lc.ctrtId.data,
        this.tokIdx
      );
      await this.waitForBlock();
      await this.assertTxSuccess(depResp.id);

      const ctrtBalDep = await this.lc.getCtrtBal(acnt.addr.data);
      const ctrtBalGainActual = ctrtBalDep.data.minus(ctrtBalInit.data);
      const ctrtBalGainExpected = jv.Token.forAmount(amount, unit).data;
      expect(ctrtBalGainActual.isEqualTo(ctrtBalGainExpected)).toBeTrue();

      const acntBalDep = await this.getTokBal(acnt.addr.data, this.tokId.data);
      expect(acntBalDep).toBe(0);

      // withdraw
      const withResp = await this.nc.withdraw(
        acnt,
        this.lc.ctrtId.data,
        this.tokIdx
      );
      await this.waitForBlock();
      await this.assertTxSuccess(withResp.id);

      const ctrtBalWith = await this.lc.getCtrtBal(acnt.addr.data);
      const ctrtBalLossActual = ctrtBalDep.data.minus(ctrtBalWith.data);
      const ctrtBalLossExpected = jv.Token.forAmount(amount, unit).data;
      expect(ctrtBalLossActual.isEqualTo(ctrtBalLossExpected)).toBeTrue();

      const acntBalWith = await this.getTokBal(acnt.addr.data, this.tokId.data);
      expect(acntBalWith).toBe(1);
    });
  });

  describe('Test method updateListUser', function () {
    it('should be able to update the presence of the user in the list', async function () {
      const acnt = this.acnt0;

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
      // An arbitrary contract ID.
      const ctrtId = 'CF5Zkj2Ycx72WrBnjrcNHvJRVwsbNX1tjgT';

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
