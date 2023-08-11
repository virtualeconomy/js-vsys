/**
 * module contract/VStableSwapCtrt provides functionalities for V Stable Swap contract.
 * @module contract/VStableSwapCtrt
 */

'use strict';

import * as tcf from './tok_ctrt_factory.js';
import * as ctrt from './ctrt.js';
import * as acnt from '../account.js';
import * as md from '../model.js';
import * as tx from '../tx_req.js';
import * as de from '../data_entry.js';
import * as msacnt from '../multisign_account.js';

/** FuncIdx is the class for function indexes */
export class FuncIdx extends ctrt.FuncIdx {
  static elems = {
    SUPERSEDE: 0,
    SET_ORDER: 1,
    UPDATE_ORDER: 2,
    ORDER_DEPOSIT: 3,
    ORDER_WITHDRAW: 4,
    CLOSE_ORDER: 5,
    SWAP_BASE_TO_TARGET: 6,
    SWAP_TARGET_TO_BASE: 7,
  };
  static _ = this.createElems();
}

/** StateVar is the class for state variables */
export class StateVar extends ctrt.StateVar {
  static elems = {
    MAKER: 0,
    BASE_TOKEN_ID: 1,
    TARGET_TOKEN_ID: 2,
    MAX_ORDER_PER_USER: 3,
    UNIT_PRICE_BASE: 4,
    UNIT_PRICE_TARGET: 5,
  };
  static _ = this.createElems();
}

/** StateMapIdx is the class for state map index */
export class StateMapIdx extends ctrt.StateMapIdx {
  static elems = {
    BASE_TOKEN_BALANCE: 0,
    TARGET_TOKEN_BALANCE: 1,
    USER_ORDERS: 2,
    ORDER_OWNER: 3,
    FEE_BASE: 4,
    FEE_TARGET: 5,
    MIN_BASE: 6,
    MAX_BASE: 7,
    MIN_TARGET: 8,
    MAX_TARGET: 9,
    PRICE_BASE: 10,
    PRICE_TARGET: 11,
    BASE_TOKEN_LOCKED: 12,
    TARGET_TOKEN_LOCKED: 13,
    ORDER_STATUS: 14,
  };
  static _ = this.createElems();
}

/** DBKey is the class for DB key */
export class DBKey extends ctrt.DBKey {
  /**
   * forMaker returns the DBKey object for querying the maker.
   * @returns {DBKey} The DBKey object.
   */
  static forMaker() {
    return new this(StateVar.MAKER.serialize());
  }

  /**
   * forBaseTokId returns the DBKey object for querying the base token ID.
   * @returns {DBKey} The DBKey object.
   */
  static forBaseTokId() {
    return new this(StateVar.BASE_TOKEN_ID.serialize());
  }

  /**
   * forTargetTokId returns the DBKey object for querying the target token ID.
   * @returns {DBKey} The DBKey object.
   */
  static forTargetTokId() {
    return new this(StateVar.TARGET_TOKEN_ID.serialize());
  }

  /**
   * forMaxOrderPerUser returns the DBKey object for querying the max order number per user.
   * @returns {DBKey} The DBKey object.
   */
  static forMaxOrderPerUser() {
    return new this(StateVar.MAX_ORDER_PER_USER.serialize());
  }

  /**
   * forBasePriceUnit returns the DBKey object for querying the unit of base token price.
   * @returns {DBKey} The DBKey object.
   */
  static forBasePriceUnit() {
    return new this(StateVar.UNIT_PRICE_BASE.serialize());
  }

  /**
   * forTargetPriceUnit returns the DBKey object for querying the unit of target token price.
   * @returns {DBKey} The DBKey object.
   */
  static forTargetPriceUnit() {
    return new this(StateVar.UNIT_PRICE_TARGET.serialize());
  }

  /**
   * forBaseTokBal returns the DBKey object for querying the base token balance.
   * @param {string} addr - The address of the account that owns the base token.
   * @returns {DBKey} The DBKey object.
   */
  static forBaseTokBal(addr) {
    const stmp = new ctrt.StateMap(
      StateMapIdx.BASE_TOKEN_BALANCE,
      de.Addr.fromStr(addr)
    );
    return new this(stmp.serialize());
  }

  /**
   * forTargetTokBal returns the DBKey object for querying the target token balance.
   * @param {string} addr - The address of the account that owns the target token.
   * @returns {DBKey} The DBKey object.
   */
  static forTargetTokBal(addr) {
    const stmp = new ctrt.StateMap(
      StateMapIdx.TARGET_TOKEN_BALANCE,
      de.Addr.fromStr(addr)
    );
    return new this(stmp.serialize());
  }

  /**
   * forUserOrders returns the DBKey object for querying the number of orders of the user's.
   * @param {string} addr - The address of the account that creates the orders.
   * @returns {DBKey} The DBKey object.
   */
  static forUserOrders(addr) {
    const stmp = new ctrt.StateMap(
      StateMapIdx.USER_ORDERS,
      de.Addr.fromStr(addr)
    );
    return new this(stmp.serialize());
  }

  /**
   * forOrderOwner returns the DBKey object for querying the order owner.
   * @param {string} orderId - The order ID.
   * @returns {DBKey} The DBKey object.
   */
  static forOrderOwner(orderId) {
    const stmp = new ctrt.StateMap(
      StateMapIdx.ORDER_OWNER,
      de.Bytes.fromBase58Str(orderId)
    );
    return new this(stmp.serialize());
  }

  /**
   * forFeeBase returns the DBKey object for querying the base token fee.
   * @param {string} orderId - The order ID.
   * @returns {DBKey} The DBKey object.
   */
  static forFeeBase(orderId) {
    const stmp = new ctrt.StateMap(
      StateMapIdx.FEE_BASE,
      de.Bytes.fromBase58Str(orderId)
    );
    return new this(stmp.serialize());
  }

  /**
   * forFeeTarget returns the DBKey object for querying the target token fee.
   * @param {string} orderId - The order ID.
   * @returns {DBKey} The DBKey object.
   */
  static forFeeTarget(orderId) {
    const stmp = new ctrt.StateMap(
      StateMapIdx.FEE_TARGET,
      de.Bytes.fromBase58Str(orderId)
    );
    return new this(stmp.serialize());
  }

  /**
   * forMinBase returns the DBKey object for querying the minimum amount of base token.
   * @param {string} orderId - The order ID.
   * @returns {DBKey} The DBKey object.
   */
  static forMinBase(orderId) {
    const stmp = new ctrt.StateMap(
      StateMapIdx.MIN_BASE,
      de.Bytes.fromBase58Str(orderId)
    );
    return new this(stmp.serialize());
  }

  /**
   * forMaxBase returns the DBKey object for querying the maximum amount of base token.
   * @param {string} orderId - The order ID.
   * @returns {DBKey} The DBKey object.
   */
  static forMaxBase(orderId) {
    const stmp = new ctrt.StateMap(
      StateMapIdx.MAX_BASE,
      de.Bytes.fromBase58Str(orderId)
    );
    return new this(stmp.serialize());
  }

  /**
   * forMinTarget returns the DBKey object for querying the minimum amount of target token.
   * @param {string} orderId - The order ID.
   * @returns {DBKey} The DBKey object.
   */
  static forMinTarget(orderId) {
    const stmp = new ctrt.StateMap(
      StateMapIdx.MIN_TARGET,
      de.Bytes.fromBase58Str(orderId)
    );
    return new this(stmp.serialize());
  }

  /**
   * forMaxTarget returns the DBKey object for querying the maximum amount of target token.
   * @param {string} orderId - The order ID.
   * @returns {DBKey} The DBKey object.
   */
  static forMaxTarget(orderId) {
    const stmp = new ctrt.StateMap(
      StateMapIdx.MAX_TARGET,
      de.Bytes.fromBase58Str(orderId)
    );
    return new this(stmp.serialize());
  }

  /**
   * forPriceBase returns the DBKey object for querying the price of the base token.
   * @param {string} orderId - The order ID.
   * @returns {DBKey} The DBKey object.
   */
  static forPriceBase(orderId) {
    const stmp = new ctrt.StateMap(
      StateMapIdx.PRICE_BASE,
      de.Bytes.fromBase58Str(orderId)
    );
    return new this(stmp.serialize());
  }

  /**
   * forPriceTarget returns the DBKey object for querying the price of the target token.
   * @param {string} orderId - The order ID.
   * @returns {DBKey} The DBKey object.
   */
  static forPriceTarget(orderId) {
    const stmp = new ctrt.StateMap(
      StateMapIdx.PRICE_TARGET,
      de.Bytes.fromBase58Str(orderId)
    );
    return new this(stmp.serialize());
  }

  /**
   * forBaseTokenLocked returns the DBKey object for querying the amount of base token locked.
   * @param {string} orderId - The order ID.
   * @returns {DBKey} The DBKey object.
   */
  static forBaseTokenLocked(orderId) {
    const stmp = new ctrt.StateMap(
      StateMapIdx.BASE_TOKEN_LOCKED,
      de.Bytes.fromBase58Str(orderId)
    );
    return new this(stmp.serialize());
  }

  /**
   * forTargetTokenLocked returns the DBKey object for querying the amount of target token locked.
   * @param {string} orderId - The order ID.
   * @returns {DBKey} The DBKey object.
   */
  static forTargetTokenLocked(orderId) {
    const stmp = new ctrt.StateMap(
      StateMapIdx.TARGET_TOKEN_LOCKED,
      de.Bytes.fromBase58Str(orderId)
    );
    return new this(stmp.serialize());
  }

  /**
   * forOrderStatus returns DBKey object for querying the order status.
   * @param {string} orderId - The order ID.
   * @returns {DBKey} The DBKey object.
   */
  static forOrderStatus(orderId) {
    const stmp = new ctrt.StateMap(
      StateMapIdx.ORDER_STATUS,
      de.Bytes.fromBase58Str(orderId)
    );
    return new this(stmp.serialize());
  }
}

export class StableSwapCtrt extends ctrt.Ctrt {
  static CTRT_META = md.CtrtMeta.fromB58Str(
    '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'
  );

  constructor(ctrtId, chain) {
    super(ctrtId, chain);
    this.baseTokId = undefined;
    this.targetTokId = undefined;
    this.baseTokCtrt = undefined;
    this.targetTokCtrt = undefined;
  }

  /**
   * register registers a V Stable Swap Contract.
   * @param {acnt.Account | msacnt.MultiSignAccount} by - The action taker.
   * @param {string} baseTokId - The base token ID.
   * @param {string} targetTokId - The target token ID.
   * @param {number} maxOrderPerUser - The max order number that per user can create.
   * @param {number} basePriceUnit - The unit of price of the base token.
   * @param {number} targetPriceUnit - The unit of price of the target token.
   * @param {number} ctrtDescription - The description of the contract. Defaults to ''.
   * @param {number} fee - The fee to pay for this action. Defaults to md.RegCtrtFee.DEFAULT.
   * @returns {StableSwapCtrt} The object of the registered Stable Swap Contract.
   */
  static async register(
    by,
    baseTokId,
    targetTokId,
    maxOrderPerUser,
    basePriceUnit,
    targetPriceUnit,
    ctrtDescription = '',
    fee = md.RegCtrtFee.DEFAULT
  ) {
    const data = await by.registerContractImpl(
      new tx.RegCtrtTxReq(
        new de.DataStack(
          de.TokenID.fromStr(baseTokId),
          de.TokenID.fromStr(targetTokId),
          de.Amount.fromNumber(maxOrderPerUser),
          de.Amount.fromNumber(basePriceUnit),
          de.Amount.fromNumber(targetPriceUnit)
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
   * getMaker queries & returns the maker of the contract.
   * @returns {md.Addr} The address of the maker of the contract.
   */
  async getMaker() {
    const rawVal = await this.queryDbKey(DBKey.forMaker());
    return new md.Addr(rawVal);
  }

  /**
   * getBaseTokId queries & returns the base token ID.
   * @returns {md.TokenID} The base token ID.
   */
  async getBaseTokId() {
    if (!this.baseTokId) {
      const rawVal = await this.queryDbKey(DBKey.forBaseTokId());
      this.baseTokId = new md.TokenID(rawVal);
    }
    return this.baseTokId;
  }

  /**
   * getTargetTokId queries & returns the target token ID.
   * @returns {md.TokenID} The target token ID.
   */
  async getTargetTokId() {
    if (!this.targetTokId) {
      const rawVal = await this.queryDbKey(DBKey.forTargetTokId());
      this.targetTokId = new md.TokenID(rawVal);
    }
    return this.targetTokId;
  }

  /**
   * getBaseTokCtrt returns the token contract instance for base token.
   * @returns {ctrt.BaseTokCtrt} The token contract instance.
   */
  async getBaseTokCtrt() {
    if (!this.baseTokCtrt) {
      const baseTokId = await this.getBaseTokId();
      this.baseTokCtrt = await tcf.fromTokId(baseTokId, this.chain);
    }
    return this.baseTokCtrt;
  }

  /**
   * getTargetTokCtrt returns the token contract instance for target token.
   * @returns {ctrt.BaseTokCtrt} The token contract instance.
   */
  async getTargetTokCtrt() {
    if (!this.targetTokCtrt) {
      const targetTokId = await this.getTargetTokId();
      this.targetTokCtrt = await tcf.fromTokId(targetTokId, this.chain);
    }
    return this.targetTokCtrt;
  }

  /**
   * getBaseTokUnit queries & returns the unit of base token.
   * @returns {number} The unit of base token.
   */
  async getBaseTokUnit() {
    const tc = await this.getBaseTokCtrt();
    return await tc.getUnit();
  }

  /**
   * getTargetTokUnit queries & returns the unit of target token.
   * @returns {number} The unit of target token.
   */
  async getTargetTokUnit() {
    const tc = await this.getTargetTokCtrt();
    return await tc.getUnit();
  }

  /**
   * getMaxOrderPerUser queries & returns the max order number that each user can create.
   * @returns {number} The max order number.
   */
  async getMaxOrderPerUser() {
    return await this.queryDbKey(DBKey.forMaxOrderPerUser());
  }

  /**
   * getBasePriceUnit queries & returns the price unit of base token.
   * @returns {number} The price unit of base token.
   */
  async getBasePriceUnit() {
    return await this.queryDbKey(DBKey.forBasePriceUnit());
  }

  /**
   * getTargetPriceUnit queries & returns the price unit of target token.
   * @returns {number} The price unit of target token.
   */
  async getTargetPriceUnit() {
    return await this.queryDbKey(DBKey.forTargetPriceUnit());
  }

  /**
   * getBaseTokBal queries & returns the balance of the available base tokens.
   * @param {string} addr - The account address that deposits the token.
   * @returns {md.Token} The balance of the token.
   */
  async getBaseTokBal(addr) {
    const rawVal = await this.queryDbKey(DBKey.forBaseTokBal(addr));
    const unit = await this.getBaseTokUnit();
    return md.Token.fromNumber(rawVal, unit);
  }

  /**
   * getTargetTokBal queries & returns the balance of the available target tokens.
   * @param {string} addr - The account address that deposits the token.
   * @returns {md.Token} The balance of the token.
   */
  async getTargetTokBal(addr) {
    const rawVal = await this.queryDbKey(DBKey.forTargetTokBal(addr));
    const unit = await this.getTargetTokUnit();
    return md.Token.fromNumber(rawVal, unit);
  }

  /**
   * getUserOrders queries & returns the number of user orders.
   * @param {string} addr - The account address.
   * @returns {number} The number of user orders.
   */
  async getUserOrders(addr) {
    return await this.queryDbKey(DBKey.forUserOrders(addr));
  }

  /**
   * getOrderOwner queries & returns the address of the order owner.
   * @param {string} orderId - The order ID.
   * @returns {md.Addr} The address of the order owner.
   */
  async getOrderOwner(orderId) {
    const rawVal = await this.queryDbKey(DBKey.forOrderOwner(orderId));
    return new md.Addr(rawVal);
  }

  /**
   * getFeeBase queries & returns the fee for base token.
   * @param {string} orderId - The order ID.
   * @returns {md.Token} The fee for base token.
   */
  async getFeeBase(orderId) {
    const rawVal = await this.queryDbKey(DBKey.forFeeBase(orderId));
    const unit = await this.getBaseTokUnit();
    return md.Token.fromNumber(rawVal, unit);
  }

  /**
   * getFeeTarget queries & returns the fee for target token.
   * @param {string} orderId - The order ID.
   * @returns {md.Token} The fee for target token.
   */
  async getFeeTarget(orderId) {
    const rawVal = await this.queryDbKey(DBKey.forFeeTarget(orderId));
    const unit = await this.getTargetTokUnit();
    return md.Token.fromNumber(rawVal, unit);
  }

  /**
   * getMinBase queries & returns the minimum amount of base token.
   * @param {string} orderId - The order ID.
   * @returns {md.Token} The minimum amount of base token.
   */
  async getMinBase(orderId) {
    const rawVal = await this.queryDbKey(DBKey.forMinBase(orderId));
    const unit = await this.getBaseTokUnit();
    return md.Token.fromNumber(rawVal, unit);
  }

  /**
   * getMaxBase queries & returns the maximum amount of base token.
   * @param {string} orderId - The order ID.
   * @returns {md.Token} The maximum amount of base token.
   */
  async getMaxBase(orderId) {
    const rawVal = await this.queryDbKey(DBKey.forMaxBase(orderId));
    const unit = await this.getBaseTokUnit();
    return md.Token.fromNumber(rawVal, unit);
  }

  /**
   * getMinTarget queries & returns the minimum amount of target token.
   * @param {string} orderId - The order ID.
   * @returns {md.Token} The minimum amount of target token.
   */
  async getMinTarget(orderId) {
    const rawVal = await this.queryDbKey(DBKey.forTargetBase(orderId));
    const unit = await this.getTargetTokUnit();
    return md.Token.fromNumber(rawVal, unit);
  }

  /**
   * getMaxTarget queries & returns the maximum amount of target token.
   * @param {string} orderId - The order ID.
   * @returns {md.Token} The maximum amount of target token.
   */
  async getMaxTarget(orderId) {
    const rawVal = await this.queryDbKey(DBKey.forMaxTarget(orderId));
    const unit = await this.getTargetTokUnit();
    return md.Token.fromNumber(rawVal, unit);
  }

  /**
   * getPriceBase queries & returns the price of base token.
   * @param {string} orderId - The order ID.
   * @returns {md.Token} The price of base token.
   */
  async getPriceBase(orderId) {
    const rawVal = await this.queryDbKey(DBKey.forPriceBase(orderId));
    const unit = await this.getBaseTokUnit();
    return md.Token.fromNumber(rawVal, unit);
  }

  /**
   * getPriceTarget queries & returns the price of target token.
   * @param {string} orderId - The order ID.
   * @returns {md.Token} The price of target token.
   */
  async getPriceTarget(orderId) {
    const rawVal = await this.queryDbKey(DBKey.forPriceTarget(orderId));
    const unit = await this.getTargetTokUnit();
    return md.Token.fromNumber(rawVal, unit);
  }

  /**
   * getBaseTokLocked queries & returns the locked balance of base token.
   * @param {string} orderId - The order ID.
   * @returns {md.Token} The locked balance of base token.
   */
  async getBaseTokLocked(orderId) {
    const rawVal = await this.queryDbKey(DBKey.forBaseTokenLocked(orderId));
    const unit = await this.getBaseTokUnit();
    return md.Token.fromNumber(rawVal, unit);
  }

  /**
   * getTargetTokLocked queries & returns the locked balance of target token.
   * @param {string} orderId - The order ID.
   * @returns {md.Token} The locked balance of target token.
   */
  async getTargetTokLocked(orderId) {
    const rawVal = await this.queryDbKey(DBKey.forTargetTokenLocked(orderId));
    const unit = await this.getTargetTokUnit();
    return md.Token.fromNumber(rawVal, unit);
  }

  /**
   * getOrderStatus queries & returns the order status.
   * @param {string} orderId - The order ID.
   * @returns {md.Token} The order status.
   */
  async getOrderStatus(orderId) {
    const status = await this.queryDbKey(DBKey.forOrderStatus(orderId));
    return status === 'true';
  }

  /**
   * supersede transfers the ownership of the contract to another account.
   * @param {acnt.Account | msacnt.MultiSignAccount} by - The action taker.
   * @param {string} newOwner - The account address of the new owner.
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
   * setOrder creates the order.
   * @param {acnt.Account | msacnt.MultiSignAccount} by - The action taker.
   * @param {number} feeBase - The fee of base token.
   * @param {number} feeTarget - The fee of target token.
   * @param {number} minBase - The minimum amount of base token.
   * @param {number} maxBase - The maximum amount of base token.
   * @param {number} minTarget - The minimum amount of target token.
   * @param {number} maxTarget - The maximum amount of target token.
   * @param {number} priceBase - The price of base token.
   * @param {number} priceTarget - The price of target token.
   * @param {number} baseDeposit - The deposit balance of base token.
   * @param {any} targetDeposit - The deposit balance of target token.
   * @param {string} attachment - The attachment of the action. Defaults to ''.
   * @param {number} fee - The fee to pay for this action. Defaults to md.ExecCtrtFee.DEFAULT.
   * @returns {object} The response returned by the Node API.
   */
  async setOrder(
    by,
    feeBase,
    feeTarget,
    minBase,
    maxBase,
    minTarget,
    maxTarget,
    priceBase,
    priceTarget,
    baseDeposit,
    targetDeposit,
    attachment = '',
    fee = md.ExecCtrtFee.DEFAULT
  ) {
    const baseUnit = await this.getBaseTokUnit();
    const targetUnit = await this.getTargetTokUnit();
    const basePriceUnit = await this.getBasePriceUnit();
    const targetPriceUnit = await this.getTargetPriceUnit();

    const data = await by.executeContractImpl(
      new tx.ExecCtrtFuncTxReq(
        this.ctrtId,
        FuncIdx.SET_ORDER,
        new de.DataStack(
          de.Amount.forTokAmount(feeBase, baseUnit),
          de.Amount.forTokAmount(feeTarget, targetUnit),
          de.Amount.forTokAmount(minBase, baseUnit),
          de.Amount.forTokAmount(maxBase, baseUnit),
          de.Amount.forTokAmount(minTarget, targetUnit),
          de.Amount.forTokAmount(maxTarget, targetUnit),
          de.Amount.forTokAmount(priceBase, basePriceUnit),
          de.Amount.forTokAmount(priceTarget, targetPriceUnit),
          de.Amount.forTokAmount(baseDeposit, baseUnit),
          de.Amount.forTokAmount(targetDeposit, targetUnit)
        ),
        md.VSYSTimestamp.now(),
        new md.Str(attachment),
        md.ExecCtrtFee.fromNumber(fee)
      )
    );
    return data;
  }

  /**
   * updateOrder updates the order.
   * @param {acnt.Account | msacnt.MultiSignAccount} by - The action taker.
   * @param {string} orderId - The order id.
   * @param {number} feeBase - The fee of base token.
   * @param {number} feeTarget - The fee of target token.
   * @param {number} minBase - The minimum amount of base token.
   * @param {number} maxBase - The maximum amount of base token.
   * @param {number} minTarget - The minimum amount of target token.
   * @param {number} maxTarget - The maximum amount of target token.
   * @param {number} priceBase - The price of base token.
   * @param {number} priceTarget - The price of target token.
   * @param {string} attachment - The attachment of the action. Defaults to ''.
   * @param {number} fee - The fee to pay for this action. Defaults to md.ExecCtrtFee.DEFAULT.
   * @returns {object} The response returned by the Node API.
   */
  async updateOrder(
    by,
    orderId,
    feeBase,
    feeTarget,
    minBase,
    maxBase,
    minTarget,
    maxTarget,
    priceBase,
    priceTarget,
    attachment = '',
    fee = md.ExecCtrtFee.DEFAULT
  ) {
    const baseUnit = await this.getBaseTokUnit();
    const targetUnit = await this.getTargetTokUnit();
    const basePriceUnit = await this.getBasePriceUnit();
    const targetPriceUnit = await this.getTargetPriceUnit();

    const data = await by.executeContractImpl(
      new tx.ExecCtrtFuncTxReq(
        this.ctrtId,
        FuncIdx.UPDATE_ORDER,
        new de.DataStack(
          de.Bytes.fromBase58Str(orderId),
          de.Amount.forTokAmount(feeBase, baseUnit),
          de.Amount.forTokAmount(feeTarget, targetUnit),
          de.Amount.forTokAmount(minBase, baseUnit),
          de.Amount.forTokAmount(maxBase, baseUnit),
          de.Amount.forTokAmount(minTarget, targetUnit),
          de.Amount.forTokAmount(maxTarget, targetUnit),
          de.Amount.forTokAmount(priceBase, basePriceUnit),
          de.Amount.forTokAmount(priceTarget, targetPriceUnit)
        ),
        md.VSYSTimestamp.now(),
        new md.Str(attachment),
        md.ExecCtrtFee.fromNumber(fee)
      )
    );
    return data;
  }

  /**
   * orderDeposit locks the tokens.
   * @param {acnt.Account | msacnt.MultiSignAccount} by - The action taker.
   * @param {string} orderId - The order id.
   * @param {number} baseDeposit - The deposit balance of base token.
   * @param {number} targetDeposit - The deposit balance of target token.
   * @param {string} attachment - The attachment of the action. Defaults to ''.
   * @param {number} fee - The fee to pay for this action. Defaults to md.ExecCtrtFee.DEFAULT.
   * @returns {object} The response returned by the Node API.
   */
  async orderDeposit(
    by,
    orderId,
    baseDeposit,
    targetDeposit,
    attachment = '',
    fee = md.ExecCtrtFee.DEFAULT
  ) {
    const baseUnit = await this.getBaseTokUnit();
    const targetUnit = await this.getTargetTokUnit();

    const data = await by.executeContractImpl(
      new tx.ExecCtrtFuncTxReq(
        this.ctrtId,
        FuncIdx.ORDER_DEPOSIT,
        new de.DataStack(
          de.Bytes.fromBase58Str(orderId),
          de.Amount.forTokAmount(baseDeposit, baseUnit),
          de.Amount.forTokAmount(targetDeposit, targetUnit)
        ),
        md.VSYSTimestamp.now(),
        new md.Str(attachment),
        md.ExecCtrtFee.fromNumber(fee)
      )
    );
    return data;
  }

  /**
   * orderWithdraw unlocks the tokens.
   * @param {acnt.Account | msacnt.MultiSignAccount} by - The action taker.
   * @param {string} orderId - The order id.
   * @param {number} baseWithdraw - The withdraw balance of base token.
   * @param {number} targetWithdraw - The withdraw balance of target token.
   * @param {string} attachment - The attachment of the action. Defaults to ''.
   * @param {number} fee - The fee to pay for this action. Defaults to md.ExecCtrtFee.DEFAULT.
   * @returns {object} The response returned by the Node API.
   */
  async orderWithdraw(
    by,
    orderId,
    baseWithdraw,
    targetWithdraw,
    attachment = '',
    fee = md.ExecCtrtFee.DEFAULT
  ) {
    const baseUnit = await this.getBaseTokUnit();
    const targetUnit = await this.getTargetTokUnit();

    const data = await by.executeContractImpl(
      new tx.ExecCtrtFuncTxReq(
        this.ctrtId,
        FuncIdx.ORDER_WITHDRAW,
        new de.DataStack(
          de.Bytes.fromBase58Str(orderId),
          de.Amount.forTokAmount(baseWithdraw, baseUnit),
          de.Amount.forTokAmount(targetWithdraw, targetUnit)
        ),
        md.VSYSTimestamp.now(),
        new md.Str(attachment),
        md.ExecCtrtFee.fromNumber(fee)
      )
    );
    return data;
  }

  /**
   * closeOrder closes the order.
   * @param {acnt.Account | msacnt.MultiSignAccount} by - The action taker.
   * @param {string} orderId - The order id.
   * @param {string} attachment - The attachment of the action. Defaults to ''.
   * @param {number} fee - The fee to pay for this action. Defaults to md.ExecCtrtFee.DEFAULT.
   * @returns {object} The response returned by the Node API.
   */
  async closeOrder(by, orderId, attachment = '', fee = md.ExecCtrtFee.DEFAULT) {
    const data = await by.executeContractImpl(
      new tx.ExecCtrtFuncTxReq(
        this.ctrtId,
        FuncIdx.CLOSE_ORDER,
        new de.DataStack(de.Bytes.fromBase58Str(orderId)),
        md.VSYSTimestamp.now(),
        new md.Str(attachment),
        md.ExecCtrtFee.fromNumber(fee)
      )
    );
    return data;
  }

  /**
   * swapBaseToTarget swaps base token to target token.
   * @param {acnt.Account | msacnt.MultiSignAccount} by - The action taker.
   * @param {string} orderId - The order id.
   * @param {number} amount - The swap amount.
   * @param {number} swapFee - The swap fee.
   * @param {number} price - The price.
   * @param {number} deadline - The deadline timestamp of the swap.
   * @param {string} attachment - The attachment of the action. Defaults to ''.
   * @param {number} fee - The fee to pay for this action. Defaults to md.ExecCtrtFee.DEFAULT.
   * @returns {object} The response returned by the Node API.
   */
  async swapBaseToTarget(
    by,
    orderId,
    amount,
    swapFee,
    price,
    deadline,
    attachment = '',
    fee = md.ExecCtrtFee.DEFAULT
  ) {
    const baseUnit = await this.getBaseTokUnit();
    const basePriceUnit = await this.getBasePriceUnit();

    const data = await by.executeContractImpl(
      new tx.ExecCtrtFuncTxReq(
        this.ctrtId,
        FuncIdx.SWAP_BASE_TO_TARGET,
        new de.DataStack(
          de.Bytes.fromBase58Str(orderId),
          de.Amount.forTokAmount(amount, baseUnit),
          de.Amount.forTokAmount(swapFee, baseUnit),
          de.Amount.forTokAmount(price, basePriceUnit),
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
   * swapTargetToBase swaps target token to base token.
   * @param {acnt.Account | msacnt.MultiSignAccount} by - The action taker.
   * @param {string} orderId - The order id.
   * @param {number} amount - The swap amount.
   * @param {number} swapFee - The swap fee.
   * @param {number} price - The price.
   * @param {number} deadline - The deadline timestamp of the swap.
   * @param {string} attachment - The attachment of the action. Defaults to ''.
   * @param {number} fee - The fee to pay for this action. Defaults to md.ExecCtrtFee.DEFAULT.
   * @returns {object} The response returned by the Node API.
   */
  async swapTargetToBase(
    by,
    orderId,
    amount,
    swapFee,
    price,
    deadline,
    attachment = '',
    fee = md.ExecCtrtFee.DEFAULT
  ) {
    const targetUnit = await this.getTargetTokUnit();
    const targetPriceUnit = await this.getTargetPriceUnit();

    const data = await by.executeContractImpl(
      new tx.ExecCtrtFuncTxReq(
        this.ctrtId,
        FuncIdx.SWAP_TARGET_TO_BASE,
        new de.DataStack(
          de.Bytes.fromBase58Str(orderId),
          de.Amount.forTokAmount(amount, targetUnit),
          de.Amount.forTokAmount(swapFee, targetUnit),
          de.Amount.forTokAmount(price, targetPriceUnit),
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
