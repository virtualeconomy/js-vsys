/**
 * module contract/atomicSwapHelper provides higher level encapsulation of functionalities for V Atomic Swap contract on VSYS chain.
 * The two swap tokens should be all be VSYS-based & on the same chain.
 * @module contract/atomicSwapHelper
 */

'use strict';

import bs58 from 'bs58';
import { Buffer } from 'buffer';
import * as acnt from '../account.js';
import * as md from '../model.js';
import * as tx from '../tx_req.js';
import * as de from '../data_entry.js';
import * as hs from '../utils/hashes.js';
import * as atomicCtrt from './atomic_swap_ctrt.js';
import { DBKey } from './atomic_swap_ctrt.js';
import * as msacnt from '../multisign_account.js';

export class AtomicSwapHelper extends atomicCtrt.AtomicSwapCtrt {
  /**
   * makerLock locks the token by the maker.
   * @param {acnt.Account | msacnt.MultiSignAccount} by - The action taker.
   * @param {number} amount - The amount of the token to be locked.
   * @param {string} recipient - The taker's address.
   * @param {string} secret - The secret.
   * @param {number} expireTime - The expired timestamp to lock.
   * @param {string} attachment - The attachment of the action. Defaults to ''.
   * @param {number} fee - The fee to pay for this action. Defaults to md.ExecCtrtFee.DEFAULT.
   * @returns {object} The response returned by the Node API.
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
        atomicCtrt.FuncIdx.LOCK,
        new de.DataStack(
          de.Amount.forTokAmount(amount, unit),
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
   * @param {acnt.Account | msacnt.MultiSignAccount} by - The action taker.
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
    // The following code assumes that maker's contract & taker's contract
    // are on the same chain.
    const puzzleDbKey = DBKey.forSwapPuzzle(makerLockTxId);
    const resp = await this.chain.api.ctrt.getCtrtData(
      makerCtrtId,
      puzzleDbKey.b58Str
    );
    const hashedPuzzle = resp.value;
    const puzzleBytes = Buffer.from(bs58.decode(hashedPuzzle));

    const unit = await this.getUnit();

    const data = await by.executeContractImpl(
      new tx.ExecCtrtFuncTxReq(
        this.ctrtId,
        atomicCtrt.FuncIdx.LOCK,
        new de.DataStack(
          de.Amount.forTokAmount(amount, unit),
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
   * @param {acnt.Account | msacnt.MultiSignAccount} by - The action taker.
   * @param {string} atomicCtrtId - The swap contract ID of the taker's.
   * @param {string} takerLockTxId - The lock transaction ID of taker's.
   * @param {string} secret - The secret.
   * @param {string} attachment - The attachment of the action. Defaults to ''.
   * @param {number} fee - The fee to pay for this action. Defaults to md.ExecCtrtFee.DEFAULT.
   * @returns {object} The response returned by the Node API.
   */
  async makerSolve(
    by,
    atomicCtrtId,
    takerLockTxId,
    secret,
    attachment = '',
    fee = md.ExecCtrtFee.DEFAULT
  ) {
    const data = await by.executeContractImpl(
      new tx.ExecCtrtFuncTxReq(
        new md.CtrtID(atomicCtrtId),
        atomicCtrt.FuncIdx.SOLVE_PUZZLE,
        new de.DataStack(
          de.Bytes.fromBase58Str(takerLockTxId),
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
    const ds = de.DataStack.deserialize(Buffer.from(bs58.decode(funcData)));
    const revealedSecret = ds.entries[1].data.data.toString('latin1');

    const data = await by.executeContractImpl(
      new tx.ExecCtrtFuncTxReq(
        new md.CtrtID(makerCtrtId),
        atomicCtrt.FuncIdx.SOLVE_PUZZLE,
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
}
