/**
 * atomic swap contract module provides functionalities for V Atomic Swap contract.
 * @module contract/nft_ctrt
 */

 "use strict";

 import * as ctrt from "./ctrt.js";
 import * as acnt from "../account.js";
 import * as md from "../model.js";
 import * as tx from "../tx_req.js";
 import * as de from "../data_entry.js";
 import * as hs from "../utils/hashes.js";
import base58 from "bs58";


export class AtomicCtrt extends ctrt {
  static CTRT_META = ctrt.CtrtMeta.fromB58Str(
    "4CrYZXauEHTHvUcNbU2qxvYSgdxPkSBum4PAUfytuZu7Nn56L59op72uKJUBMnF8dk8dLb5k63M9236s8S2yH4FTeWFP4zjfpkx9HGwjAuh6n6WJyxWE1S5HHH2cQLy4xk5B4iMpQKyHQwrQDn3zWwQQPsrfnwaHX1F3V2zKHKx15QYATS784BGfz9NeY72Ntdz2Cgsf6MLQE1YKdgdRfpryCwadqs5xchALCPYLNg6ECSxzPDa4XdS8ywTWzRpiajTGZA1z9YoQZiUMYBwM8S2G4ttZJkgrWTqpXuxberLv3CWZm7kp8bwvg577p8kJ7zAugTgaBU9vzSRFzi3fWtGEP1TPuMCjLSQfskepjoLXbPHyVMmvLZGbjx2AwCyGikdXBdLJWhheL6rnveiXJQfV6zfgF9zeMTpg9GE5SRstGHFetCZwfe3qCPV6vUWrobmWusQ9rDkj5uUXVpjwmBseynCnKNS1CZKDnBDy6mWBDPHNCtuDdYCamqaSEh1nx9ykk4vVJggzPJR8awFMHh5iKPRL9LGhuqbqs4rDPVsg7BCrdaszTGEBEHjfqF51K8PF9kUnPQJvGkf58MrLj2SAArizmZYcnpGMwdfYqGxrjz7xaJGZVAqvFbWFDk3x18ozp58PwFM1fdAn1dn15fKCsiQoqZBtVTxSd4GRJ2tFvBzgUJjig6hqhHqCqobCbpes8LoTdtDCHE5Co3YBnrYN19vbESu2W6LMpwrPPgd1YUeHx8AxR9evasFYrCjmnvBkEyefu5n66yTPYNXfjAk646dHmWYJiUPp1oWDXMjfDJ4xif4BXhRwBtfwgHoDhU2dMV6E7cPVppXxeVL2UsFCbqsafpNcDmhsrGEDAWmxJ3V8KymyuNugM1CHTEiwcTb7GXd4dD3UznDVoJEVrmBveETvCuGVNfGZ4zGZnURyoJHzMkDKPWFQhqgVYLoRuLg4MtquRAaSEKixtXiSJZFKZvQTzMbJC2ie3bnyQoX3x2C9pPpzp3uFKc1eGpgafgi8KoyiqiCMJvfzi8v8DiyTZ9QPENAtwToUpf6vsn1C4HhDzGb9otfigtVuh9JuzsZkJbd4r2rU8sUcKWZcaLF1uX4EdZiEfiW3aV5cm1L7oEJX2w4rQbNiFZWGUpS31WS6mYtWkSTnQupp7rggs8sQxcdWK8WamLgonF4mhXkY12Y2U9AXDJifMKr7mzxiFxZumPWxGn8A1PtTp34wcuhykNMesekwDgWGRCWca9w3YDkeinoD2QmV5ivF2GfHTKhCVH5pkGmBZczeVMA2ZTWb5DTM5qQA9vRy43aJipwmYH73ssbdF7N96678x4hsdcFXXJooRbDtuEY9UkhFPtFMjzD7D5uvXzN4qTPFSyoumwH3ag6cmZMxxQdHNJAm7vitgDpRy3HM174KpjE7uUQXtVvMKEYeAWus24vwW6M4i7APsVg6FeJTgGJJHAHFJFJ4YrZ1fmzgGFnugfp9g4hMuo9G76dzzkZetLhweJCggXBRVpNeRzQ9xmtuDN3wmiyQ1bLSx2ZtNcmWqzbSDsUnCezXtbF4CURyp2djUKo2DRza78CHpmUgHHVai8JrAxPwS6gB8mBg"
  );

  static FuncIdx = class FuncIdx extends ctrt.FuncIdx {
    static elems = {
      LOCK: 0,
      SOLVE_PUZZLE: 1,
      EXPIRE_WITHDRAW: 2,
    };
    static _ = this.createElems();
  }

  static stateVar = class StateVar extends ctrt.StateVar {
    static elems = {
      MAKER: 0,
      TOKEN_ID: 1,
    };
    static _ = this.createElems();
  }

  static stateMapIdx = class StateMapIdx extends ctrt.StateMapIdx {
    static elems = {
      CONTRACT_BALANCE: 0,
      SWAP_OWNER: 1,
      SWAP_RECIPIENT: 2,
      SWAP_PUZZLE: 3,
      SWAP_AMOUNT: 4,
      SWAP_EXPIRED_TIME: 5,
      SWAP_STATUS: 6
    };
    static _ = this.createElems();
  }

  static DBKey = class DBKey extends ctrt.DBKey {
    static forMaker() {
      return new this(StateVar.MAKER.serialize());
    }

    static forTokenID() {
      return new this(StateVar.TOKEN_ID.serialize());
    }

    static forCtrtBal(addr) {
        return this(
            StateMap(
                StateMapIdx.CONTRACT_BALANCE,
                de.Addr(md.Addr(addr))
            ).serialize()
        );
    }

    static forSwapOwner(txId) {
        return this(
            StateMap(
                StateMapIdx.SWAP_OWNER,
                de.Bytes.fromBase58Str(txId)
            ).serialize()
        );
    }

    static forSwapRcpt(txId) {
        return this(
            StateMap(
                StateMapIdx.SWAP_RECIPIENT,
                de.Bytes.fromBase58Str(txId)
            ).serialize()
        );
    }

    static forSwapPuzzle(txId) {
        return this(
            StateMap(
                StateMapIdx.SWAP_PUZZLE,
                de.Bytes.fromBase58Str(txId)
            ).serialize()
        );
    }

    static forSwapAmount(txId) {
        return this(
            StateMap(
                StateMapIdx.SWAP_AMOUNT,
                de.Bytes.fromBase58Str(txId)
            ).serialize()
        );
    }

    static forSwapExpTime(txId) {
        return this(
            StateMap(
                StateMapIdx.SWAP_EXPIRED_TIME,
                de.Bytes.fromBase58Str(txId)
            ).serialize()
        );
    }

    static forSwapStatus(txId) {
        return this(
            StateMap(
                StateMapIdx.SWAP_STATUS,
                de.Bytes.fromBase58Str(txId)
            ).serialize()
        );
    }
  };

  static async register(by, tokId, ctrtDescription, fee = md.RegCtrtFee.DEFAULT) {
    const data = await by.registerContractImpl(
      new tx.RegCtrtTxReq(
        new de.DataStack(de.TokenID(md.TokenID(tokId))),
        this.CTRT_META,
        md.VSYSTimestamp.now(),
        new md.Str(ctrtDescription),
        md.RegCtrtFee.fromNumber(fee)
      )
    );

    return new this(data["contractId"], by.chain);
  }

  async getMaker() {
    rawVal = await this.queryDbKey(this.DBKey.forMaker());
    return md.Addr(rawVal);
  }

  async getTokId() {
    rawVal = await this.queryDbKey(this.DBKey.forTokenID());
    return md.TokenID(rawVal);
  }

  async getTokCtrt() {//wait for tokCtrtFactory
    tokId = await this.getTokId();
    tok_ctrt = await 
  }

  async getUnit() {//wait for getTokCtrt
    tc = await this.getTokCtrt();
    unit = await tc.getUnit;
  }

  async getCtrtBal(addr) {
    raw_val = await this._query_db_key(this.DBKey.forCtrtBal(addr));
    unit = await this.getUnit();
    return md.Token(raw_val, unit);
  }

  async getSwapOwner(txId) {
    raw_val = await this._query_db_key(this.DBKey.forSwapOwner(txId));
    return md.Addr(raw_val);
  }

  async getSwapRcpt(txId) {
    raw_val = await this._query_db_key(this.DBKey.forSwapRcpt(txId));
    return md.Addr(raw_val);
  }

  async getSwapPuzzle(txId) {
    raw_val = await this._query_db_key(this.DBKey.forSwapPuzzle(txId));
    return raw_val
  }

  async getSwapAmnt(txId) {
    raw_val = await this._query_db_key(this.DBKey.forSwapAmnt(txId));
    unit = await this.getUnit();
    return md.Token(raw_val,unit);
  }

  async getSwapExpTime(txId) {
    raw_val = await this._query_db_key(this.DBKey.forSwapExpTime(txId));
    return md.VSYSTimestamp(raw_val);
  }

  async makerLock(
    by,
    amount,
    recipient,
    secret,
    expireTime,
    attachment = "",
    fee = md.ExecCtrtFee.DEFAULT
  ) {
    puzzleBytes = hs.sha256Hash(Buffer.from(secret,'latin1'));

    unit = await this.getUnit();

    const data = await by.executeContractImpl(
      new tx.ExecCtrtFuncTxReq(
        this.ctrtId,
        FuncIdx.ISSUE,
        new de.DataStack(
          de.Amount.for_tok_amount(amount, unit),
          de.Addr(md.Addr(recipient)),
          de.Bytes(md.Bytes(puzzle_bytes)),
          de.Timestamp(md.VSYSTimestamp.fromUnixTs(int(expireTime))),
        ),
        md.VSYSTimestamp.now(),
        new md.Str(attachment),
        md.ExecCtrtFee.fromNumber(fee)
      )
    );
    return data;
  }

  async takerLock(
    by,
    amount,
    makerSwapCtrtId,
    recipient,
    makerLockTxId,
    expireTime,
    attachment = "",
    fee = md.ExecCtrtFee.DEFAULT
  ) {
    puzzleDBKey = this.DBKey.forSwapPuzzle(makerLockTxId);
    data = await this.chain.api.ctrt.getCtrtData(
      makerSwapCtrtId,puzzleDBKey.b58Str
      );

    hashSecretB58str = data["value"];
    puzzleBytes = base58.decode(hashSecretB58str);

    unit = await this.getUnit();

    const data = await by.executeContractImpl(
      new tx.ExecCtrtFuncTxReq(
        this.ctrtId,
        FuncIdx.ISSUE,
        new de.DataStack(
          de.Amount.for_tok_amount(amount, unit),
          de.Addr(md.Addr(recipient)),
          de.Bytes(md.Bytes(puzzleBytes)),
          de.Timestamp(md.VSYSTimestamp.fromUnixTs(expireTime)),
        ),
        md.VSYSTimestamp.now(),
        new md.Str(attachment),
        md.ExecCtrtFee.fromNumber(fee)
      )
    );
    return data;
  }

  async makerSolve(
    by,
    taker_ctrt_id,
    tx_id,
    secret,
    attachment = "",
    fee = md.ExecCtrtFee.DEFAULT
  ) {

    const data = await by.executeContractImpl(
      new tx.ExecCtrtFuncTxReq(
        taker_ctrt_id,
        FuncIdx.ISSUE,
        new de.DataStack(
          de.Bytes.fromBase58Str(tx_id),
          de.Bytes.fromStr(secret),
        ),
        md.VSYSTimestamp.now(),
        new md.Str(attachment),
        md.ExecCtrtFee.fromNumber(fee)
      )
    );
    return data;
  }

  async takerSolve(
    by,
    maker_ctrt_id,
    maker_lock_tx_id,
    maker_solve_tx_id,
    attachment = "",
    fee = md.ExecCtrtFee.DEFAULT
  ) {
    dictData = await by.chain.api.tx.getInfo(maker_solve_tx_id);
    funcData = dictData["functionData"];
    ds = de.DataStack.deserialize(base58.decode(funcData));
    revealedSecret = ds.entries[1].data.data.decode();

    const data = await by.executeContractImpl(
      new tx.ExecCtrtFuncTxReq(
        maker_ctrt_id,
        FuncIdx.ISSUE,
        new de.DataStack(
          de.Bytes.fromBase58Str(maker_lock_tx_id),
          de.Bytes.fromStr(revealedSecret),
        ),
        md.VSYSTimestamp.now(),
        new md.Str(attachment),
        md.ExecCtrtFee.fromNumber(fee)
      )
    );
    return data;
  }

  async expWithdraw(
    by,
    tx_id,
    attachment = "",
    fee = md.ExecCtrtFee.DEFAULT
  ) {

    const data = await by.executeContractImpl(
      new tx.ExecCtrtFuncTxReq(
        this.ctrtId,
        FuncIdx.ISSUE,
        new de.DataStack(de.Bytes.fromStr(tx_id)),
        md.VSYSTimestamp.now(),
        new md.Str(attachment),
        md.ExecCtrtFee.fromNumber(fee)
      )
    );
    return data;
  }
}