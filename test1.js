'use strict';

import { NodeAPI } from './src/api.js';
import { Chain } from './src/chain.js';
import { Wallet } from './src/account.js';
import * as md from './src/model.js';
import * as pcc from './src/contract/pay_chan_ctrt.js';
import * as tok from './src/contract/tok_ctrt_no_split.js';
import * as bn from './src/utils/big_number.js';

const host = 'http://veldidina.vos.systems:9928';

const api = NodeAPI.new(host);
const ch = new Chain(api);

const seed = new md.Seed(
  'wheel explain level seven scene coach cherry mutual spread account deposit rapid clinic critic glance'
);

const wal = new Wallet(seed);
const acnt0 = wal.getAcnt(ch, 0);
const acnt1 = wal.getAcnt(ch, 1);
const addr = 'AU8h6YH5iJuwFzcUdGugUwKo2E8tbEHdtqu';
const addr1 = 'AU1KWrn3sFwddbZjfeKnauh4zAYiDTmo9gM';

// const toka = await tok.TokCtrtWithoutSplit.register(acnt0,100,1);
// console.log(toka.ctrtId.data);//CF4H5byzrrL7unvTh5Db8gdKPeUgXyjJFBq

const toka = new tok.TokCtrtWithoutSplit(
  'CF4H5byzrrL7unvTh5Db8gdKPeUgXyjJFBq',
  ch
);
const ctrtId = 'CF4H5byzrrL7unvTh5Db8gdKPeUgXyjJFBq';
const tokId = 'TWtjsSCWC4Bm512suVSsV6Pdmdgd3NuoEx7h7FMhi';
// console.log(await toka.issue(acnt0,100));

// const pc = await pcc.paymentChannelCtrt.register(acnt0,tokId);
// console.log(pc.ctrtId.data);//CEzPt2cLcdFrunLkEASbn2C1ZecACCt3zyf

// console.log(await toka.deposit(acnt0,'CEzPt2cLcdFrunLkEASbn2C1ZecACCt3zyf',100));

const pc = new pcc.paymentChannelCtrt(
  'CEzPt2cLcdFrunLkEASbn2C1ZecACCt3zyf',
  ch
);

const date = Date.now() + 1800;
// console.log(await pc.createAndLoad(acnt0,addr1,50,date));
const chanId = '6coC4EHBJvvS6wFkZz1tiN7dg84UMD81VRKy7QpPiv6p';

console.log(await pc.load(acnt0, chanId, 10));
// console.log(await pc.getChanStatus(chanId));

// const amntBN = new bn.BigNumber(10);
// const data = amntBN.times(1);

// console.log(data.isInteger());

const sig = await pc.offchainPay(acnt0.keyPair, chanId, 10);
console.log(sig);
