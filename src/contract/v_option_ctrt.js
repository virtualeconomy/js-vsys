/**
 * module VOptionCtrt provides functionalities for V Option contract.
 * @module contract/VOptionCtrt
 */

'use strict';

import * as ctrt from './ctrt.js';
import * as acnt from '../account.js';
import * as md from '../model.js';
import * as tx from '../tx_req.js';
import * as de from '../data_entry.js';
import * as tcf from './tok_ctrt_factory.js';
import * as msacnt from '../multisign_account.js';

/** FuncIdx is the class for function indexes */
export class FuncIdx extends ctrt.FuncIdx {
  static elems = {
    SUPERSEDE: 0,
    ACTIVATE: 1,
    MINT: 2,
    UNLOCK: 3,
    EXECUTE: 4,
    COLLECT: 5,
  };
  static _ = this.createElems();
}

/** StateVar is the class for state variables */
export class StateVar extends ctrt.StateVar {
  static elems = {
    MAKER: 0,
    BASE_TOKEN_ID: 1,
    TARGET_TOKEN_ID: 2,
    OPTION_TOKEN_ID: 3,
    PROOF_TOKEN_ID: 4,
    EXECUTE_TIME: 5,
    EXECUTE_DEADLINE: 6,
    OPTION_STATUS: 7,
    MAX_ISSUE_NUM: 8,
    RESERVED_OPTION: 9,
    RESERVED_PROOF: 10,
    PRICE: 11,
    PRICE_UNIT: 12,
    TOKEN_LOCKED: 13,
    TOKEN_COLLECTED: 14,
  };
  static _ = this.createElems();
}

/** StateMapIdx is the class for state map index */
export class StateMapIdx extends ctrt.StateMapIdx {
  static elems = {
    BASE_TOKEN_BALANCE: 0,
    TARGET_TOKEN_BALANCE: 1,
    OPTION_TOKEN_BALANCE: 2,
    PROOF_TOKEN_BALANCE: 3,
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
   * forBaseTokId returns the DBKey object for querying the base token id.
   * @returns {DBKey} The DBKey object for querying the base token id.
   */
  static forBaseTokId() {
    return new this(StateVar.BASE_TOKEN_ID.serialize());
  }

  /**
   * forTargetTokId returns the DBKey object for querying the target token id.
   * @returns {DBKey} The DBKey object for querying the target token id.
   */
  static forTargetTokId() {
    return new this(StateVar.TARGET_TOKEN_ID.serialize());
  }

  /**
   * forOptionTokId returns the DBKey object for querying the option token id.
   * @returns {DBKey} The DBKey object for querying the option token id.
   */
  static forOptionTokId() {
    return new this(StateVar.OPTION_TOKEN_ID.serialize());
  }

  /**
   * forProofTokId returns the DBKey object for querying the proof token id.
   * @returns {DBKey} The DBKey object for querying the proof token id.
   */
  static forProofTokId() {
    return new this(StateVar.PROOF_TOKEN_ID.serialize());
  }

  /**
   * forExecuteTime returns the DBKey object for querying the execute time.
   * @returns {DBKey} The DBKey object for querying the execute time.
   */
  static forExecuteTime() {
    return new this(StateVar.EXECUTE_TIME.serialize());
  }

  /**
   * forExecuteDeadline returns the DBKey object for querying the execute deadline.
   * @returns {DBKey} The DBKey object for querying the execute deadline.
   */
  static forExecuteDeadline() {
    return new this(StateVar.EXECUTE_DEADLINE.serialize());
  }

  /**
   * forOptionStatus returns the DBKey object for querying the execute deadline.
   * @returns {DBKey} The DBKey object for querying the execute deadline.
   */
  static forOptionStatus() {
    return new this(StateVar.EXECUTE_DEADLINE.serialize());
  }

  /**
   * forMaxIssueNum returns the DBKey object for querying the maximum issue number.
   * @returns {DBKey} The DBKey object for querying the maximum issue number.
   */
  static forMaxIssueNum() {
    return new this(StateVar.MAX_ISSUE_NUM.serialize());
  }

  /**
   * forReversedOption returns the DBKey object for querying the reserved option tokens remaining in the pool.
   * @returns {DBKey} The DBKey object for querying the reserved option tokens remaining in the pool.
   */
  static forReversedOption() {
    return new this(StateVar.RESERVED_OPTION.serialize());
  }

  /**
   * forReversedProof returns the DBKey object for querying the reserved proof tokens remaining in the pool.
   * @returns {DBKey} The DBKey object for querying the reserved proof tokens remaining in the pool.
   */
  static forReversedProof() {
    return new this(StateVar.RESERVED_PROOF.serialize());
  }

  /**
   * forPrice returns the DBKey object for querying the price of the contract creator.
   * @returns {DBKey} The DBKey object for querying the price of the contract creator.
   */
  static forPrice() {
    return new this(StateVar.PRICE.serialize());
  }

  /**
   * forPriceUnit returns the DBKey object for querying the price unit of the contract creator.
   * @returns {DBKey} The DBKey object for querying the price unit of the contract creator.
   */
  static forPriceUnit() {
    return new this(StateVar.PRICE_UNIT.serialize());
  }

  /**
   * forTokenLocked returns the DBKey object for querying the address of the contract creator.
   * @returns {DBKey} The DBKey object for querying the address of the contract creator.
   */
  static forTokenLocked() {
    return new this(StateVar.TOKEN_LOCKED.serialize());
  }

  /**
   * forTokenCollect returns the DBKey object for querying the amount of base tokens in the pool.
   * @returns {DBKey} The DBKey object for querying the amount of base tokens in the pool.
   */
  static forTokenCollect() {
    return new this(StateVar.TOKEN_COLLECTED.serialize());
  }

  /**
   * forBaseTokBal returns the DBKey object for querying the total amount of base token balance.
   * @returns {DBKey} The DBKey object for querying the total amount of base token balance.
   */
  static forBaseTokBal(addr) {
    const stmp = new ctrt.StateMap(
      StateMapIdx.BASE_TOKEN_BALANCE,
      de.Addr.fromStr(addr)
    );
    return new this(stmp.serialize());
  }

  /**
   * forTargetTokBal returns the DBKey object for querying the total amount of target token balance.
   * @returns {DBKey} The DBKey object for querying the total amount of target token balance.
   */
  static forTargetTokBal(addr) {
    const stmp = new ctrt.StateMap(
      StateMapIdx.TARGET_TOKEN_BALANCE,
      de.Addr.fromStr(addr)
    );
    return new this(stmp.serialize());
  }

  /**
   * forOptionTokBal returns the DBKey object for querying the total amount of option token balance.
   * @returns {DBKey} The DBKey object for querying the total amount of option token balance.
   */
  static forOptionTokBal(addr) {
    const stmp = new ctrt.StateMap(
      StateMapIdx.OPTION_TOKEN_BALANCE,
      de.Addr.fromStr(addr)
    );
    return new this(stmp.serialize());
  }

  /**
   * forProofTokBal returns the DBKey object for querying the total amount of proof token balance.
   * @returns {DBKey} The DBKey object for querying the total amount of proof token balance.
   */
  static forProofTokBal(addr) {
    const stmp = new ctrt.StateMap(
      StateMapIdx.PROOF_TOKEN_BALANCE,
      de.Addr.fromStr(addr)
    );
    return new this(stmp.serialize());
  }
}

export class VOptionCtrt extends ctrt.Ctrt {
  static CTRT_META = md.CtrtMeta.fromB58Str(
    '2Vcyrgk4NQi6yuVa2yobJmcXuZp81ZmxGaDrWMxPzaioQBZ6s9grRKucYDFGbPqnxQ86T8YLyzYWF64Rj7uyAWbkHDqTvnVZMfuMhgrtrmp4ffDwH9dc7g6fNy9PrMefNAYtHh9hw7ThJ8RTcKFiSa4qBBQMy768DaAMrLoWWBXYivvViBeGXTpdeP65CbUWWyqKLTX3Kg8DzHgvQwakXoUTe4fWCjTVBeNaPfQwN8yTtwbgGJ8pr7GUfkxaUVBCJAmVKJEfW4hwvosU2KWCQWFezZwYqevPZj6PsAd1QiSU5axu3oognJiowAUrAY7DFYAeMhmm3tLMDziVHZkvKA3157LXewm7SAqh5EZSCkZSSGZaAMdkk7JkQG5k7KLBb5r791ue8MA1vrVtHd6Tj7URWonFKRGXvb2aSLjGvFQEyCWRkquDmVzBaoyJkaBn6V7TaJoGmXuyLCD7CY6vcMrjnW7wbwNd1UriSn6JqfHCu8fqHXuaBBmgNGnh4tSzPZU8cxcFsaEeWvZxNAB4Sa3mb9mkK9Qiqn2VKPNaQkDESjjUdMuBiR56squRBdtyNXoN47zAdrT5CdVxJ2EjEtLp3khUsJgCJWyyU2mbSATc7HbS5uwNDywYSkyyU3eJ6KZRo1JCq7yHSQb4RVZ4NSeCTPF4iJxH1mKy7p7BMqMYhxJpUGzgd3zkubcd1djU1KsjrZPemTs8sp4BnYvH5uRmxADNVHNN9E9ZmGAHRw5UYLyK7t5v93je8VAXnQh7m9vJNgrEBbHBtyZ5shoH4Z7b35hfrPGesdLPoiYibmjtBuGGaXgTAfx8t6ZfwrhaVL3GBTcW2xpKsFzM2ZFu4CWEqyvh4hrZnYbSfiGvX4MURsrHRsbfiiudPynqbSnFXyHaBB3XKhnpuKCkEtUQheLTFQnbjdWuozUYNZAnbggxHnZLqpPtXVUjdtm25wpEo6DUXvRFKNbe9bhcXkn6WotQeUp9NSuyV77cfCeKf28suudPVdnM7emShWNfSptTMpLQBnaABnquxKThiaooV9qAwfQoj6yEuhAR6BriEUsbYqoQqhVZgZGrUhPUQr4A32wT3A8fMWGw1X2BAUuoKkMrXsqFxg9yB3iHLS5QGB9Powx7ZaJob1u6CzbzDn4zs3NTvNQzvunktoPsw9UVj1SkdrLK7doPU7kmM6S8VaT14yM4mubSXENsUJrJ4KjKCNzxmw4xb1BMCwySP9PuD1LNz1N8yBU6gX1o69queS98Fszv2Kpumwrp3qvZgyJv9krA5yyuyXctHoQ8kteHVWuMet7TLzH5j15226jFU8Gi5hkCYfcP8REYVz9RbmR2F67w3rapkdeP3K4eq2MmWpHLAKZCCP9uUeoTiAfS7f2JajcjAFexbZcpURsU3A9ipFhau7jvN4a9Y29WxpSSfvb9Jfwa4ZoyrrLT1um4GafLstfwVhJpmTADJePBJ4SUokNHJyjFgDeV5FnCuwNus5PzXdGmZfviuGnH79LExLbGVXJ6v2u6H2KnQFghAYPm1joKebkSm629B2QXTEMjSnKeBCjtHXushgtTPaKBaNuKJW39rStwaPpySt3A2xdqeb8sWXgJFKFDs5aFq1CuVMdWB2i7EAStY3ycjvG4C8yd6pxEuW5NNr5L7bTaRwc9gvNMaJvdePeZvmXsCXaUMnF54KNuzBMynQDGQCkCrV5bYS57j9Lt53sL93vuhQozA27pAAVwb9UbBcZXzuxdMVp8NTavSQckkaAAH4jspLkX2QRPSXA2RFuX5YbeSGsFMtKxmxFncHNUsfspJA5QPzUTEo8pDapU4tst9rzXQQBi5zUvdcZ2G71G7cW1sAgPD8NTE6cMBJ6SQbms19z12aSRnrkB7CxxbtUEbNuaYBEvWRNNgCFN3KNPCSGM2Yp6SYYUquwFhAeHmyfeEytoQrAabB1NXSZY8TvdMi4cNkXrUqzxna6LVXVWHAzjUrWu1PioAK5b9DLfHtBM7FKVVFVNSTS9FjAGS43xeMxq9FSQASXqty92kUMHDey4sRasVHgQFRp9kMEBNx3qCypexkgDD8gFAennsF3wW6FcFQhenhygAhZGz4TWBUtvJnSYZFVqoNdzigZSwoZNRJotzrqxV18yUUkv4KFCiHBsQka2MSB7dNfnTMSnD7W9kRH8uYEp3J9NjWS3aXZiBsYTeEfGw2HL4uk6SeWNbArwDHDDRrMZHaC4uNFpvodc3JbyMpo7LE3tZ275xr82pjhFAoU5LP4A8G98ifxgr2ojzhs84wwGGNRuHQQdd7h9iWwevWHnrwuw5x4bfAEwJgXBhEzxpJGgxGfKWMRWCuzyYrm6KN7ThGprvpYye5cyn8FzMAGQP9LcFVffifg9Ua8PFnX7oRfH1BuSMPmKC4Zo93F9GeiK5Nr89Szjg3BrddyCBjJbA6JCUcAkctUXoYAm1MGmJzpuUMWPbo3Kd2HDaUuMYUeeK9sZGmznexnhhQcYeFPZjLGZ9GpMFCFAaNfQXCcmxRV5i34LbxT9hEkBZnjRYQWCZLp7Qx4bgha5T8LBBrLztv2tC1J9TuTYN8q6QJX5SsC39eFnV6tBBfoo9tDxtcNm2atGWWM2eFUwoDhAz1TpjfH6yFo14nyxMQKFVgPDEDWX7g8u2L5BieF9NhazyixCwgsJNUEGAKedQsR6spyZAU7QbfcxF88izRJgaWH2tAvkJ7zkBjkoLkhGWcJzjoR1sabxriUt3KFn7NNJfUhZ3FVn3EY2PeM15RVD7ng1nih79DAneG1sLAbcPesHdmJVxCCndt8x8MH3J6My8pYR5xCAz6JL1d6AJrXAn14q4zvQbLNTxFSi8KVCX6wWLqNYeGHeCuMJFDNfXaJqUiUkxM4tJERxYZqHAtcXvfax26ZWe8FniXAxGfvTZQUh1JX6UTk6rnkVpiDe294Bx8HGYK4CiprQB5TXQ53FAu8RbgYsZPBNv9q2rHxnQ2MBwJY9yRuHvn4rQb3Nfmyei2zoAiLcYwNyJ22aS9buxYE6PX22ZJLomBvnJFrs9AxY4zaxSLrssDYuDPJB2JfEivPBU3nsT8H3G3ii79tF5m9CSz3RjA1Z3nc9DMmHhScbvK8scv7d7o43MfFhK1cvrk6fY5FzgPnzftyiS4tvGCfkZp3PzXrwf56sdUsQUZA9ucT3rBEbFh1YUtLwqFeE8ZgWsx1992wHc65DxvLqB3ZQLywikfkSwmYeYbUZLChccVc3WYFD82WYJJc5s77cdZSpvqjePjsVqti8vz23yM5epHDi3utrfD73Se75jTP19Trvpi2fmMEY15528EsAWFNMhtCN2Fgp71KR1wA5MorZmLw2ZTt2Nxf9M5i1fFrBtX7VxMYjUqkj4NoXF4SMn1G254DWqeP9P4oA83zRVQHxdHKduvZFxa3rztcidxmJmNampu4MeSNJVCK6ZgYbkkJjLotG9ELpf8zEtwfpx6CLsBeuRAiq5xYWETCLj3aHBMPsEEgp5b3PwMPqXn3rLCqzTbQBsWB19KBU4sFEf7kg5DaSHFUevDNcQJbtnCEupucLZ9b1bSQjziwZsMXNCX13nzUxZFtnFZjS1tRpf5esLJujwseB1wYpbJcGcTXFLpcCpsKNgrWp8VymidvTJ9mjmqkQGB4GQmczLme3gbA31KPVwChtow9JNrZcy3rWZadFCFpcSocAgTNsavkVrgFgxTqFScFfn72n88r3eq4m5V2Zqz3ySekwPy5vsDHZ2CptGAmKzqvbwhGVnM2reYw7Np2upB45fcCHH2uZg4XWcnddcH7mt4heTeuWDEm3zZ934gWb8LuZJGxxKAdYJkmDnrURdMk9rFCd7oezNsmjCgdkyAQyoTrJwLeJ6YMqTgnuTBPnUve9bx1QHheE2TupceVLmVTArhRAzAEcFEesxLyDMm5rNj6WF5wnizwZ8c56oN2pR6cNhtVPWbLUV2TvAK1bEdFFjsMXjsRkUiEN9u2VKx4cg1W19nnjD6rMgyS9BEXaNFo6NzaaPTKowY6rropbNtJwmsJxNqg9y6eJwxme8Y5bJR882pvrHwipTdKRnH7n9FtmKd1AbXRPcwjb73ET7oJNKcqBUGrgUVfDGYfv9fpFbQaZVr6obqDeY7DFHHkDUbe6BmYCR1SnxsBgov5yHsHxze7FQySH9DXV9p649kS3WLJeD3gGKnjHpe33m8JGUeRaJDw6KTpzvjGun7DD5FbZiGUxtCHJCbxma9Ymig9AvgrDNtMRdsVqCaR1kqsytRJSme6AhKDSvJxG8Ss2z725nuWvvLSfUdcnPpF6ZUdhEN9e2ENSshq4QZSKjc5W6unSHv9K7HZ8G9K8weuj8VphzKE7jdTJUi5BKUqEWyGqgfgDC7tCmjKD5YNgRAs1eQKiy4yNrdU4pQ5Yem6KQi3KnWUkvHt72akZqg3srdYzAg1yuWJbozCY4aE4PG5bEHXQQvrFR12hAJhmcvvqA79NvHRotWAoTcMyH3E9wUbEdQyCayet9QtDHoVq6xhDnHt4A8rvc9W2xHHvKUmPzz4TEPgskpwu44QcpP1B8w9ye8Q8ibKP45x4jk9jgbncttrrjaehALoLNLacRqk8D7QUy42KcPiwCsdKNtJJsjYCL2oKmKjCMADT7Y3bx2grwwrScpJ5ctsZn38to4AigPvaff5e9j91E1ev1pxX3JLFzgAc6QThMqnZSaNGqB4FChLTK5TZv5owf8H9rNeSZp6UqcT93svwaN6dsLnDt71uAGi34G8dXw96nT6qHMMSsrJBAdVnSfgrp'
  );

  constructor(ctrtId, chain) {
    super(ctrtId, chain);
    this._baseTokId = undefined;
    this._targetTokId = undefined;
    this._optionTokId = undefined;
    this._proofTokId = undefined;

    this._baseTokCtrt = undefined;
    this._targetCtrt = undefined;
    this._proofCtrt = undefined;
    this._optionCtrt = undefined;

    this._executeTime = undefined;
    this._executeDeadline = undefined;
    this._maxIssueNumber = undefined;
    this._price = undefined;
    this._priceUnit = undefined;
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
   * getBaseTokId queries & returns the base token id of the contract.
   * @returns {md.TokenID} The base token id of the contract.
   */
  async getBaseTokId() {
    if (!this._baseTokId) {
      const rawVal = await this.queryDbKey(DBKey.forBaseTokId());
      this._baseTokId = new md.TokenID(rawVal);
    }
    return this._baseTokId;
  }

  /**
   * getTargetTokId queries & returns the target token id of the contract.
   * @returns {md.TokenID} The target token id of the contract.
   */
  async getTargetTokId() {
    if (!this._targetTokId) {
      const rawVal = await this.queryDbKey(DBKey.forTargetTokId());
      this._targetTokId = new md.TokenID(rawVal);
    }
    return this._targetTokId;
  }

  /**
   * getOptionTokId queries & returns the option token id of the contract.
   * @returns {md.TokenID} The option token id of the contract.
   */
  async getOptionTokId() {
    if (!this._optionTokId) {
      const rawVal = await this.queryDbKey(DBKey.forOptionTokId());
      this._optionTokId = new md.TokenID(rawVal);
    }
    return this._optionTokId;
  }

  /**
   * getProofTokId queries & returns the proof token id of the contract.
   * @returns {md.TokenID} The proof token id of the contract.
   */
  async getProofTokId() {
    if (!this._proofTokId) {
      const rawVal = await this.queryDbKey(DBKey.forProofTokId());
      this._proofTokId = new md.TokenID(rawVal);
    }
    return this._proofTokId;
  }

  /**
   * getBaseTokCtrt queries & returns the instance of base token contract.
   * @returns {ctrt.BaseTokCtrt} The instance of base token contract.
   */
  async getBaseTokCtrt() {
    if (!this._baseTokCtrt) {
      const baseTokId = await this.getBaseTokId();
      this._baseTokCtrt = await tcf.fromTokId(baseTokId, this.chain);
    }
    return this._baseTokCtrt;
  }

  /**
   * getTargetTokCtrt queries & returns the instance of target token contract.
   * @returns {ctrt.BaseTokCtrt} The instance of target token contract.
   */
  async getTargetTokCtrt() {
    if (!this._targetTokCtrt) {
      const targetTokId = await this.getTargetTokId();
      this._targetTokCtrt = await tcf.fromTokId(targetTokId, this.chain);
    }
    return this._targetTokCtrt;
  }

  /**
   * getOptionTokCtrt queries & returns the instance of option token contract.
   * @returns {ctrt.BaseTokCtrt} The instance of option token contract.
   */
  async getOptionTokCtrt() {
    if (!this._optionTokCtrt) {
      const optionTokId = await this.getOptionTokId();
      this._optionTokCtrt = await tcf.fromTokId(optionTokId, this.chain);
    }
    return this._optionTokCtrt;
  }

  /**
   * getProofTokCtrt queries & returns the instance of proof token contract.
   * @returns {ctrt.BaseTokCtrt} The instance of proof token contract.
   */
  async getProofTokCtrt() {
    if (!this._proofTokCtrt) {
      const proofTokId = await this.getProofTokId();
      this._proofTokCtrt = await tcf.fromTokId(proofTokId, this.chain);
    }
    return this._proofTokCtrt;
  }

  /**
   * getBaseTokUnit queries & returns the base token's unit.
   * @returns {number} The unit of base token.
   */
  async getBaseTokUnit() {
    const tc = await this.getBaseTokCtrt();
    return await tc.getUnit();
  }

  /**
   * getTargetTokUnit queries & returns the target token's unit.
   * @returns {number} The unit of target token.
   */
  async getTargetTokUnit() {
    const tc = await this.getTargetTokCtrt();
    return await tc.getUnit();
  }

  /**
   * getOptionTokUnit queries & returns the option token's unit.
   * @returns {number} The unit of option token.
   */
  async getOptionTokUnit() {
    const tc = await this.getOptionTokCtrt();
    return await tc.getUnit();
  }

  /**
   * getProofTokUnit queries & returns the proof token's unit.
   * @returns {number} The unit of proof token.
   */
  async getProofTokUnit() {
    const tc = await this.getProofTokCtrt();
    return await tc.getUnit();
  }

  /**
   * getExeTime queries & returns the execute time.
   * @returns {md.VSYSTimestamp} The execute time.
   */
  async getExeTime() {
    if (!this._exeTime) {
      const time = await this.queryDbKey(DBKey.forExecuteTime());
      this._exeTime = md.VSYSTimestamp.fromNumber(time);
    }
    return this._exeTime;
  }

  /**
   * getExeDeadline queries & returns the execute deadline.
   * @returns {md.VSYSTimestamp} The execute deadline.
   */
  async getExeDeadline() {
    if (!this._executeDeadline) {
      const time = await this.queryDbKey(DBKey.forExecuteDeadline());
      this._executeDeadline = md.VSYSTimestamp.fromNumber(time);
    }
    return this._executeDeadline;
  }

  /**
   * getOptionStatus queries & returns the option contract's status.
   * @returns {boolean} The option contract's status.
   */
  async getOptionStatus() {
    const rawVal = await this.queryDbKey(DBKey.forOptionStatus());
    return rawVal === true;
  }

  /**
   * getMaxIssueNum queries & returns the maximum issue of the option tokens.
   * @returns {md.Token} The maximum issue of the option tokens.
   */
  async getMaxIssueNum() {
    if (!this._maxIssueNumber) {
      const rawVal = await this.queryDbKey(DBKey.forMaxIssueNum());
      this._maxIssueNumber = md.Token.forAmount(
        rawVal,
        await this.getBaseTokUnit()
      );
    }
    return this._maxIssueNumber;
  }

  /**
   * getReversedOption queries & returns the reserved option tokens remaining in the pool.
   * @returns {md.Token} The reserved option tokens remaining in the pool.
   */
  async getReversedOption() {
    const rawVal = await this.queryDbKey(DBKey.forReversedOption());
    return md.Token.forAmount(rawVal, await this.getOptionTokUnit());
  }

  /**
   * getReversedProof queries & returns the reserved proof tokens remaining in the pool.
   * @returns {md.Token} The reserved proof tokens remaining in the pool.
   */
  async getReversedProof() {
    const rawVal = await this.queryDbKey(DBKey.forReversedProof());
    return md.Token.forAmount(rawVal, await this.getProofTokUnit());
  }

  /**
   * getPrice queries & returns the price of the contract creator.
   * @returns {md.Token} The price of the contract creator.
   */
  async getPrice() {
    if (!this._price) {
      const rawVal = await this.queryDbKey(DBKey.forPrice());
      this._price = md.Token.fromNumber(rawVal, 1);
    }
    return this._price;
  }

  /**
   * getPriceUnit queries & returns the price unit of the contract creator.
   * @returns {md.Token} The price unit of the contract creator.
   */
  async getPriceUnit() {
    if (!this._priceUnit) {
      const rawVal = await this.queryDbKey(DBKey.forPriceUnit());
      this._priceUnit = md.Token.fromNumber(rawVal, 1);
    }
    return this._priceUnit;
  }

  /**
   * getTokenLocked queries & returns the locked token amount.
   * @returns {md.Token} the locked token amount.
   */
  async getTokenLocked() {
    const rawVal = await this.queryDbKey(DBKey.forTokenLocked());
    return md.Token.forAmount(rawVal, await this.getTargetTokUnit());
  }

  /**
   * getTokenCollected queries & returns the amount of the base tokens in the pool.
   * @returns {md.Token} The amount of the base tokens in the pool.
   */
  async getTokenCollected() {
    const rawVal = await this.queryDbKey(DBKey.forTokenCollect());
    return md.Token.forAmount(rawVal, await this.getBaseTokUnit());
  }

  /**
   * getBaseTokBal queries & returns the balance of base token stored within the contract belonging to the given user address.
   * @param {string} addr - The account address that deposits the token.
   * @returns {md.Token} The balance of base token stored within the contract belonging to the given address.
   */
  async getBaseTokBal(addr) {
    const rawVal = await this.queryDbKey(DBKey.forBaseTokBal(addr));
    const unit = await this.getBaseTokUnit();
    return md.Token.fromNumber(rawVal, unit);
  }

  /**
   * getTargetTokBal queries & returns the balance of target token stored within the contract belonging to the given user address.
   * @param {string} addr - The account address that deposits the token.
   * @returns {md.Token} The balance of target token stored within the contract belonging to the given address.
   */
  async getTargetTokBal(addr) {
    const rawVal = await this.queryDbKey(DBKey.forTargetTokBal(addr));
    const unit = await this.getTargetTokUnit();
    return md.Token.fromNumber(rawVal, unit);
  }

  /**
   * getOptionTokBal queries & returns the balance of option token stored within the contract belonging to the given user address.
   * @param {string} addr - The account address that deposits the token.
   * @returns {md.Token} The balance of option token stored within the contract belonging to the given address.
   */
  async getOptionTokBal(addr) {
    const rawVal = await this.queryDbKey(DBKey.forOptionTokBal(addr));
    const unit = await this.getOptionTokUnit();
    return md.Token.fromNumber(rawVal, unit);
  }

  /**
   * getProofTokBal queries & returns the balance of proof token stored within the contract belonging to the given user address.
   * @param {string} addr - The account address that deposits the token.
   * @returns {md.Token} The balance of proof token stored within the contract belonging to the given address.
   */
  async getProofTokBal(addr) {
    const rawVal = await this.queryDbKey(DBKey.forProofTokBal(addr));
    const unit = await this.getProofTokUnit();
    return md.Token.fromNumber(rawVal, unit);
  }

  /**
   * register registers a V Option Contract.
   * @param {acnt.Account | msacnt.MultiSignAccount} by - The action taker.
   * @param {string} baseTokId - The base token's id.
   * @param {string} targetTokId - The target token's id.
   * @param {string} optionTokId - The option token's id.
   * @param {string} proofTokId - The proof token's id.
   * @param {number} executeTime - The execute time.
   * @param {number} executeDeadline - The execute deadline.
   * @param {string} ctrtDescription - The description of the contract. Defaults to ''.
   * @param {number} fee - The fee to pay for this action. Defaults to md.RegCtrtFee.DEFAULT.
   * @returns {VSwapCtrt} - The VSwapCtrt object of the registered V Swap Contract.
   */
  static async register(
    by,
    baseTokId,
    targetTokId,
    optionTokId,
    proofTokId,
    executeTime,
    executeDeadline,
    ctrtDescription = '',
    fee = md.RegCtrtFee.DEFAULT
  ) {
    const data = await by.registerContractImpl(
      new tx.RegCtrtTxReq(
        new de.DataStack(
          de.TokenID.fromStr(baseTokId),
          de.TokenID.fromStr(targetTokId),
          de.TokenID.fromStr(optionTokId),
          de.TokenID.fromStr(proofTokId),
          new de.Timestamp(md.VSYSTimestamp.fromUnixTs(executeTime)),
          new de.Timestamp(md.VSYSTimestamp.fromUnixTs(executeDeadline))
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
   * activate activates the V Option contract to store option token and proof token into the pool.
   * @param {acnt.Account | msacnt.MultiSignAccount} by - The action taker.
   * @param {number} maxIssueNum - The number of the maximum issue of the option tokens.
   * @param {number} price - The price of the creator of the V Option contract.
   * @param {number} priceUnit - The price unit of the creator of the V Option contract.
   * @param {string} attachment - The attachment of the action. Defaults to ''.
   * @param {number} fee - The fee to pay for this action. Defaults to md.ExecCtrtFee.DEFAULT.
   * @returns {object} The response returned by the Node API.
   */
  async activate(
    by,
    maxIssueNum,
    price,
    priceUnit,
    attachment = '',
    fee = md.ExecCtrtFee.DEFAULT
  ) {
    const data = await by.executeContractImpl(
      new tx.ExecCtrtFuncTxReq(
        this.ctrtId,
        FuncIdx.ACTIVATE,
        new de.DataStack(
          de.Amount.forTokAmount(maxIssueNum, await this.getOptionTokUnit()),
          de.Amount.forTokAmount(price, await this.getOptionTokUnit()),
          de.Amount.forTokAmount(priceUnit, await this.getOptionTokUnit())
        ),
        md.VSYSTimestamp.now(),
        new md.Str(attachment),
        md.ExecCtrtFee.fromNumber(fee)
      )
    );
    return data;
  }

  /**
   * mint locks target tokens into the pool to get option tokens and proof tokens.
   * @param {acnt.Account | msacnt.MultiSignAccount} by - The action taker.
   * @param {number} amount - The mint amount.
   * @param {string} attachment - The attachment of the action. Defaults to ''.
   * @param {number} fee - The fee to pay for this action. Defaults to md.ExecCtrtFee.DEFAULT.
   * @returns {object} The response returned by the Node API.
   */
  async mint(by, amount, attachment = '', fee = md.ExecCtrtFee.DEFAULT) {
    const data = await by.executeContractImpl(
      new tx.ExecCtrtFuncTxReq(
        this.ctrtId,
        FuncIdx.MINT,
        new de.DataStack(
          de.Amount.forTokAmount(amount, await this.getTargetTokUnit())
        ),
        md.VSYSTimestamp.now(),
        new md.Str(attachment),
        md.ExecCtrtFee.fromNumber(fee)
      )
    );
    return data;
  }

  /**
   * unlock gets the remaining option tokens and proof tokens from the pool before the execute time.
   * @param {acnt.Account | msacnt.MultiSignAccount} by - The action taker.
   * @param {number} amount - The amount.
   * @param {string} attachment - The attachment of the action. Defaults to ''.
   * @param {number} fee - The fee to pay for this action. Defaults to md.ExecCtrtFee.DEFAULT.
   * @returns {object} The response returned by the Node API.
   */
  async unlock(by, amount, attachment = '', fee = md.ExecCtrtFee.DEFAULT) {
    const data = await by.executeContractImpl(
      new tx.ExecCtrtFuncTxReq(
        this.ctrtId,
        FuncIdx.UNLOCK,
        new de.DataStack(
          de.Amount.forTokAmount(amount, await this.getTargetTokUnit())
        ),
        md.VSYSTimestamp.now(),
        new md.Str(attachment),
        md.ExecCtrtFee.fromNumber(fee)
      )
    );
    return data;
  }

  /**
   * execute executes the V Option contract to get target token after execute time.
   * @param {acnt.Account | msacnt.MultiSignAccount} by - The action taker.
   * @param {number} amount - The amount.
   * @param {string} attachment - The attachment of the action. Defaults to ''.
   * @param {number} fee - The fee to pay for this action. Defaults to md.ExecCtrtFee.DEFAULT.
   * @returns {object} The response returned by the Node API.
   */
  async execute(by, amount, attachment = '', fee = md.ExecCtrtFee.DEFAULT) {
    const data = await by.executeContractImpl(
      new tx.ExecCtrtFuncTxReq(
        this.ctrtId,
        FuncIdx.EXECUTE,
        new de.DataStack(
          de.Amount.forTokAmount(amount, await this.getTargetTokUnit())
        ),
        md.VSYSTimestamp.now(),
        new md.Str(attachment),
        md.ExecCtrtFee.fromNumber(fee)
      )
    );
    return data;
  }

  /**
   * collect collects the base tokens or/and target tokens from the pool depending on the amount of proof tokens after execute deadline.
   * @param {acnt.Account | msacnt.MultiSignAccount} by - The action taker.
   * @param {number} amount - The amount.
   * @param {string} attachment - The attachment of the action. Defaults to ''.
   * @param {number} fee - The fee to pay for this action. Defaults to md.ExecCtrtFee.DEFAULT.
   * @returns {object} The response returned by the Node API.
   */
  async collect(by, amount, attachment = '', fee = md.ExecCtrtFee.DEFAULT) {
    const data = await by.executeContractImpl(
      new tx.ExecCtrtFuncTxReq(
        this.ctrtId,
        FuncIdx.COLLECT,
        new de.DataStack(
          de.Amount.forTokAmount(amount, await this.getOptionTokUnit())
        ),
        md.VSYSTimestamp.now(),
        new md.Str(attachment),
        md.ExecCtrtFee.fromNumber(fee)
      )
    );
    return data;
  }
}
