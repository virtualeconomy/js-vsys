/**
 * module contract/nftCtrt provides functionalities for NFT contract.
 * @module contract/nftCtrt
 */

'use strict';

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
    ISSUE: 1,
    SEND: 2,
    TRANSFER: 3,
    DEPOSIT: 4,
    WITHDRAW: 5,
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

/** NFTCtrt is the class for NFT Contract V1 */
export class NFTCtrt extends ctrt.BaseTokCtrt {
  static CTRT_META = md.CtrtMeta.fromB58Str(
    'VJodouhmnHVDwtkBZ2NdgahT7NAgNE9EpWoZApzobhpua2nDL9D3sbHSoRRk8bEFeme2BHrXPdcq5VNJcPdGMUD54Smwatyx74cPJyet6bCWmLciHE2jGw9u5TmatjdpFSjGKegh76GvJstK3VaLagvsJJMaaKM9MNXYtgJyDr1Zw7U9PXV7N9TQnSsqz6EHMgDvd8aTDqEG7bxxAotkAgeh4KHqnk6Ga117q5AJctJcbUtD99iUgPmJrC8vzX85TEXgHRY1psW7D6daeExfVVrEPHFHrU6XfhegKv9vRbJBGL861U4Qg6HWbWxbuitgtKoBazSp7VofDtrZebq2NSpZoXCAZC8DRiaysanAqyCJZf7jJ8NfXtWej8L9vg8PVs65MrEmK8toadcyCA2UGzg6pQKrMKQEUahruBiS7zuo62eWwJBxUD1fQ1RGPk9BbMDk9FQQxXu3thSJPnKktq3aJhD9GNFpvyEAaWigp5nfjgH5doVTQk1PgoxeXRAWQNPztjNvZWv6iD85CoZqfCWdJbAXPrWvYW5FsRLW1xJ4ELRUfReMAjCGYuFWdA3CZyefpiDEWqVTe5SA6J6XeUppRyXKpKQTc6upesoAGZZ2NtFDryq22izC6D5p1i98YpC6Dk1qcKevaANKHH8TfFoQT717nrQEY2aLoWrA1ip2t5etdZjNVFmghxXEeCAGy3NcLDFHmAfcBZhHKeJHp8H8HbiMRtWe3wmwKX6mPx16ahnd3dMGCsxAZfjQcy4J1HpuCm7rHMULkixUFYRYqx85c7UpLcijLRybE1MLRjEZ5SEYtazNuiZBwq1KUcNipzrxta9Rpvt2j4WyMadxPf5r9YeAaJJp42PiC6SGfyjHjRQN4K3pohdQRbbG4HQ95NaWCy7CAwbpXRCh9NDMMQ2cmTfB3KFW2M'
  );

  FUNC_IDX_CLS = FuncIdx;

  /**
   * getIssuer queries & returns the issuer of the contract.
   * @returns {md.Addr} The issuer of the contract.
   */
  async getIssuer() {
    const rawVal = await this.queryDbKey(DBKey.forIssuer());
    return new md.Addr(rawVal);
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
   * getUnit queries & returns the unit of the contract.
   * This method exists to be compatible with fungible token contracts.
   * @returns {number} The unit of the contract.
   */
  async getUnit() {
    return 1;
  }

  /**
   * register registers an NFT Contract.
   * @param {acnt.Account | msacnt.MultiSignAccount} by - The action taker.
   * @param {string} ctrtDescription - The description of the contract. Defaults to ''.
   * @param {number} fee - The fee to pay for this action. Defaults to md.RegCtrtFee.DEFAULT.
   * @returns {NFTCtrt} The NFTCtrt object of the registered NFT Contract.
   */
  static async register(by, ctrtDescription, fee = md.RegCtrtFee.DEFAULT) {
    const data = await by.registerContractImpl(
      new tx.RegCtrtTxReq(
        new de.DataStack(),
        this.CTRT_META,
        md.VSYSTimestamp.now(),
        new md.Str(ctrtDescription),
        md.RegCtrtFee.fromNumber(fee)
      )
    );

    return new this(data['contractId'], by.chain);
  }

  /**
   * supersede transafers the issuer role of the contract to a new account.
   * @param {acnt.Account | msacnt.MultiSignAccount} by - The action taker.
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
        this.FUNC_IDX_CLS.SUPERSEDE,
        new de.DataStack(new de.Addr(newIssuerMd)),
        md.VSYSTimestamp.now(),
        new md.Str(attachment),
        md.ExecCtrtFee.fromNumber(fee)
      )
    );
    return data;
  }

  /**
   * issue issues a token of the NFT contract.
   * @param {acnt.Account | msacnt.MultiSignAccount} by - The action taker.
   * @param {string} tokDescription - The description of the token. Defaults to ''.
   * @param {string} attachment - The attachment of the action. Defaults to ''.
   * @param {number} fee - The fee to pay for this action. Defaults to md.ExecCtrtFee.DEFAULT.
   * @returns {object} The response returned by the Node API.
   */
  async issue(
    by,
    tokDescription = '',
    attachment = '',
    fee = md.ExecCtrtFee.DEFAULT
  ) {
    const data = await by.executeContractImpl(
      new tx.ExecCtrtFuncTxReq(
        this.ctrtId,
        this.FUNC_IDX_CLS.ISSUE,
        new de.DataStack(de.Str.fromStr(tokDescription)),
        md.VSYSTimestamp.now(),
        new md.Str(attachment),
        md.ExecCtrtFee.fromNumber(fee)
      )
    );
    return data;
  }

  /**
   * send sends the NFT token from the action taker to the recipient.
   * @param {acnt.Account | msacnt.MultiSignAccount} by - The action taker.
   * @param {string} recipient - The account address of the recipient.
   * @param {number} tokIdx - The index of the token within this contract to send.
   * @param {string} attachment - The attachment of the action. Defaults to ''.
   * @param {number} fee - The fee to pay for this action. Defaults to md.ExecCtrtFee.DEFAULT.
   * @returns {object} The response returned by the Node API.
   */
  async send(
    by,
    recipient,
    tokIdx,
    attachment = '',
    fee = md.ExecCtrtFee.DEFAULT
  ) {
    const rcptMd = new md.Addr(recipient);
    rcptMd.mustOn(by.chain);

    const data = await by.executeContractImpl(
      new tx.ExecCtrtFuncTxReq(
        this.ctrtId,
        this.FUNC_IDX_CLS.SEND,
        new de.DataStack(
          new de.Addr(rcptMd),
          new de.Int32(new md.TokenIdx(tokIdx))
        ),
        md.VSYSTimestamp.now(),
        new md.Str(attachment),
        md.ExecCtrtFee.fromNumber(fee)
      )
    );
    return data;
  }

  /**
   * transfer transfers the NFT token from the sender to the recipient.
   * @param {acnt.Account | msacnt.MultiSignAccount} by - The action taker.
   * @param {string} sender - The account address of the sender.
   * @param {string} recipient - The account address of the recipient.
   * @param {number} tokIdx - The index of the token within this contract to send.
   * @param {string} attachment - The attachment of the action. Defaults to ''.
   * @param {number} fee - The fee to pay for this action. Defaults to md.ExecCtrtFee.DEFAULT.
   * @returns {object} The response returned by the Node API.
   */
  async transfer(
    by,
    sender,
    recipient,
    tokIdx,
    attachment = '',
    fee = md.ExecCtrtFee.DEFAULT
  ) {
    const senderMd = new md.Addr(sender);
    senderMd.mustOn(this.chain);

    const rcptMd = new md.Addr(recipient);
    rcptMd.mustOn(this.chain);

    const data = await by.executeContractImpl(
      new tx.ExecCtrtFuncTxReq(
        this.ctrtId,
        this.FUNC_IDX_CLS.TRANSFER,
        new de.DataStack(
          new de.Addr(senderMd),
          new de.Addr(rcptMd),
          new de.Int32(new md.TokenIdx(tokIdx))
        ),
        md.VSYSTimestamp.now(),
        new md.Str(attachment),
        md.ExecCtrtFee.fromNumber(fee)
      )
    );
    return data;
  }

  /**
   * deposit deposits the NFT from the action taker to another token-holding contract.
   * @param {acnt.Account | msacnt.MultiSignAccount} by - The action taker.
   * @param {string} ctrtId - The contract ID.
   * @param {number} tokIdx - The index of the token within this contract to send.
   * @param {string} attachment - The attachment of the action. Defaults to ''.
   * @param {number} fee - The fee to pay for this action. Defaults to md.ExecCtrtFee.DEFAULT.
   * @returns {object} The response returned by the Node API.
   */
  async deposit(
    by,
    ctrtId,
    tokIdx,
    attachment = '',
    fee = md.ExecCtrtFee.DEFAULT
  ) {
    const data = await by.executeContractImpl(
      new tx.ExecCtrtFuncTxReq(
        this.ctrtId,
        this.FUNC_IDX_CLS.DEPOSIT,
        new de.DataStack(
          new de.Addr(by.addr),
          de.CtrtAcnt.fromStr(ctrtId),
          new de.Int32(new md.TokenIdx(tokIdx))
        ),
        md.VSYSTimestamp.now(),
        new md.Str(attachment),
        md.ExecCtrtFee.fromNumber(fee)
      )
    );
    return data;
  }

  /**
   * withdraw withdraws the NFT from a token-holding contract to the action taker.
   * @param {acnt.Account | msacnt.MultiSignAccount} by - The action taker.
   * @param {string} ctrtId - The contract ID.
   * @param {number} tokIdx - The index of the token within this contract to send.
   * @param {string} attachment - The attachment of the action. Defaults to ''.
   * @param {number} fee - The fee to pay for this action. Defaults to md.ExecCtrtFee.DEFAULT.
   * @returns {object} The response returned by the Node API.
   */
  async withdraw(
    by,
    ctrtId,
    tokIdx,
    attachment = '',
    fee = md.ExecCtrtFee.DEFAULT
  ) {
    const data = await by.executeContractImpl(
      new tx.ExecCtrtFuncTxReq(
        this.ctrtId,
        this.FUNC_IDX_CLS.WITHDRAW,
        new de.DataStack(
          de.CtrtAcnt.fromStr(ctrtId),
          new de.Addr(by.addr),
          new de.Int32(new md.TokenIdx(tokIdx))
        ),
        md.VSYSTimestamp.now(),
        new md.Str(attachment),
        md.ExecCtrtFee.fromNumber(fee)
      )
    );
    return data;
  }
}
