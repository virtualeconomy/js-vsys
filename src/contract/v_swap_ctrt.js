/**
 * module contract/VSwapCtrt provides functionalities for V Swap contract.
 * @module contract/VSwapCtrt
 */

'use strict';

import * as ctrt from './ctrt.js';
import * as md from '../model.js';
import * as tx from '../tx_req.js';
import * as de from '../data_entry.js';
import * as tcf from './tok_ctrt_factory.js';
import * as msacnt from '../multisign_account.js';

/** FuncIdx is the class for function indexes */
export class FuncIdx extends ctrt.FuncIdx {
  static elems = {
    SUPERSEDE: 0,
    SET_SWAP: 1,
    ADD_LIQUIDITY: 2,
    REMOVE_LIQUIDITY: 3,
    SWAP_B_FOR_EXACT_A: 4,
    SWAP_EXACT_B_FOR_A: 5,
    SWAP_A_FOR_EXACT_B: 6,
    SWAP_EXACT_A_FOR_B: 7,
  };
  static _ = this.createElems();
}

/** StateVar is the class for state variables */
export class StateVar extends ctrt.StateVar {
  static elems = {
    MAKER: 0,
    TOKEN_A_ID: 1,
    TOKEN_B_ID: 2,
    LIQUIDITY_TOKEN_ID: 3,
    SWAP_STATUS: 4,
    MINIMUM_LIQUIDITY: 5,
    TOKEN_A_RESERVED: 6,
    TOKEN_B_RESERVED: 7,
    TOTAL_SUPPLY: 8,
    LIQUIDITY_TOKEN_LEFT: 9,
  };
  static _ = this.createElems();
}

/** StateMapIdx is the class for state map indexes */
class StateMapIdx extends ctrt.StateMapIdx {
  static elems = {
    TOKEN_A_BALANCE: 0,
    TOKEN_B_BALANCE: 1,
    LIQUIDITY_TOKEN_BALANCE: 2,
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
   * forTokAId returns the DBKey object for querying the token A id.
   * @returns {DBKey} The DBKey object for querying the token A id.
   */
  static forTokAId() {
    return new this(StateVar.TOKEN_A_ID.serialize());
  }

  /**
   * forTokBId returns the DBKey object for querying the token B id.
   * @returns {DBKey} The DBKey object for querying the token B id.
   */
  static forTokBId() {
    return new this(StateVar.TOKEN_B_ID.serialize());
  }

  /**
   * forLiqTokId returns the DBKey object for querying the liquidity token id.
   * @returns {DBKey} The DBKey object for querying the liquidity token id.
   */
  static forLiqTokId() {
    return new this(StateVar.LIQUIDITY_TOKEN_ID.serialize());
  }

  /**
   * forSwapStatus returns the DBKey object for querying the swap status.
   * @returns {DBKey} The DBKey object for querying the swap status.
   */
  static forSwapStatus() {
    return new this(StateVar.SWAP_STATUS.serialize());
  }

  /**
   * forMinLiq returns the DBKey object for querying the minimum liquidity.
   * @returns {DBKey} The DBKey object for querying the minimum liquidity.
   */
  static forMinLiq() {
    return new this(StateVar.MINIMUM_LIQUIDITY.serialize());
  }

  /**
   * forTokARes returns the DBKey object for querying the amount of token A inside the pool.
   * @returns {DBKey} The DBKey object for querying the amount of token A inside the pool.
   */
  static forTokARes() {
    return new this(StateVar.TOKEN_A_RESERVED.serialize());
  }

  /**
   * forTokBRes returns the DBKey object for querying the amount of token B inside the pool.
   * @returns {DBKey} The DBKey object for querying the amount of token B inside the pool.
   */
  static forTokBRes() {
    return new this(StateVar.TOKEN_B_RESERVED.serialize());
  }

  /**
   * forTotalSupply returns the DBKey object for querying the total amount of liquidity tokens that can be minted.
   * @returns {DBKey} The DBKey object for querying the total amount of liquidity tokens that can be minted.
   */
  static forTotalSupply() {
    return new this(StateVar.TOTAL_SUPPLY.serialize());
  }

  /**
   * forLiqTokLeft returns the DBKey object for querying the amount of liquidity tokens left to be minted.
   * @returns {DBKey} The DBKey object for querying the amount of liquidity tokens left to be minted.
   */
  static forLiqTokLeft() {
    return new this(StateVar.LIQUIDITY_TOKEN_LEFT.serialize());
  }

  /**
   * forTokABal returns the DBKey object for querying the total amount of token A balance.
   * @returns {DBKey} The DBKey object for querying the total amount of token A balance.
   */
  static forTokABal(addr) {
    const stmp = new ctrt.StateMap(
      StateMapIdx.TOKEN_A_BALANCE,
      de.Addr.fromStr(addr)
    );
    return new this(stmp.serialize());
  }

  /**
   * forTokBBal returns the DBKey object for querying the total amount of token B balance.
   * @returns {DBKey} The DBKey object for querying the total amount of token B balance.
   */
  static forTokBBal(addr) {
    const stmp = new ctrt.StateMap(
      StateMapIdx.TOKEN_B_BALANCE,
      de.Addr.fromStr(addr)
    );
    return new this(stmp.serialize());
  }

  /**
   * forLiqTokBal returns the DBKey object for querying the total amount of liquidity token balance.
   * @returns {DBKey} The DBKey object for querying the total amount of liquidity token balance.
   */
  static forLiqTokBal(addr) {
    const stmp = new ctrt.StateMap(
      StateMapIdx.LIQUIDITY_TOKEN_BALANCE,
      de.Addr.fromStr(addr)
    );
    return new this(stmp.serialize());
  }
}

/** VSwapCtrt is the class for V Swap Contract */
export class VSwapCtrt extends ctrt.BaseTokCtrt {
  static CTRT_META = md.CtrtMeta.fromB58Str(
    '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'
  );

  constructor(ctrtId, chain) {
    super(ctrtId, chain);
    this._tokAId = undefined;
    this._tokBId = undefined;
    this._liqTokId = undefined;
    this._tokACtrt = undefined;
    this._tokBCtrt = undefined;
    this._liqTokCtrt = undefined;
    this._minLiq = 0;
  }

  /**
   * getMaker queries & returns the maker of the contract.
   * @returns {md.Addr} The maker of the contract.
   */
  async getMaker() {
    const rawVal = await this.queryDbKey(DBKey.forMaker());
    return new md.Addr(rawVal);
  }

  /**
   * getTokAId queries & returns the token A id of the contract.
   * @returns {md.TokenID} The token A id of the contract.
   */
  async getTokAId() {
    if (!this._tokAId) {
      const rawVal = await this.queryDbKey(DBKey.forTokAId());
      this._tokAId = new md.TokenID(rawVal);
    }
    return this._tokAId;
  }

  /**
   * getTokBId queries & returns the token B id of the contract.
   * @returns {md.TokenID} The token B id of the contract.
   */
  async getTokBId() {
    if (!this._tokBId) {
      const rawVal = await this.queryDbKey(DBKey.forTokBId());
      this._tokBId = new md.TokenID(rawVal);
    }
    return this._tokBId;
  }

  /**
   * getLiqTokId queries & returns the liquidity token id of the contract.
   * @returns {md.TokenID} The liquidity token id of the contract.
   */
  async getLiqTokId() {
    if (!this._liqTokId) {
      const rawVal = await this.queryDbKey(DBKey.forLiqTokId());
      this._liqTokId = new md.TokenID(rawVal);
    }
    return this._liqTokId;
  }

  /**
   * getTokACtrt queries & returns the instance of token A contract.
   * @returns {ctrt.BaseTokCtrt} The instance of token A contract.
   */
  async getTokACtrt() {
    if (!this._tokACtrt) {
      const tokAId = await this.getTokAId();
      this._tokACtrt = await tcf.fromTokId(tokAId, this.chain);
    }
    return this._tokACtrt;
  }

  /**
   * getTokBCtrt queries & returns the instance of token B contract.
   * @returns {ctrt.BaseTokCtrt} The instance of token B contract.
   */
  async getTokBCtrt() {
    if (!this._tokBCtrt) {
      const tokBId = await this.getTokBId();
      this._tokBCtrt = await tcf.fromTokId(tokBId, this.chain);
    }
    return this._tokBCtrt;
  }

  /**
   * getLiqTokCtrt queries & returns the instance of liquidity token contract.
   * @returns {ctrt.BaseTokCtrt} The instance of liquidity token contract.
   */
  async getLiqTokCtrt() {
    if (!this._liqTokCtrt) {
      const liqTokId = await this.getLiqTokId();
      this._liqTokCtrt = await tcf.fromTokId(liqTokId, this.chain);
    }
    return this._liqTokCtrt;
  }

  /**
   * getTokAUnit queries & returns the token A's unit.
   * @returns {number} The unit of token A.
   */
  async getTokAUnit() {
    const tc = await this.getTokACtrt();
    return await tc.getUnit();
  }

  /**
   * getTokBUnit queries & returns the token B's unit.
   * @returns {number} The unit of token B.
   */
  async getTokBUnit() {
    const tc = await this.getTokBCtrt();
    return await tc.getUnit();
  }

  /**
   * getLiqTokUnit queries & returns the liquidity token's unit.
   * @returns {number} The unit of liquidity token.
   */
  async getLiqTokUnit() {
    const tc = await this.getLiqTokCtrt();
    return await tc.getUnit();
  }

  /**
   * getSwapStatus queries & returns the status of the swap.
   * @returns {bool} The status of the swap. True represents active and false is inactive.
   */
  async getSwapStatus() {
    const rawVal = await this.queryDbKey(DBKey.forSwapStatus());
    return rawVal == 'true';
  }

  /**
   * getMinLiq queries & returns the minimum liquidity.
   * @returns {md.Token} The minimum liquidity of the contract.
   */
  async getMinLiq() {
    if (this._minLiq === 0) {
      const rawVal = await this.queryDbKey(DBKey.forMinLiq());
      const unit = await this.getLiqTokUnit();
      this._minLiq = md.Token.fromNumber(rawVal, unit);
    }
    return this._minLiq;
  }

  /**
   * getTokARes queries & returns the amount of token A inside the pool.
   * @returns {md.Token} The amount of token A inside the pool.
   */
  async getTokARes() {
    const rawVal = await this.queryDbKey(DBKey.forTokARes());
    const unit = await this.getTokAUnit();
    return md.Token.fromNumber(rawVal, unit);
  }

  /**
   * getTokBRes queries & returns the amount of token B inside the pool.
   * @returns {md.Token} The amount of token B inside the pool.
   */
  async getTokBRes() {
    const rawVal = await this.queryDbKey(DBKey.forTokBRes());
    const unit = await this.getTokBUnit();
    return md.Token.fromNumber(rawVal, unit);
  }

  /**
   * getTotalSupply queries & returns the total amount of liquidity tokens that can be minted.
   * @returns {md.Token} The total amount of liquidity tokens that can be minted.
   */
  async getTotalSupply() {
    const rawVal = await this.queryDbKey(DBKey.forTotalSupply());
    const unit = await this.getLiqTokUnit();
    return md.Token.fromNumber(rawVal, unit);
  }

  /**
   * getLiqTokLeft queries & returns the amount of liquidity tokens left to be minted.
   * @returns {md.Token} The amount of liquidity tokens left to be minted.
   */
  async getLiqTokLeft() {
    const rawVal = await this.queryDbKey(DBKey.forLiqTokLeft());
    const unit = await this.getLiqTokUnit();
    return md.Token.fromNumber(rawVal, unit);
  }

  /**
   * getTokABal queries & returns the balance of token A stored within the contract belonging to the given user address.
   * @param {string} addr - The address of the user.
   * @returns {md.Token} The balance of token A stored within the contract belonging to the given user address.
   */
  async getTokABal(addr) {
    const rawVal = await this.queryDbKey(DBKey.forTokABal(addr));
    const unit = await this.getTokAUnit();
    return md.Token.fromNumber(rawVal, unit);
  }

  /**
   * getTokBBal queries & returns the balance of token B stored within the contract belonging to the given user address.
   * @param {string} addr - The address of the user.
   * @returns {md.Token} The balance of token B stored within the contract belonging to the given user address.
   */
  async getTokBBal(addr) {
    const rawVal = await this.queryDbKey(DBKey.forTokBBal(addr));
    const unit = await this.getTokBUnit();
    return md.Token.fromNumber(rawVal, unit);
  }

  /**
   * getLiqTokBal queries & returns the balance of liquidity token stored within the contract belonging to the given user address.
   * @param {string} addr - The address of the user.
   * @returns {md.Token} The balance of liquidity token stored within the contract belonging to the given user address.
   */
  async getLiqTokBal(addr) {
    const rawVal = await this.queryDbKey(DBKey.forLiqTokBal(addr));
    const unit = await this.getLiqTokUnit();
    return md.Token.fromNumber(rawVal, unit);
  }

  /**
   * register registers a V Swap Contract.
   * @param {acnt.Account | msacnt.MultiSignAccount} by - The action taker.
   * @param {string} tokAId - The token A's id.
   * @param {string} tokBId - The token B's id.
   * @param {string} liqTokId - The liquidity token's id.
   * @param {number} minLiq - The minimum liquidity of the contract.
   * @param {string} ctrtDescription - The description of the contract. Defaults to ''.
   * @param {number} fee - The fee to pay for this action. Defaults to md.RegCtrtFee.DEFAULT.
   * @returns {VSwapCtrt} - The VSwapCtrt object of the registered V Swap Contract.
   */
  static async register(
    by,
    tokAId,
    tokBId,
    liqTokId,
    minLiq,
    ctrtDescription = '',
    fee = md.RegCtrtFee.DEFAULT
  ) {
    const resp = await by.chain.api.ctrt.getTokInfo(liqTokId);
    const liqUnit = resp.unity;

    const data = await by.registerContractImpl(
      new tx.RegCtrtTxReq(
        new de.DataStack(
          de.TokenID.fromStr(tokAId),
          de.TokenID.fromStr(tokBId),
          de.TokenID.fromStr(liqTokId),
          de.Amount.forTokAmount(minLiq, liqUnit)
        ),
        this.CTRT_META,
        md.VSYSTimestamp.now(),
        new md.Str(ctrtDescription),
        md.RegCtrtFee.fromNumber(fee)
      )
    );
    return new this(data.contractId, by.chain);
  }

  /**
   * supersede transfers the issuer role of the contract to a new account.
   * @param {any} by - The action taker.
   * @param {any} newOwner - The account address of the new owner.
   * @param {string} attachment - The attachment of the action. Defaults to ''.
   * @param {number} fee - The fee to pay for this action. Defaults to md.ExecCtrtFee.DEFAULT.
   * @returns {object} The response returned by the Node API.
   */
  async supersede(by, newOwner, attachment = '', fee = md.ExecCtrtFee.DEFAULT) {
    const newOwnerMd = new md.Addr(newOwner);
    newOwnerMd.mustOn(by.chain);

    const data = await by.executeContractImpl(
      new tx.ExecCtrtFuncTxReq(
        this.ctrtId,
        FuncIdx.SUPERSEDE,
        new de.DataStack(new de.Addr(newOwnerMd)),
        md.VSYSTimestamp.now(),
        new md.Str(attachment),
        md.ExecCtrtFee.fromNumber(fee)
      )
    );
    return data;
  }

  /**
   * setSwap creates a swap and deposit initial amounts into the pool.
   * @param {acnt.Account | msacnt.MultiSignAccount} by - The action taker.
   * @param {number} amntA - The initial amount for token A.
   * @param {number} amntB - The initial amount for token B.
   * @param {string} attachment - The attachment of the action. Defaults to ''.
   * @param {number} fee - The fee to pay for this action. Defaults to md.ExecCtrtFee.DEFAULT.
   * @returns {object} The response returned by the Node API.
   */
  async setSwap(
    by,
    amntA,
    amntB,
    attachment = '',
    fee = md.ExecCtrtFee.DEFAULT
  ) {
    const tokAUnit = await this.getTokAUnit();
    const tokBUnit = await this.getTokBUnit();

    const data = await by.executeContractImpl(
      new tx.ExecCtrtFuncTxReq(
        this.ctrtId,
        FuncIdx.SET_SWAP,
        new de.DataStack(
          de.Amount.forTokAmount(amntA, tokAUnit),
          de.Amount.forTokAmount(amntB, tokBUnit)
        ),
        md.VSYSTimestamp.now(),
        new md.Str(attachment),
        md.ExecCtrtFee.fromNumber(fee)
      )
    );
    return data;
  }

  /**
   * addLiquidity adds liquidity to the pool. The final added amount of token A & B will
     be in the same proportion as the pool at that moment as the liquidity provider shouldn't
     change the price of the token while the price is determined by the ratio between A & B.
   * @param {acnt.Account | msacnt.MultiSignAccount} by - The action taker.
   * @param {number} amntA - The desired amount for token A.
   * @param {number} amntB - The desired amount for token B.
   * @param {number} amntAMin - The minimum acceptable amount for token A.
   * @param {number} amntBMin - The minimum acceptable amount for token B.
   * @param {number} deadline - The deadline for this operation to complete.
   * @param {string} attachment - The attachment of the action. Defaults to ''.
   * @param {number} fee - The fee to pay for this action. Defaults to md.ExecCtrtFee.DEFAULT.
   * @returns {object} The response returned by the Node API.
   */
  async addLiquidity(
    by,
    amntA,
    amntB,
    amntAMin,
    amntBMin,
    deadline,
    attachment = '',
    fee = md.ExecCtrtFee.DEFAULT
  ) {
    const tokAUnit = await this.getTokAUnit();
    const tokBUnit = await this.getTokBUnit();

    const data = await by.executeContractImpl(
      new tx.ExecCtrtFuncTxReq(
        this.ctrtId,
        FuncIdx.ADD_LIQUIDITY,
        new de.DataStack(
          de.Amount.forTokAmount(amntA, tokAUnit),
          de.Amount.forTokAmount(amntB, tokBUnit),
          de.Amount.forTokAmount(amntAMin, tokAUnit),
          de.Amount.forTokAmount(amntBMin, tokBUnit),
          new de.Timestamp(md.VSYSTimestamp.fromUnixTs(deadline))
        ),
        md.VSYSTimestamp.now(),
        new md.Str(attachment),
        md.ExecCtrtFee.fromNumber(fee)
      )
    );
    return data;
  }

  /**
   * removeLiquidity removes liquidity from the pool by redeeming token A & B with liquidity tokens.
   * @param {acnt.Account | msacnt.MultiSignAccount} by - The action taker.
   * @param {number} amntLiq - The amount of liquidity token to return.
   * @param {number} amntAMin - The minimum acceptable amount of token A to redeem.
   * @param {number} amntBMin - The minimum acceptable amount of token B to redeem.
   * @param {any} deadline - The deadline for this operation to complete.
   * @param {string} attachment - The attachment of the action. Defaults to ''.
   * @param {number} fee - The fee to pay for this action. Defaults to md.ExecCtrtFee.DEFAULT.
   * @returns {object} The response returned by the Node API.
   */
  async removeLiquidity(
    by,
    amntLiq,
    amntAMin,
    amntBMin,
    deadline,
    attachment = '',
    fee = md.ExecCtrtFee.DEFAULT
  ) {
    const tokAUnit = await this.getTokAUnit();
    const tokBUnit = await this.getTokBUnit();
    const liqTokUnit = await this.getLiqTokUnit();

    const data = await by.executeContractImpl(
      new tx.ExecCtrtFuncTxReq(
        this.ctrtId,
        FuncIdx.REMOVE_LIQUIDITY,
        new de.DataStack(
          de.Amount.forTokAmount(amntLiq, liqTokUnit),
          de.Amount.forTokAmount(amntAMin, tokAUnit),
          de.Amount.forTokAmount(amntBMin, tokBUnit),
          new de.Timestamp(md.VSYSTimestamp.fromUnixTs(deadline))
        ),
        md.VSYSTimestamp.now(),
        new md.Str(attachment),
        md.ExecCtrtFee.fromNumber(fee)
      )
    );
    return data;
  }

  /**
   * swapBForExactA swaps token B for token A where the desired amount of token A is fixed.
   * @param {acnt.Account | msacnt.MultiSignAccount} by - The action taker.
   * @param {number} amntA - The desired amount for token A.
   * @param {number} amntBMax - The maximum amount of token B the action taker is willing to pay.
   * @param {any} deadline - The deadline for this operation to complete.
   * @param {string} attachment - The attachment of the action. Defaults to ''.
   * @param {number} fee - The fee to pay for this action. Defaults to md.ExecCtrtFee.DEFAULT.
   * @returns {object} The response returned by the Node API.
   */
  async swapBForExactA(
    by,
    amntA,
    amntBMax,
    deadline,
    attachment = '',
    fee = md.ExecCtrtFee.DEFAULT
  ) {
    const tokAUnit = await this.getTokAUnit();
    const tokBUnit = await this.getTokBUnit();

    const data = await by.executeContractImpl(
      new tx.ExecCtrtFuncTxReq(
        this.ctrtId,
        FuncIdx.SWAP_B_FOR_EXACT_A,
        new de.DataStack(
          de.Amount.forTokAmount(amntA, tokAUnit),
          de.Amount.forTokAmount(amntBMax, tokBUnit),
          new de.Timestamp(md.VSYSTimestamp.fromUnixTs(deadline))
        ),
        md.VSYSTimestamp.now(),
        new md.Str(attachment),
        md.ExecCtrtFee.fromNumber(fee)
      )
    );
    return data;
  }

  /**
   * swapExactBForA swaps token B for token A where the amount of token B to pay is fixed.
   * @param {acnt.Account | msacnt.MultiSignAccount} by - The action taker.
   * @param {number} amntAMin - The minimum acceptable amount for token A.
   * @param {number} amntB - The amount of token B to pay.
   * @param {number} deadline - The deadline for this operation to complete.
   * @param {string} attachment - The attachment of the action. Defaults to ''.
   * @param {number} fee - The fee to pay for this action. Defaults to md.ExecCtrtFee.DEFAULT.
   * @returns {object} The response returned by the Node API.
   */
  async swapExactBForA(
    by,
    amntAMin,
    amntB,
    deadline,
    attachment = '',
    fee = md.ExecCtrtFee.DEFAULT
  ) {
    const tokAUnit = await this.getTokAUnit();
    const tokBUnit = await this.getTokBUnit();

    const data = await by.executeContractImpl(
      new tx.ExecCtrtFuncTxReq(
        this.ctrtId,
        FuncIdx.SWAP_EXACT_B_FOR_A,
        new de.DataStack(
          de.Amount.forTokAmount(amntAMin, tokAUnit),
          de.Amount.forTokAmount(amntB, tokBUnit),
          new de.Timestamp(md.VSYSTimestamp.fromUnixTs(deadline))
        ),
        md.VSYSTimestamp.now(),
        new md.Str(attachment),
        md.ExecCtrtFee.fromNumber(fee)
      )
    );
    return data;
  }

  /**
   * swapAForExactB swaps token A for token B where the desired amount of token B is fixed.
   * @param {acnt.Account | msacnt.MultiSignAccount} by - The action taker.
   * @param {number} amntB - The desired amount of token B.
   * @param {number} amntAMax - The maximum amount of token A the action taker is willing to pay.
   * @param {number} deadline - The deadline for this operation to complete.
   * @param {string} attachment - The attachment of the action. Defaults to ''.
   * @param {number} fee - The fee to pay for this action. Defaults to md.ExecCtrtFee.DEFAULT.
   * @returns {object} The response returned by the Node API.
   */
  async swapAForExactB(
    by,
    amntB,
    amntAMax,
    deadline,
    attachment = '',
    fee = md.ExecCtrtFee.DEFAULT
  ) {
    const tokAUnit = await this.getTokAUnit();
    const tokBUnit = await this.getTokBUnit();

    const data = await by.executeContractImpl(
      new tx.ExecCtrtFuncTxReq(
        this.ctrtId,
        FuncIdx.SWAP_A_FOR_EXACT_B,
        new de.DataStack(
          de.Amount.forTokAmount(amntAMax, tokAUnit),
          de.Amount.forTokAmount(amntB, tokBUnit),
          new de.Timestamp(md.VSYSTimestamp.fromUnixTs(deadline))
        ),
        md.VSYSTimestamp.now(),
        new md.Str(attachment),
        md.ExecCtrtFee.fromNumber(fee)
      )
    );
    return data;
  }

  /**
   * swapExactAForB swaps token A for token B where the amount of token A to pay is fixed.
   * @param {acnt.Account | msacnt.MultiSignAccount} by - The action taker.
   * @param {number} amntBMin - The minimum acceptable amount of token B.
   * @param {number} amntA - The amount of token A to pay.
   * @param {number} deadline - The deadline for this operation to complete.
   * @param {string} attachment - The attachment of the action. Defaults to ''.
   * @param {number} fee - The fee to pay for this action. Defaults to md.ExecCtrtFee.DEFAULT.
   * @returns {object} The response returned by the Node API.
   */
  async swapExactAForB(
    by,
    amntBMin,
    amntA,
    deadline,
    attachment = '',
    fee = md.ExecCtrtFee.DEFAULT
  ) {
    const tokAUnit = await this.getTokAUnit();
    const tokBUnit = await this.getTokBUnit();

    const data = await by.executeContractImpl(
      new tx.ExecCtrtFuncTxReq(
        this.ctrtId,
        FuncIdx.SWAP_EXACT_A_FOR_B,
        new de.DataStack(
          de.Amount.forTokAmount(amntA, tokAUnit),
          de.Amount.forTokAmount(amntBMin, tokBUnit),
          new de.Timestamp(md.VSYSTimestamp.fromUnixTs(deadline))
        ),
        md.VSYSTimestamp.now(),
        new md.Str(attachment),
        md.ExecCtrtFee.fromNumber(fee)
      )
    );
    return data;
  }
}
