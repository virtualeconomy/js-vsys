/**
 * module contract/ctrt provides utilities & base classes for smart contracts.
 * @module contract/ctrt
 */

'use strict';

import { Buffer } from 'buffer';
import bs58 from 'bs58';
import * as md from '../model.js';
import * as ch from '../chain.js';
import * as de from '../data_entry.js';
import * as bp from '../utils/bytes_packer.js';
import * as en from '../utils/enum.js';
import * as hs from '../utils/hashes.js';

/** Bytes is the helper data container for bytes used in contract meta data
 * with handy methods.
 */
class Bytes {
  /**
   * Creates a new Bytes instance.
   * @param {any} data - The bytes data to contain.
   */
  constructor(data = Buffer.of()) {
    this.data = data;
  }

  /**
   * lenBytes returns the length of the data in bytes.
   * @returns {Buffer} The bytes data to contain.
   */
  get lenBytes() {
    return bp.packUInt16(this.data.length);
  }

  /**
   * serialize serializes the instance to bytes.
   * @returns {Buffer} The serialization result.
   */
  serialize() {
    return Buffer.concat([this.lenBytes, this.data]);
  }

  /**
   * deserialize deserializes the given bytes and constructs a new Bytes instance.
   * @param {Buffer} b - The bytes to parse.
   * @returns {Bytes} The Bytes instance.
   */
  static deserialize(b) {
    const l = bp.unpackUInt16(b.slice(0, 2));
    return new this(b.slice(2, 2 + l));
  }
}

/** BytesList is a collection of Bytes */
class BytesList {
  /**
   * Creates a new BytesList instance.
   * @param {Bytes[]} items - The Bytes instances to contain.
   */
  constructor(...items) {
    this.items = items;
  }

  /**
   * serialize serializes the instance to bytes.
   * @param {boolean} withBytesLen - Whether or not to include the bytes length in the serialization result.
   * @returns {Buffer} The serialization result.
   */
  serialize(withBytesLen = true) {
    const bufs = [bp.packUInt16(this.items.length)];
    this.items.forEach((item) => bufs.push(item.serialize()));

    let b = Buffer.concat(bufs);

    if (withBytesLen === true) {
      b = Buffer.concat([bp.packUInt16(b.length), b]);
    }
    return b;
  }

  /**
   * deserialize deserialize the given bytes to a BytesList instance.
   * @param {Buffer} b - The bytes to deserialize
   * @param {boolean} withBytesLen - If the given bytes contain length.
   * @returns {BytesList} The BytesList instance.
   */
  static deserialize(b, withBytesLen = true) {
    if (withBytesLen === true) {
      const l = bp.unpackUInt16(b.slice(0, 2));
      b = b.slice(2, 2 + l);
    }

    const itemsCnt = bp.unpackUInt16(b.slice(0, 2));
    b = b.slice(2);

    const items = [];
    for (let i = 0; i < itemsCnt; i++) {
      const l = bp.unpackUInt16(b.slice(0, 2));
      items.push(Bytes.deserialize(b));
      b = b.slice(2 + l);
    }
    return new this(...items);
  }
}

/** CtrtMeta is the class for smart contract meta data */
export class CtrtMeta {
  static LANG_CODE_BYTE_LEN = 4;
  static LANG_VER_BYTE_LEN = 4;
  static TOKEN_ADDR_VER = -124;
  static CHECKSUM_LEN = 4;

  /**
   * Create a new CtrtMeta instance.
   * @param {string} langCode - The language code of the contract. E.g. 'vdds'.
   * @param {int} langVer - The language version of the contract. E.g. 1.
   * @param {BytesList} triggers - The triggers of the contract.
   * @param {BytesList} descriptors - The descriptors of the contract.
   * @param {BytesList} stateVars - The state variables of the contract.
   * @param {BytesList} stateMap - The state map of the contract.
   * @param {BytesList} textual - The textual of the contract.
   */
  constructor(
    langCode,
    langVer,
    triggers,
    descriptors,
    stateVars,
    stateMap,
    textual
  ) {
    this.langCode = langCode;
    this.langVer = langVer;
    this.triggers = triggers;
    this.descriptors = descriptors;
    this.stateVars = stateVars;
    this.stateMap = stateMap;
    this.textual = textual;
  }

  /**
   * serialize serializes CtrtMeta to bytes.
   * @returns {Buffer} - The serialization result.
   */
  serialize() {
    const stmapBytes =
      this.langVer === 1 ? Buffer.of() : this.stateMap.serialize();
    return Buffer.concat([
      Buffer.from(this.langCode, 'latin1'),
      bp.packUInt32(this.langVer),
      this.triggers.serialize(),
      this.descriptors.serialize(),
      this.stateVars.serialize(),
      stmapBytes,
      this.textual.serialize(false),
    ]);
  }

  /**
   * deserialize deserializes the given bytes to a CtrtMeta object.
   * @param {Buffer} b - The bytes to parse.
   * @returns {CtrtMeta} The CtrtMeta instance.
   */
  static deserialize(b) {
    /**
     * parseLen unpacks the given 2 bytes as an unsigned short integer.
     * @param {Buffer} b - The bytes to deserialize.
     * @returns {number} The length.
     */
    function parseLen(b) {
      return bp.unpackUInt16(b);
    }

    const langCode = b.slice(0, 4).toString('latin1');
    b = b.slice(4);

    const langVer = bp.unpackUInt32(b.slice(0, 4));
    b = b.slice(4);

    const triggerLen = parseLen(b.slice(0, 2));
    const triggers = BytesList.deserialize(b);
    b = b.slice(2 + triggerLen);

    const descriptorsLen = parseLen(b.slice(0, 2));
    const descriptors = BytesList.deserialize(b);
    b = b.slice(2 + descriptorsLen);

    const svLen = parseLen(b.slice(0, 2));
    const stateVars = BytesList.deserialize(b);
    b = b.slice(2 + svLen);

    let stateMap;

    if (langVer === 1) {
      stateMap = new BytesList();
    } else {
      const smLen = parseLen(b.slice(0, 2));
      stateMap = BytesList.deserialize(b);
      b = b.slice(2 + smLen);
    }

    const textual = BytesList.deserialize(b, false);

    return new this(
      langCode,
      langVer,
      triggers,
      descriptors,
      stateVars,
      stateMap,
      textual
    );
  }

  /**
   * fromB58Str creates a CtrtMeta object from the given base58 string.
   * @param {string} s - The base58 string to parse.
   * @returns {CtrtMeta} The result CtrtMeta object.
   */
  static fromB58Str(s) {
    return this.deserialize(Buffer.from(bs58.decode(s)));
  }
}

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
   */
  async getUnit() {
    throw new Error('Not implemented');
  }

  /**
   * getTokId gets the token ID of the token contract with the given token index.
   * @param {number} tokIdx - The token index.
   * @returns {md.TokenID} The token ID.
   */
  async getTokId(tokIdx) {
    new md.TokenIdx(tokIdx); // for validation

    const b = this.ctrtId.bytes;
    const rawCtrtId = b.slice(1, b.length - CtrtMeta.CHECKSUM_LEN);
    const ctrtIdNoChecksum = Buffer.concat([
      bp.packInt8(CtrtMeta.TOKEN_ADDR_VER),
      rawCtrtId,
      bp.packUInt32(tokIdx),
    ]);

    const h = hs.keccak256Hash(hs.blake2b32Hash(ctrtIdNoChecksum));

    const tokIdBytes = bs58.encode(
      Buffer.concat([ctrtIdNoChecksum, h.slice(0, CtrtMeta.CHECKSUM_LEN)])
    );

    const tokId = tokIdBytes.toString('latin1');
    return new md.TokenID(tokId);
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
