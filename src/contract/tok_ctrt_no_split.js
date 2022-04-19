/**
 * module contract/tokCtrtNoSplit provides functionalities for Token contract V1 without split.
 * @module contract/tokCtrtNoSplit
 */

'use strict';

import * as ctrt from './ctrt.js';
import * as acnt from '../account.js';
import * as md from '../model.js';
import * as tx from '../tx_req.js';
import * as de from '../data_entry.js';

/** FuncIdx is the class for function indexes */
export class FuncIdx extends ctrt.FuncIdx {
  static elems = {
    SUPERSEDE: 0,
    ISSUE: 1,
    DESTROY: 2,
    SEND: 3,
    TRANSFER: 4,
    DEPOSIT: 5,
    WITHDRAW: 6,
    TOTAL_SUPPLY: 7,
    MAX_SUPPLY: 8,
    BALANCE_OF: 9,
    GET_ISSUER: 10,
  };
  static _ = this.createElems();
}

/** StateVar is the class for state variables */
export class StateVar extends ctrt.StateVar {
  static elems = {
    ISSUER: 0,
    MAKER: 1,
  };
  static _ = this.createElems();
}

/** DBKey is the class for DB key */
export class DBKey extends ctrt.DBKey {
  /**
   * forIssuer returns the DBKey object for querying the issuer.
   * @returns {DBKey} The DBKey object for querying the issuer.
   */
  static forIssuer() {
    return new this(StateVar.ISSUER.serialize());
  }

  /**
   * forMaker returns the DBKey object for querying the maker.
   * @returns {DBKey} The DBKey object for querying the maker.
   */
  static forMaker() {
    return new this(StateVar.MAKER.serialize());
  }
}

export class TokCtrtWithoutSplit extends ctrt.BaseTokCtrt {
  constructor(ctrtId, chain) {
    super(ctrtId, chain);
    this._tokId = undefined;
    this._unit = 0;
  }

  /**
   * getIssuer quries & returns the issuer of the contract.
   * @returns {md.Addr} The address of the issuer of the contract.
   */
  async getIssuer() {
    const rawVal = await this.queryDbKey(DBKey.forIssuer());
    return new md.Addr(rawVal);
  }

  /**
   * getMaker quries & returns the maker of the contract.
   * @returns {md.Addr} The address of the maker of the contract.
   */
  async getMaker() {
    const rawVal = await this.queryDbKey(DBKey.forMaker());
    return new md.Addr(rawVal);
  }

  /**
   * getTokId returns the token ID of the contract.
   * @returns {md.TokenID} The token ID.
   */
  get tokId() {
    if (!this._tokId) {
      this._tokId = this.getTokId(0);
    }
    return this._tokId;
  }

  /**
   * getUnit queries & returns the unit.
   * @returns {number} The unit.
   */
  async getUnit() {
    if (this._unit <= 0) {
      const resp = await this.chain.api.ctrt.getTokInfo(this.tokId.data);
      this._unit = resp.unity;
    }
    return this._unit;
  }

  /**
   * register registers a new contract instance.
   * @param {acnt.Account} by - The action taker.
   * @param {number} max - The max amount that can be issued.
   * @param {number} unit - The granularity of splitting a token.
   * @param {string} tokDescription - The description of the token. Defaults to ''.
   * @param {string} ctrtDescription - The description of the contract. Defaults to ''.
   * @param {number} fee - The fee to pay for this action. Defaults to md.ExecCtrtFee.DEFAULT.
   * @returns {TokCtrtWithoutSplit} A token contract without split.
   */
  async register(
    by,
    max,
    unit,
    tokDescription = '',
    ctrtDescription = '',
    fee = md.RegCtrtFee.DEFAULT
  ) {
    const data = await by.registerContractImpl(
      new tx.RegCtrtTxReq(
        new de.DataStack(
          de.Amount.forTokAmount(max, unit),
          new de.Amount(md.Long.fromNumber(unit)),
          de.Str.fromStr(tokDescription)
        ),
        this.CTRT_META,
        md.VSYSTimestamp.now(),
        new md.Str(ctrtDescription),
        md.RegCtrtFee.fromNumber(fee)
      )
    );
    return data;
  }

  /**
   * getTokBal quries & returns the balance of the token of the contract belonging to the user address.
   * @param {string} addr - The user address.
   * @returns {md.Token} The balance.
   */
  async getTokBal(addr) {
    const resp = await this.chain.api.ctrt.getTokBal(addr, this.getTokId.data);
    const unit = await this.getUnit();
    return new md.Token(resp.balance, unit);
  }

  /**
   * supersede transafers the issuer role of the contract to a new account.
   * @param {acnt.Account} by - The action taker.
   * @param {string} newIssuer - The account address of the new issuer.
   * @param {string} attachment - The attachment of the action. Defaults to ''.
   * @param {number} fee - The fee to pay for this action. Defaults to md.ExecCtrtFee.DEFAULT.
   * @returns {object} The response returned by the Node API.
   */
  async supersede(
    by,
    newIssuer,
    attachment = '',
    fee = md.ExecCtrtFee.DEFAULT
  ) {
    const newIssuerMd = new md.Addr(newIssuer);
    newIssuerMd.mustOn(by.chain);

    const data = await by.executeContractImpl(
      new tx.ExecCtrtFuncTxReq(
        this.ctrtId,
        FuncIdx.SUPERSEDE,
        new de.DataStack(new de.Addr(newIssuerMd)),
        md.VSYSTimestamp.now(),
        new md.Str(attachment),
        md.ExecCtrtFee.fromNumber(fee)
      )
    );
    return data;
  }

  /**
   * issue issues new Tokens by account who has the issuing right.
   * @param {acnt.Account} by - The action taker.
   * @param {number} amount - The amount of token to issue.
   * @param {string} attachment - The attachment of the action. Defaults to ''.
   * @param {number} fee - The fee to pay for this action. Defaults to md.ExecCtrtFee.DEFAULT.
   * @returns {object} The response returned by the Node API.
   */
  async issue(by, amount, attachment = '', fee = md.ExecCtrtFee.DEFAULT) {
    const unit = await this.getUnit();

    const data = await by.executeContractImpl(
      new tx.ExecCtrtFuncTxReq(
        this.ctrtId,
        FuncIdx.ISSUE,
        new de.DataStack(de.Amount.forTokAmount(amount, unit)),
        md.VSYSTimestamp.now(),
        new md.Str(attachment),
        md.ExecCtrtFee.fromNumber(fee)
      )
    );
    return data;
  }

  /**
   * send sends tokens to another account.
   * @param {acnt.Account} by - The action taker.
   * @param {string} recipient - The recipient account.
   * @param {number} amount - The amount of token to send.
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

    const unit = await this.getUnit();

    const data = await by.executeContractImpl(
      new tx.ExecCtrtFuncTxReq(
        this.ctrtId,
        FuncIdx.SEND,
        new de.DataStack(
          new de.Addr(rcptMd),
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
   * destroy destroys an amount of tokens by account who has the issuing right..
   * @param {acnt.Account} by - The action taker.
   * @param {number} amount - The amount of token to destroy.
   * @param {string} attachment - The attachment of the action. Defaults to ''.
   * @param {number} fee - The fee to pay for this action. Defaults to md.ExecCtrtFee.DEFAULT.
   * @returns {object} The response returned by the Node API.
   */
  async destroy(by, amount, attachment = '', fee = md.ExecCtrtFee.DEFAULT) {
    const unit = await this.getUnit();

    const data = await by.executeContractImpl(
      new tx.ExecCtrtFuncTxReq(
        this.ctrtId,
        FuncIdx.DESTROY,
        new de.DataStack(de.Amount.forTokAmount(amount, unit)),
        md.VSYSTimestamp.now(),
        new md.Str(attachment),
        md.ExecCtrtFee.fromNumber(fee)
      )
    );
    return data;
  }

  /**
   * transfer transfers tokens from sender to recipient.
   * @param {string} sender - The sender account.
   * @param {string} recipient - The recipient account.
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

    const unit = await this.unit;

    const data = await by.executeContractImpl(
      new tx.ExecCtrtFuncTxReq(
        this.ctrtId,
        FuncIdx.TRANSFER,
        new de.DataStack(
          new de.Addr(senderMd),
          new de.Addr(rcptMd),
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
   * deposit deposits the tokens into the contract.
   * @param {acnt.Account} by - The action taker.
   * @param {string} ctrtId - The contract id to deposit into.
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
          new de.Addr(by.addr),
          de.CtrtAcnt.fromStr(ctrtId),
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
   * withdraw withdraws tokens from another contract.
   * @param {acnt.Account} by - The action taker.
   * @param {string} ctrtId - The contract id to withdraw from.
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
          new de.Addr(by.addr),
          de.Amount.forTokAmount(amount, unit)
        ),
        md.VSYSTimestamp.now(),
        new md.Str(attachment),
        md.ExecCtrtFee.fromNumber(fee)
      )
    );
    return data;
  }
}
