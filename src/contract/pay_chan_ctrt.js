/**
 * module contract/payChanCtrt  provides functionalities for payment channel contract.
 * @module contract/payChanCtrt
 */

'use strict';

import bs58 from 'bs58';
import * as ctrt from './ctrt.js';
import * as md from '../model.js';
import * as tx from '../tx_req.js';
import * as de from '../data_entry.js';
import * as tcf from './tok_ctrt_factory.js';
import * as curve from '../utils/curve_25519.js';
import * as bp from '../utils/bytes_packer.js';
import * as bn from '../utils/big_number.js';
import * as msacnt from '../multisign_account.js';

/** FuncIdx is the class for function indexes */
export class FuncIdx extends ctrt.FuncIdx {
  static elems = {
    CREATE_AND_LOAD: 0,
    EXTEND_EXPIRATION_TIME: 1,
    LOAD: 2,
    ABORT: 3,
    UNLOAD: 4,
    COLLECT_PAYMENT: 5,
  };
  static _ = this.createElems();
}

/** StateVar is the class for state variables */
export class StateVar extends ctrt.StateVar {
  static elems = {
    MAKER: 0,
    TOKEN_ID: 1,
  };
  static _ = this.createElems();
}

/** StateMapIdx is the class for state map index */
export class StateMapIdx extends ctrt.StateMapIdx {
  static elems = {
    CONTRACT_BALANCE: 0,
    CHANNEL_CREATOR: 1,
    CHANNEL_CREATOR_PUBLIC_KEY: 2,
    CHANNEL_RECIPIENT: 3,
    CHANNEL_ACCUMULATED_LOAD: 4,
    CHANNEL_ACCUMULATED_PAYMENT: 5,
    CHANNEL_EXPIRATION_TIME: 6,
    CHANNEL_STATUS: 7,
  };
  static _ = this.createElems();
}

/** DBKey is the class for DB key */
export class DBKey extends ctrt.DBKey {
  /**
   * forMaker returns the DBKey object for querying the maker.
   * @returns {DBKey} The DBKey object for querying the maker.
   */
  static forMaker() {
    return new this(StateVar.MAKER.serialize());
  }

  /**
   * forTokenId returns the DBKey object for querying the token ID.
   * @returns {DBKey} The DBKey object for querying the token ID.
   */
  static forTokenId() {
    return new this(StateVar.TOKEN_ID.serialize());
  }

  /**
   * forContractBalance returns the DBKey object for querying the contract balance.
   * @param {string} addr - The address of the account that deposits into this contract.
   * @returns {DBKey} The DBKey object for querying the contract balance.
   */
  static forContractBalance(addr) {
    const stmp = new ctrt.StateMap(
      StateMapIdx.CONTRACT_BALANCE,
      de.Addr.fromStr(addr)
    );
    return new this(stmp.serialize());
  }

  /**
   * forChannelCreator returns the DBKey object for querying the channel creator.
   * @param {string} chanId - The channel ID.
   * @returns {DBKey} The DBKey object for querying the channel creator.
   */
  static forChannelCreator(chanId) {
    const stmp = new ctrt.StateMap(
      StateMapIdx.CHANNEL_CREATOR,
      de.Bytes.fromBase58Str(chanId)
    );
    return new this(stmp.serialize());
  }

  /**
   * forChannelCreatorPublicKey returns the DBKey object for querying the public key
    of the channel creator.
   * @param {string} chanId - The channel ID.
   * @returns {DBKey} The DBKey object for querying the public key of the channel creator.
   */
  static forChannelCreatorPublicKey(chanId) {
    const stmp = new ctrt.StateMap(
      StateMapIdx.CHANNEL_CREATOR_PUBLIC_KEY,
      de.Bytes.fromBase58Str(chanId)
    );
    return new this(stmp.serialize());
  }

  /**
   * forChannelRecipient returns the DBKey object for querying the channel recipient.
   * @param {string} chanId - The channel ID.
   * @returns {DBKey} The DBKey object for querying the channel recipient.
   */
  static forChannelRecipient(chanId) {
    const stmp = new ctrt.StateMap(
      StateMapIdx.CHANNEL_RECIPIENT,
      de.Bytes.fromBase58Str(chanId)
    );
    return new this(stmp.serialize());
  }

  /**
   * forChannelAccumLoad returns the DBKey object for querying the
    accumulated amount loaded into the channel.
   * @param {string} chanId - The channel ID.
   * @returns {DBKey} The DBKey object for querying the accumulated amount.
   */
  static forChannelAccumLoad(chanId) {
    const stmp = new ctrt.StateMap(
      StateMapIdx.CHANNEL_ACCUMULATED_LOAD,
      de.Bytes.fromBase58Str(chanId)
    );
    return new this(stmp.serialize());
  }

  /**
   * forChannelAccumPayment returns the DBKey object for querying the
    accumulated amount already collected by the recipient.
   * @param {string} chanId - The channel ID.
   * @returns {DBKey} The DBKey object for querying the accumulated amount.
   */
  static forChannelAccumPayment(chanId) {
    const stmp = new ctrt.StateMap(
      StateMapIdx.CHANNEL_ACCUMULATED_PAYMENT,
      de.Bytes.fromBase58Str(chanId)
    );
    return new this(stmp.serialize());
  }

  /**
   * forChannelExpTime returns the DBKey object for querying the expiration 
    time of the channel, after which the creator can unload the funds.
   * @param {string} chanId - The channel ID.
   * @returns {DBKey} The DBKey object for querying the channel expired time.
   */
  static forChannelExpTime(chanId) {
    const stmp = new ctrt.StateMap(
      StateMapIdx.CHANNEL_EXPIRATION_TIME,
      de.Bytes.fromBase58Str(chanId)
    );
    return new this(stmp.serialize());
  }

  /**
   * forChannelStatus returns the DBKey object for querying the expiration 
    time of the channel, after which the creator can unload the funds.
   * @param {string} chanId - The channel ID.
   * @returns {DBKey} The DBKey object for querying the channel status.
   */
  static forChannelStatus(chanId) {
    const stmp = new ctrt.StateMap(
      StateMapIdx.CHANNEL_STATUS,
      de.Bytes.fromBase58Str(chanId)
    );
    return new this(stmp.serialize());
  }
}

export class PayChanCtrt extends ctrt.Ctrt {
  static CTRT_META = md.CtrtMeta.fromB58Str(
    '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'
  );

  /**
   * getMaker queries & returns the maker of the contract.
   * @returns {md.Addr} The address of the maker of the contract.
   */
  async getMaker() {
    const rawVal = await this.queryDbKey(DBKey.forMaker());
    return new md.Addr(rawVal);
  }

  /**
   * getTokId queries & returns the token ID of the contract.
   * @returns {md.TokenID} The token ID of the contract.
   */
  async getTokId() {
    const rawVal = await this.queryDbKey(DBKey.forTokenId());
    return new md.TokenID(rawVal);
  }

  /**
   * getTokCtrt queries & returns the instance of token contract.
   * @returns {ctrt.BaseTokCtrt} The instance of token contract.
   */
  async getTokCtrt() {
    if (!this._tokCtrt) {
      const tokId = await this.getTokId();
      this._tokCtrt = await tcf.fromTokId(tokId, this.chain);
    }
    return this._tokCtrt;
  }

  /**
   * getUnit queries & returns the token's unit.
   * @returns {number} The unit of the token.
   */
  async getUnit() {
    const tc = await this.getTokCtrt();
    return await tc.getUnit();
  }

  /**
   * getCtrtBal gets the token balance within this contract belonging to the user address.
   * @param {string} addr - The account address.
   * @returns {md.Token} The token balance.
   */
  async getCtrtBal(addr) {
    const rawVal = await this.queryDbKey(DBKey.forContractBalance(addr));
    const unit = await this.getUnit();
    return md.Token.fromNumber(rawVal, unit);
  }

  /**
   * getChanCreator queries & returns the address of the channel creator.
   * @param {string} chanId - The channel ID.
   * @returns {md.Addr} The address of the channel creator.
   */
  async getChanCreator(chanId) {
    const rawVal = await this.queryDbKey(DBKey.forChannelCreator(chanId));
    return new md.Addr(rawVal);
  }

  /**
   * getChanCreatorPubKey queries & returns the public key of the channel creator.
   * @param {string} chanId - The channel ID.
   * @returns {md.PubKey} The public key of the channel creator.
   */
  async getChanCreatorPubKey(chanId) {
    const rawVal = await this.queryDbKey(
      DBKey.forChannelCreatorPublicKey(chanId)
    );
    return new md.PubKey(rawVal);
  }

  /**
   * getChanRecipient queries & returns the recipient of the channel.
   * @param {string} chanId - The channel ID.
   * @returns {md.Addr} The recipient of the channel.
   */
  async getChanRecipient(chanId) {
    const rawVal = await this.queryDbKey(DBKey.forChannelRecipient(chanId));
    return new md.Addr(rawVal);
  }

  /**
   * getChanAccumLoad queries & returns the accumulated load of the channel.
   * @param {string} chanId - The channel ID.
   * @returns {md.Token} The accumulated load of the channel.
   */
  async getChanAccumLoad(chanId) {
    const rawVal = await this.queryDbKey(DBKey.forChannelAccumLoad(chanId));
    const unit = await this.getUnit();
    return md.Token.fromNumber(rawVal, unit);
  }

  /**
   * getChanAccumPay queries & returns the accumulated payment of the channel.
   * @param {string} chanId - The channel ID.
   * @returns {md.Token} The accumulated payment of the channel.
   */
  async getChanAccumPay(chanId) {
    const rawVal = await this.queryDbKey(DBKey.forChannelAccumPayment(chanId));
    const unit = await this.getUnit();
    return md.Token.fromNumber(rawVal, unit);
  }

  /**
   * getChanExpTime queries & returns the expired time of the channel.
   * @param {string} chanId - The channel ID.
   * @returns {md.VSYSTimestamp} The expired time of the channel.
   */
  async getChanExpTime(chanId) {
    const rawVal = await this.queryDbKey(DBKey.forChannelExpTime(chanId));
    return md.VSYSTimestamp.fromNumber(rawVal);
  }

  /**
   * getChanStatus queries & returns the status of the channel. (if the channel is still active)
   * @param {string} chanId - The channel ID.
   * @returns {boolean} The status of the channel.
   */
  async getChanStatus(chanId) {
    const rawVal = await this.queryDbKey(DBKey.forChannelStatus(chanId));
    return rawVal === 'true';
  }

  /**
   * register registers a Payment Channel Contract.
   * @param {acnt.Account | msacnt.MultiSignAccount} by - The action taker.
   * @param {string} tokId - The ID of the token deposited into the contract.
   * @param {string} ctrtDescription - The description of the contract. Defaults to ''.
   * @param {number} fee - The fee to pay for this action. Defaults to md.RegCtrtFee.DEFAULT.
   * @returns {PayChanCtrt} The PayChanCtrt object of the registered contract.
   */
  static async register(
    by,
    tokId,
    ctrtDescription,
    fee = md.RegCtrtFee.DEFAULT
  ) {
    const data = await by.registerContractImpl(
      new tx.RegCtrtTxReq(
        new de.DataStack(de.TokenID.fromStr(tokId)),
        this.CTRT_META,
        md.VSYSTimestamp.now(),
        new md.Str(ctrtDescription),
        md.RegCtrtFee.fromNumber(fee)
      )
    );
    return new this(data.contractId, by.chain);
  }

  /**
   * createAndLoad creates the payment channel and loads an amount into it.
     (This function's transaction id becomes the channel ID)
   * @param {acnt.Account | msacnt.MultiSignAccount} by - The action taker.
   * @param {string} recipient - The recipient's address.
   * @param {number} amount - The amount of the token.
   * @param {number} expireTime - The expired timestamp of the channel.
   * @param {string} attachment - The attachment of the action. Defaults to ''.
   * @param {number} fee - The fee to pay for this action. Defaults to md.ExecCtrtFee.DEFAULT.
   * @returns {object} The response returned by the Node API.
   */
  async createAndLoad(
    by,
    recipient,
    amount,
    expireTime,
    attachment = '',
    fee = md.ExecCtrtFee.DEFAULT
  ) {
    const rcptMd = new md.Addr(recipient);
    rcptMd.mustOn(by.chain);

    const unit = await this.getUnit();

    const data = await by.executeContractImpl(
      new tx.ExecCtrtFuncTxReq(
        this.ctrtId,
        FuncIdx.CREATE_AND_LOAD,
        new de.DataStack(
          de.Addr.fromStr(recipient),
          de.Amount.forTokAmount(amount, unit),
          de.Timestamp.fromUnixTs(expireTime)
        ),
        md.VSYSTimestamp.now(),
        new md.Str(attachment),
        md.ExecCtrtFee.fromNumber(fee)
      )
    );
    return data;
  }

  /**
   * extendExpTime extends the expiration time of the channel to the new input timestamp.
   * @param {acnt.Account | msacnt.MultiSignAccount} by - The action taker.
   * @param {string} chanId - The channel ID.
   * @param {number} expireTime - The expired timestamp of the lock.
   * @param {string} attachment - The attachment of the action. Defaults to ''.
   * @param {number} fee - The fee to pay for this action. Defaults to md.ExecCtrtFee.DEFAULT.
   * @returns {object} The response returned by the Node API.
   */
  async extendExpTime(
    by,
    chanId,
    expireTime,
    attachment = '',
    fee = md.ExecCtrtFee.DEFAULT
  ) {
    const data = await by.executeContractImpl(
      new tx.ExecCtrtFuncTxReq(
        this.ctrtId,
        FuncIdx.EXTEND_EXPIRATION_TIME,
        new de.DataStack(
          de.Bytes.fromBase58Str(chanId),
          de.Timestamp.fromUnixTs(expireTime)
        ),
        md.VSYSTimestamp.now(),
        new md.Str(attachment),
        md.ExecCtrtFee.fromNumber(fee)
      )
    );
    return data;
  }

  /**
   * load loads more tokens into the channel.
   * @param {acnt.Account | msacnt.MultiSignAccount} by - The action taker.
   * @param {string} chanId - The channel ID.
   * @param {number} amount - The amount of tokens.
   * @param {string} attachment - The attachment of the action. Defaults to ''.
   * @param {number} fee - The fee to pay for this action. Defaults to md.ExecCtrtFee.DEFAULT.
   * @returns {object} The response returned by the Node API.
   */
  async load(
    by,
    chanId,
    amount,
    attachment = '',
    fee = md.ExecCtrtFee.DEFAULT
  ) {
    const unit = await this.getUnit();

    const data = await by.executeContractImpl(
      new tx.ExecCtrtFuncTxReq(
        this.ctrtId,
        FuncIdx.LOAD,
        new de.DataStack(
          de.Bytes.fromBase58Str(chanId),
          de.Amount.forTokAmount(amount, unit)
        ),
        md.VSYSTimestamp.now(),
        new md.Str(attachment),
        md.ExecCtrtFee.fromNumber(fee)
      )
    );
    return data;
  }

  /**
   * abort aborts the channel, triggering a 2-day grace period where the recipient can still
     collect payments. After 2 days, the payer can unload all the remaining funds that was locked
     in the channel.
   * @param {acnt.Account | msacnt.MultiSignAccount} by - The action taker.
   * @param {string} chanId - The channel ID.
   * @param {string} attachment - The attachment of the action. Defaults to ''.
   * @param {number} fee - The fee to pay for this action. Defaults to md.ExecCtrtFee.DEFAULT.
   * @returns {object} The response returned by the Node API.
   */
  async abort(by, chanId, attachment = '', fee = md.ExecCtrtFee.DEFAULT) {
    const data = await by.executeContractImpl(
      new tx.ExecCtrtFuncTxReq(
        this.ctrtId,
        FuncIdx.ABORT,
        new de.DataStack(de.Bytes.fromBase58Str(chanId)),
        md.VSYSTimestamp.now(),
        new md.Str(attachment),
        md.ExecCtrtFee.fromNumber(fee)
      )
    );
    return data;
  }

  /**
   * unload unloads all the funcs locked in the channel (only works if the channel has expired).
   * @param {acnt.Account | msacnt.MultiSignAccount} by - The action taker.
   * @param {string} chanId - The channel ID.
   * @param {string} attachment - The attachment of the action. Defaults to ''.
   * @param {number} fee - The fee to pay for this action. Defaults to md.ExecCtrtFee.DEFAULT.
   * @returns {object} The response returned by the Node API.
   */
  async unload(by, chanId, attachment = '', fee = md.ExecCtrtFee.DEFAULT) {
    const data = await by.executeContractImpl(
      new tx.ExecCtrtFuncTxReq(
        this.ctrtId,
        FuncIdx.UNLOAD,
        new de.DataStack(de.Bytes.fromBase58Str(chanId)),
        md.VSYSTimestamp.now(),
        new md.Str(attachment),
        md.ExecCtrtFee.fromNumber(fee)
      )
    );
    return data;
  }

  /**
   * collectPayment collects the payment from the channel.
   * @param {acnt.Account | msacnt.MultiSignAccount} by - The action taker.
   * @param {string} chanId - The channel ID.
   * @param {number} amount - The amount of the token.
   * @param {string} signature - The signature in base 58 format.
   * @param {string} attachment - The attachment of the action. Defaults to ''.
   * @param {number} fee - The fee to pay for this action. Defaults to md.ExecCtrtFee.DEFAULT.
   * @returns {object} The response returned by the Node API.
   */
  async collectPayment(
    by,
    chanId,
    amount,
    signature,
    attachment = '',
    fee = md.ExecCtrtFee.DEFAULT
  ) {
    const unit = await this.getUnit();

    const data = await by.executeContractImpl(
      new tx.ExecCtrtFuncTxReq(
        this.ctrtId,
        FuncIdx.COLLECT_PAYMENT,
        new de.DataStack(
          de.Bytes.fromBase58Str(chanId),
          de.Amount.forTokAmount(amount, unit),
          de.Bytes.fromBase58Str(signature)
        ),
        md.VSYSTimestamp.now(),
        new md.Str(attachment),
        md.ExecCtrtFee.fromNumber(fee)
      )
    );
    return data;
  }

  /**
   * offchainPay generates the offchain payment signature.
   * @param {md.KeyPair} keyPair - The key pair to sign.
   * @param {string} chanId - The channel ID.
   * @param {number} amount - The amount of the token.
   * @returns {string} The signature in base58 string format.
   */
  async offchainPay(keyPair, chanId, amount) {
    const msg = await this.getPayMsg(chanId, amount);
    const sigBytes = curve.sign(keyPair.pri.bytes, msg);
    return Buffer.from(bs58.encode(sigBytes)).toString('latin1');
  }

  /**
   * verifySig verifies the payment signature.
   * @param {string} chanId - The channel ID.
   * @param {number} amount - The amount of the token.
   * @param {string} signature - The signature in base 58 format.
   * @returns {boolean} If the signature is valid.
   */
  async verifySig(chanId, amount, signature) {
    const msg = await this.getPayMsg(chanId, amount);
    const pubKey = await this.getChanCreatorPubKey(chanId);
    const sigBytes = Buffer.from(bs58.decode(signature));
    return curve.verify(pubKey.bytes, msg, sigBytes);
  }

  /**
   * getPayMsg generates the payment message in bytes.
   * @param {string} chanId - The channel ID.
   * @param {number} amount - The amount of the token.
   * @returns {Buffer} The payment message.
   */
  async getPayMsg(chanId, amount) {
    const unit = await this.getUnit();
    const rawAmount = md.Token.forAmount(amount, unit).data;

    const chanIdBytes = Buffer.from(bs58.decode(chanId));
    const msg = Buffer.concat([
      bp.packUInt16(chanIdBytes.length),
      chanIdBytes,
      bp.packUInt64(rawAmount),
    ]);

    return msg;
  }
}
