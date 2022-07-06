/**
 * module contract/ctrt provides utilities & base classes for smart contracts.
 * @module contract/ctrt
 */

'use strict';

import { Buffer } from 'buffer';
import * as md from '../model.js';
import * as ch from '../chain.js';
import * as de from '../data_entry.js';
import * as bp from '../utils/bytes_packer.js';
import * as en from '../utils/enum.js';

/** FuncIdx is the class for function indexes */
export class FuncIdx extends en.Enum {
  serialize() {
    return bp.packUInt16(this.val);
  }
}

/** StateVar is the class for state variables */
export class StateVar extends en.Enum {
  serialize() {
    return bp.packUInt8(this.val);
  }
}

/** StateMapIdx is the class for state map indexes */
export class StateMapIdx extends en.Enum {}

/** StateMap is the class for state map */
export class StateMap {
  /**
   * @param {StateMapIdx} idx - The state map index.
   * @param {de.DataEntry} dataEntry - The data entry.
   */
  constructor(idx, dataEntry) {
    this.idx = idx;
    this.dataEntry = dataEntry;
  }

  /**
   * serialize serializes the instance to bytes.
   * @returns {Buffer} The serialization result.
   */
  serialize() {
    return Buffer.concat([
      bp.packUInt8(this.idx.val),
      this.dataEntry.serialize(),
    ]);
  }
}

/** DBKey is the class for DB key */
export class DBKey extends md.Bytes {}

/** Ctrt is the base class for smart contracts */
export class Ctrt {
  /**
   * Creates a new smart contract instance.
   * @param {string} ctrtId - The contract ID.
   * @param {ch.Chain} chain - The chain.
   */
  constructor(ctrtId, chain) {
    this.ctrtId = new md.CtrtID(ctrtId);
    this.chain = chain;
  }

  /**
   * queryDbKey queries the data by the given dbKey.
   * @param {DBKey} dbKey - The dbKey to query.
   * @returns {any} The querying result.
   */
  async queryDbKey(dbKey) {
    const data = await this.chain.api.ctrt.getCtrtData(
      this.ctrtId.data,
      dbKey.b58Str
    );
    return data['value'];
  }
}

/** BaseTokCtrt is the base class for token contracts */
export class BaseTokCtrt extends Ctrt {
  /**
   * getUnit returns the unit of the token contract.
   * @abstract
   * @returns {number} The unit of the token.
   */
  async getUnit() {
    throw new Error('Not implemented');
  }

  /**
   * getTokId gets the token ID of the token contract with the given token index.
   * @param {number} tokIdx - The token index.
   * @returns {md.TokenID} The token ID.
   */
  getTokId(tokIdx) {
    return this.ctrtId.getTokId(tokIdx);
  }

  /**
   * getLastTokIdx gets the last token index of the contract.
   * @returns {number} The last token index.
   */
  async getLastTokIdx() {
    const resp = await this.chain.api.ctrt.getLastTokIdx(this.ctrtId.data);
    return resp.lastTokenIndex;
  }
}
