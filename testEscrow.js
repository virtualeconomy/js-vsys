'use strict';

import { NodeAPI } from './src/api.js';
import { Chain } from './src/chain.js';
import { Wallet } from './src/account.js';
import * as md from './src/model.js';
import * as tok from './src/contract/v_escrow_ctrt.js';
import * as tok1 from './src/contract/tok_ctrt_no_split.js';
import * as ss from './src/contract/v_stable_swap_ctrt.js';

const host = 'http://veldidina.vos.systems:9928';
const api = NodeAPI.new(host);
const ch = new Chain(api);
// const seed = new md.Seed(
//     'badge lazy duty lunar sister tank save movie review steel emerge exchange churn replace leopard'
// );
// const wal = new Wallet(seed);
// const acnt0 = wal.getAcnt(ch, 0);
// const acnt1 = wal.getAcnt(ch, 1);
// const acnt2 = wal.getAcnt(ch, 2);

const ec = new ss.StableSwapCtrt('CEzip4FF5yJMJkmVQQ2UHoQfWiDGKy93kxF',ch);
console.log(await ec.getOrderOwner("JChwB1yFyFMUjSLCruuTDHVPWHWqvYvQBkFkinnmRmvY"));