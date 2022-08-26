/**
 * module dataEntry provides data entries for communicating with the node api.
 * @module dataEntry
 */

'use strict';

import { Buffer } from 'buffer';
import * as md from './model.js';
import * as bp from './utils/bytes_packer.js';

/** DataEntry is the base class for data entries */
export class DataEntry {
  static IDX = 0;
  static SIZE = 0;

  /**
   * Creates DataEntry object.
   * @param {md.Model} data - The data model to contain.
   */
  constructor(data) {
    this.data = data;
  }

  /**
   * idxBytes returns the bytes representation of the data entry index.
   * @returns {Buffer} The bytes representation of the data entry index.
   */
  get idxBytes() {
    return Buffer.of(this.constructor.IDX);
  }

  /**
   * bytes returns the bytes representation of the data entry.
   * @abstract
   * @returns {Buffer} The bytes representation of this data entry.
   */
  get bytes() {
    throw new Error('Not implemented');
  }

  /**
   * fromBytes parses the given bytes and constructs a data entry.
   * It is assumed that the given bytes contains only data(i.e. no other meta info like length)
   * @param {Buffer} b - The bytes to parse.
   * @abstract
   * @returns {DataEntry} - The data entry.
   */
  static fromBytes(b) {
    throw new Error('Not implemented');
  }

  /**
   * serialize serializes the containing data to bytes.
   * @returns {Buffer} The serialization result.
   */
  serialize() {
    return Buffer.concat([this.idxBytes, this.bytes]);
  }

  /**
   * deserialize deserializes the given bytes and constructs a data entry.
   * It is assumed that the given bytes has meta bytes
   * (e.g. data entry index, size, etc) at its front.
   * @param {Buffer} b - The bytes to parse.
   * @abstract
   * @returns {DataEntry} The data entry.
   */
  static deserialize(b) {
    throw new Error('Not implemented');
  }
}

/** FixedSizeB58Str is the base class for data entries that contain
 * fixed-size strings.
 */
class FixedSizeB58Str extends DataEntry {
  static MODEL = md.FixedSizedB58Str;

  /**
   * Create a FixedSizedB58Str instance.
   * @param {md.FixedSizedB58Str} data - The data model to contain.
   */
  constructor(data = new md.FixedSizedB58Str()) {
    super(data);
  }

  /**
   * fromBytes parses the given bytes and constructs a data entry.
   * It is assumed that the given bytes contains only data(i.e. no other meta info like length)
   * @param {Buffer} b - The bytes to parse.
   * @returns {FixedSizeB58Str} The data entry.
   */
  static fromBytes(b) {
    return new this(this.MODEL.fromBytes(b));
  }

  /**
   * fromStr takes the given string as the raw data to contain and constructs a data entry.
   * @param {string} s - The string to contain.
   * @returns {FixedSizeB58Str} The data entry.
   */
  static fromStr(s) {
    return new this(new this.MODEL(s));
  }

  /**
   * deserialize deserializes the given bytes and constructs a data entry.
   * It is assumed that the given bytes has meta bytes
   * (e.g. data entry index, size, etc) at its front.
   * @param {Buffer} b - The bytes to parse.
   * @returns {FixedSizeB58Str} The data entry.
   */
  static deserialize(b) {
    return this.fromBytes(b.slice(1, 1 + this.SIZE));
  }

  /**
   * bytes returns the bytes representation of the data entry.
   * @returns {Buffer} The bytes representation of this data entry.
   */
  get bytes() {
    return this.data.bytes;
  }
}

/** Long is the base class for data entries that contain
 * 8-byte integers
 */
class Long extends DataEntry {
  static SIZE = 8;

  /**
   * Create a Long instance.
   * @param {md.Long} data - The data model to contain.
   */
  constructor(data = new md.Long()) {
    super(data);
  }

  /**
   * fromBytes parses the given bytes and constructs a data entry.
   * It is assumed that the given bytes contains only data(i.e. no other meta info like length)
   * @param {Buffer} b - The bytes to parse.
   * @returns {Long} The data entry.
   */
  static fromBytes(b) {
    return new this(md.Long.fromNumber(bp.unpackUInt64(b)));
  }

  /**
   * deserialize deserializes the given bytes and constructs a data entry.
   * It is assumed that the given bytes has meta bytes
   * (e.g. data entry index, size, etc) at its front.
   * @param {Buffer} b - The bytes to parse.
   * @returns {Long} The data entry.
   */
  static deserialize(b) {
    return this.fromBytes(b.slice(1, 1 + this.SIZE));
  }

  /**
   * bytes returns the bytes representation of the data entry.
   * @returns {Buffer} The bytes representation of this data entry.
   */
  get bytes() {
    return bp.packUInt64(this.data.data);
  }

  /**
   * fromNumber creates a new Long instance from the given number.
   * @param {number} n - The number.
   * @returns {Long} The new Long instance.
   */
  static fromNumber(n) {
    return new this(md.Long.fromNumber(n));
  }
}

/** Text is the baes class for data entries that contain texts
 * (e.g. string, bytes)
 */
class Text extends DataEntry {
  /**
   * lenBytes returns the length in bytes representation of the containing data.
   * @returns {Buffer} The length bytes representation.
   */
  get lenBytes() {
    return bp.packUInt16(this.bytes.length);
  }

  /**
   * serialize serializes the containing data to bytes.
   * @returns {Buffer} The serialization result.
   */
  serialize() {
    return Buffer.concat([this.idxBytes, this.lenBytes, this.bytes]);
  }

  /**
   * deserialize deserializes the given bytes and constructs a data entry.
   * @param {Buffer} b - The bytes to parse.
   * @returns {Text} The data entry.
   */
  static deserialize(b) {
    const l = bp.unpackUInt16(b.slice(1, 3));
    return this.fromBytes(b.slice(3, 3 + l));
  }
}

// Concrete data entry classes are listed below.
// By the order of their indexes

/** PubKey is the data entry class for public key*/
export class PubKey extends FixedSizeB58Str {
  static MODEL = md.PubKey;
  static IDX = 1;
  static SIZE = 32;

  /**
   * Create a new PubKey instance.
   * @param {md.PubKey} data - The data model to contain.
   */
  constructor(data) {
    super(data);
  }
}

/** Addr is the data entry class for addresses */
export class Addr extends FixedSizeB58Str {
  static MODEL = md.Addr;
  static IDX = 2;
  static SIZE = 26;

  /**
   * Create a new Addr instance.
   * @param {md.Addr} data - The data model to contain.
   */
  constructor(data) {
    super(data);
  }
}

/** Amount is the data entry class for amount */
export class Amount extends Long {
  static IDX = 3;

  /**
   * forVsysAmount creates an Amount instance based on the given VSYS coin amount.
   * @param {number} amnt - The amount.
   * @returns {Amount} - The data entry.
   *
   */
  static forVsysAmount(amnt) {
    return new this(md.VSYS.forAmount(amnt));
  }

  /**
   * forTokAmount creates an Amount instance based on the given
   * token amount & unit.
   * @param {number} amnt - The desired tokens amount.
   * @param {number} unit - The unit for the token.
   * @returns {Amount} The Amount instance.
   */
  static forTokAmount(amnt, unit) {
    return new this(md.Token.forAmount(amnt, unit));
  }
}

/** Int32 is the data entry class for 4-byte integer */
export class Int32 extends DataEntry {
  static IDX = 4;
  static SIZE = 4;

  /**
   * fromBytes parses the given bytes and constructs a data entry.
   * It is assumed that the given bytes contains only data(i.e. no other meta info like length)
   * @param {Buffer} b - The bytes to parse.
   * @returns {Int32} The data entry.
   */
  static fromBytes(b) {
    return new this(new md.Int(bp.unpackUInt32(b)));
  }

  /**
   * deserialize deserializes the given bytes and constructs a data entry.
   * It is assumed that the given bytes has meta bytes
   * (e.g. data entry index, size, etc) at its front.
   * @param {Buffer} b - The bytes to parse.
   * @returns {Int32} The data entry.
   */
  static deserialize(b) {
    return this.fromBytes(b.slice(1, 1 + this.SIZE));
  }

  /**
   * bytes returns the bytes representation of the data entry.
   * @returns {Buffer} The bytes representation of this data entry.
   */
  get bytes() {
    return bp.packUInt32(this.data.data);
  }
}

/** Str ia the data entry class for string */
export class Str extends Text {
  static IDX = 5;

  /**
   * Creates a new Str instance.
   * @param {md.Str} data - The data model to contain.
   */
  constructor(data = new md.Str()) {
    super(data);
  }

  /**
   * fromBytes parses the given bytes and constructs a data entry.
   * It is assumed that the given bytes contains only data(i.e. no other meta info like length)
   * @param {Buffer} b - The bytes to parse.
   * @returns {Str} The data entry.
   */
  static fromBytes(b) {
    return new this(md.Str.fromBytes(b));
  }

  /**
   * fromStr constructs a data entry from the given string.
   * @param {string} s - The given string.
   * @returns {Str} The data entry.
   */
  static fromStr(s) {
    return new this(new md.Str(s));
  }

  /**
   * bytes returns the bytes representation of the data entry.
   * @returns {Buffer} The bytes representation of this data entry.
   */
  get bytes() {
    return this.data.bytes;
  }
}

/** CtrtAcnt is the data entry class for contract account */
export class CtrtAcnt extends FixedSizeB58Str {
  static MODEL = md.CtrtID;
  static IDX = 6;
  static SIZE = 26;

  /**
   * Creates a new CtrtAcnt instance.
   * @param {md.CtrtID} data - The data model to contain.
   */
  constructor(data) {
    super(data);
  }
}

/** Acnt is the data entry class for account */
export class Acnt extends FixedSizeB58Str {
  static MODEL = md.Addr;
  static IDX = 7;
  static SIZE = 26;

  /**
   * Creates a new Acnt instance
   * @param {md.Addr} data - The data model to contain.
   */
  constructor(data) {
    super(data);
  }
}

/** TokenID is the data entry class for token ID */
export class TokenID extends FixedSizeB58Str {
  static MODEL = md.TokenID;
  static IDX = 8;
  static SIZE = 30;

  /**
   * Creates a new TokenID instance.
   * @param {md.TokenID} data - The data model to contain.
   */
  constructor(data) {
    super(data);
  }
}

/** Timestamp is the data entry class for Timestamp */
export class Timestamp extends Long {
  static IDX = 9;

  /**
   * Creates a new Timestamp instance.
   * @param {md.VSYSTimestamp} data - The data model to contain.
   */
  constructor(data) {
    super(data);
  }

  /**
   * now returns a Timestamp instance of the current timestamp.
   * @returns {Timestamp} The data entry instance.
   */
  static now() {
    return new this(md.VSYSTimestamp.now());
  }

  /**
   * fromUnixTs creates a new Timestamp from the given UNIX timestamp at milliseconds.
   * @param {number} uxTs - UNIX timestamp as interger.
   * @returns {Timestamp} The Timestamp instance.
   */
  static fromUnixTs(uxTs) {
    return new this(md.VSYSTimestamp.fromUnixTs(uxTs));
  }
}

/** Bool is the data entry class for boolean values */
export class Bool extends DataEntry {
  static IDX = 10;
  static SIZE = 1;

  /**
   * Creates a new Bool instance.
   * @param {md.Bool} data - The data model to contain.
   */
  constructor(data) {
    super(data);
  }

  /**
   * fromBytes parses the given bytes and constructs a data entry.
   * It is assumed that the given bytes contains only data(i.e. no other meta info like length)
   * @param {Buffer} b - The bytes to parse.
   * @returns {Bool} The data entry.
   */
  static fromBytes(b) {
    return new this(md.Bool(bp.unpackBool(b)));
  }

  /**
   * deserialize deserializes the given bytes and constructs a data entry.
   * It is assumed that the given bytes has meta bytes
   * (e.g. data entry index, size, etc) at its front.
   * @param {Buffer} b - The bytes to parse.
   * @returns {Bool} The data entry.
   */
  static deserialize(b) {
    return this.fromBytes(b.slice(1, 1 + this.SIZE));
  }

  /**
   * bytes returns the bytes representation of the data entry.
   * @returns {Buffer} The bytes representation of this data entry.
   */
  get bytes() {
    return bp.packBool(this.data.data);
  }
}

/** Bytes is the data entry class for bytes */
export class Bytes extends Text {
  static IDX = 11;

  /**
   * Creates a new Bytes instance.
   * @param {md.Bytes} data - The data model to contain.
   */
  constructor(data = new md.Bytes()) {
    super(data);
  }

  /**
   * fromBytes parses the given bytes and constructs a data entry.
   * It is assumed that the given bytes contains only data(i.e. no other meta info like length)
   * @param {Buffer} b - The bytes to parse.
   * @returns {Bytes} The data entry.
   */
  static fromBytes(b) {
    return new this(new md.Bytes(b));
  }

  /**
   * fromStr gets the data entry from a string.
   * @param {string} s - The string to parse.
   * @returns {Bytes} The Bytes instance.
   */
  static fromStr(s) {
    return new this(md.Bytes.fromStr(s));
  }

  /**
   * fromBase58Str get the data entry from a b58 string.
   * @param {string} s - The base58 string to parse.
   * @returns {Bytes} The Bytes instance.
   */
  static fromBase58Str(s) {
    return new this(md.Bytes.fromB58Str(s));
  }

  /**
   * bytes returns the bytes representation of the data entry.
   * @returns {Buffer} The bytes representation of this data entry.
   */
  get bytes() {
    return this.data.data;
  }
}

/** Balance is the data entry class for balance*/
export class Balance extends Long {
  static IDX = 12;
}

/** INDEX_MAP provides mapping between data entry indexes & data entry classes */
const INDEX_MAP = new Map([
  [1, PubKey],
  [2, Addr],
  [3, Amount],
  [4, Int32],
  [5, Str],
  [6, CtrtAcnt],
  [7, Acnt],
  [8, TokenID],
  [9, Timestamp],
  [10, Bool],
  [11, Bytes],
  [12, Balance],
]);

/** DataStack is the collection of data entries */
export class DataStack {
  /**
   * Creates a new DataStack instance.
   * @param {DataEntry[]} dataEntries - The data entries to contain.
   */
  constructor(...dataEntries) {
    this.entries = dataEntries;
  }

  /**
   * serialize serializes the DataStack object to bytes.
   * @returns {Buffer} The serialization result.
   */
  serialize() {
    const bufs = [bp.packUInt16(this.entries.length)];

    this.entries.forEach((de) => bufs.push(de.serialize()));
    return Buffer.concat(bufs);
  }

  /**
   * deserialize deserializes the given bytes to a DataStack object.
   * @returns {DataStack} The DataStack instance.
   */
  static deserialize(b) {
    const entriesCnt = bp.unpackUInt16(b.slice(0, 2));
    let data = b.slice(2);

    const entries = [];

    for (let i = 0; i < entriesCnt; i++) {
      const idx = bp.unpackUInt8(data.slice(0, 1));
      const deCls = INDEX_MAP.get(idx);
      const de = deCls.deserialize(data);
      entries.push(de);
      data = data.slice(de.serialize().length);
    }
    return new this(...entries);
  }
}
