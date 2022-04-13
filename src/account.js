/**
 * Account module provides functionalities for Wallet & Account.
 * @module account
 */

'use strict';

import bs58 from 'bs58';
import { WORDS } from './words.js';
import * as md from './model.js';
import * as ch from './chain.js';
import * as tx from './tx_req.js';
import * as hs from './utils/hashes.js';
import * as curve from './utils/curve_25519.js';
import * as rd from './utils/random.js';
import * as api from './api.js';

/** Wallet is the class for a wallet in VSYS blockchain network */
export class Wallet {
  /**
   * Create a new Wallet instance.
   * @param {md.Seed} seed - The seed of the wallet.
   */
  constructor(seed) {
    this.seed = seed;
  }

  /**
   * fromSeedStr creates a new Wallet from the given seed string.
   * @param {string} s - The seed string.
   * @returns {Wallet} The Wallet instance.
   */
  static fromSeedStr(s) {
    const seed = new md.Seed(s);
    return new Wallet(seed);
  }

  /**
   * newSeed creates a new wallet seed.
   * @returns {md.Seed} - The seed of a new Wallet.
   */
  static newSeed() {
    const wordCnt = WORDS.length;
    const seedWords = [];

    for (let i = 0; i < 5; ++i) {
      const r = rd.getRandomBytes(4);
      const x = r[3] + (r[2] << 8) + (r[1] << 16) + r[0] * (1 << 24);

      const w1 = x % wordCnt;
      const w2 = (parseInt(x / wordCnt) + w1) % wordCnt;
      const w3 = (parseInt(parseInt(x / wordCnt) / wordCnt) + w2) % wordCnt;

      seedWords.push(WORDS[w1]);
      seedWords.push(WORDS[w2]);
      seedWords.push(WORDS[w3]);
    }
    return new md.Seed(seedWords.join(' '));
  }

  /**
   * register registers a new Wallet & returns the Wallet instances.
   * @returns {Wallet} The new Wallet instance.
   */
  static register() {
    return new this(this.newSeed());
  }

  /**
   * getAcntSeedHash gets account seed hash
   * @param {md.Seed} seed - The wallet seed.
   * @param {md.Nonce} nonce - The nonce.
   * @returns {Buffer} The account seed hash.
   */
  static getAcntSeedHash(seed, nonce) {
    return hs.sha256Hash(
      hs.keccak256Hash(
        hs.blake2b32Hash(Buffer.from(`${nonce.data}${seed.data}`, 'latin1'))
      )
    );
  }

  /**
   * getKeyPair generates a key pair based on the given account seed hash.
   * @param {Buffer} acntSeedHash - The account seed hash.
   * @returns {md.KeyPair} The generated key pair.
   */
  static getKeyPair(acntSeedHash) {
    const kp = curve.genKeyPair(acntSeedHash);

    return new md.KeyPair(
      new md.PubKey(bs58.encode(kp.pub)),
      new md.PriKey(bs58.encode(kp.pri))
    );
  }

  /**
   * getAddr generates an account address.
   * @param {md.PubKey} pubKey - The public key.
   * @param {number} addrVer - The address version.
   * @param {ch.ChainID} chainId - The chain ID.
   * @returns {md.Addr} The generated address.
   */
  static getAddr(pubKey, addrVer, chainId) {
    const rawAddr =
      String.fromCharCode(addrVer) +
      chainId.val +
      hs
        .keccak256Hash(hs.blake2b32Hash(pubKey.bytes))
        .toString('latin1')
        .slice(0, 20);

    const checksum = hs
      .keccak256Hash(hs.blake2b32Hash(Buffer.from(rawAddr, 'latin1')))
      .toString('latin1')
      .slice(0, 4);
    return md.Addr.fromBytes(Buffer.from(rawAddr + checksum, 'latin1'));
  }

  /**
   * @param {Chain} chain
   * @param {number} nonce
   */
  getAcnt(chain, nonce) {
    return new Account(chain, this, new md.Nonce(nonce));
  }
}

/** Account is the class for an account in VSYS blockchain network */
export class Account {
  static addrVer = 5;

  /**
   * Creates a new Account instance.
   * @param {ch.Chain} chain
   * @param {Wallet} wallet
   * @param {md.Nonce} nonce
   */
  constructor(chain, wallet, nonce) {
    this.chain = chain;
    this.wallet = wallet;
    this.nonce = nonce;
    this.acntSeedHash = Wallet.getAcntSeedHash(wallet.seed, this.nonce);
    this.keyPair = Wallet.getKeyPair(this.acntSeedHash);
    this.addr = Wallet.getAddr(
      this.keyPair.pub,
      this.constructor.addrVer,
      this.chain.chainId
    );
  }

  /**
   * api returns the NodeAPI instance of the chain.
   * @returns {api.NodeAPI} The NodeAPI instance.
   */
  get api() {
    return this.chain.api;
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
}
