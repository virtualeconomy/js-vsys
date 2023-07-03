/**
 * module MultisignAccount provides functionalities for Multisign Account.
 * @module MultisignAccount
 */

'use strict';

import { WORDS } from './words.js';
import * as md from './model.js';
import * as ch from './chain.js';
import * as tx from './tx_req.js';
import * as curve from './utils/curve_25519.js';
import * as rd from './utils/random.js';
import * as api from './api.js';
import * as dp from './dbput.js';
import * as jv from './index.js';
import bs58 from 'bs58';


/** Multisign Account is the class for an account in VSYS blockchain network */
export class MultiSignAccount {
  /**
   * Creates a new Multisign Account instance.
   * @param {md.PriKey} priKey - The private key list
   * @param {ch.Chain} chain - The chain where the account is on.
   */
  constructor(priKeys, chain) {
    this.chain = chain;
    this.MULPKS = [];
    this.allAs = [];
    this.xAs = [];
    this.bpAs = [];
    for (var priKey of priKeys) {
      var MULPK = new jv.MultiSignPriKey(Buffer.from(bs58.decode(priKey)));
      var A = MULPK.A;
      this.MULPKS.push(MULPK);
      this.allAs.push(A);
    }
    for (var MULPK of this.MULPKS) {
      var xA = MULPK.getxA(this.allAs);
      this.xAs.push(xA);
    }
    this.unionA = jv.MultiSign.getUnionA(this.xAs);

    for (var MULPK of this.MULPKS) {
      var bpA = MULPK.getbpA(this.allAs);
      this.bpAs.push(bpA);
    }
    this.multiPubKey = jv.MultiSign.getPub(this.bpAs);
  }
  
  getPubKeyStr() {
    return md.PubKey.fromBytes(this.multiPubKey);
  }
  getAddr(chain) {
    var mulpubStr = this.getPubKeyStr();
    return md.Addr.fromPubKey(mulpubStr, chain.chainId);
  }
  getSign(msg) {
    var RAND = rd.getRandomBytes(64);
    var Rs = [], sigs = [];
    for (var MULPK of this.MULPKS) {
      var R = MULPK.getR(msg, RAND);
      Rs.push(R);
    }
    var unionR = jv.MultiSign.getUnionR(Rs);

    for (var MULPK of this.MULPKS) {
      var sign = MULPK.sign(msg, RAND, this.unionA, unionR, this.allAs);
      sigs.push(sign);
    }
    return jv.MultiSign.getSig(this.unionA, unionR, sigs);
  }
  /**
   * api returns the NodeAPI instance of the chain.
   * @returns {api.NodeAPI} The NodeAPI instance.
   */
  get api() {
    return this.chain.api;
  }
  get keyPair() {
    return {
      sign: (param) => this.getSign(param),
      pub: this.getPubKeyStr()
    }
  }

  /**
   * getBal returns the account's ledger(regular) balance.
   * NOTE: The amount leased out will NOT be reflected in this balance.
   * @returns {md.VSYS} The account's ledger(regular) balance.
   */
  async getBal() {
    const resp = await this.api.addr.getBalanceDetails(this.addr.data);
    return md.VSYS.fromNumber(resp.regular);
  }

  /**
   * getAvailBal returns the account's available balance(i.e. the balance that can be spent).
   * NOTE: The amount leased out will NOT be reflected in this balance.
   * @returns {md.VSYS} The account's available balance.
   */
  async getAvailBal() {
    const resp = await this.api.addr.getBalanceDetails(this.addr.data);
    return md.VSYS.fromNumber(resp.available);
  }

  /**
    * getEffBal returns the account's effective balance(i.e. the balance that counts
         when contending a slot).
    * NOTE: The amount leased in&out will NOT be reflected in this balance.
    * @returns {md.VSYS} The account's effective balance.
    */
  async getEffBal() {
    const resp = await this.api.addr.getBalanceDetails(this.addr.data);
    return md.VSYS.fromNumber(resp.effective);
  }

  /**
    * getTokBal returns the raw balance of the token of the given token ID for this account.
         NOTE that the token ID from the system contract is not supported due to the pre-defined & built-in nature
         of system contract.
    * @param {string} tokId - The token ID.
    * @returns {md.Token} The account's balance of the given token.
    */
  async getTokBal(tokId) {
    const resp = await this.api.ctrt.getTokBal(this.addr.data, tokId);
    return md.Token.fromNumber(resp.balance, resp.unity);
  }

  /**
   * payImpl provides the internal implementation of paying.
   * @param {tx.PaymentTxReq} req - The Payment Transaction Request.
   * @returns {object} The response returned by the NodeAPI.
   */
  async payImpl(req) {
    return await this.api.vsys.broadcastPayment(
      req.toBroadcastPaymentPayload(this.keyPair)
    );
  }

  /**
   * pay pays the VSYS coins from the action taker to the recipient.
   * @param {string} recipient - The account address of the recipient
   * @param {number} amount - The amount of VSYS coins to pay.
   * @param {string} attachment - The attachment of the action. Defaults to ''.
   * @param {number} fee - Teh fee to pay for this action. Defaults to md.PaymentFee.DEFAULT.
   */
  async pay(recipient, amount, attachment = '', fee = md.PaymentFee.DEFAULT) {
    const rcptMd = new md.Addr(recipient);
    rcptMd.mustOn(this.chain);

    const data = await this.payImpl(
      new tx.PaymentTxReq(
        rcptMd,
        md.VSYS.forAmount(amount),
        md.VSYSTimestamp.now(),
        new md.Str(attachment),
        md.PaymentFee.fromNumber(fee)
      )
    );
    return data;
  }

  /**
   * leaseImpl provides the internal implementation of leasing.
   * @param {tx.LeaseTxReq} req - The leasing Transaction Request.
   * @returns {object} The response returned by the NodeAPI.
   */
  async leaseImpl(req) {
    return await this.api.leasing.broadcastLease(
      req.toBroadcastLeasingPayload(this.keyPair)
    );
  }

  /**
   * lease leases the VSYS coins from the action taker to the recipient(a supernode).
   * @param {string} supernodeAddr - The supernode address.
   * @param {number} amount - The lease amount.
   * @param {number} fee - The lease fee. DEFAULT to be md.Fee.DEFAULT.
   * @returns {object} The response returned by the NodeAPI.
   */
  async lease(supernodeAddr, amount, fee = md.LeasingFee.DEFAULT) {
    const addrMd = new md.Addr(supernodeAddr);
    addrMd.mustOn(this.chain);
    const data = await this.leaseImpl(
      new tx.LeaseTxReq(
        addrMd,
        md.VSYS.forAmount(amount),
        md.VSYSTimestamp.now(),
        md.LeasingFee.fromNumber(fee)
      )
    );
    return data;
  }

  /**
   * leaseCancelImpl provides the internal implementation of leasing.
   * @param {tx.PaymentTxReq} req - The Payment Transaction Request.
   * @returns {object} The response returned by the NodeAPI.
   */
  async leaseCancelImpl(req) {
    return await this.api.leasing.broadcastCancel(
      req.toBroadcastLeasingCancelPayload(this.keyPair)
    );
  }

  /**
   * leaseCancel sends a leasing cancel transaction request on behalf of the account.
   * @param {string} leasingTxId - The leasing Transaction id.
   * @param {number} fee - The leasing cancel fee. DEFAULT to be md.Fee.DEFAULT.
   * @returns {object} The response returned by the NodeAPI.
   */
  async leaseCancel(leasingTxId, fee = md.Fee.DEFAULT) {
    const data = await this.leaseCancelImpl(
      new tx.LeaseCancelReq(
        new md.TxID(leasingTxId),
        md.VSYSTimestamp.now(),
        md.LeasingCancelFee.fromNumber(fee)
      )
    );
    return data;
  }

  /**
   * pay pays the VSYS coins from the action taker to the recipient.
   * @param {string} recipient - The account address of the recipient
   * @param {number} amount - The amount of VSYS coins to pay.
   * @param {string} attachment - The attachment of the action. Defaults to ''.
   * @param {number} fee - Teh fee to pay for this action. Defaults to md.PaymentFee.DEFAULT.
   */
  async pay(recipient, amount, attachment = '', fee = md.PaymentFee.DEFAULT) {
    const rcptMd = new md.Addr(recipient);
    rcptMd.mustOn(this.chain);

    const data = await this.payImpl(
      new tx.PaymentTxReq(
        rcptMd,
        md.VSYS.forAmount(amount),
        md.VSYSTimestamp.now(),
        new md.Str(attachment),
        md.PaymentFee.fromNumber(fee)
      )
    );
    return data;
  }

  /**
   * registerContractImpl provides the internal implementation of registering a contract.
   * @param {tx.RegCtrtTxReq} req - The Register Contract Transaction Request.
   * @returns {object} The response returned by the NodeAPI.
   */
  async registerContractImpl(req) {
    return await this.api.ctrt.broadcastRegister(
      req.toBroadcastRegisterPayload(this.keyPair)
    );
  }

  /**
   * executeContractImpl provides the internal implementation of executing a contract function.
   * @param {tx.ExecCtrtFuncTxReq} req - The Execute Contract Function Transaction Request.
   * @returns {object} The response returned by the NodeAPI.
   */
  async executeContractImpl(req) {
    return await this.api.ctrt.broadcastExecute(
      req.toBroadcastExecutePayload(this.keyPair)
    );
  }

  /**
   * executeContractImpl provides the internal implementation of executing a contract function.
   * @param {tx.ExecCtrtFuncTxReq} req - The Execute Contract Function Transaction Request.
   * @returns {object} The response returned by the NodeAPI.
   */
  async dbPutImpl(req) {
    return await this.api.database.broadcastPut(
      req.toBroadcastPutPayload(this.keyPair)
    );
  }

  /**
  * dbPut stores the data under the key onto the chain.
  * @param {string} dbKey - The db key of the data.
  * @param {string} data - The data to put.
  * @param {DBPutData} dataType - The type of the data(i.e. how should the string be parsed).
              Defaults to dp.ByteArray.
  * @param {number} fee - Teh fee to pay for this action. Defaults to md.DBPutFee.DEFAULT.
  * @returns {object} - The response returned by the Node API.
  */
  async dbPut(dbKey, data, dataType = dp.ByteArray, fee = md.DBPutFee.DEFAULT) {
    data = await this.dbPutImpl(
      new tx.DBPutTxReq(
        dp.DBPutKey.fromStr(dbKey),
        dp.DBPutData.new(data, dataType),
        md.VSYSTimestamp.now(),
        md.DBPutFee.fromNumber(fee)
      )
    );
    return data;
  }
}
