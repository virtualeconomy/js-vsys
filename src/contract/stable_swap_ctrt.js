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
