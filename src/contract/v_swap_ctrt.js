/**
 * module contract/VSwapCtrt provides functionalities for V Swap contract.
 * @module contract/VSwapCtrt
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

  static forTokAId() {
    return new this(StateVar.TOKEN_A_ID.serialize());
  }

  static forTokBId() {
    return new this(StateVar.TOKEN_B_ID.serialize());
  }

  static forLiqTokId() {
    return new this(StateVar.LIQUIDITY_TOKEN_ID.serialize());
  }

  static forSwapStatus() {
    return new this(StateVar.SWAP_STATUS.serialize());
  }

  static forMinLiq() {
    return new this(StateVar.MINIMUM_LIQUIDITY.serialize());
  }

  static forTokARes() {
    return new this(StateVar.TOKEN_A_RESERVED.serialize());
  }

  static forTokBRes() {
    return new this(StateVar.TOKEN_B_RESERVED.serialize());
  }

  static forTotalSupply() {
    return new this(StateVar.TOTAL_SUPPLY.serialize());
  }

  static forLiqTokLeft() {
    return new this(StateVar.LIQUIDITY_TOKEN_LEFT.serialize());
  }

  static forTokABal(addr) {
    const stmp = new ctrt.StateMap(
      StateMapIdx.CONTRACT_BALANCE,
      de.Addr.fromStr(addr)
    );
    return new this(stmp.serialize());
  }

  static forTokBBal(addr) {
    const stmp = new ctrt.StateMap(
      StateMapIdx.CONTRACT_BALANCE,
      de.Addr.fromStr(addr)
    );
    return new this(stmp.serialize());
  }

  static forLiqTokBal(addr) {
    const stmp = new ctrt.StateMap(
      StateMapIdx.CONTRACT_BALANCE,
      de.Addr.fromStr(addr)
    );
    return new this(stmp.serialize());
  }
}

/** VSwapCtrt is the class for V Swap Contract */
export class VSwapCtrt extends ctrt.BaseTokCtrt {
  static CTRT_META = ctrt.CtrtMeta.fromB58Str(
    'VJodouhmnHVDwtkBZ2NdgahT7NAgNE9EpWoZApzobhpua2nDL9D3sbHSoRRk8bEFeme2BHrXPdcq5VNJcPdGMUD54Smwatyx74cPJyet6bCWmLciHE2jGw9u5TmatjdpFSjGKegh76GvJstK3VaLagvsJJMaaKM9MNXYtgJyDr1Zw7U9PXV7N9TQnSsqz6EHMgDvd8aTDqEG7bxxAotkAgeh4KHqnk6Ga117q5AJctJcbUtD99iUgPmJrC8vzX85TEXgHRY1psW7D6daeExfVVrEPHFHrU6XfhegKv9vRbJBGL861U4Qg6HWbWxbuitgtKoBazSp7VofDtrZebq2NSpZoXCAZC8DRiaysanAqyCJZf7jJ8NfXtWej8L9vg8PVs65MrEmK8toadcyCA2UGzg6pQKrMKQEUahruBiS7zuo62eWwJBxUD1fQ1RGPk9BbMDk9FQQxXu3thSJPnKktq3aJhD9GNFpvyEAaWigp5nfjgH5doVTQk1PgoxeXRAWQNPztjNvZWv6iD85CoZqfCWdJbAXPrWvYW5FsRLW1xJ4ELRUfReMAjCGYuFWdA3CZyefpiDEWqVTe5SA6J6XeUppRyXKpKQTc6upesoAGZZ2NtFDryq22izC6D5p1i98YpC6Dk1qcKevaANKHH8TfFoQT717nrQEY2aLoWrA1ip2t5etdZjNVFmghxXEeCAGy3NcLDFHmAfcBZhHKeJHp8H8HbiMRtWe3wmwKX6mPx16ahnd3dMGCsxAZfjQcy4J1HpuCm7rHMULkixUFYRYqx85c7UpLcijLRybE1MLRjEZ5SEYtazNuiZBwq1KUcNipzrxta9Rpvt2j4WyMadxPf5r9YeAaJJp42PiC6SGfyjHjRQN4K3pohdQRbbG4HQ95NaWCy7CAwbpXRCh9NDMMQ2cmTfB3KFW2M'
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

  async getTokAId() {
    if (!this._tokAId) {
      const rawVal = await this.queryDbKey(DBKey.forTokAId());
      this._tokAId = rawVal;
    }
    return this._tokAId;
  }

  async getTokBId() {
    if (!this._tokBId) {
      const rawVal = await this.queryDbKey(DBKey.forTokBId());
      this._tokBId = rawVal;
    }
    return this._tokBId;
  }

  async getLiqTokId() {
    if (!this._liqTokId) {
      const rawVal = await this.queryDbKey(DBKey.forLiqTokId());
      this._liqTokId = rawVal;
    }
    return this._liqTokId;
  }

  async getTokACtrt() {
    if (!this._tokACtrt) {
      const rawVal = await this.queryDbKey(DBKey.forTokACtrt());
      this._tokACtrt = rawVal;
    }
    return this._tokACtrt;
  }

  async getTokBCtrt() {
    if (!this._tokBCtrt) {
      const rawVal = await this.queryDbKey(DBKey.forTokBCtrt());
      this._tokBCtrt = rawVal;
    }
    return this._tokBCtrt;
  }

  async getLiqTokCtrt() {
    if (!this._liqTokCtrt) {
      const rawVal = await this.queryDbKey(DBKey.forLiqTokCtrt());
      this._liqTokCtrt = rawVal;
    }
    return this._liqTokCtrt;
  }

  async getTokAUnit() {
    tc = await this._tokACtrt;
    return await tc.unit;
  }

  async getTokBUnit() {
    tc = await this._tokBCtrt;
    return await tc.unit;
  }

  async getLiqTokUnit() {
    tc = await this._liqTokCtrt;
    return await tc.unit;
  }

  async getSwapStatus() {
    const rawVal = await this.queryDbKey(DBKey.forSwapStatus());
    return new md.Addr(rawVal);
  }

  async getMinLiq() {
    if (this._minLiq === 0) {
      const rawVal = await this.queryDbKey(DBKey.forLiqTokCtrt());
      this._liqTokCtrt = rawVal;
    }
    return this._liqTokCtrt;
  }

  async getTokARes() {
    const rawVal = await this.queryDbKey(DBKey.forTokARes());
    unit = await this.getTokAUnit();
    return md.Token(rawVal, unit);
  }

  async getTokBRes() {
    const rawVal = await this.queryDbKey(DBKey.forTokBRes());
    unit = await this.getTokBUnit();
    return md.Token(rawVal, unit);
  }

  async getTotalSupply() {
    const rawVal = await this.queryDbKey(DBKey.forTotalSupply());
    unit = await this.getLiqTokUnit();
    return md.Token(rawVal, unit);
  }

  async getLiqTokLeft() {
    const rawVal = await this.queryDbKey(DBKey.forLiqTokLeft());
    unit = await this.getLiqTokUnit();
    return md.Token(rawVal, unit);
  }

  async getTokABal(addr) {
    const rawVal = await this.queryDbKey(DBKey.forTokABal(addr));
    unit = await this.getTokAUnit();
    return md.Token(rawVal, unit);
  }

  async getTokBBal(addr) {
    const rawVal = await this.queryDbKey(DBKey.forTokBBal(addr));
    unit = await this.getTokBUnit();
    return md.Token(rawVal, unit);
  }

  async getLiqTokBal(addr) {
    const rawVal = await this.queryDbKey(DBKey.forLiqTokBal(addr));
    unit = await this.getLiqTokUnit();
    return md.Token(rawVal, unit);
  }

  static async register(
    by,
    tokAId,
    tokBId,
    liqTokId,
    minLiq,
    ctrtDescription = '',
    fee = md.RegCtrtFee.DEFAULT
  ) {
    const data = await by.registerContractImpl(
      new tx.RegCtrtTxReq(
        new de.DataStack(
          de.TokenID(md.TokenID(tokAId)),
          de.TokenID(md.TokenID(tokBId)),
          de.TokenID(md.TokenID(liqTokId)),
          de.Amount(md.NonNegativeInt(minLiq))
        ),
        this.CTRT_META,
        md.VSYSTimestamp.now(),
        new md.Str(ctrtDescription),
        md.RegCtrtFee.fromNumber(fee)
      )
    );
    return new this(data.contractId, by.chain);
  }

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

  async setSwap(
    by,
    amntA,
    amntB,
    attachment = '',
    fee = md.ExecCtrtFee.DEFAULT
  ) {
    tokAUnit = await this.getTokAUnit();
    tokBUnit = await this.getTokBUnit();

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
    tokAUnit = await this.getTokAUnit();
    tokBUnit = await this.getTokBUnit();

    const data = await by.executeContractImpl(
      new tx.ExecCtrtFuncTxReq(
        this.ctrtId,
        FuncIdx.ADD_LIQUIDITY,
        new de.DataStack(
          de.Amount.forTokAmount(amntA, tokAUnit),
          de.Amount.forTokAmount(amntB, tokBUnit),
          de.Amount.forTokAmount(amntAMin, tokAUnit),
          de.Amount.forTokAmount(amntBMin, tokBUnit),
          de.Timestamp(md.VSYSTimestamp.fromUnixTs(deadline))
        ),
        md.VSYSTimestamp.now(),
        new md.Str(attachment),
        md.ExecCtrtFee.fromNumber(fee)
      )
    );
    return data;
  }

  async removeLiquidity(
    by,
    amntLiq,
    amntAMin,
    amntBMin,
    deadline,
    attachment = '',
    fee = md.ExecCtrtFee.DEFAULT
  ) {
    tokAUnit = await this.getTokAUnit();
    tokBUnit = await this.getTokBUnit();
    liqTokUnit = await this.getLiqTokUnit();

    const data = await by.executeContractImpl(
      new tx.ExecCtrtFuncTxReq(
        this.ctrtId,
        FuncIdx.REMOVE_LIQUIDITY,
        new de.DataStack(
          de.Amount.forTokAmount(amntLiq, liqTokUnit),
          de.Amount.forTokAmount(amntAMin, tokAUnit),
          de.Amount.forTokAmount(amntBMin, tokBUnit),
          de.Timestamp(md.VSYSTimestamp.fromUnixTs(deadline))
        ),
        md.VSYSTimestamp.now(),
        new md.Str(attachment),
        md.ExecCtrtFee.fromNumber(fee)
      )
    );
    return data;
  }

  async swapBForExactA(
    by,
    amntA,
    amntBMax,
    deadline,
    attachment = '',
    fee = md.ExecCtrtFee.DEFAULT
  ) {
    tokAUnit = await this.getTokAUnit();
    tokBUnit = await this.getTokBUnit();

    const data = await by.executeContractImpl(
      new tx.ExecCtrtFuncTxReq(
        this.ctrtId,
        FuncIdx.SWAP_B_FOR_EXACT_A,
        new de.DataStack(
          de.Amount.forTokAmount(amntA, tokAUnit),
          de.Amount.forTokAmount(amntBMax, tokBUnit),
          de.Timestamp(md.VSYSTimestamp.fromUnixTs(deadline))
        ),
        md.VSYSTimestamp.now(),
        new md.Str(attachment),
        md.ExecCtrtFee.fromNumber(fee)
      )
    );
    return data;
  }

  async swapExactBForA(
    by,
    amntAMin,
    amntB,
    deadline,
    attachment = '',
    fee = md.ExecCtrtFee.DEFAULT
  ) {
    tokAUnit = await this.getTokAUnit();
    tokBUnit = await this.getTokBUnit();

    const data = await by.executeContractImpl(
      new tx.ExecCtrtFuncTxReq(
        this.ctrtId,
        FuncIdx.SWAP_EXACT_B_FOR_A,
        new de.DataStack(
          de.Amount.forTokAmount(amntAMin, tokAUnit),
          de.Amount.forTokAmount(amntB, tokBUnit),
          de.Timestamp(md.VSYSTimestamp.fromUnixTs(deadline))
        ),
        md.VSYSTimestamp.now(),
        new md.Str(attachment),
        md.ExecCtrtFee.fromNumber(fee)
      )
    );
    return data;
  }

  async swapAForExactB(
    by,
    amntB,
    amntAMax,
    deadline,
    attachment = '',
    fee = md.ExecCtrtFee.DEFAULT
  ) {
    tokAUnit = await this.getTokAUnit();
    tokBUnit = await this.getTokBUnit();

    const data = await by.executeContractImpl(
      new tx.ExecCtrtFuncTxReq(
        this.ctrtId,
        FuncIdx.SWAP_A_FOR_EXACT_B,
        new de.DataStack(
          de.Amount.forTokAmount(amntB, tokBUnit),
          de.Amount.forTokAmount(amntAMax, tokAUnit),
          de.Timestamp(md.VSYSTimestamp.fromUnixTs(deadline))
        ),
        md.VSYSTimestamp.now(),
        new md.Str(attachment),
        md.ExecCtrtFee.fromNumber(fee)
      )
    );
    return data;
  }

  async swapExactAForB(
    by,
    amntBMin,
    amntA,
    deadline,
    attachment = '',
    fee = md.ExecCtrtFee.DEFAULT
  ) {
    tokAUnit = await this.getTokAUnit();
    tokBUnit = await this.getTokBUnit();

    const data = await by.executeContractImpl(
      new tx.ExecCtrtFuncTxReq(
        this.ctrtId,
        FuncIdx.SWAP_EXACT_A_FOR_B,
        new de.DataStack(
          de.Amount.forTokAmount(amntBMin, tokBUnit),
          de.Amount.forTokAmount(amntA, tokAUnit),
          de.Timestamp(md.VSYSTimestamp.fromUnixTs(deadline))
        ),
        md.VSYSTimestamp.now(),
        new md.Str(attachment),
        md.ExecCtrtFee.fromNumber(fee)
      )
    );
    return data;
  }
}
