/**
 * atomic swap contract module provides functionalities for V Atomic Swap contract.
 * @module contract/nft_ctrt
 */

'use strict';

import * as ctrt from './ctrt.js';
import * as acnt from '../account.js';
import * as md from '../model.js';
import * as tx from '../tx_req.js';
import * as de from '../data_entry.js';
import * as hs from '../utils/hashes.js';
import base58 from 'bs58';

/** FuncIdx is the class for function indexes */
export class FuncIdx extends ctrt.FuncIdx {
  static elems = {
    LOCK: 0,
    SOLVE_PUZZLE: 1,
    EXPIRE_WITHDRAW: 2,
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
    SWAP_OWNER: 1,
    SWAP_RECIPIENT: 2,
    SWAP_PUZZLE: 3,
    SWAP_AMOUNT: 4,
    SWAP_EXPIRED_TIME: 5,
    SWAP_STATUS: 6,
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
   * forSwapOwner returns the DBKey object for querying the swap owner.
   * @param {string} txId - The lock transaction ID.
   * @returns {DBKey} The DBKey object for querying the swap owner.
   */
  static forSwapOwner(txId) {
    const stmp = new ctrt.StateMap(
      StateMapIdx.SWAP_OWNER,
      de.Bytes.fromBase58Str(txId)
    );
    return new this(stmp.serialize());
  }

  /**
   * forSwapRecipient returns the DBKey object for querying the swap recipient.
   * @param {string} txId - The lock transaction ID.
   * @returns {DBKey} The DBKey object for querying the swap recipient.
   */
  static forSwapRecipient(txId) {
    const stmp = new ctrt.StateMap(
      StateMapIdx.SWAP_RECIPIENT,
      de.Bytes.fromBase58Str(txId)
    );
    return new this(stmp.serialize());
  }

  /**
   * forSwapPuzzle returns the DBKey object for querying the swap puzzle.
   * @param {string} txId - The lock transaction ID.
   * @returns {DBKey} The DBKey object for querying the swap puzzle.
   */
  static forSwapPuzzle(txId) {
    const stmp = new ctrt.StateMap(
      StateMapIdx.SWAP_PUZZLE,
      de.Bytes.fromBase58Str(txId)
    );
    return new this(stmp.serialize());
  }

  /**
   * forSwapAmount returns the DBKey object for querying the swap amount.
   * @param {string} txId - The lock transaction ID.
   * @returns {DBKey} The DBKey object for querying the swap amount.
   */
  static forSwapAmount(txId) {
    const stmp = new ctrt.StateMap(
      StateMapIdx.SWAP_AMOUNT,
      de.Bytes.fromBase58Str(txId)
    );
    return new this(stmp.serialize());
  }

  /**
   * forSwapExpiredTime returns the DBKey object for querying the swap expired time.
   * @param {string} txId - The lock transaction ID.
   * @returns {DBKey} The DBKey object for querying the swap expired time.
   */
  static forSwapExpiredTime(txId) {
    const stmp = new ctrt.StateMap(
      StateMapIdx.SWAP_EXPIRED_TIME,
      de.Bytes.fromBase58Str(txId)
    );
    return new this(stmp.serialize());
  }

  /**
   * forSwapStatus returns the DBKey object for querying the swap status.
   * @param {string} txId - The lock transaction ID.
   * @returns {DBKey} The DBKey object for querying the swap status.
   */
  static forSwapStatus(txId) {
    const stmp = new ctrt.StateMap(
      StateMapIdx.SWAP_STATUS,
      de.Bytes.fromBase58Str(txId)
    );
    return new this(stmp.serialize());
  }
}

export class AtomicSwapCtrt extends ctrt.Ctrt {
  static CTRT_META = ctrt.CtrtMeta.fromB58Str(
    '4CrYZXauEHTHvUcNbU2qxvYSgdxPkSBum4PAUfytuZu7Nn56L59op72uKJUBMnF8dk8dLb5k63M9236s8S2yH4FTeWFP4zjfpkx9HGwjAuh6n6WJyxWE1S5HHH2cQLy4xk5B4iMpQKyHQwrQDn3zWwQQPsrfnwaHX1F3V2zKHKx15QYATS784BGfz9NeY72Ntdz2Cgsf6MLQE1YKdgdRfpryCwadqs5xchALCPYLNg6ECSxzPDa4XdS8ywTWzRpiajTGZA1z9YoQZiUMYBwM8S2G4ttZJkgrWTqpXuxberLv3CWZm7kp8bwvg577p8kJ7zAugTgaBU9vzSRFzi3fWtGEP1TPuMCjLSQfskepjoLXbPHyVMmvLZGbjx2AwCyGikdXBdLJWhheL6rnveiXJQfV6zfgF9zeMTpg9GE5SRstGHFetCZwfe3qCPV6vUWrobmWusQ9rDkj5uUXVpjwmBseynCnKNS1CZKDnBDy6mWBDPHNCtuDdYCamqaSEh1nx9ykk4vVJggzPJR8awFMHh5iKPRL9LGhuqbqs4rDPVsg7BCrdaszTGEBEHjfqF51K8PF9kUnPQJvGkf58MrLj2SAArizmZYcnpGMwdfYqGxrjz7xaJGZVAqvFbWFDk3x18ozp58PwFM1fdAn1dn15fKCsiQoqZBtVTxSd4GRJ2tFvBzgUJjig6hqhHqCqobCbpes8LoTdtDCHE5Co3YBnrYN19vbESu2W6LMpwrPPgd1YUeHx8AxR9evasFYrCjmnvBkEyefu5n66yTPYNXfjAk646dHmWYJiUPp1oWDXMjfDJ4xif4BXhRwBtfwgHoDhU2dMV6E7cPVppXxeVL2UsFCbqsafpNcDmhsrGEDAWmxJ3V8KymyuNugM1CHTEiwcTb7GXd4dD3UznDVoJEVrmBveETvCuGVNfGZ4zGZnURyoJHzMkDKPWFQhqgVYLoRuLg4MtquRAaSEKixtXiSJZFKZvQTzMbJC2ie3bnyQoX3x2C9pPpzp3uFKc1eGpgafgi8KoyiqiCMJvfzi8v8DiyTZ9QPENAtwToUpf6vsn1C4HhDzGb9otfigtVuh9JuzsZkJbd4r2rU8sUcKWZcaLF1uX4EdZiEfiW3aV5cm1L7oEJX2w4rQbNiFZWGUpS31WS6mYtWkSTnQupp7rggs8sQxcdWK8WamLgonF4mhXkY12Y2U9AXDJifMKr7mzxiFxZumPWxGn8A1PtTp34wcuhykNMesekwDgWGRCWca9w3YDkeinoD2QmV5ivF2GfHTKhCVH5pkGmBZczeVMA2ZTWb5DTM5qQA9vRy43aJipwmYH73ssbdF7N96678x4hsdcFXXJooRbDtuEY9UkhFPtFMjzD7D5uvXzN4qTPFSyoumwH3ag6cmZMxxQdHNJAm7vitgDpRy3HM174KpjE7uUQXtVvMKEYeAWus24vwW6M4i7APsVg6FeJTgGJJHAHFJFJ4YrZ1fmzgGFnugfp9g4hMuo9G76dzzkZetLhweJCggXBRVpNeRzQ9xmtuDN3wmiyQ1bLSx2ZtNcmWqzbSDsUnCezXtbF4CURyp2djUKo2DRza78CHpmUgHHVai8JrAxPwS6gB8mBg'
  );

  /**
   * register registers a Atomic Swap Contract.
   * @param {acnt.Account} by - The action taker.
   * @param {string} tokId - The ID of the token to lock.
   * @param {string} ctrtDescription - The description of the contract. Defaults to ''.
   * @param {number} fee - The fee to pay for this action. Defaults to md.RegCtrtFee.DEFAULT.
   * @returns {AtomicSwapCtrt} The LockCtrt object of the registered Lock Contract.
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
   * getUnit returns the unit of the token of this contract.
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
   * getSwapOwner queries & returns the address of swap owner.
   * @param {string} txId - The lock transaction ID.
   * @returns {md.Addr} The address of the swap owner.
   */
  async getSwapOwner(txId) {
    const rawVal = await this.queryDbKey(DBKey.forSwapOwner(txId));
    return new md.Addr(rawVal);
  }

  /**
   * getSwapRcpt queries & returns the address of swap recipient.
   * @param {string} txId - The lock transaction ID.
   * @returns {md.Addr} The address of the swap owner.
   */
  async getSwapRecipient(txId) {
    const rawVal = await this.queryDbKey(DBKey.forSwapRecipient(txId));
    return new md.Addr(rawVal);
  }

  /**
   * getSwapPuzzle query & returns the hashed secret.
   * @param {string} txId - The lock transaction ID.
   * @returns {string} The puzzle.
   */
  async getSwapPuzzle(txId) {
    const rawVal = await this.queryDbKey(DBKey.forSwapPuzzle(txId));
    return rawVal;
  }

  /**
   * getSwapAmount query & returns the swap amount.
   * @param {string} txId - The lock transaction ID.
   * @returns {md.Token} The balance of the token locked.
   */
  async getSwapAmount(txId) {
    const rawVal = await this.queryDbKey(DBKey.forSwapAmount(txId));
    const unit = await this.getUnit();
    return new md.Token(rawVal, unit);
  }

  /**
   * getSwapExpiredTime query & returns the the expiration time.
   * @param {string} txId - The lock transaction ID.
   * @returns {md.VSYSTimestamp} The expiration time.
   */
  async getSwapExpiredTime(txId) {
    rawVal = await this.queryDbKey(DBKey.forSwapExpiredTime(txId));
    return new md.VSYSTimestamp(rawVal);
  }

  /**
   * makerLock locks the token by the maker.
   * @param {acnt.Account} by - The action taker.
   * @param {number} amount - The amount of the token to be locked.
   * @param {string} recipient - The taker's address.
   * @param {string} secret - The secret.
   * @param {number} expireTime - The expired timestamp to lock.
   * @param {any} attachment=""
   * @param {any} fee=md.ExecCtrtFee.DEFAULT
   * @returns {any}
   */
  async makerLock(
    by,
    amount,
    recipient,
    secret,
    expireTime,
    attachment = '',
    fee = md.ExecCtrtFee.DEFAULT
  ) {
    const puzzleBytes = hs.sha256Hash(Buffer.from(secret, 'latin1'));
    const unit = await this.getUnit();

    const data = await by.executeContractImpl(
      new tx.ExecCtrtFuncTxReq(
        this.ctrtId,
        FuncIdx.LOCK,
        new de.DataStack(
          de.Amount.for_tok_amount(amount, unit),
          de.Addr.fromStr(recipient),
          de.Bytes.fromBytes(puzzleBytes),
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
   * takerLock locks the token by the taker.
   * @param {acnt.Account} by - The action taker.
   * @param {number} amount - The amount of the token to be locked.
   * @param {string} makerCtrtId - The ID of the maker's contract.
   * @param {string} recipient - The maker's address.
   * @param {string} makerLockTxId - The transaction ID of the maker's.
   * @param {number} expireTime - The expiration timestamp of the lock.
   * @param {string} attachment - The attachment of the action. Defaults to ''.
   * @param {number} fee - The fee to pay for this action. Defaults to md.ExecCtrtFee.DEFAULT.
   * @returns {object} The response returned by the Node API.
   */
  async takerLock(
    by,
    amount,
    makerCtrtId,
    recipient,
    makerLockTxId,
    expireTime,
    attachment = '',
    fee = md.ExecCtrtFee.DEFAULT
  ) {
    // TODO:!!!!
    // Deal with the case where maker & taker are on different chains.
    // The following code assumes that maker's contract & taker's contract
    // are on the same chain.

    const puzzleDbKey = DBKey.forSwapPuzzle(makerLockTxId);
    const resp = await this.chain.api.ctrt.getCtrtData(
      makerCtrtId,
      puzzleDbKey.b58Str
    );
    const hashedPuzzle = resp.value;
    const puzzleBytes = base58.decode(hashedPuzzle);

    const unit = await this.getUnit();

    const data = await by.executeContractImpl(
      new tx.ExecCtrtFuncTxReq(
        this.ctrtId,
        FuncIdx.LOCK,
        new de.DataStack(
          de.Amount.for_tok_amount(amount, unit),
          de.Addr.fromStr(recipient),
          de.Bytes.fromBytes(puzzleBytes),
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
   * makerSolve solves the puzzle and reveals the secret to get taker's locked tokens for maker.
   * @param {acnt.Account} by - The action taker.
   * @param {string} takerCtrtId - The swap contract ID of the taker's.
   * @param {string} tx_id - The lock transaction ID of taker's.
   * @param {string} secret - The secret.
   * @param {string} attachment - The attachment of the action. Defaults to ''.
   * @param {number} fee - The fee to pay for this action. Defaults to md.ExecCtrtFee.DEFAULT.
   * @returns {object} The response returned by the Node API.
   */
  async makerSolve(
    by,
    takerCtrtId,
    txId,
    secret,
    attachment = '',
    fee = md.ExecCtrtFee.DEFAULT
  ) {
    const data = await by.executeContractImpl(
      new tx.ExecCtrtFuncTxReq(
        takerCtrtId,
        FuncIdx.SOLVE_PUZZLE,
        new de.DataStack(
          de.Bytes.fromBase58Str(txId),
          de.Bytes.fromStr(secret)
        ),
        md.VSYSTimestamp.now(),
        new md.Str(attachment),
        md.ExecCtrtFee.fromNumber(fee)
      )
    );
    return data;
  }

  /**
   * takerSolve solves the puzzle by the secret the maker reveals and gets the makers' locked tokens
      for taker.
   * @param {acnt.Account} by - The action taker.
   * @param {string} makerCtrtId - The contract ID of the maker'.
   * @param {string} makerLockTxId - The lock transaction ID of the maker's.
   * @param {string} makerSolveTxId - The solve transaction ID of the maker's.
   * @param {string} attachment - The attachment of the action. Defaults to ''.
   * @param {number} fee - The fee to pay for this action. Defaults to md.ExecCtrtFee.DEFAULT.
   * @returns {object} The response returned by the Node API.
   */
  async takerSolve(
    by,
    makerCtrtId,
    makerLockTxId,
    makerSolveTxId,
    attachment = '',
    fee = md.ExecCtrtFee.DEFAULT
  ) {
    const dictData = await by.chain.api.tx.getInfo(makerSolveTxId);
    const funcData = dictData['functionData'];
    const ds = de.DataStack.deserialize(base58.decode(funcData));
    const revealedSecret = ds.entries[1].data.data.decode();

    const data = await by.executeContractImpl(
      new tx.ExecCtrtFuncTxReq(
        makerCtrtId,
        FuncIdx.SOLVE_PUZZLE,
        new de.DataStack(
          de.Bytes.fromBase58Str(makerLockTxId),
          de.Bytes.fromStr(revealedSecret)
        ),
        md.VSYSTimestamp.now(),
        new md.Str(attachment),
        md.ExecCtrtFee.fromNumber(fee)
      )
    );
    return data;
  }

  /**
   * expWithdraw withdraws the tokens when the lock is expired.
   * @param {acnt.Account} by - The action taker.
   * @param {string} txId - The transaction lock ID.
   * @param {string} attachment - The attachment of the action. Defaults to ''.
   * @param {number} fee - The fee to pay for this action. Defaults to md.ExecCtrtFee.DEFAULT.
   * @returns {object} The response returned by the Node API.
   */
  async expWithdraw(by, txId, attachment = '', fee = md.ExecCtrtFee.DEFAULT) {
    const data = await by.executeContractImpl(
      new tx.ExecCtrtFuncTxReq(
        this.ctrtId,
        FuncIdx.EXPIRE_WITHDRAW,
        new de.DataStack(de.Bytes.fromBase58Str(txId)),
        md.VSYSTimestamp.now(),
        new md.Str(attachment),
        md.ExecCtrtFee.fromNumber(fee)
      )
    );
    return data;
  }
}
