/**
 * module contract/sysCtrt provides functionalities for System Contract.
 * @module contract/sysCtrt
 */

'use strict';

import * as ctrt from './ctrt.js';
import * as acnt from '../account.js';
import * as md from '../model.js';
import * as tx from '../tx_req.js';
import * as de from '../data_entry.js';
import base58 from "bs58";
import { Buffer } from "node:buffer";
import { blake2b } from 'blakejs';
import * as msacnt from '../multisign_account.js';

/** FuncIdx is the class for function indexes */
class FuncIdx extends ctrt.FuncIdx {
  static elems = {
    SEND: 0,
    DEPOSIT: 1,
    WITHDRAW: 2,
    TRANSFER: 3,
  };
  static _ = this.createElems();
}

/** SysCtrt is the class for System Contract */
export class SysCtrt extends ctrt.BaseTokCtrt {
  static MAINNET_CTRT_ID = 'CCL1QGBqPAaFjYiA8NMGVhzkd3nJkGeKYBq';
  static TESTNET_CTRT_ID = 'CF9Nd9wvQ8qVsGk8jYHbj6sf8TK7MJ2GYgt';

  /**
   * forMainnet returns the SysCtrt instance for mainnet.
   * @param {ch.Chain} chain - The chain object where the contract is on.
   * @returns {SysCtrt} The SysCtrt object.
   */
  static forMainnet(chain) {
    return new this(this.MAINNET_CTRT_ID, chain);
  }

  /**
   * forTestnet returns the SysCtrt instance for testnet.
   * @param {ch.Chain} chain - The chain object where the contract is on.
   * @returns {SysCtrt} The SysCtrt object.
   */
  static forTestnet(chain) {
    return new this(this.TESTNET_CTRT_ID, chain);
  }

  /**
   * Creates a new System Contract instance.
   * @param {string} ctrtId - The contract ID.
   * @param {ch.Chain} chain - The chain.
   */
  constructor(ctrtId, chain) {
    super(ctrtId, chain);
    /**
     * @type {(md.TokenID|undefined)}
     */
    this._tokId = undefined;
  }

  /**
   * tokId returns the tokenID of the contract.
   * @returns {md.TokenID}
   */
  get tokId() {
    if (!this._tokId) {
      this._tokId = this.getTokId(0);
    }
    return this._tokId;
  }

  /**
   * unit returns the unit of tokens defined in System Contract(VSYS coins)
   * @returns {number} The unit.
   */
  get unit() {
    return md.VSYS.UNIT;
  }

  /**
   * send sends VSYS coins to another account.
   * @param {acnt.Account | msacnt.MultiSignAccount} by - The action taker.
   * @param {string} recipient - The account address of the recipient.
   * @param {number} amount - The amount of token to be sent.
   * @param {string} attachment - The attachment of the action. Defaults to ''.
   * @param {number} fee - The fee to pay for this action. Defaults to md.ExecCtrtFee.DEFAULT.
   * @returns {object} The response returned by the Node API.
   */
  async send(
    by,
    recipient,
    amount,
    attachment = '',
    fee = md.ExecCtrtFee.DEFAULT
  ) {
    const rcptMd = new md.Addr(recipient);
    rcptMd.mustOn(by.chain);

    const data = await by.executeContractImpl(
      new tx.ExecCtrtFuncTxReq(
        this.ctrtId,
        FuncIdx.SEND,
        new de.DataStack(new de.Addr(rcptMd), de.Amount.forVsysAmount(amount)),
        md.VSYSTimestamp.now(),
        new md.Str(attachment),
        md.ExecCtrtFee.fromNumber(fee)
      )
    );
    return data;
  }

  /**
   * transfer transfers tokens from sender to recipient.
   * @param {acnt.Account | msacnt.MultiSignAccount} by - The action taker.
   * @param {string} sender - The account address of the sender.
   * @param {string} recipient - The account address of the recipient.
   * @param {number} amount - The amount of token to transfer.
   * @param {string} attachment - The attachment of the action. Defaults to ''.
   * @param {number} fee - The fee to pay for this action. Defaults to md.ExecCtrtFee.DEFAULT.
   * @returns {object} The response returned by the Node API.
   */
  async transfer(
    by,
    sender,
    recipient,
    amount,
    attachment = '',
    fee = md.ExecCtrtFee.DEFAULT
  ) {
    const senderMd = new md.Addr(sender);
    senderMd.mustOn(by.chain);

    const rcptMd = new md.Addr(recipient);
    rcptMd.mustOn(by.chain);

    const data = await by.executeContractImpl(
      new tx.ExecCtrtFuncTxReq(
        this.ctrtId,
        FuncIdx.TRANSFER,
        new de.DataStack(
          new de.Addr(senderMd),
          new de.Addr(rcptMd),
          de.Amount.forVsysAmount(amount)
        ),
        md.VSYSTimestamp.now(),
        new md.Str(attachment),
        md.ExecCtrtFee.fromNumber(fee)
      )
    );
    return data;
  }

  /**
   * deposit deposits the tokens into the contract.
   * @param {acnt.Account | msacnt.MultiSignAccount} by - The action taker.
   * @param {string} ctrtId - The contract ID to deposit into.
   * @param {number} amount - The amount of token to deposit.
   * @param {string} attachment - The attachment of the action. Defaults to ''.
   * @param {number} fee - The fee to pay for this action. Defaults to md.ExecCtrtFee.DEFAULT.
   * @returns {object} The response returned by the Node API.
   */
  async deposit(
    by,
    ctrtId,
    amount,
    attachment = '',
    fee = md.ExecCtrtFee.DEFAULT
  ) {
    const data = await by.executeContractImpl(
      new tx.ExecCtrtFuncTxReq(
        this.ctrtId,
        FuncIdx.DEPOSIT,
        new de.DataStack(
          de.Addr.fromStr(by.addr.data),
          de.CtrtAcnt.fromStr(ctrtId),
          de.Amount.forVsysAmount(amount)
        ),
        md.VSYSTimestamp.now(),
        new md.Str(attachment),
        md.ExecCtrtFee.fromNumber(fee)
      )
    );
    return data;
  }

  /**
   * withdraw withdraws the tokens from the contract.
   * @param {acnt.Account | msacnt.MultiSignAccount} by - The action taker.
   * @param {string} ctrtId - The contract ID to withdraw tokens from.
   * @param {number} amount - The amount of token to withdraw.
   * @param {string} attachment - The attachment of the action. Defaults to ''.
   * @param {number} fee - The fee to pay for this action. Defaults to md.ExecCtrtFee.DEFAULT.
   * @returns {object} The response returned by the Node API.
   */
  async withdraw(
    by,
    ctrtId,
    amount,
    attachment = '',
    fee = md.ExecCtrtFee.DEFAULT
  ) {
    const data = await by.executeContractImpl(
      new tx.ExecCtrtFuncTxReq(
        this.ctrtId,
        FuncIdx.WITHDRAW,
        new de.DataStack(
          de.CtrtAcnt.fromStr(ctrtId),
          de.Addr.fromStr(by.addr.data),
          de.Amount.forVsysAmount(amount)
        ),
        md.VSYSTimestamp.now(),
        new md.Str(attachment),
        md.ExecCtrtFee.fromNumber(fee)
      )
    );
    return data;
  }

  /**
   * getInt64Bits converts Big Integer into 8-byte array
   * @param {BigInt} x - integer to be converted
   * @returns {Buffer} 8 Byte array
  */
  getInt64Bits(x) {
    const bytes = Buffer.alloc(8);
    bytes.writeBigInt64BE(x);
    return bytes;
  }

  /**
   * getInt16Bits converts Short Integer into 2-byte array
   * @param {number} x - integer to be converted
   * @returns {Buffer} 2 Byte array
  */
  getInt16Bits(x) {
    const bytes = Buffer.alloc(2);
    bytes.writeInt16BE(x);
    return bytes;
  }

  /**
   * generateTxID generates transaction ID based on parameters
   * @param {number} timestamp - timestamp in millis from transaction info
   * @param {number} amount - amount from transaction info
   * @param {number} fee - fee from transaction info
   * @param {number} feeScale - fee scale from transaction info
   * @param {string} recipient - encoded recipient address from transaction info
   * @param {string} attachment - encoded attachment from transaction info
   * @returns {string} generated transaction ID
   */
  generateTxID(
    timestamp,
    amount,
    fee,
    feeScale, 
    recipient,
    attachment
  ) {
    const timestampBytes = this.getInt64Bits(BigInt(timestamp.toString()))
    const amountBytes = this.getInt64Bits(BigInt(amount.toString()))
    const feeBytes = this.getInt64Bits(BigInt(fee.toString()))
    const feeScaleBytes = this.getInt16Bits(feeScale)
    const recipientBytesArr = base58.decode(recipient)

    const attachmentBytes = base58.decode(attachment)
    const lenBytes = this.getInt16Bits(attachmentBytes.length)
    
    const toSign = Buffer.concat([Uint8Array.from([2]), timestampBytes, amountBytes, feeBytes, feeScaleBytes, recipientBytesArr, lenBytes, attachmentBytes])

    const txIDHashed = blake2b(toSign, undefined, 32)
    const txIDStr = base58.encode(txIDHashed)

    return txIDStr
  }
  
}
