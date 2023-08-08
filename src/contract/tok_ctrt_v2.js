/**
 * module contract/tokCtrtV2 provides functionalities for Token contract V2.
 * @module contract/tokCtrtV2
 */
'use strict';

import * as ctrt from './ctrt.js';
import * as acnt from '../account.js';
import * as md from '../model.js';
import * as tx from '../tx_req.js';
import * as de from '../data_entry.js';
import * as tcns from './tok_ctrt_no_split.js';
import * as msacnt from '../multisign_account.js';

/** FuncIdx is the class for function indexes */
export class FuncIdx extends ctrt.FuncIdx {
  static elems = {
    SUPERSEDE: 0,
    ISSUE: 1,
    DESTROY: 2,
    UPDATE_LIST: 3,
    SEND: 4,
    TRANSFER: 5,
    DEPOSIT: 6,
    WITHDRAW: 7,
    TOTAL_SUPPLY: 8,
    MAX_SUPPLY: 9,
    BALANCE_OF: 10,
    GET_ISSUER: 11,
  };
  static _ = this.createElems();
}

/** StateVar is the class for state variables */
export class StateVar extends ctrt.StateVar {
  static elems = {
    ISSUER: 0,
    MAKER: 1,
    REGULATOR: 2,
  };
  static _ = this.createElems();
}

/** StateMapIdx is the class for state map indexes */
export class StateMapIdx extends ctrt.StateMapIdx {
  static elems = {
    IS_IN_LIST: 0,
  };
  static _ = this.createElems();
}

/** DBKey is the class for DB key */
export class DBKey extends tcns.DBKey {
  /**
   * forRegulator returns the DBKey object for querying the regulator.
   * @returns {DBKey} The DBKey object.
   */
  static forRegulator() {
    return new this(StateVar.REGULATOR.serialize());
  }

  /**
   * forIsInListImpl returns the DBKey object for querying the status of if the
   * address in the given data entry is in the list.
   * It is a helper method for method isXXXInList
   * @param {(de.Addr|de.CtrtAcnt)} addrDataEntry - The data entry for the address.
   * @returns {DBKey} The DBKey object.
   */
  static forIsInListImpl(addrDataEntry) {
    const stmp = new ctrt.StateMap(StateMapIdx.IS_IN_LIST, addrDataEntry);
    return new this(stmp.serialize());
  }

  /**
   * forIsUserInList returns the DBKey for querying the status of if the given
   * user address is in the list.
   * @param {string} addr - The user address.
   * @returns {DBKey} The DBKey object.
   */
  static forIsUserInList(addr) {
    return this.forIsInListImpl(de.Addr.fromStr(addr));
  }

  /**
   * forIsCtrtInList returns the DBKey for querying the status of if the given
   * contract ID is in the list.
   * @param {string} ctrtID - The contract ID.
   * @returns {DBKey} The DBKey object.
   */
  static forIsCtrtInList(ctrtID) {
    return this.forIsInListImpl(de.CtrtAcnt.fromStr(ctrtID));
  }
}

/** TokCtrtV2Whitelist is the class for Token Contract V2 with whitelist */
export class TokCtrtV2Whitelist extends tcns.TokCtrtWithoutSplit {
  static CTRT_META = md.CtrtMeta.fromB58Str(
    '7BekqFZ2yZqjiQFFnsxL4CDRFWCjHdZvFXQd6sxAgEktxwn5kkR6vkV27SFC7VmhuMysVfunZWTtHAqPjg4gGz72pha6TMUerSUSXSn7BHaVexyQJoUfqDT5bdr3XVpok1mU2gT29mwtJ6BibizpAEgZZncZauDnvqrWWdkCmRP8VXpPBiPEaUZuq9eRusrUcc5YHshhN6BVkArN84tarVQH3pTRmiekdQveuxFw4r4weXUxwEGCkYX3Zqeqc4mmRsajVCQwV5DuGTEwaBVWiAAfHLGPFgJF6w6aP3d22tdBRLqZ2Y4G5WHdhMunNDEZ2E79w7gbwqDXtz3eVfGtyET5NZEJGmM2S8pZSn2MPjvfPAYZMa9Zd4WXnPLZng1pxjYvrpqPDy27VQu1rhvxXMNPVMdP9QyCQSoExZUot1FmskS1NcmzKfguwsSWR1Z1py58iVDKm8t7x7RnaP7avcjtvixJQkPGg7qaxBKfRQ26vFePWeNdkbJwQJvqComvjEg3hEYjQrysk3j3M9QWEgXQzRqTPTFEVCTJSbdpL2GyYXYC4cLcB81UzJuWf2zoERNPdfpHwumoaaaSutfg7dccbWRaqogrBf6u9PfANQm9TsFca37UHhxvsq8WZdu71NQCY1V7w9NKKLbHF7MjjyCs6w2TM4Ej9Tyj8hFR4qo3MosgSbmQt298aEB3qQHVF8FshVwGg2vqAK7PNBHE7KgBgXQJiVRc4X1XZvWQt4uASvMowRECURoMZ17z2s3LnDrQYVqYedfzjJXxwsWXQkoQp51WWkFfp7QStBtfEhdUx15wtD8sjDdNrda8n3P6sNrN8J7NXxH4JPE7DzLLCjPSbn5Yc2jzomULSRiQN2yzC5qE43XiHB89VFqTHTduCFbP3Pom3uc5iBgjW9ky8LyPBMcsqQZSv99adjgbKpeaGPtJN6iUQ9mae1ddw6SBKTxZVZvqK6k7dJBjJ5UsFDyXLWkm8jogkRCFBfXPxmxyB5ihqk2wnsWNEbKEz6sg6RJqy5SR9A8r3QEx8FZt5z4DJpHyUAoi6KKVHEJfRvdjtjSDrayG2WUrBCgTTHsyGZEnuXLRXpy7XmdzFSwKSr4p7NPbAqt44yHdgjycn2MY5X1P9rneBdh4LukH3syRAarjmTSZr67QexRE4cca5fnxUZJ2zYNWRynqWmZy6aCBLBQziP81bHHbN5WP9MMseovCvzTpMso9TB3QLSRkCphJpyvv9qLN4tpFB9r9g3UGhTqqJFvxJDcLwR485AqLymM91kMjTvodniJ4coymUeE3MjGf2P67z4UiBDBxnzWbkCzmaPpkWFY9125hg9SovQrJnn9zzpF5smp7oiHhjrkzyi2G4qWVidtaWi6TipZFXwb8z6TSSjZkaj4SWexgnE2bUKeJS9P1xYwVSX39At735bqhfKCNP29n7UzX7bMwQiTWWK8bCiCpYSXfcfUpxtbYXdHgGMEZzpzawS9H5UeFiw31rS5Caps7QQJmMeetAuDa8tsiMJ9QauABLfJ4G6Hjkn5GM9jH9yXJWj2boH1U4ErVQXbr9KvmSsSsLeLLc3XeKQaczMtLroQax4D5estuP3Cy1gfqhbTsEWL2HkF7dUKDnuLmzsjv3kZXF9PMhcVR1Qj9j8KaYWYqKYV5TxXkrPrzSVa1yYEjU71A6ZYW327vgFJYFUJmx9vqTGym3yRiSoJiaYVfgf8iLwqS1EKSTMiisxE8hCHfKiew4YmiCTxPkq7pc5tHrKkogoRX7GdDnX93BsxGACu9nEbXwDZERLFLexrnRKpWDjqR2Z6CLWhXNPDJYMcUQ5rfGAhgu4ZK16q1'
  );

  FUNC_IDX_CLS = FuncIdx;

  /**
   * getRegulator queries & returns the regulator of the contract.
   * @returns {md.Addr} The regulator of the contract.
   */
  async getRegulator() {
    const rawVal = await this.queryDbKey(DBKey.forRegulator());
    return new md.Addr(rawVal);
  }

  /**
   * isInListImpl queries & returns the status of whether the address is in
   * the list for the given DB key.
   * @param {DBKey} dbKey - The DB key for the query.
   * @returns {boolean} If the address is in the list.
   */
  async isInListImpl(dbKey) {
    const data = await this.queryDbKey(dbKey);
    return data === 'true';
  }

  /**
   * isUserInList queries & returns the status of whether the user address is in the list.
   * @param {string} addr - The user address.
   * @returns {boolean} If the address is in the list.
   */
  async isUserInList(addr) {
    return await this.isInListImpl(DBKey.forIsUserInList(addr));
  }

  /**
   * isCtrtInList queries & returns the status of whether the contract id is in the list.
   * @param {string} ctrtID - The contract address.
   * @returns {boolean} If the address is in the list.
   */
  async isCtrtInList(ctrtID) {
    return await this.isInListImpl(DBKey.forIsCtrtInList(ctrtID));
  }

  /**
   * updateListImpl updates the presence of the address within the given data entry in the list.
        It's the helper method for updateList.
   * @param {acnt.Account | msacnt.MultiSignAccount} by - The action taker.
   * @param {(de.Addr|de.CtrtAcnt)} addrDataEntry - The data entry for the address to update.
   * @param {boolean} val - The value to update to.
   * @param {string} attachment - The attachment of the action. Defaults to ''.
   * @param {number} fee - The fee to pay for this action. Defaults to md.ExecCtrtFee.DEFAULT.
   * @returns {object} The response returned by the Node API.
   */
  async updateListImpl(
    by,
    addrDataEntry,
    val,
    attachment = '',
    fee = md.ExecCtrtFee.DEFAULT
  ) {
    const data = await by.executeContractImpl(
      new tx.ExecCtrtFuncTxReq(
        this.ctrtId,
        FuncIdx.UPDATE_LIST,
        new de.DataStack(addrDataEntry, new de.Bool(new md.Bool(val))),
        md.VSYSTimestamp.now(),
        new md.Str(attachment),
        md.ExecCtrtFee.fromNumber(fee)
      )
    );
    return data;
  }

  /**
   * updateListUser updates the presence of the user address in the list.
   * @param {acnt.Account | msacnt.MultiSignAccount} by - The action taker.
   * @param {string} addr - The account address of the user.
   * @param {boolean} val - The value to update to.
   * @param {string} attachment - The attachment of the action. Defaults to ''.
   * @param {number} fee - The fee to pay for this action. Defaults to md.ExecCtrtFee.DEFAULT.
   * @returns {object} The response returned by the Node API.
   */
  async updateListUser(
    by,
    addr,
    val,
    attachment = '',
    fee = md.ExecCtrtFee.DEFAULT
  ) {
    const userMd = new md.Addr(addr);
    userMd.mustOn(by.chain);
    return await this.updateListImpl(
      by,
      new de.Addr(userMd),
      val,
      attachment,
      fee
    );
  }

  /**
   * updateListCtrt updates the presence of the contract address in the list.
   * @param {acnt.Account | msacnt.MultiSignAccount} by - The action taker.
   * @param {string} addr - The account address of the user.
   * @param {boolean} val - The value to update to.
   * @param {string} attachment - The attachment of the action. Defaults to ''.
   * @param {number} fee - The fee to pay for this action. Defaults to md.ExecCtrtFee.DEFAULT.
   * @returns {object} The response returned by the Node API.
   */
  async updateListCtrt(
    by,
    addr,
    val,
    attachment = '',
    fee = md.ExecCtrtFee.DEFAULT
  ) {
    const ctrtMd = new md.CtrtID(addr);
    return await this.updateListImpl(
      by,
      new de.CtrtAcnt(ctrtMd),
      val,
      attachment,
      fee
    );
  }

  /**
   * supersede transfers the issuer role of the contract to a new account.
   * @param {acnt.Account | msacnt.MultiSignAccount} by - The action taker.
   * @param {string} newIssuer - The account address of the new issuer.
   * @param {string} newRegulator - The account address of the new regulator.
   * @param {string} attachment - The attachment of the action. Defaults to ''.
   * @param {number} fee - The fee to pay for this action. Defaults to md.ExecCtrtFee.DEFAULT.
   * @returns {object} The response returned by the Node API.
   */
  async supersede(
    by,
    newIssuer,
    newRegulator,
    attachment = '',
    fee = md.ExecCtrtFee.DEFAULT
  ) {
    const newIssuerMd = new md.Addr(newIssuer);
    newIssuerMd.mustOn(by.chain);

    const newRegulatorMd = new md.Addr(newRegulator);
    newRegulatorMd.mustOn(by.chain);

    const data = await by.executeContractImpl(
      new tx.ExecCtrtFuncTxReq(
        this.ctrtId,
        FuncIdx.SUPERSEDE,
        new de.DataStack(new de.Addr(newIssuerMd), new de.Addr(newRegulatorMd)),
        md.VSYSTimestamp.now(),
        new md.Str(attachment),
        md.ExecCtrtFee.fromNumber(fee)
      )
    );
    return data;
  }
}

export class TokCtrtV2Blacklist extends TokCtrtV2Whitelist {
  static CTRT_META = md.CtrtMeta.fromB58Str(
    '2wsw3fMnDpB5PpXoJxJeuE9RkRNzQqZrV35hBa366PhG9Sb3sPeBNeYQo8CuExtT8GpKuc84PLMsevNoodw7YGVf24PKstuzhM96H2gQoawx4BVNZwy3UFyWn156SyZakSvJPXz521p1nzactXZod1Qnn7BWYXFYCU3JFe1LGy35Sg6aXwKz6swFmBtPg1vBeQsUq1TJ5GXkDksaUYjB8ix9ScNNG8faB1mCCMWwfrcr6PyBA7YeHsTLD86zuviak6HQEQQi9kqVr4XhnDJnZyiTKGcNDo49KZyTyvkPmkFyDEhLf9DYrJM3niePqtDQ9unJj52Bku7f47hrxo83eSh3UPncyq8Hti2Ffhgb8ZFCFdnPyRDEZ1YbKFGAsJL3h3GdPFoVdnYySmnVJWrm6fVUdGgkA5ijMeqEUpXte1m7MFYCJ1wQchjebpLk3NnZzrT8FysUJVUgUzmkoSniF2UPEPXuF9cyWFWGGoZjfDWqarPMi7miqdCPQMMw4QRvSWkB3gVyeZykAvKYzXm8wYGV6HDbipZeVoyZ1UVeR6E5C4VZQmjs4GupAR9EuT5mt1ALFT4HyAMX6RCRxjeHoSgnnUJcEiRHapAYSene174RvVkRGLTtonWTYnsXUrtPD6xks4GdpQWQv89EdNWFEtmMfyVvUEFuTPGXUS5TuqYxCzg8Gor5WjPip2wDmoMYQ3wikJoRpYSfRVw88RHQPBmkHrpeHYWkAx6N7Yk4WwgBF9SVVtEWnWmPVVbuH2bQrvks4iGL8DnmEiLMs6JuFsg3a3cMHqbdvQgfu72XYKFqQzzDbDhaqFKpR3bxgMMiJvGbPuydPk9DCsG5KpqZepkkD6RGhWTQzga9G6y6ryctoGZPBHpFRwirALkksarQSEuGryhatvnjqG9U14zyW2KvJYrErMyUVy3wNK5wRqAKMjE6hFPdoH9Cn6TYQLebVTBoYTfimn5gBmgnKqBtXSfUxiwrjWujQPGxgtbNCL1RXRNRJ8nrtcpphQyRVZ8JVeubYq1zM7G1AUurEyAQi64rcbsimGptcXMAvt9TbwDjpUGRWvF6dyw1XijcukfZBQh1fG5C8peumkGnP8PemmYWKP7qsifNc44PqnNG5qYVivwtK4sz2h3B6pwneX8XNYtGSjVJCb6gJ7oDG45shocvALKNu7LwfJxXT7MPAdx7CjbHU5B3qs71wJphwkc4yWa6hHTamPTGRFGuhJa4kFfeGMctE1WZrFe47L32fKZkSxaX1sguoi5w9UPHw6udJiKPYENSSbASYpfS9q8suCs1bbq8jdMhCwoGMDZaA4MNAW1Q6sLSX6ezZ436AMbVnXZLQW8jdBaX8rvRSMJu8fdYU9PHq4MkoczxNz5jNvRiTX9jTpN1Z1P5rtgnf6XN9vzTLdqsvwZcXqvSdBwdTVgk7qn9uNjuFZEgSmA6rnPhSu6TMxJLmjKP93uqiNmXsj1NKtqBZiHjrRaUzA4pAFEyfZTdo8oaDH7umSBU2s9ff5Cruds7cYFopLm2KavHH33S7BczL7FMXAcqrESiPUzhUhHbkBKHGiCAUMVE8zxo6Eo85W2PGn6D39MaUfahEmzq8zxmrDQdmagx5EQZUev3fNCFzTzU4zpY1sra5ZPknXJkyKKfj4r9xy9Kfd8s5hsiKFyX6V1Kc2T1Ehpdkobwb7Wc8V1n1GaeL7jRgvhVg1inPaWZ3zyqNBjxnzqtLpZor3VdXLo6SikzWNahCMLNMXaoBvmJDEJUazC9qGxin7SC3YWCTAyoskJRhVMp592ehmpruu2azeCHBF2rzP6LabikVfkBSeAzGQKVeiEkU3devRNpjNM4YDXQDm9wbkPKWrqBK4SRdo44PRYG3XwNhu2gpNX8b9AuirrbRPiaJ1tJ7rzodHzLheMyUMXRB9nYx8JgrhkZzPZa4oUxo8JUNuKZnn7Ku7fEt5y'
  );
}
