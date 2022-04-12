/**
 * NFT contract module provides functionalities for NFT contract.
 * @module contract/nft_ctrt
 */

 "use strict";

 import * as ctrt from "./ctrt.js";
 import * as acnt from "../account.js";
 import * as md from "../model.js";
 import * as tx from "../tx_req.js";
 import * as de from "../data_entry.js";


export class NFTCtrt extends ctrt.BaseTokCtrt {
  static CTRT_META = ctrt.CtrtMeta.fromB58Str(
    "VJodouhmnHVDwtkBZ2NdgahT7NAgNE9EpWoZApzobhpua2nDL9D3sbHSoRRk8bEFeme2BHrXPdcq5VNJcPdGMUD54Smwatyx74cPJyet6bCWmLciHE2jGw9u5TmatjdpFSjGKegh76GvJstK3VaLagvsJJMaaKM9MNXYtgJyDr1Zw7U9PXV7N9TQnSsqz6EHMgDvd8aTDqEG7bxxAotkAgeh4KHqnk6Ga117q5AJctJcbUtD99iUgPmJrC8vzX85TEXgHRY1psW7D6daeExfVVrEPHFHrU6XfhegKv9vRbJBGL861U4Qg6HWbWxbuitgtKoBazSp7VofDtrZebq2NSpZoXCAZC8DRiaysanAqyCJZf7jJ8NfXtWej8L9vg8PVs65MrEmK8toadcyCA2UGzg6pQKrMKQEUahruBiS7zuo62eWwJBxUD1fQ1RGPk9BbMDk9FQQxXu3thSJPnKktq3aJhD9GNFpvyEAaWigp5nfjgH5doVTQk1PgoxeXRAWQNPztjNvZWv6iD85CoZqfCWdJbAXPrWvYW5FsRLW1xJ4ELRUfReMAjCGYuFWdA3CZyefpiDEWqVTe5SA6J6XeUppRyXKpKQTc6upesoAGZZ2NtFDryq22izC6D5p1i98YpC6Dk1qcKevaANKHH8TfFoQT717nrQEY2aLoWrA1ip2t5etdZjNVFmghxXEeCAGy3NcLDFHmAfcBZhHKeJHp8H8HbiMRtWe3wmwKX6mPx16ahnd3dMGCsxAZfjQcy4J1HpuCm7rHMULkixUFYRYqx85c7UpLcijLRybE1MLRjEZ5SEYtazNuiZBwq1KUcNipzrxta9Rpvt2j4WyMadxPf5r9YeAaJJp42PiC6SGfyjHjRQN4K3pohdQRbbG4HQ95NaWCy7CAwbpXRCh9NDMMQ2cmTfB3KFW2M"
  );

  static FuncIdx = class FuncIdx extends ctrt.FuncIdx {
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
  
  static stateVar = class StateVar extends ctrt.StateVar {
    static elems = {
      ISSUER: 0,
      MAKER: 1,
    };
    static _ = this.createElems();
  }
  
  static DBKey = class DBKey extends ctrt.DBKey {
    static forIssuer() {
      return new this(StateVar.ISSUER.serialize());
    }
  
    static forMaker() {
      return new this(StateVar.MAKER.serialize());
    }
  }

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

    return new this(data["contractId"], by.chain);
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
    tokDescription = "",
    attachment = "",
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

  async supersede(by, newIssuer, attachment = "", fee = md.ExecCtrtFee.DEFAULT) {
    issuerMd = md.Addr(newIssuer);
    issuerMd.mustOn(by.chain);
    
    const data = await by.executeContractImpl(
      new tx.ExecCtrtFuncTxReq(
        this.ctrtId,
        FuncIdx.SUPERSEDE,
        new de.DataStack(
          de.Addr(issuerMd),
        ),
        md.VSYSTimestamp.now(),
        new md.Str(attachment),
        md.ExecCtrtFee.fromNumber(fee)
      )
    );
    return data;
  }

  async send(by, recipient, tokIdx, attachment = "", fee = md.ExecCtrtFee.DEFAULT) {
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

  async transfer(by, sender, recipient, tokIdx, attachment = "", fee = md.ExecCtrtFee.DEFAULT) {
    const rcptMd = new md.Addr(recipient);
    const senderMd = new md.Addr(sender);
    senderMd.mustOn(by.chain);
    rcptMd.mustOn(by.chain);

    const data = await by.executeContractImpl(
      new tx.ExecCtrtFuncTxReq(
        this.ctrtId,
        FuncIdx.SEND,
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

  async deposit(by, ctrt_id, tokIdx, attachment = "", fee = md.ExecCtrtFee.DEFAULT) {
    const ctrtIdMd = new md.CtrtID(ctrt_id);

    const data = await by.executeContractImpl(
      new tx.ExecCtrtFuncTxReq(
        this.ctrtId,
        FuncIdx.DEPOSIT,
        new de.DataStack(
          new de.Addr(by.getAddr.data),
          new de.CtrtAcnt(ctrtIdMd),
          new de.Int32(new md.TokenIdx(tokIdx))
        ),
        md.VSYSTimestamp.now(),
        new md.Str(attachment),
        md.ExecCtrtFee.fromNumber(fee)
      )
    );
    return data;
  }

  async withdraw(by, ctrt_id, tokIdx, attachment = "", fee = md.ExecCtrtFee.DEFAULT) {
    const ctrtIdMd = new md.CtrtID(ctrt_id);

    const data = await by.executeContractImpl(
      new tx.ExecCtrtFuncTxReq(
        this.ctrtId,
        FuncIdx.WITHDRAW,
        new de.DataStack(
          new de.CtrtAcnt(ctrtIdMd),
          new de.Addr(by.getAddr.data),
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

export class NFTCtrtV2Base extends NFTCtrt {

  static FuncIdx = class FuncIdx extends NFTCtrt.FuncIdx {
    static elems = {
      SUPERSEDE: 0,
      ISSUE: 1,
      UPDATE_LIST = 2,
      SEND: 3,
      TRANSFER: 4,
      DEPOSIT: 5,
      WITHDRAW: 6,
    };
    static _ = this.createElems();
  }
  
  static StateVar = class StateVar extends NFTCtrt.StateVar {
    static elems = {
      ISSUER: 0,
      MAKER: 1,
      REGULATOR: 2,
    };
    static _ = this.createElems();
  }

  static StateMapIdx = class StateMapIdx extends ctrt.StateMapIdx {
    static elems = {
      IS_IN_LIST = 0
    }
  }

  static DBKey = class DBKey extends NFTCtrt.DBKey {
    static for_regulator() {
      return new this(StateVar.REGULATOR.serialize());
    }
  
    static _forIsInList(addrDataEntry) {
      stmp = NFTCtrtV2Base.StateMap(
        idx = StateMapIdx.IS_IN_LIST,
        dataEntry = addrDataEntry,
      )
      return new this(stmp.serialize());
    }
    static for_isUserInList(addr) {
      addrDe = de.Addr(md.Addr(addr))
      return new this._forIsInList(addrDe);
    }
  
    static for_isCtrtInList(addr) {
      addrDe = de.CtrtAcnt(md.CtrtID(addr))
      return new this._forIsInList(addrDe);
    }

  }

  async getregulator() {
    const rawVal = await this.queryDbKey(DBKey.for_regulator());
    return new md.Addr(rawVal);
  }

  async isInList(db_key) {
    data = await this.queryDbKey(db_key);
    return data == "true"
  }

  async isUserInList(addr) {
    return await this.isInList(this.DBKey.for_isUserInList(addr))
  }

  async isCtrtInList(addr) {
    return await this.isInList(this.DBKey.for_isUserInList(addr))
  }

  async updateList(by, addrDataEntry, val, attachment = "", fee) {
    const data = await by.executeContractImpl(
      new tx.ExecCtrtFuncTxReq(
        this.ctrtId,
        FuncIdx.UPDATE_LIST,
        new de.DataStack(
          addrDataEntry,
          new de.Bool(new md.Bool(val))
        ),
        md.VSYSTimestamp.now(),
        new md.Str(attachment),
        md.ExecCtrtFee.fromNumber(fee)
      )
    );
    return data;
  }

  async updateListUser(by, addr, val, attachment = "", fee) {
    userMd = md.Addr(addr);
    userMd.mustOn(by.chain);
    return await self.updateList(by,de.Addr(userMd),val,attachment,fee);
  }

  async updateListCtrt(by, addr, val, attachment = "", fee) {
    ctrtIdMd = md.CtrtID(addr);
    return await self.updateList(by,de.CtrtAcnt(ctrtIdMd),val,attachment,fee);
  }

  async supersede(by, newIssuer, newRegulator, attachment = "", fee = md.ExecCtrtFee.DEFAULT) {
    issuerMd = md.Addr(newIssuer);
    regulatorMd = md.Addr(newRegulator);
    issuerMd.mustOn(by.chain);
    regulatorMd.mustOn(by.chain);
    
    const data = await by.executeContractImpl(
      new tx.ExecCtrtFuncTxReq(
        this.ctrtId,
        FuncIdx.SUPERSEDE,
        new de.DataStack(
          de.Addr(issuerMd),
          de.Addr(regulatorMd),
        ),
        md.VSYSTimestamp.now(),
        new md.Str(attachment),
        md.ExecCtrtFee.fromNumber(fee)
      )
    );
    return data;
  }

}

export class NFTCtrtV2Whitelist extends NFTCtrtV2Base {
  static CTRT_META = ctrt.CtrtMeta.fromB58Str(
    "3g9JzsVg6kPLJKHuWAbMKgiH2aeZt5VTTdrVNeVBQuviDGJnyLrPB4FHtt6Np2rKXy2ZCZftZ1SkNRifVAasWGF5dYt1zagnDrgE52Forq9QyXq2vmyq8NUMVuLfHFDgUC7d7tJPSVZdmhDNzc3cR9WcobXqcR3x923wmTZp63ztxgzdk4cV39TJLoTBLFguFKjqetkU7WUmP6ivMfcvDzMBzgq48fjJ1AYn5fxt31ZV6tAorCQ4w2zfekL8aUEhePgR66RXSBggiqQhTcw7dGg8xkGtRh3wkAVEbFuZa78R1C9cUUytbYM5fi17AE5q9UEgegxMMpZgsk9YNHs4mx4NPLj6Rz5DK3QwbeUbaVWceSqssYS6GodJ41bEm84x3aQrqQK33tHSPRy9uAr9ku773fZuHWPEeNoEDdsnUVsxCKQ7AyM5K1JVFRFwMABGGAnkYsFV23pfLFktBSvAJkzo8Hi6Wss7ZEBgSDeCJJohqoxmsR7L8kcfjRwy3Rb7VU76LMuqGrBfb39uUy5qdxRqAMFtwE4imkxxX6akuR7RMd3RmKQ2W7TXMuWZNyJHd4c17ZJrSCQNAXQ2iKXxSbUoDUmetuCud81SQonTjomq9RsGqRvaV2iGjHUb4wvUuKhodE4dF8xrNWXQxfPpwed1mUEuUPmhppY7Lg7p5EJyXVYDr4ybdsmYohDFgTDbGs3mZBmgUpEVAUC4vJrXqWWv8gjw8j5xabF6QfbtcWrbrVu4sTtMGzybVAoeB4b1x3Rkd67ABWnmzHfDxMopfb21TSDGpWLnSQeRn2gA2jnLUokb8FXUHG5qttmLNzG7RY1XRmC7TKRQ3X5JqGbHbN4rhUxU8iQUKpACWsyGuEP8VrUNvx41sMEbfReZ8ay7v2cQEtmw5uFfXMmAcsQBrRdxsHTaN5Cpu7Ak1pRvZzQKKesWuHLuUgNStdqVpHih4cTk1YzoJJ34spDa7FYhzTWTSVJBwHvYy5WQxrXnXAXBmMeNVroX8x9gT38LeqJ2z4KoAWnj2o1waKB8TC1JXet7sXHttGWDs7YHJHNEy5CcWkVCPnt5xVTq9ZwPkc4EhLQDWortL35e75vyQR3F3tW2Pr89UiPSNWEXxC5L8apavKVyv9zUcWUwShd5bdcfKa1CnLSMhW9DE6CT4APWKuPdxW9hLgkYZziJtN4WebcbA5PbG8hrkhU2E7easz3pRJQ49vhMtSf7tKTf9NDwZuuZ9ix9q5TZMzYvNbg5rk9P6uoPLRZk61J2LpQv8K7YLBrcWSduPsxWWjiCvxL7bW8vA8gWQocxfuXiM5i3wdA1zLx8As3Ydufi2S3nk23BwRjZhjhh7BEq7p1nwpqP97PqqW2CpMJspEHdHCzRR3fBJw6mLdSGAYeia22r2uJm1o73WrPFTt9vQwCLXMKS3WMd3GpRmR36n3C9Ed7xdnFcRDYZBgLis63UEvczGvH9HS8MMHkoAXE3wuahEzYZEd1NxJXSXFhe2h6DJbABXQKMMkZdPQmGJkDhBPTh9nZ9DgGHhnnitxQ5ESfxqvqxwuVubAXTt3psg8LS2B16mjDGh9"
  );
}

export class NFTCtrtV2Blacklist extends NFTCtrtV2Base {
  static CTRT_META = ctrt.CtrtMeta.fromB58Str(
    "3g9JzsVg6kPLJKHuWAbMKgiH2aeZt5VTTdrVNeVBQuviDGJnyLrPB4FHtt6Np2rKXy2ZCZftZ1SkNRifVAasWGF5dYt1zagnDrgE52Forq9QyXq2vmyq8NUMVuLfHFDgUC7d7tJPSVZdmhDNzc3cR9WcobXqcR3x923wmTZp63ztxgzdk4cV39TJLoTBLFguFKjqetkU7WUmP6ivMfcvDzMBzgq48fjJ1AYn5fxt31ZV6tAorCQ4w2zfekL8aUEhePgR66RXSBggiqQhTcw7dGg8xkGtRh3wkAVEbFuZa78R1Bw8Fc7fND3crHRj8pY66QYiaksdHixYVm4R68ez9K1ndEZq1ShQBs5DbvyoFGc4Dr1Yosv5VKJbqaB5fu7ZZ8SvB5RVYqSsN9tTTmUinNmJ4v63DWvH2N7WnFq8JYPL4RpEpnvBYnSUdAxN44skS45uVi5F4bkueAXbgUeoir82hTgLvgnf573Ziw9Mon4STtfhP8Y5DKTqA2gM44MmVkNWW7WwNDXerdYwD65QMG7BSSU9UhH6eNvay2LYXNph9heAWYwKcQPJnA7niSZto23XaFoU8kGRUoDNvofQw1XJkdTgVgLt5yz8HbGxnXT5AdKa3YNyAnq4KgXjU4W3Xj8xWqpYHX54C8GQF7poCM4E5XNDXbgExoK3bS4WHkbmwJJJzJ6MtsiyZnmSYGs7HhfcueFH4SjjNKevcntrC4Kenc6tygSWrSzefdSC78XrQ5bgSp24wKoX4WxUUUky8KB9NvWGHYF3x8Bg59HwH67haNB9wejM8Jj5a88XoVTYAqMh6z8zuZUqANshYRaxjxYLaV2VATrTKM13zMARaBVoDRFKtYiE8CmFKeequ9HdWix6CmCEtKQdCC4UmtYJ1Ch4qpfjKyMP4Bd7YbKLg928ZHFiLN2Uq1KLfbn1V83Xe1xPGwkX1TCsJpBXyqmsByaYUckFgkCNNvkpuAs1dA8HLLrnd1Tx6zT99vDaPUr2k9nLQ6o1hjPyK1EPBVg5zxrnaSP446m54CemwNPa1UECFx6sEhrL1EbL1yQR7cfMnrr82z9iSiSMZMubfEhPyuD58TYjSRGd1XRSnhjo1tBwN2k27RsNtdhAmH2u57eCfDQpnMUnBkSZj71o2Kk5cMfMxNWLBYr1w7Ma8yJriQYNedNo5fG5XVubmmd5H7YpVAjPKWVVru3SQXR7AHcLv834pCQD7EjYEbNdFeheaDiA1yp7amZrig3cd6jabMPoDSvP1GxX8HrUnv4hCvSmDivGpFvcGJnGbNuSHTP8qHTAf8jVFeMpeMiLH9rP9qcpMAhh9mAzmj5pVhZZBuiWFor8empJoKGv2RcUFRALEFDXoYaPrri7oCypNeWS4eiVum8fm5hx3CMY9N2HMqMrokCCTHceiHYKfgjYRnXaJsJUs28rPyqqxAaxUj3qNpaB2D6x6nc4fKLSZyuUCgZSmRPPBWWugRNRDxppG6ecA1hkNZDX2NQY9erhuMYX9jhVCLb6NLVe5euWFkvBjF4Y7qfpKM1uLSZvxd4gmA5VGA99vKFkYUwvBB5TNPnupdECD9"
  );
}