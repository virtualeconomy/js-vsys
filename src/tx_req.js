/**
 * module txReq provides transaction requests.
 * @module txReq
 */

'use strict';

import * as md from './model.js';
import * as curve from './utils/curve_25519.js';
import * as de from './data_entry.js';
import * as en from './utils/enum.js';
import * as bp from './utils/bytes_packer.js';
import * as ctrt from './contract/ctrt.js';
import * as dp from './dbput.js';

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
    if (keyPair instanceof md.KeyPair) {
      return curve.sign(keyPair.pri.bytes, this.dataToSign);
    }
    else {
      return keyPair.sign(this.dataToSign);
    }
  }
}

/** PaymentTxReq is the class for payment transaction request */
export class PaymentTxReq extends TxReq {
  static TX_TYPE = TxType.PAYMENT;

  /**
   * Creates a PaymentTxReq object.
   * @param {md.Addr} recipient - The address of the recipient.
   * @param {md.VSYS} amount - The amount of VSYS coins to sends.
   * @param {md.VSYSTimestamp} timestamp - The timestamp of this request.
   * @param {md.Str} attachment - The attachment for this request. Defaults to new md.Str().
   * @param {md.PaymentFee} fee - The fee for this request. Defaults to md.PaymentFee.default().
   */
  constructor(
    recipient,
    amount,
    timestamp,
    attachment = new md.Str(),
    fee = md.PaymentFee.default()
  ) {
    super();
    this.recipient = recipient;
    this.amount = amount;
    this.timestamp = timestamp;
    this.attachment = attachment;
    this.fee = fee;
  }

  /**
   * dataToSign returns the data to sign.
   * @returns {Buffer} The data to sign.
   */
  get dataToSign() {
    const cls = this.constructor;
    return Buffer.concat([
      cls.TX_TYPE.serialize(),
      bp.packUInt64(this.timestamp.data),
      bp.packUInt64(this.amount.data),
      bp.packUInt64(this.fee.data),
      bp.packUInt16(cls.FEE_SCALE),
      this.recipient.bytes,
      bp.packUInt16(this.attachment.data.length),
      this.attachment.bytes,
    ]);
  }

  /**
   * toBroadcastPaymentPayload returns the payload for node api /vsys/broadcast/payment
   * @param {md.KeyPair} keyPair - The key pair used for signing.
   * @returns {object} The payload.
   */
  toBroadcastPaymentPayload(keyPair) {
    return {
      senderPublicKey: keyPair.pub.data,
      recipient: this.recipient.data,
      amount: this.amount.data.toNumber(),
      fee: this.fee.data.toNumber(),
      feeScale: this.constructor.FEE_SCALE,
      timestamp: this.timestamp.data.toNumber(),
      attachment: this.attachment.b58Str,
      signature: new md.Bytes(this.sign(keyPair)).b58Str,
    };
  }
}

/** RegCtrtTxReq is the class for register contract transaction request */
export class RegCtrtTxReq extends TxReq {
  static TX_TYPE = TxType.REGISTER_CONTRACT;

  /**
   * Creates a new RegCtrtTxReq instance.
   * @param {de.DataStack} dataStack - The payload of this request.
   * @param {md.CtrtMeta} ctrtMeta - The meta data of the contract to register.
   * @param {md.VSYSTimestamp} timestamp - The timestamp of this request.
   * @param {md.Str} description - The description for this request. Defaults to new md.Str().
   * @param {md.RegCtrtFee} fee - The fee for this request. Defaults to md.RegCtrtFee.default().
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
      bp.packUInt64(this.fee.data),
      bp.packUInt16(cls.FEE_SCALE),
      bp.packUInt64(this.timestamp.data),
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
   * @param {md.CtrtID} ctrtId - The contract id.
   * @param {ctrt.FuncIdx} funcId - The function index.
   * @param {de.DataStack} dataStack - The payload of this request.
   * @param {md.VSYSTimestamp} timestamp - The timestamp of this request.
   * @param {md.Str} attachment - The attachment for this request. Defaults to new md.Str().
   * @param {md.ExecCtrtFee} fee - The fee for this request. Defaults to md.ExecCtrtFee.default().
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
      bp.packUInt64(this.fee.data),
      bp.packUInt16(cls.FEE_SCALE),
      bp.packUInt64(this.timestamp.data),
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

/** LeaseTxReq is the class for leasing transaction request */
export class LeaseTxReq extends TxReq {
  static TX_TYPE = TxType.LEASE;

  /**
   * Creates a new LeaseTxReq instance.
   * @param {md.Addr} supernodeAddr - The supernode address.
   * @param {md.VSYS} amount - The function index.
   * @param {md.VSYSTimestamp} timestamp - The timestamp of this request.
   * @param {md.ExecCtrtFee} fee - The fee for this request. Defaults to md.ExecCtrtFee.default().
   */
  constructor(supernodeAddr, amount, timestamp, fee) {
    super();
    this.supernodeAddr = supernodeAddr;
    this.amount = amount;
    this.timestamp = timestamp;
    this.fee = fee;
  }

  /**
   * dataToSign returns the data to sign.
   * @returns {Buffer} The data to sign.
   */
  get dataToSign() {
    const cls = this.constructor;

    return Buffer.concat([
      cls.TX_TYPE.serialize(),
      this.supernodeAddr.bytes,
      bp.packUInt64(this.amount.data),
      bp.packUInt64(this.fee.data),
      bp.packUInt16(cls.FEE_SCALE),
      bp.packUInt64(this.timestamp.data),
    ]);
  }

  /**
   * toBroadcastLeasingPayload returns the payload for node api /leasing/lease
   * @param {md.KeyPair} keyPair - The key pair used for signing.
   * @returns {object} The payload.
   */
  toBroadcastLeasingPayload(keyPair) {
    return {
      senderPublicKey: keyPair.pub.data,
      recipient: this.supernodeAddr.data,
      amount: this.amount.data,
      fee: this.fee.data.toNumber(),
      feeScale: this.constructor.FEE_SCALE,
      timestamp: this.timestamp.data.toNumber(),
      signature: new md.Bytes(this.sign(keyPair)).b58Str,
    };
  }
}

/** LeaseCancelReq is the class for leasing transaction request */
export class LeaseCancelReq extends TxReq {
  static TX_TYPE = TxType.LEASE_CANCEL;

  /**
   * Creates a new LeaseCancelReq instance.
   * @param {md.TxID} leasingTxId - The supernode address.
   * @param {md.VSYSTimestamp} timestamp - The timestamp of this request.
   * @param {md.ExecCtrtFee} fee - The fee for this request. Defaults to md.ExecCtrtFee.default().
   */
  constructor(leasingTxId, timestamp, fee) {
    super();
    this.leasingTxId = leasingTxId;
    this.timestamp = timestamp;
    this.fee = fee;
  }

  /**
   * dataToSign returns the data to sign.
   * @returns {Buffer} The data to sign.
   */
  get dataToSign() {
    const cls = this.constructor;

    return Buffer.concat([
      cls.TX_TYPE.serialize(),
      bp.packUInt64(this.fee.data),
      bp.packUInt16(cls.FEE_SCALE),
      bp.packUInt64(this.timestamp.data),
      this.leasingTxId.bytes,
    ]);
  }

  /**
   * toBroadcastLeasingPayload returns the payload for node api /leasing/lease
   * @param {md.KeyPair} keyPair - The key pair used for signing.
   * @returns {object} The payload.
   */
  toBroadcastLeasingCancelPayload(keyPair) {
    return {
      senderPublicKey: keyPair.pub.data,
      txId: this.leasingTxId.data,
      fee: this.fee.data.toNumber(),
      feeScale: this.constructor.FEE_SCALE,
      timestamp: this.timestamp.data.toNumber(),
      signature: new md.Bytes(this.sign(keyPair)).b58Str,
    };
  }
}

// BPutTxReq is DB Put Transaction Request.
export class DBPutTxReq extends TxReq {
  static TX_TYPE = TxType.DB_PUT;

  /**
   * Creates a new DBPutTxReq instance.
   * @param {dp.DBPutKey}  - The db key of the data.
   * @param {dp.DBPutData}  - The data to put.
   * @param {md.VSYSTimestamp} timestamp - The timestamp of this request.
   * @param {md.ExecCtrtFee} fee - The fee for this request. Defaults to md.DBPutFee.default().
   */
  constructor(dbKey, data, timestamp, fee = md.DBPutFee()) {
    super();
    this.dbKey = dbKey;
    this.data = data;
    this.timestamp = timestamp;
    this.fee = fee;
  }

  /**
   * dataToSign returns the data to sign.
   * @returns {Buffer} The data to sign.
   */
  get dataToSign() {
    const cls = this.constructor;

    return Buffer.concat([
      cls.TX_TYPE.serialize(),
      this.dbKey.serialize(),
      this.data.serialize(),
      bp.packUInt64(this.fee.data),
      bp.packUInt16(cls.FEE_SCALE),
      bp.packUInt64(this.timestamp.data),
    ]);
  }

  /**
   * toBroadcastPutPayload returns the payload for node api /database/broadcast/put
   * @param {md.KeyPair} keyPair - The key pair used for signing.
   * @returns {object} The payload.
   */
  toBroadcastPutPayload(keyPair) {
    return {
      senderPublicKey: keyPair.pub.data,
      dbKey: this.dbKey.data.data,
      dataType: 'ByteArray',
      data: this.data.data.data,
      fee: this.fee.data.toNumber(),
      feeScale: this.constructor.FEE_SCALE,
      timestamp: this.timestamp.data.toNumber(),
      signature: new md.Bytes(this.sign(keyPair)).b58Str,
    };
  }
}
