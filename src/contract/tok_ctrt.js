/**
 * token contract module provides functionalities for token contract.
 * @module contract/tok_ctrt
 */

 'use strict';

 import * as ctrt from './ctrt.js';
 import * as acnt from '../account.js';
 import * as md from '../model.js';
 import * as tx from '../tx_req.js';
 import * as de from '../data_entry.js';
 
 export class TokCtrt extends ctrt.BaseTokCtrt {
   /**
    * Creates a new smart contract instance.
    * @param {string} ctrtId - The contract ID.
    * @param {ch.chain} chain - The chain.
    */
    constructor(ctrtId, chain) {
     this.ctrtId = new md.CtrtID(ctrtId);
     this.chain = chain;
   }
   
   static CTRT_META = ctrt.CtrtMeta.fromB58Str(
     '3GQnJtxDQc3zFuUwXKbrev1TL7VGxk5XNZ7kUveKK6BsneC1zTSTRjgBTdDrksHtVMv6nwy9Wy6MHRgydAJgEegDmL4yx7tdNjdnU38b8FrCzFhA1aRNxhEC3ez7JCi3a5dgVPr93hS96XmSDnHYvyiCuL6dggahs2hKXjdz4SGgyiUUP4246xnELkjhuCF4KqRncUDcZyWQA8UrfNCNSt9MRKTj89sKsV1hbcGaTcX2qqqSU841HyokLcoQSgmaP3uBBMdgSYVtovPLEFmpXFMoHWXAxQZDaEtZcHPkrhJyG6CdTgkNLUQKWtQdYzjxCc9AsUGMJvWrxWMi6RQpcqYk3aszbEyAh4r4fcszHHAJg64ovDgMNUDnWQWJerm5CjvN76J2MVN6FqQkS9YrM3FoHFTj1weiRbtuTc3mCR4iMcu2eoxcGYRmUHxKiRoZcWnWMX2mzDw31SbvHqqRbF3t44kouJznTyJM6z1ruiyQW6LfFZuV6VxsKLX3KQ46SxNsaJoUpvaXmVj2hULoGKHpwPrTVzVpzKvYQJmz19vXeZiqQ2J3tVcSFH17ahSzwRkXYJ5HP655FHqTr6Vvt8pBt8N5vixJdYtfx7igfKX4aViHgWkreAqBK3trH4VGJ36e28RJP8Xrt6NYG2icsHsoERqHik7GdjPAmXpnffDL6P7NBfyKWtp9g9C289TDGUykS8CNiW9L4sbUabdrqsdkdPRjJHzzrb2gKTf2vB56rZmreTUbJ53KsvpZht5bixZ59VbCNZaHfZyprvzzhyTAudAmhp8Nrks7SV1wTySZdmfLyw7vsNmTEi3hmuPmYqExp4PoLPUwT4TYt2doYUX1ds3CesnRSjFqMhXnLmTgYXsAXvvT2E6PWTY5nPCycQv5pozvQuw1onFtGwY9n5s2VFjxS9W6FkCiqyyZAhCXP5o44wkmD5SVqyqoL5HmgNc8SJL7uMMMDDwecy7Sh9vvt3RXirH7F7bpUv3VsaepVGCHLfDp9GMG59ZiWK9Rmzf66e8Tw4unphu7gFNZuqeBk2YjCBj3i4eXbJvBEgCRB51FATRQY9JUzdMv9Mbkaq4DW69AgdqbES8aHeoax1UDDBi3raM8WpP2cKVEqoeeCGYM2vfN6zBAh7Tu3M4NcNFJmkNtd8Mpc2Md1kxRsusVzHiYxnsZjo'
   );
 
   static FuncIdx = class FuncIdx extends ctrt.FuncIdx {
     static elems = {
       SUPERSEDE: 0,
       ISSUE: 1,
       DESTROY: 2,
       SEND: 3,
       TRANSFER: 4,
       DEPOSIT: 5,
       WITHDRAW: 6,
       TOTAL_SUPPLY: 7,
       MAX_SUPPLY: 8,
       BALANCE_OF: 9,
       GET_ISSUER: 10,
     };
 
     static _ = this.createElems();
   };
 
   static stateVar = class StateVar extends ctrt.StateVar {
     static elems = {
       ISSUER: 0,
       MAKER: 1,
     };
 
     static _ = this.createElems();
   };
 
   static DBKey = class DBKey extends ctrt.DBKey {
     static forIssuer() {
       return new this(StateVar.ISSUER.serialize());
     }
 
     static forMaker() {
       return new this(StateVar.MAKER.serialize());
     }
   };
 
   async getIssuer() {
     const rawVal = await this.queryDbKey(DBKey.forIssuer());
     return new md.Addr(rawVal);
   }
 
   async getMaker() {
     const rawVal = await this.queryDbKey(DBKey.forMaker());
     return new md.Addr(rawVal);
   }
 
   async tokId() {
     this.tokId = this.getTokId(0);
     return this.tokId;
   }

   async unit() {
     if(this.unit <= 0){
       info = await this.chain.api.ctrt.getTokInfo(this.tokId.data);
       this.unit = info["unity"];
     }
     return this.unit;
   }
 
   /**
    * register registers an NFT Contract.
    * @param {acnt.Account} by
    * @param {string} ctrtDescription
    * @param {number} fee
    * @returns {NFTCtrt}
    */
   static async register(by, max, unit, tokDescription = "", ctrtDescription, fee = md.RegCtrtFee.DEFAULT) {
     const data = await by.registerContractImpl(
       new tx.RegCtrtTxReq(
         new de.DataStack(
           de.Amount.forTokAmount(max,unit),
           de.Amount(md.Int(unit)),
           de.Str(md.Str(tokDescription))
         ),
         this.CTRT_META,
         md.VSYSTimestamp.now(),
         new md.Str(ctrtDescription),
         md.RegCtrtFee.fromNumber(fee)
       )
     );
 
     return new this(data['contractId'], by.chain.api);
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
 
   async issue(
     by,
     amnt,
     attachment = "",
     fee = md.ExecCtrtFee.DEFAULT
   ) {
     const data = await by.executeContractImpl(
       new tx.ExecCtrtFuncTxReq(
         this.ctrtId,
         FuncIdx.ISSUE,
         new de.DataStack(de.Amount.forTokAmount(amnt)),
         md.VSYSTimestamp.now(),
         new md.Str(attachment),
         md.ExecCtrtFee.fromNumber(fee)
       )
     );
     return data;
   }
 
   async send(by, recipient, amnt, attachment = "", fee = md.ExecCtrtFee.DEFAULT) {
     const rcptMd = new md.Addr(recipient);
     rcptMd.mustOn(by.chain);
 
     unit = await this.unit;
 
     const data = await by.executeContractImpl(
       new tx.ExecCtrtFuncTxReq(
         this.ctrtId,
         FuncIdx.SEND,
         new de.DataStack(
           new de.Addr(rcptMd),
           new de.Amount.forTokAmount(amnt,unit)
         ),
         md.VSYSTimestamp.now(),
         new md.Str(attachment),
         md.ExecCtrtFee.fromNumber(fee)
       )
     );
     return data;
   }
 
   async destroy(by, amnt, attachment = "", fee = md.ExecCtrtFee.DEFAULT) {
    unit = await this.unit;

    const data = await by.executeContractImpl(
      new tx.ExecCtrtFuncTxReq(
        this.ctrtId,
        FuncIdx.DESTROY,
        new de.DataStack(
          new de.Amount.forTokAmount(amnt,unit)
        ),
        md.VSYSTimestamp.now(),
        new md.Str(attachment),
        md.ExecCtrtFee.fromNumber(fee)
      )
    );
    return data;
  }

  async transfer(by, sender, recipient, amnt, attachment = "", fee = md.ExecCtrtFee.DEFAULT) {
    const senderMd = new md.Addr(sender);
    const rcptMd = new md.Addr(recipient);
    senderMd.mustOn(by.chain);
    rcptMd.mustOn(by.chain);

    unit = await this.unit;

    const data = await by.executeContractImpl(
      new tx.ExecCtrtFuncTxReq(
        this.ctrtId,
        FuncIdx.TRANSFER,
        new de.DataStack(
          new de.Addr(senderMd),
          new de.Addr(rcptMd),
          new de.Amount.forTokAmount(amnt,unit)
        ),
        md.VSYSTimestamp.now(),
        new md.Str(attachment),
        md.ExecCtrtFee.fromNumber(fee)
      )
    );
    return data;
  }

  async deposit(by, ctrtId, amnt, attachment = "", fee = md.ExecCtrtFee.DEFAULT) {
    const senderMd = md.Addr(by.addr.data)
    senderMd.mustOn(by.chain)
    
    unit = await this.unit;

    const data = await by.executeContractImpl(
      new tx.ExecCtrtFuncTxReq(
        this.ctrtId,
        FuncIdx.DEPOSIT,
        new de.DataStack(
          new de.Addr(senderMd),
          de.CtrtAcnt(md.CtrtID(ctrtId)),
          new de.Amount.forTokAmount(amnt,unit)
        ),
        md.VSYSTimestamp.now(),
        new md.Str(attachment),
        md.ExecCtrtFee.fromNumber(fee)
      )
    );
    return data;
  }

  async withdraw(by, recipient, amnt, attachment = "", fee = md.ExecCtrtFee.DEFAULT) {
    const rcptMd = new md.Addr(recipient);
    rcptMd.mustOn(by.chain);

    unit = await this.unit;

    const data = await by.executeContractImpl(
      new tx.ExecCtrtFuncTxReq(
        this.ctrtId,
        FuncIdx.SEND,
        new de.DataStack(
          new de.Addr(rcptMd),
          new de.Amount.forTokAmount(amnt,unit)
        ),
        md.VSYSTimestamp.now(),
        new md.Str(attachment),
        md.ExecCtrtFee.fromNumber(fee)
      )
    );
    return data;
  }



 }
 