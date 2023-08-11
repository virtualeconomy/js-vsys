/**
 * module contract/nftCtrtV2 provides functionalities for NFT Contract V2.
 * @module contract/nftCtrtV2
 */

'use strict';

import * as ctrt from './ctrt.js';
import * as nc from './nft_ctrt.js';
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
    UPDATE_LIST: 2,
    SEND: 3,
    TRANSFER: 4,
    DEPOSIT: 5,
    WITHDRAW: 6,
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
export class DBKey extends nc.DBKey {
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
   * contract address is in the list.
   * @param {string} addr - The contract address.
   * @returns {DBKey} The DBKey object.
   */
  static forIsCtrtInList(addr) {
    return this.forIsInListImpl(de.CtrtAcnt.fromStr(addr));
  }
}

/** NFTCtrtV2Base is the base class for NFT Contract V2 */
class NFTCtrtV2Base extends nc.NFTCtrt {
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
   * isCtrtInList queries & returns the status of whether the contract address is in the list.
   * @param {string} addr - The contract address.
   * @returns {boolean} If the address is in the list.
   */
  async isCtrtInList(addr) {
    return await this.isInListImpl(DBKey.forIsCtrtInList(addr));
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
        this.FUNC_IDX_CLS.UPDATE_LIST,
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
        this.FUNC_IDX_CLS.SUPERSEDE,
        new de.DataStack(new de.Addr(newIssuerMd), new de.Addr(newRegulatorMd)),
        md.VSYSTimestamp.now(),
        new md.Str(attachment),
        md.ExecCtrtFee.fromNumber(fee)
      )
    );
    return data;
  }
}

/** NFTCtrtV2Whitelist is the class for NFT Contract V2 with whitelist */
export class NFTCtrtV2Whitelist extends NFTCtrtV2Base {
  FUNC_IDX_CLS = FuncIdx;
  static CTRT_META = md.CtrtMeta.fromB58Str(
    '3g9JzsVg6kPLJKHuWAbMKgiH2aeZt5VTTdrVNeVBQuviDGJnyLrPB4FHtt6Np2rKXy2ZCZftZ1SkNRifVAasWGF5dYt1zagnDrgE52Forq9QyXq2vmyq8NUMVuLfHFDgUC7d7tJPSVZdmhDNzc3cR9WcobXqcR3x923wmTZp63ztxgzdk4cV39TJLoTBLFguFKjqetkU7WUmP6ivMfcvDzMBzgq48fjJ1AYn5fxt31ZV6tAorCQ4w2zfekL8aUEhePgR66RXSBggiqQhTcw7dGg8xkGtRh3wkAVEbFuZa78R1C9cUUytbYM5fi17AE5q9UEgegxMMpZgsk9YNHs4mx4NPLj6Rz5DK3QwbeUbaVWceSqssYS6GodJ41bEm84x3aQrqQK33tHSPRy9uAr9ku773fZuHWPEeNoEDdsnUVsxCKQ7AyM5K1JVFRFwMABGGAnkYsFV23pfLFktBSvAJkzo8Hi6Wss7ZEBgSDeCJJohqoxmsR7L8kcfjRwy3Rb7VU76LMuqGrBfb39uUy5qdxRqAMFtwE4imkxxX6akuR7RMd3RmKQ2W7TXMuWZNyJHd4c17ZJrSCQNAXQ2iKXxSbUoDUmetuCud81SQonTjomq9RsGqRvaV2iGjHUb4wvUuKhodE4dF8xrNWXQxfPpwed1mUEuUPmhppY7Lg7p5EJyXVYDr4ybdsmYohDFgTDbGs3mZBmgUpEVAUC4vJrXqWWv8gjw8j5xabF6QfbtcWrbrVu4sTtMGzybVAoeB4b1x3Rkd67ABWnmzHfDxMopfb21TSDGpWLnSQeRn2gA2jnLUokb8FXUHG5qttmLNzG7RY1XRmC7TKRQ3X5JqGbHbN4rhUxU8iQUKpACWsyGuEP8VrUNvx41sMEbfReZ8ay7v2cQEtmw5uFfXMmAcsQBrRdxsHTaN5Cpu7Ak1pRvZzQKKesWuHLuUgNStdqVpHih4cTk1YzoJJ34spDa7FYhzTWTSVJBwHvYy5WQxrXnXAXBmMeNVroX8x9gT38LeqJ2z4KoAWnj2o1waKB8TC1JXet7sXHttGWDs7YHJHNEy5CcWkVCPnt5xVTq9ZwPkc4EhLQDWortL35e75vyQR3F3tW2Pr89UiPSNWEXxC5L8apavKVyv9zUcWUwShd5bdcfKa1CnLSMhW9DE6CT4APWKuPdxW9hLgkYZziJtN4WebcbA5PbG8hrkhU2E7easz3pRJQ49vhMtSf7tKTf9NDwZuuZ9ix9q5TZMzYvNbg5rk9P6uoPLRZk61J2LpQv8K7YLBrcWSduPsxWWjiCvxL7bW8vA8gWQocxfuXiM5i3wdA1zLx8As3Ydufi2S3nk23BwRjZhjhh7BEq7p1nwpqP97PqqW2CpMJspEHdHCzRR3fBJw6mLdSGAYeia22r2uJm1o73WrPFTt9vQwCLXMKS3WMd3GpRmR36n3C9Ed7xdnFcRDYZBgLis63UEvczGvH9HS8MMHkoAXE3wuahEzYZEd1NxJXSXFhe2h6DJbABXQKMMkZdPQmGJkDhBPTh9nZ9DgGHhnnitxQ5ESfxqvqxwuVubAXTt3psg8LS2B16mjDGh9'
  );
}

/** NFTCtrtV2Blacklist is the class for NFT Contract V2 with blacklist */
export class NFTCtrtV2Blacklist extends NFTCtrtV2Base {
  FUNC_IDX_CLS = FuncIdx;
  static CTRT_META = md.CtrtMeta.fromB58Str(
    '3g9JzsVg6kPLJKHuWAbMKgiH2aeZt5VTTdrVNeVBQuviDGJnyLrPB4FHtt6Np2rKXy2ZCZftZ1SkNRifVAasWGF5dYt1zagnDrgE52Forq9QyXq2vmyq8NUMVuLfHFDgUC7d7tJPSVZdmhDNzc3cR9WcobXqcR3x923wmTZp63ztxgzdk4cV39TJLoTBLFguFKjqetkU7WUmP6ivMfcvDzMBzgq48fjJ1AYn5fxt31ZV6tAorCQ4w2zfekL8aUEhePgR66RXSBggiqQhTcw7dGg8xkGtRh3wkAVEbFuZa78R1Bw8Fc7fND3crHRj8pY66QYiaksdHixYVm4R68ez9K1ndEZq1ShQBs5DbvyoFGc4Dr1Yosv5VKJbqaB5fu7ZZ8SvB5RVYqSsN9tTTmUinNmJ4v63DWvH2N7WnFq8JYPL4RpEpnvBYnSUdAxN44skS45uVi5F4bkueAXbgUeoir82hTgLvgnf573Ziw9Mon4STtfhP8Y5DKTqA2gM44MmVkNWW7WwNDXerdYwD65QMG7BSSU9UhH6eNvay2LYXNph9heAWYwKcQPJnA7niSZto23XaFoU8kGRUoDNvofQw1XJkdTgVgLt5yz8HbGxnXT5AdKa3YNyAnq4KgXjU4W3Xj8xWqpYHX54C8GQF7poCM4E5XNDXbgExoK3bS4WHkbmwJJJzJ6MtsiyZnmSYGs7HhfcueFH4SjjNKevcntrC4Kenc6tygSWrSzefdSC78XrQ5bgSp24wKoX4WxUUUky8KB9NvWGHYF3x8Bg59HwH67haNB9wejM8Jj5a88XoVTYAqMh6z8zuZUqANshYRaxjxYLaV2VATrTKM13zMARaBVoDRFKtYiE8CmFKeequ9HdWix6CmCEtKQdCC4UmtYJ1Ch4qpfjKyMP4Bd7YbKLg928ZHFiLN2Uq1KLfbn1V83Xe1xPGwkX1TCsJpBXyqmsByaYUckFgkCNNvkpuAs1dA8HLLrnd1Tx6zT99vDaPUr2k9nLQ6o1hjPyK1EPBVg5zxrnaSP446m54CemwNPa1UECFx6sEhrL1EbL1yQR7cfMnrr82z9iSiSMZMubfEhPyuD58TYjSRGd1XRSnhjo1tBwN2k27RsNtdhAmH2u57eCfDQpnMUnBkSZj71o2Kk5cMfMxNWLBYr1w7Ma8yJriQYNedNo5fG5XVubmmd5H7YpVAjPKWVVru3SQXR7AHcLv834pCQD7EjYEbNdFeheaDiA1yp7amZrig3cd6jabMPoDSvP1GxX8HrUnv4hCvSmDivGpFvcGJnGbNuSHTP8qHTAf8jVFeMpeMiLH9rP9qcpMAhh9mAzmj5pVhZZBuiWFor8empJoKGv2RcUFRALEFDXoYaPrri7oCypNeWS4eiVum8fm5hx3CMY9N2HMqMrokCCTHceiHYKfgjYRnXaJsJUs28rPyqqxAaxUj3qNpaB2D6x6nc4fKLSZyuUCgZSmRPPBWWugRNRDxppG6ecA1hkNZDX2NQY9erhuMYX9jhVCLb6NLVe5euWFkvBjF4Y7qfpKM1uLSZvxd4gmA5VGA99vKFkYUwvBB5TNPnupdECD9'
  );
}
