/**
 * module model provides data models as data containers with handy methods.
 * @module model
 */

'use strict';

import bs58 from 'bs58';
import { Buffer } from 'buffer';
import * as ch from './chain.js';
import * as bn from './utils/big_number.js';
import * as hs from './utils/hashes.js';
import { WORDS_SET } from './words.js';

/** Model is the base class for data models */
export class Model {
  /**
   * Create a new Model instance.
   * @param {any} data - The data to contain.
   */
  constructor(data) {
    this.data = data;
    this.validate();
  }

  /**
   * validate validates the instance.
   * @abstract
   */
  validate() {}

  /**
   * equal compares this instance with the given instance to see if they are equal.
   * @param {Model} other - The other instance to compare.
   * @returns {boolean} - If the 2 instances are equal.
   */
  equal(other) {
    return this.constructor === other.constructor && this.data === other.data;
  }
}

/** Bytes is the data model class for bytes */
export class Bytes extends Model {
  /**
   * Creates a new Bytes instance.
   * @param {Buffer} data - The data to contain.
   */
  constructor(data = Buffer.of()) {
    super(data);
  }

  /**
   * b58Str returns the base58 string representation of the contained data.
   * @returns {string} The base58 string representation.
   */
  get b58Str() {
    return bs58.encode(this.data);
  }

  /**
   * validate validates the instance.
   */
  validate() {
    super.validate();

    if (!(this.data instanceof Buffer)) {
      const cls = this.constructor;
      throw new Error(`Data in ${cls.name} must be Buffer`);
    }
  }

  /**
   * fromB58Str parses the given base58 string and returns a Bytes instance.
   * @param {string} s - The string to parse.
   * @returns {Bytes} The Bytes instance.
   */
  static fromB58Str(s) {
    return new this(Buffer.from(bs58.decode(s)));
  }

  /**
   * fromStr parses the given string and returns a Bytes instance.
   * @param {string} s - The string to parse.
   * @returns {Bytes} The Bytes instance.
   */
  static fromStr(s) {
    return new this(Buffer.from(s, 'latin1'));
  }
}

/** Str is the data model class for string */
export class Str extends Model {
  /**
   * Creates a new Str instance.
   * @param {string} data - The data to contain.
   */
  constructor(data = '') {
    super(data);
  }

  /**
   * bytes returns the bytes representation of the contained data.
   * @returns {Buffer} The bytes representation of the contained data.
   */
  get bytes() {
    return Buffer.from(this.data, 'latin1');
  }

  /**
   * b58Str returns the base58 string representation of the contained data.
   * @returns {string} The base58 string representation of the contained data.
   */
  get b58Str() {
    return bs58.encode(Buffer.from(this.data, 'latin1'));
  }

  /**
   * fromBytes parses the given bytes and constructs a data model.
   * @param {Buffer} b - The data to parse.
   * @returns {Str} A new Str instance.
   */
  static fromBytes(b) {
    return new this(Buffer.from(b, 'latin1').toString('latin1'));
  }

  /**
   * validate validates the instance.
   */
  validate() {
    super.validate();

    if (!(typeof this.data === 'string')) {
      throw new Error(`Data in ${this.constructor.name} must be a string`);
    }
  }
}

/** Seed is the data model class for wallet seed */
export class Seed extends Str {
  static WORD_CNT = 15;

  /**
   * validate validates the instance.
   */
  validate() {
    super.validate();

    const expectedWordCnt = 15;
    const words = this.data.split(' ');
    const cls = this.constructor;

    if (words.length !== expectedWordCnt) {
      throw new Error(
        `Data in ${cls.name} must contain exactly ${cls.WORD_CNT} words`
      );
    }

    for (const w of words) {
      if (!WORDS_SET.has(w)) {
        throw new Error(`Data in ${cls.name} contains invalid words`);
      }
    }
  }
}

/** B58Str is the data model class base58 string */
export class B58Str extends Str {
  /**
   * bytes returns the bytes representation of the contained data.
   * @returns {Buffer} The bytes representation of the contained data.
   */
  get bytes() {
    return Buffer.from(bs58.decode(this.data));
  }

  /**
   * fromBytes parses the given bytes and constructs a data model.
   * @param {Buffer} b - The data to parse.
   * @returns {B58Str} A new B58Str instance.
   */
  static fromBytes(b) {
    return new this(bs58.encode(b));
  }

  /**
   * validate validates the instance.
   */
  validate() {
    super.validate();

    try {
      this.bytes;
    } catch {
      throw new Error(
        `Data in ${this.constructor.name} must be base58-decodable`
      );
    }
  }
}

/** FixedSizedB58Str is the data model class for fixed sized strings */
export class FixedSizedB58Str extends B58Str {
  static BYTES_LEN = 0;

  /**
   * validate validates the instance.
   */
  validate() {
    super.validate();
    const cls = this.constructor;

    if (this.bytes.length !== cls.BYTES_LEN) {
      throw new Error(
        `Data in ${cls.name} must be exactly ${cls.BYTES_LEN} bytes after base58 decode`
      );
    }
  }
}

/** PubKey is the data model class for public keys */
export class PubKey extends FixedSizedB58Str {
  static BYTES_LEN = 32;
}

/** Prikey is the data model class for private keys */
export class PriKey extends FixedSizedB58Str {
  static BYTES_LEN = 32;
}

/** Addr is the data model class for addresses */
export class Addr extends FixedSizedB58Str {
  static VERSION = 5;
  static VER_BYTES_LEN = 1;
  static CHAINID_BYTES_LEN = 1;
  static PUBKEY_HASH_BYTES_LEN = 20;
  static CHECKSUM_BYTES_LEN = 4;
  static BYTES_LEN =
    this.VER_BYTES_LEN +
    this.CHAINID_BYTES_LEN +
    this.PUBKEY_HASH_BYTES_LEN +
    this.CHECKSUM_BYTES_LEN;

  /**
   * version returns the address version.
   * @returns {number} The address version.
   */
  get version() {
    return this.bytes[0];
  }

  /**
   * chainId returns the chain ID.
   * @returns {ch.ChainID} The chain ID.
   */
  get chainId() {
    return ch.ChainID.fromStr(String.fromCharCode(this.bytes[1]));
  }

  /**
   * pubKeyHash returns the public key hash.
   * @returns {Buffer} The public key hash.
   */
  get pubKeyHash() {
    const cls = this.constructor;

    return this.bytes
      .slice(cls.VER_BYTES_LEN + cls.CHAINID_BYTES_LEN)
      .slice(0, cls.PUBKEY_HASH_BYTES_LEN);
  }

  /**
   * checksum returns the checksum.
   * @returns {Buffer} The checksum.
   */
  get checksum() {
    const cls = this.constructor;
    return this.bytes.slice(-cls.CHECKSUM_BYTES_LEN);
  }

  /**
   * validate validates the instance.
   */
  validate() {
    super.validate();
    const cls = this.constructor;

    if (this.version !== cls.VERSION) {
      throw new Error(`Data in ${cls.name} has invalid address version`);
    }

    try {
      this.chainId.validate();
    } catch {
      throw new Error(`Data in ${cls.name} has invalid chain ID`);
    }

    const expectedChecksum = hs
      .keccak256Hash(
        hs.blake2b32Hash(this.bytes.slice(0, -cls.CHECKSUM_BYTES_LEN))
      )
      .slice(0, cls.CHECKSUM_BYTES_LEN);

    if (!this.checksum.equals(expectedChecksum)) {
      throw new Error(`Data in ${cls.name} has invalid checksum`);
    }
  }

  /**
   * mustOn asserts the address must be valid for the given chain.
   * @param {ch.Chain} chain - The chain.
   */
  mustOn(chain) {
    if (this.chainId !== chain.chainId) {
      throw new Error(
        `Addr is not on the chain. The Addr has chainId ${this.chainId} while the chain expects ${chain.chainId}`
      );
    }
  }
}

/** CtrtID is the data model class for contract ID */
export class CtrtID extends FixedSizedB58Str {
  static BYTES_LEN = 26;
}

/** TokenID is the data model class for token ID */
export class TokenID extends FixedSizedB58Str {
  static BYTES_LEN = 30;
  static MAINNET_VSYS_TOK_ID = 'TWatCreEv7ayv6iAfLgke6ppVV33kDjFqSJn8yicf';
  static TESTNET_VSYS_TOK_ID = 'TWuKDNU1SAheHR99s1MbGZLPh1KophEmKk1eeU3mW';

  get isVsysTok() {
    return this.isMainnetVsysTok || this.isTestnetVsysTok;
  }

  get isMainnetVsysTok() {
    return this.data === this.constructor.MAINNET_VSYS_TOK_ID;
  }

  get isTestnetVsysTok() {
    return this.data === this.constructor.TESTNET_VSYS_TOK_ID;
  }
}

/** KeyPair is the data model class for key pair */
export class KeyPair {
  /**
   * Create a new KeyPair instance.
   * @param {PubKey} pub - The public key.
   * @param {PriKey} pri - The private key.
   */
  constructor(pub, pri) {
    this.pub = pub;
    this.pri = pri;
  }
}

/** Int is the data model class for integers */
export class Int extends Model {
  /**
   * Creates a new Int instance.
   * @param {number} data - The data to contain.
   */
  constructor(data = 0) {
    super(data);
  }

  /**
   * validate validates the instance.
   */
  validate() {
    super.validate();

    if (!Number.isInteger(this.data)) {
      throw new Error(`Data in ${this.constructor.name} must be an integer`);
    }
  }
}

/** NonNegativeInt is the data model class for non-negative integers */
export class NonNegativeInt extends Int {
  /**
   * validate validates the instance.
   */
  validate() {
    super.validate();

    if (this.data < 0) {
      throw new Error(`Data in ${this.constructor.name} must be non-negative`);
    }
  }
}

/** Nonce is the data model class for wallet account nonce */
export class Nonce extends NonNegativeInt {}

/** TokenIdx is the data model class for token index */
export class TokenIdx extends NonNegativeInt {}

/** Long is the data model class for long integers (big number) */
export class Long extends Model {
  /**
   * Creates a new Long instance.
   * @param {bn.BigNumber} data - The data to contain.
   */
  constructor(data = new bn.BigNumber(0)) {
    super(data);
  }

  /**
   * bigInt returns the containing data in JavaScript built-in BigInt.
   * @returns {BigInt}
   */
  get bigInt() {
    return bn.toBigInt(this.data);
  }

  /**
   * validate validates the instance.
   */
  validate() {
    super.validate();

    if (!bn.BigNumber.isBigNumber(this.data)) {
      throw new Error(`Data in ${this.constructor.name} must be BigNumber`);
    }
  }

  /**
   * fromNumber creates a new Long instance from the given number.
   * @param {number} n - The number.
   * @returns {Long} The new Long instance.
   */
  static fromNumber(n) {
    return new this(new bn.BigNumber(n));
  }
}

/** NonNegativeBigInt is the data model class for non-negative big integers */
export class NonNegativeBigInt extends Long {
  /**
   * validate validates the instance.
   */
  validate() {
    super.validate();

    if (this.data < 0) {
      throw new Error(`Data in ${this.constructor.name} must be non-negative`);
    }
  }
}

/** VSYSTimestamp is the data model class for timestamp used in VSYS blockchain network */
export class VSYSTimestamp extends NonNegativeBigInt {
  // In JS, Date.now() returns the unix timestamp in milliseconds.
  static SCALE = 1e6;

  /**
   * unixTx returns the unix timestamp contained in VSYSTimestamp.
   * @returns {number} The unix timestamp.
   */
  get unixTs() {
    return this.data.dividedBy(this.constructor.SCALE).toNumber();
  }

  /**
   * validate validates the instance.
   */
  validate() {
    super.validate();

    const cls = this.constructor;

    if (this.data !== 0 && this.data < cls.SCALE) {
      throw new Error(
        `Data in ${cls.name} must either be 0 or equal or greater than ${cls.SCALE}`
      );
    }
  }

  /**
   * now creates a new VSYSTimestamp for current time.
   * @returns {VSYSTimestamp} The VSYSTimestamp instance.
   */
  static now() {
    const n = new bn.BigNumber(Date.now());
    return new this(n.multipliedBy(this.SCALE));
  }

  /**
   * fromUnixTs creates a new VSYSTimestamp from the given UNIX timestamp at milliseconds.
   * @param {number} uxTs - UNIX timestamp as interger.
   * @returns {VSYSTimestamp} The VSYSTimestamp instance.
   */
  static fromUnixTs(uxTs) {
    if (typeof uxTs !== 'number') {
      throw new Error(`uxTs must be a number`);
    }

    return new this(new bn.BigNumber(uxTs).multipliedBy(this.SCALE));
  }
}

/** Token is the data model class for general token amount */
export class Token extends NonNegativeBigInt {
  /**
   * Create a Token instance.
   * @param {bn.BigNumber} data - The data to contain.
   * @param {number} unit - The unit of the token.
   */
  constructor(data, unit) {
    super(data);
    this.unit = unit;
  }

  /**
   * amount returns the natural amount (without multiplying the unit)
   * @returns {bn.BigNumber}
   */
  get amount() {
    return this.data.dividedBy(this.unit);
  }

  /**
   * forAmount creates a new Token where the amount is equal to the given amount.
   * @param {number} amount - The raw amount.
   * @param {number} unit - The unit of the token.
   * @returns {Token} The Token instance.
   */
  static forAmount(amount, unit) {
    const amntBN = new bn.BigNumber(amount);
    const data = amntBN.times(unit);

    if (!data.isInteger()) {
      throw new Error(
        `Invalid amount for ${
          this.name
        }: ${amount}. The minimal valid amount granularity is ${1 / unit}`
      );
    }
    return new this(data, unit);
  }

  /**
   * fromNumber creates a new Token isntance from the given number.
   * @param {any} n - The number.
   * @param {any} unit - The unit.
   * @returns {Token} The Token instance.
   */
  static fromNumber(n, unit) {
    return new this(new bn.BigNumber(n), unit);
  }
}

/** VSYS is the data model class for VSYS coin amount */
export class VSYS extends NonNegativeBigInt {
  static UNIT = 1e8;

  /**
   * amount returns the natural amount (without multiplying the unit)
   * @returns {bn.BigNumber}
   */
  get amount() {
    return this.data.dividedBy(this.constructor.UNIT);
  }

  /**
   * forAmount creates a new VSYS where the amount equals to the given amount.
   * @param {number} amnt - The natural amount.
   * @returns {VSYS} The VSYSTimestamp instance.
   */
  static forAmount(amnt) {
    const amntBN = new bn.BigNumber(amnt);
    const data = amntBN.times(this.UNIT);

    if (!data.isInteger()) {
      throw new Error(
        `Invalid amount for ${
          this.name
        }: ${amnt}. The minimal valid amount granularity is ${1 / this.UNIT}`
      );
    }

    return new this(data);
  }
}

/** Fee is the data model class for gas fee in VSYS blockchain network */
export class Fee extends VSYS {
  static DEFAULT = VSYS.UNIT * 0.1;

  /**
   * validate validates the instance.
   */
  validate() {
    super.validate();
    const cls = this.constructor;

    if (this.data < cls.DEFAULT) {
      throw new Error(
        `Data in ${cls.name} must be equal or greater than ${cls.DEFAULT}`
      );
    }
  }

  /**
   * default creates a Fee object with default value.
   * @returns {Fee} The Fee object.
   */
  static default() {
    return this.fromNumber(this.DEFAULT);
  }
}

/** PaymentFee is the data model class for payment fee */
export class PaymentFee extends Fee {}

/** RegCtrtFee is the data model class for register contract fee */
export class RegCtrtFee extends Fee {
  static DEFAULT = VSYS.UNIT * 100;
}

/** ExecCtrtFee is the data model class for execute contract fee */
export class ExecCtrtFee extends Fee {
  static DEFAULT = VSYS.UNIT * 0.3;
}

/** Bool is the data model class for boolean values */
export class Bool extends Model {
  /**
   * Creates a new Bool instance.
   * @param {boolean} data - The data to contain.
   */
  constructor(data = false) {
    super(data);
  }

  /**
   * validate validates the instance.
   */
  validate() {
    super.validate();
    const cls = this.constructor;

    if (!(typeof this.data === 'boolean')) {
      throw new Error(`Data in ${cls.name} must be a bool`);
    }
  }
}
