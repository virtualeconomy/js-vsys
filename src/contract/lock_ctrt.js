/**
 * module contract/lockCtrt provides functionalities for Lock Contract.
 * @module contract/lockCtrt
 */

'use strict';

import * as ctrt from './ctrt.js';
import * as acnt from '../account.js';
import * as md from '../model.js';
import * as tx from '../tx_req.js';
import * as de from '../data_entry.js';
import * as msacnt from '../multisign_account.js';

/** FuncIdx is the class for function indexes */
class FuncIdx extends ctrt.FuncIdx {
  static elems = {
    LOCK: 0,
  };
  static _ = this.createElems();
}

/** StateVar is the class for state variables */
class StateVar extends ctrt.StateVar {
  static elems = {
    MAKER: 0,
    TOKEN_ID: 1,
  };
  static _ = this.createElems();
}

/** StateMapIdx is the class for state map indexes */
class StateMapIdx extends ctrt.StateMapIdx {
  static elems = {
    CONTRACT_BALANCE: 0,
    CONTRACT_LOCK_TIME: 1,
  };
  static _ = this.createElems();
}

/** DBKey is the class for DB key */
class DBKey extends ctrt.DBKey {
  /**
   * forMaker returns the DBKey object for querying the maker.
   * @returns {DBKey} The DBKey object.
   */
  static forMaker() {
    return new this(StateVar.MAKER.serialize());
  }

  /**
   * forTokenId returns the DBKey object for querying the token ID.
   * @returns {DBKey} The DBKey object.
   */
  static forTokenId() {
    return new this(StateVar.TOKEN_ID.serialize());
  }

  /**
   * forContractBalance returns the DBKey object for querying the contract balance.
   * @param {string} addr - The account address.
   * @returns {DBKey} The DBKey object.
   */
  static forContractBalance(addr) {
    const stmp = new ctrt.StateMap(
      StateMapIdx.CONTRACT_BALANCE,
      de.Addr.fromStr(addr)
    );
    return new this(stmp.serialize());
  }

  /**
   * forContractLockTime returns the DBKey object for querying the contract lock time.
   * @param {string} addr - The account address.
   * @returns {DBKey} The DBKey object.
   */
  static forContractLockTime(addr) {
    const stmp = new ctrt.StateMap(
      StateMapIdx.CONTRACT_LOCK_TIME,
      de.Addr.fromStr(addr)
    );
    return new this(stmp.serialize());
  }
}

/** LockCtrt is the class for Lock Contract */
export class LockCtrt extends ctrt.Ctrt {
  static CTRT_META = md.CtrtMeta.fromB58Str(
    '4Qgfi31k6qfLxTguJg8AeYzmmgaCTJCEPQyAdoRUUSrFDc91PhkdU6C8QQSsNCFc2xEud2XnuQ4YNJ51HgdNtBdnxZcU5Rnqdzyop41Ck81v4nRKkHpTdTrfD8vTur2w4mTFeTFKVzGvGjpHXUVvT47vZiKLBHSB7FHHpGf69bu8DQGXWu6xnZZkn9v2Rfc9mByhwVLSNghNdRhrQwRWPFJ9Qt7Yb8N8WdmcUCAC6PrC3Ha3Z9w7dyf6CsKcCMS6JmB2gvNQitm9jqAfjRxDdqPBUR6TtyjSdmHP9BZRGgiVCaQH7X8fbJZVWSib4RXvFoSrqY4SfVftDY3PU4hXASaRWbaheB8m4VgM4mA8nKDbZvRWZtZ4cHdWeNFyVPs6HxHQZHrQ3GZGNPjmBSyAkGRFS7i5dK8aYWQDEYu1Xijk63UFAWuf6tRdR44ZgRjWGUZJtdQBDFB38XaU8LSFEj2eaC1yNqZ6nnGeRXDzS1q3YKsGyJTqaDDMHvPHiHonGn76JQHAZN7eGU7biaSLxoikW4MaTPSfmcTmDyPGJyJNHjc8MrpV8aQSaGGyDkf1a9MpoJcyEjsPFQbxYzSJVqFEFg2oUL7Z8VUtJK2kYcWDz7w8UiiQqe3uuQnKDGb1nJ5Ad3W8ZPfVP6YHbJrnBKZXMMypNoveokVvxZMCkSNYDsoBxJzrwFvm5DcDJbePQU6VbeZ5SzQw9XTAw4DZpxkQm9RwRE9PXPqogpp9P6LhaiUa6ZD1cWUAHypjWLJ2Rds96oap3biBp5aESunuh99HByoXg5Aa7EQ3FrEvmeq9TLVFYpJraZyW'
  );

  /**
   * Creates a new LockCtrt instance.
   * @param {string} ctrtId
   * @param {ch.Chain} chain
   */
  constructor(ctrtId, chain) {
    super(ctrtId, chain);
  }

  /**
   * register registers a Lock Contract.
   * @param {acnt.Account | msacnt.MultiSignAccount} by - The action taker.
   * @param {string} tokId - The ID of the token to lock.
   * @param {string} ctrtDescription - The description of the contract. Defaults to ''.
   * @param {number} fee - The fee to pay for this action. Defaults to md.RegCtrtFee.DEFAULT.
   * @returns {LockCtrt} The LockCtrt object of the registered Lock Contract.
   */
  static async register(
    by,
    tokId,
    ctrtDescription = '',
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
   * getUnit returns the unit of the token locked in the contract.
   * @returns {number} The unit of the token.
   */
  async getUnit() {
    const tokId = await this.getTokId();
    const tokInfo = await this.chain.api.ctrt.getTokInfo(tokId.data);
    return tokInfo.unity;
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
   * getCtrtLockTime gets the lock time of the token locked in this contract
   * belonging to the user address.
   * @param {string} addr - The account address.
   * @returns {md.VSYSTimestamp} The lock time of the token.
   */
  async getCtrtLockTime(addr) {
    const rawVal = await this.queryDbKey(DBKey.forContractLockTime(addr));
    return md.VSYSTimestamp.fromNumber(rawVal);
  }

  /**
   * lock locks the user's deposited tokens in the contract until the given timestamp.
   * @param {acnt.Account | msacnt.MultiSignAccount} by - The action taker.
   * @param {number} expireAt - Unix timestamp when the lock will expire.
   * @param {string} attachment - The attachment of the action. Defaults to ''.
   * @param {number} fee - The fee to pay for this action. Defaults to md.ExecCtrtFee.DEFAULT.
   * @returns {object} The response returned by the Node API.
   */
  async lock(by, expireAt, attachment = '', fee = md.ExecCtrtFee.DEFAULT) {
    const data = await by.executeContractImpl(
      new tx.ExecCtrtFuncTxReq(
        this.ctrtId,
        FuncIdx.LOCK,
        new de.DataStack(de.Timestamp.fromUnixTs(expireAt)),
        md.VSYSTimestamp.now(),
        new md.Str(attachment),
        md.ExecCtrtFee.fromNumber(fee)
      )
    );
    return data;
  }
}
