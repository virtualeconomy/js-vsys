/**
 * module contract/stableSwapCtrt provides functionalities for V Stable Swap contract.
 * @module contract/stableSwapCtrt
 */

'use strict';

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
   * forBaseTokenId returns the DBKey object for querying the base token ID.
   * @returns {DBKey} The DBKey object.
   */
  static forBaseTokenId() {
    return new this(StateVar.BASE_TOKEN_ID.serialize());
  }

  /**
   * forTargetTokenId returns the DBKey object for querying the target token ID.
   * @returns {DBKey} The DBKey object.
   */
  static forTargetTokenID() {
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
   * forBaseTokenBalance returns the DBKey object for querying the base token balance.
   * @param {string} addr - The address of the account that owns the base token.
   * @returns {DBKey} The DBKey object.
   */
  static forBaseTokenBalance(addr) {
    const stmp = new ctrt.StateMap(
      StateMapIdx.BASE_TOKEN_BALANCE,
      de.Addr.fromStr(addr)
    );
    return new this(stmp.serialize());
  }

  /**
   * forTargetTokenBalance returns the DBKey object for querying the target token balance.
   * @param {string} addr - The address of the account that owns the target token.
   * @returns {DBKey} The DBKey object.
   */
  static forTargetTokenBalance(addr) {
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
   * forMinBase returns the DBKey object for querying the minimum value of base token.
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
   * forMaxBase returns the DBKey object for querying the maximum value of base token.
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
   * forMinTarget returns the DBKey object for querying the minimum value of target token.
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
   * forMaxTarget returns the DBKey object for querying the maximum value of target token.
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
