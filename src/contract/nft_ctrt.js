/**
 * NFT contract module provides functionalities for NFT contract.
 * @module contract/nft_ctrt
 */

'use strict';

import * as ctrt from './ctrt.js';
import * as acnt from '../account.js';
import * as md from '../model.js';
import * as tx from '../tx_req.js';
import * as de from '../data_entry.js';

class FuncIdx extends ctrt.FuncIdx {
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

class StateVar extends ctrt.StateVar {
  static elems = {
    ISSUER: 0,
    MAKER: 1,
  };
  static _ = this.createElems();
}

class DBKey extends ctrt.DBKey {
  static forIssuer() {
    return new this(StateVar.ISSUER.serialize());
  }

  static forMaker() {
    return new this(StateVar.MAKER.serialize());
  }
}

export class NFTCtrt extends ctrt.BaseTokCtrt {
  static CTRT_META = ctrt.CtrtMeta.fromB58Str(
    'VJodouhmnHVDwtkBZ2NdgahT7NAgNE9EpWoZApzobhpua2nDL9D3sbHSoRRk8bEFeme2BHrXPdcq5VNJcPdGMUD54Smwatyx74cPJyet6bCWmLciHE2jGw9u5TmatjdpFSjGKegh76GvJstK3VaLagvsJJMaaKM9MNXYtgJyDr1Zw7U9PXV7N9TQnSsqz6EHMgDvd8aTDqEG7bxxAotkAgeh4KHqnk6Ga117q5AJctJcbUtD99iUgPmJrC8vzX85TEXgHRY1psW7D6daeExfVVrEPHFHrU6XfhegKv9vRbJBGL861U4Qg6HWbWxbuitgtKoBazSp7VofDtrZebq2NSpZoXCAZC8DRiaysanAqyCJZf7jJ8NfXtWej8L9vg8PVs65MrEmK8toadcyCA2UGzg6pQKrMKQEUahruBiS7zuo62eWwJBxUD1fQ1RGPk9BbMDk9FQQxXu3thSJPnKktq3aJhD9GNFpvyEAaWigp5nfjgH5doVTQk1PgoxeXRAWQNPztjNvZWv6iD85CoZqfCWdJbAXPrWvYW5FsRLW1xJ4ELRUfReMAjCGYuFWdA3CZyefpiDEWqVTe5SA6J6XeUppRyXKpKQTc6upesoAGZZ2NtFDryq22izC6D5p1i98YpC6Dk1qcKevaANKHH8TfFoQT717nrQEY2aLoWrA1ip2t5etdZjNVFmghxXEeCAGy3NcLDFHmAfcBZhHKeJHp8H8HbiMRtWe3wmwKX6mPx16ahnd3dMGCsxAZfjQcy4J1HpuCm7rHMULkixUFYRYqx85c7UpLcijLRybE1MLRjEZ5SEYtazNuiZBwq1KUcNipzrxta9Rpvt2j4WyMadxPf5r9YeAaJJp42PiC6SGfyjHjRQN4K3pohdQRbbG4HQ95NaWCy7CAwbpXRCh9NDMMQ2cmTfB3KFW2M'
  );

  async getIssuer() {
    const rawVal = await this.queryDbKey(DBKey.forIssuer());
    return new md.Addr(rawVal);
  }

  async getMaker() {
    const rawVal = await this.queryDbKey(DBKey.forMaker());
    return new md.Addr(rawVal);
  }

  /**
   * register registers an NFT Contract.
   * @param {acnt.Account} by
   * @param {string} ctrtDescription
   * @param {number} fee
   * @returns {NFTCtrt}
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

  async getUnit() {
    return 1;
  }

  /**
   * issue issues a token of the NFT contract.
   * @param {acnt.Account} by
   * @param {string} tokDescription
   * @param {string} attachment
   * @param {number} fee
   * @returns {object}
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
        FuncIdx.ISSUE,
        new de.DataStack(de.Str.fromStr(tokDescription)),
        md.VSYSTimestamp.now(),
        new md.Str(attachment),
        md.ExecCtrtFee.fromNumber(fee)
      )
    );
    return data;
  }

  async send(by, recipient, tokIdx, attachment = '', fee) {
    const rcptMd = new md.Addr(recipient);
    rcptMd.mustOn(by.chain);

    const data = await by.executeContractImpl(
      new tx.ExecCtrtFuncTxReq(
        this.ctrtId,
        FuncIdx.SEND,
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
}
