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
     super(ctrtId, chain);
     this.tokId = '';
     this.unit = 0;
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
 
   async getTokId() {
     this.tokId = this.getTokId(0);
     return this.tokId;
   }

   async getUnit() {
     if(this.unit <= 0){
       info = await this.chain.api.ctrt.getTokInfo(this.tokId.data);
       this.unit = info["unity"];
     }
     return this.unit;
   }
 
   /**
    * register registers a token Contract.
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
 
     unit = await this.getUnit;
 
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
    unit = await this.getUnit;

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

    unit = await this.getUnit;

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
    
    unit = await this.getUnit;

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

    unit = await this.getUnit;

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

 export class TokCtrtWithSplit extends TokCtrt {
  static CTRT_META = ctrt.CtrtMeta.fromB58Str(
    '3dPGAWbTw4srh5hmMiRUhHtcxmXXLUooKGAfnmz11j5NruyJpBzZpgvADMdZS7Mevy5MAHqFbfHYdfqaAe1JEpLWt1pJWLHZBV62zUhLGmVLXUP5UDvSs24jsBRHqZMC71ciE1uYtgydKxCoFJ3rAgsYqp7GDeTU2PXS5ygDmL6WXmbAYPS8jE4sfNUbJVwpvL1cTw4nnjnJvmLET8VmQybxFt415RemV3MFPeYZay5i5gMmyZa63bjzK1uMZAVWA9TpF5YQ1NTZjPaRPvQGYVY4kY9L4LFJvUG2bib1QaNh7wUAQnTzJfRYJoy1aegFGFZFnBGp9GugH4fHAY69vGmZQnhDw3jU45G9odFyXo3T5Ww4R5szegbjCUKdUGpXf9vY2cKEMJ7i8eCkFVG1dDFZeVov1KMjkVNV8rDBDYfcp3oSGNWQQvGSUT5iGUvDRN8phy1UpR3A9uMVebvjLnVzPx9RyqQ8HaXLM8vPhLuWLoh5hk1Zi1n9nwz55XvKDYjP6eeB55yK5vpg8xjaYDnw9bjYV7ZmS7LAsHvXfnwi8y2W6vk2hGvs4rtR1vNRZSQMPGRRSuwCRJL1yngH6uHWwm2ajWxc684jApuoLdyjZomfCtdpabSyU3kp9Lrn8zT8BVY332sJPQU6gTQi8ke9s9dBxCae4cfSQM6HhuBmFc5KKWHCVG4bm4KZRYbMtidw8ZZnjaAMtcGq7k3Se6GXaTxdS3GcuttB3VB7njypyzuqAcfCdYb9ht8Y1WuTCZ1aLsXsL6eydfk2WLJVrqYpbTk6AchV5gMAEopvc3qXvzrDCedjtNsDmA56Lh6PxrrKr8aV8Wzz8aMaQ88YsVBpE8J4cDkxzo31AojhzEGVBKLmpb3bjmsaw9VkpB6yL8ngYs8eJMSPdM289TSMaEmG4eHt1jezpHTKxkuB9cwqcvhGNLWuv8KXQkik5pRMXV67Qs2FvjpzeJ81z2hnVh1wCtsa6M6qAG1gsqLHa1AVMRzsowafC99uDexwWMBS2RqsZWZBXJcUiNVULjApSnoBREYfHYEpjJ152hnTYZCAwpZMWEkVdBQpZ3zk8gbfLxB4fWMfKgJJucbKPGp1K56u7P8MHQu9aNb9dEof2mwX8rTHjk8jSQ7kXVX4Mf1JqMRWWftkV3GmU1nqYhxRGu4FjDNAomwTr5epHpcMF6P5oiXcLWh5BFQVmGYKz129oizAyUJBsZdxr2WZEGDieLxUg8cve25g28oTuCVENST4z1ZsFAN9wTa1'
  );

  static FuncIdx = class FuncIdx extends ctrt.FuncIdx {
    static elems = {
      SUPERSEDE: 0,
      ISSUE: 1,
      DESTROY: 2,
      SPLIT: 3,
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
  };

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

    tc = new this(data['contractId'], by.chain.api);
    tc.unit = unit;
    return tc;
  }

  async split(by, newUnit, attachment = "", fee = md.ExecCtrtFee.DEFAULT) {

    const data = await by.executeContractImpl(
      new tx.ExecCtrtFuncTxReq(
        this.ctrtId,
        FuncIdx.SPLIT,
        new de.DataStack(
          new de.Amount(md.Int(newUnit))
        ),
        md.VSYSTimestamp.now(),
        new md.Str(attachment),
        md.ExecCtrtFee.fromNumber(fee)
      )
    );
    return data;
  }

 }
 
 export class TokCtrtV2Whitelist extends TokCtrt {
  static CTRT_META = ctrt.CtrtMeta.fromB58Str(
    '7BekqFZ2yZqjiQFFnsxL4CDRFWCjHdZvFXQd6sxAgEktxwn5kkR6vkV27SFC7VmhuMysVfunZWTtHAqPjg4gGz72pha6TMUerSUSXSn7BHaVexyQJoUfqDT5bdr3XVpok1mU2gT29mwtJ6BibizpAEgZZncZauDnvqrWWdkCmRP8VXpPBiPEaUZuq9eRusrUcc5YHshhN6BVkArN84tarVQH3pTRmiekdQveuxFw4r4weXUxwEGCkYX3Zqeqc4mmRsajVCQwV5DuGTEwaBVWiAAfHLGPFgJF6w6aP3d22tdBRLqZ2Y4G5WHdhMunNDEZ2E79w7gbwqDXtz3eVfGtyET5NZEJGmM2S8pZSn2MPjvfPAYZMa9Zd4WXnPLZng1pxjYvrpqPDy27VQu1rhvxXMNPVMdP9QyCQSoExZUot1FmskS1NcmzKfguwsSWR1Z1py58iVDKm8t7x7RnaP7avcjtvixJQkPGg7qaxBKfRQ26vFePWeNdkbJwQJvqComvjEg3hEYjQrysk3j3M9QWEgXQzRqTPTFEVCTJSbdpL2GyYXYC4cLcB81UzJuWf2zoERNPdfpHwumoaaaSutfg7dccbWRaqogrBf6u9PfANQm9TsFca37UHhxvsq8WZdu71NQCY1V7w9NKKLbHF7MjjyCs6w2TM4Ej9Tyj8hFR4qo3MosgSbmQt298aEB3qQHVF8FshVwGg2vqAK7PNBHE7KgBgXQJiVRc4X1XZvWQt4uASvMowRECURoMZ17z2s3LnDrQYVqYedfzjJXxwsWXQkoQp51WWkFfp7QStBtfEhdUx15wtD8sjDdNrda8n3P6sNrN8J7NXxH4JPE7DzLLCjPSbn5Yc2jzomULSRiQN2yzC5qE43XiHB89VFqTHTduCFbP3Pom3uc5iBgjW9ky8LyPBMcsqQZSv99adjgbKpeaGPtJN6iUQ9mae1ddw6SBKTxZVZvqK6k7dJBjJ5UsFDyXLWkm8jogkRCFBfXPxmxyB5ihqk2wnsWNEbKEz6sg6RJqy5SR9A8r3QEx8FZt5z4DJpHyUAoi6KKVHEJfRvdjtjSDrayG2WUrBCgTTHsyGZEnuXLRXpy7XmdzFSwKSr4p7NPbAqt44yHdgjycn2MY5X1P9rneBdh4LukH3syRAarjmTSZr67QexRE4cca5fnxUZJ2zYNWRynqWmZy6aCBLBQziP81bHHbN5WP9MMseovCvzTpMso9TB3QLSRkCphJpyvv9qLN4tpFB9r9g3UGhTqqJFvxJDcLwR485AqLymM91kMjTvodniJ4coymUeE3MjGf2P67z4UiBDBxnzWbkCzmaPpkWFY9125hg9SovQrJnn9zzpF5smp7oiHhjrkzyi2G4qWVidtaWi6TipZFXwb8z6TSSjZkaj4SWexgnE2bUKeJS9P1xYwVSX39At735bqhfKCNP29n7UzX7bMwQiTWWK8bCiCpYSXfcfUpxtbYXdHgGMEZzpzawS9H5UeFiw31rS5Caps7QQJmMeetAuDa8tsiMJ9QauABLfJ4G6Hjkn5GM9jH9yXJWj2boH1U4ErVQXbr9KvmSsSsLeLLc3XeKQaczMtLroQax4D5estuP3Cy1gfqhbTsEWL2HkF7dUKDnuLmzsjv3kZXF9PMhcVR1Qj9j8KaYWYqKYV5TxXkrPrzSVa1yYEjU71A6ZYW327vgFJYFUJmx9vqTGym3yRiSoJiaYVfgf8iLwqS1EKSTMiisxE8hCHfKiew4YmiCTxPkq7pc5tHrKkogoRX7GdDnX93BsxGACu9nEbXwDZERLFLexrnRKpWDjqR2Z6CLWhXNPDJYMcUQ5rfGAhgu4ZK16q1'
  );

  static FuncIdx = class FuncIdx extends ctrt.FuncIdx {
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
  };

  static stateVar = class StateVar extends ctrt.StateVar {
    static elems = {
      ISSUER: 0,
      MAKER: 1,
      REGULATOR = 2
    };

    static _ = this.createElems();
  };

  static DBKey = class DBKey extends ctrt.DBKey {
    static forRegulator() {
      return new this(StateVar.REGULATOR.serialize());
    }

    static forIsInList(addrDe) {
      stmp = TokCtrtV2Whitelist.StateMap(
        0,addrDe
      );
      b = stmp.serialize();
      return new this(b);
    }

    static forIsUserInList(addr) {
      addrDe = de.Addr(md.Addr(addr));
      return this.forIsInList(addrDe);
    }

    static forIsCtrtInList(addr) {
      addrDe = de.CtrtAcnt(md.CtrtID(addr));
      return this.forIsInList(addrDe);
    }
  };

  async getRegulator() {
    raw_val = await this.queryDbKey(this.DBKey.forRegulator());
    return md.Addr(raw_val);
  }

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

  async isInList(DBKey) {
    data = await this.queryDbKey(DBKey);
    return data == "true";
  }

  async isUserInList(addr) {
    return await this.isInList(this.DBKey.forIsUserInList(addr));
  }

  async isCtrtInList(addr) {
    return await this.isInList(this.DBKey.forIsUserInList(addr));
  }

  async updateList(by, addrDE, val, attachment = "", fee = md.ExecCtrtFee.DEFAULT) {

    const data = await by.executeContractImpl(
      new tx.ExecCtrtFuncTxReq(
        this.ctrtId,
        FuncIdx.UPDATE_LIST,
        new de.DataStack(
          addrDE,
          new de.Bool(md.Bool(val))
        ),
        md.VSYSTimestamp.now(),
        new md.Str(attachment),
        md.ExecCtrtFee.fromNumber(fee)
      )
    );
    return data;
  }

  async updateListUser(by,addr,val, attachment = "", fee = md.ExecCtrtFee.DEFAULT) {
    userMd = md.Addr(addr);
    userMd.mustOn(by.chain);
    return await this.updateList(by, de.Addr(userMd), val, attachment, fee);
  }

  async updateListCtrt(by,addr,val, attachment = "", fee = md.ExecCtrtFee.DEFAULT) {
    ctrtMd = md.CtrtID(addr);
    return await this.updateList(by, de.CtrtAcnt(ctrtMd), val, attachment, fee);
  }

  async supersede(by, newIssuer, newRegulator, attachment = "", fee = md.ExecCtrtFee.DEFAULT) {
    issuerMd = md.Addr(newIssuer);
    issuerMd.mustOn(by.chain);
    regulatorMd = md.Addr(newRegulator);
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

 export class TokCtrtV2Blacklist extends TokCtrtV2Blacklist {
  static CTRT_META = ctrt.CtrtMeta.fromB58Str(
    '2wsw3fMnDpB5PpXoJxJeuE9RkRNzQqZrV35hBa366PhG9Sb3sPeBNeYQo8CuExtT8GpKuc84PLMsevNoodw7YGVf24PKstuzhM96H2gQoawx4BVNZwy3UFyWn156SyZakSvJPXz521p1nzactXZod1Qnn7BWYXFYCU3JFe1LGy35Sg6aXwKz6swFmBtPg1vBeQsUq1TJ5GXkDksaUYjB8ix9ScNNG8faB1mCCMWwfrcr6PyBA7YeHsTLD86zuviak6HQEQQi9kqVr4XhnDJnZyiTKGcNDo49KZyTyvkPmkFyDEhLf9DYrJM3niePqtDQ9unJj52Bku7f47hrxo83eSh3UPncyq8Hti2Ffhgb8ZFCFdnPyRDEZ1YbKFGAsJL3h3GdPFoVdnYySmnVJWrm6fVUdGgkA5ijMeqEUpXte1m7MFYCJ1wQchjebpLk3NnZzrT8FysUJVUgUzmkoSniF2UPEPXuF9cyWFWGGoZjfDWqarPMi7miqdCPQMMw4QRvSWkB3gVyeZykAvKYzXm8wYGV6HDbipZeVoyZ1UVeR6E5C4VZQmjs4GupAR9EuT5mt1ALFT4HyAMX6RCRxjeHoSgnnUJcEiRHapAYSene174RvVkRGLTtonWTYnsXUrtPD6xks4GdpQWQv89EdNWFEtmMfyVvUEFuTPGXUS5TuqYxCzg8Gor5WjPip2wDmoMYQ3wikJoRpYSfRVw88RHQPBmkHrpeHYWkAx6N7Yk4WwgBF9SVVtEWnWmPVVbuH2bQrvks4iGL8DnmEiLMs6JuFsg3a3cMHqbdvQgfu72XYKFqQzzDbDhaqFKpR3bxgMMiJvGbPuydPk9DCsG5KpqZepkkD6RGhWTQzga9G6y6ryctoGZPBHpFRwirALkksarQSEuGryhatvnjqG9U14zyW2KvJYrErMyUVy3wNK5wRqAKMjE6hFPdoH9Cn6TYQLebVTBoYTfimn5gBmgnKqBtXSfUxiwrjWujQPGxgtbNCL1RXRNRJ8nrtcpphQyRVZ8JVeubYq1zM7G1AUurEyAQi64rcbsimGptcXMAvt9TbwDjpUGRWvF6dyw1XijcukfZBQh1fG5C8peumkGnP8PemmYWKP7qsifNc44PqnNG5qYVivwtK4sz2h3B6pwneX8XNYtGSjVJCb6gJ7oDG45shocvALKNu7LwfJxXT7MPAdx7CjbHU5B3qs71wJphwkc4yWa6hHTamPTGRFGuhJa4kFfeGMctE1WZrFe47L32fKZkSxaX1sguoi5w9UPHw6udJiKPYENSSbASYpfS9q8suCs1bbq8jdMhCwoGMDZaA4MNAW1Q6sLSX6ezZ436AMbVnXZLQW8jdBaX8rvRSMJu8fdYU9PHq4MkoczxNz5jNvRiTX9jTpN1Z1P5rtgnf6XN9vzTLdqsvwZcXqvSdBwdTVgk7qn9uNjuFZEgSmA6rnPhSu6TMxJLmjKP93uqiNmXsj1NKtqBZiHjrRaUzA4pAFEyfZTdo8oaDH7umSBU2s9ff5Cruds7cYFopLm2KavHH33S7BczL7FMXAcqrESiPUzhUhHbkBKHGiCAUMVE8zxo6Eo85W2PGn6D39MaUfahEmzq8zxmrDQdmagx5EQZUev3fNCFzTzU4zpY1sra5ZPknXJkyKKfj4r9xy9Kfd8s5hsiKFyX6V1Kc2T1Ehpdkobwb7Wc8V1n1GaeL7jRgvhVg1inPaWZ3zyqNBjxnzqtLpZor3VdXLo6SikzWNahCMLNMXaoBvmJDEJUazC9qGxin7SC3YWCTAyoskJRhVMp592ehmpruu2azeCHBF2rzP6LabikVfkBSeAzGQKVeiEkU3devRNpjNM4YDXQDm9wbkPKWrqBK4SRdo44PRYG3XwNhu2gpNX8b9AuirrbRPiaJ1tJ7rzodHzLheMyUMXRB9nYx8JgrhkZzPZa4oUxo8JUNuKZnn7Ku7fEt5y'
  );
 }