/**
 * Transaction request module provides transaction requests.
 * @module tx_req
 */

'use strict';

import * as md from './model.js';
import * as curve from './utils/curve_25519.js';
import * as de from './data_entry.js';
import * as en from './utils/enum.js';
import * as bp from './utils/bytes_packer.js';
import * as ctrt from './contract/ctrt.js';

/** TxType is the enum class that defines transaction types. */
class TxType extends en.Enum {
  static elems = {
    GENESIS: 1,
    PAYMENT: 2,
    LEASE: 3,
    LEASE_CANCEL: 4,
    MINTING: 5,
    CONTEND_SLOTS: 6,
    RELEASE_SLOTS: 7,
    REGISTER_CONTRACT: 8,
    EXECUTE_CONTRACT_FUNCTION: 9,
    DB_PUT: 10,
  };
  static _ = this.createElems();

  /**
   * serialize serializes the instance to a single byte.
   * @returns {Buffer} The serialization result.
   */
  serialize() {
    return bp.packUInt8(this.val);
  }
}

/** TxReq is the base class for transaction requests. */
class TxReq {
  static FEE_SCALE = 100;

  /**
   * dataToSign returns the data to sign.
   * @abstract
   * @returns {Buffer} The data to sign.
   */
  get dataToSign() {
    throw new Error('Not implemented');
  }

  /**
   * sign signs the transaction request with the given key pair.
   * @param {md.KeyPair} keyPair - The key pair used for signing.
   * @returns {Buffer} The signature.
   */
  sign(keyPair) {
    return curve.sign(keyPair.pri.bytes, this.dataToSign);
  }
}

/** RegCtrtTxReq is the class for register contract transaction request */
export class RegCtrtTxReq extends TxReq {
  static TX_TYPE = TxType.REGISTER_CONTRACT;

  /**
   * Creates a new RegCtrtTxReq instance.
   * @param {de.DataStack} dataStack
   * @param {ctrt.CtrtMeta} ctrtMeta
   * @param {md.VSYSTimestamp} timestamp
   * @param {md.Str} description
   * @param {md.Fee} fee
   */
  constructor(dataStack, ctrtMeta, timestamp, description, fee) {
    super();
    this.dataStack = dataStack;
    this.ctrtMeta = ctrtMeta;
    this.timestamp = timestamp;
    this.description = description;
    this.fee = fee;
  }

  /**
   * dataToSign returns the data to sign.
   * @returns {Buffer} The data to sign.
   */
  get dataToSign() {
    const ctrtMeta = this.ctrtMeta.serialize();
    const dataStack = this.dataStack.serialize();
    const cls = this.constructor;

    return Buffer.concat([
      cls.TX_TYPE.serialize(),
      bp.packUInt16(ctrtMeta.length),
      ctrtMeta,
      bp.packUInt16(dataStack.length),
      dataStack,
      bp.packUInt16(this.description.data.length),
      this.description.bytes,
      bp.packUInt64(this.fee.bigInt),
      bp.packUInt16(cls.FEE_SCALE),
      bp.packUInt64(this.timestamp.bigInt),
    ]);
  }

  /**
   * toBroadcastRegisterPayload returns the payload for node api /contract/broadcast/register
   * @param {md.KeyPair} keyPair - The key pair used for signing.
   * @returns {object} The payload.
   */
  toBroadcastRegisterPayload(keyPair) {
    return {
      senderPublicKey: keyPair.pub.data,
      contract: new md.Bytes(this.ctrtMeta.serialize()).b58Str,
      initData: new md.Bytes(this.dataStack.serialize()).b58Str,
      description: this.description.data,
      fee: this.fee.data.toNumber(),
      feeScale: this.constructor.FEE_SCALE,
      timestamp: this.timestamp.data.toNumber(),
      signature: new md.Bytes(this.sign(keyPair)).b58Str,
    };
  }
}

/** ExecCtrtFuncTxReq is the class for executing contract transaction request */
export class ExecCtrtFuncTxReq extends TxReq {
  static TX_TYPE = TxType.EXECUTE_CONTRACT_FUNCTION;

  /**
   * Creates a new ExecCtrtFuncTxReq instance.
   * @param {md.CtrtID} ctrtId
   * @param {ctrt.FuncIdx} funcId
   * @param {de.DataStack} dataStack
   * @param {md.VSYSTimestamp} timestamp
   * @param {md.Str} attachment
   * @param {md.ExecCtrtFee} fee
   */
  constructor(ctrtId, funcId, dataStack, timestamp, attachment, fee) {
    super();
    this.ctrtId = ctrtId;
    this.funcId = funcId;
    this.dataStack = dataStack;
    this.timestamp = timestamp;
    this.attachment = attachment;
    this.fee = fee;
  }

  /**
   * dataToSign returns the data to sign.
   * @returns {Buffer} The data to sign.
   */
  get dataToSign() {
    const dataStack = this.dataStack.serialize();
    const cls = this.constructor;

    return Buffer.concat([
      cls.TX_TYPE.serialize(),
      this.ctrtId.bytes,
      this.funcId.serialize(),
      bp.packUInt16(dataStack.length),
      dataStack,
      bp.packUInt16(this.attachment.data.length),
      this.attachment.bytes,
      bp.packUInt64(this.fee.bigInt),
      bp.packUInt16(cls.FEE_SCALE),
      bp.packUInt64(this.timestamp.bigInt),
    ]);
  }

  /**
   * toBroadcastExecutePayload returns the payload for node api /contract/broadcast/execute
   * @param {md.KeyPair} keyPair - The key pair used for signing.
   * @returns {object} The payload.
   */
  toBroadcastExecutePayload(keyPair) {
    return {
      senderPublicKey: keyPair.pub.data,
      contractId: this.ctrtId.data,
      functionIndex: this.funcId.val,
      functionData: new md.Bytes(this.dataStack.serialize()).b58Str,
      attachment: this.attachment.b58Str,
      fee: this.fee.data.toNumber(),
      feeScale: this.constructor.FEE_SCALE,
      timestamp: this.timestamp.data.toNumber(),
      signature: new md.Bytes(this.sign(keyPair)).b58Str,
    };
  }
}
