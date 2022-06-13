# V Swap Contract

- [Payment Channel Contract](#payment-channel-contract)
  - [Introduction](#introduction)
  - [Usage with Javascript SDK](#usage-with-javascript-sdk)
    - [Registration](#registration)
    - [From Existing Contract](#from-existing-contract)
    - [Querying](#querying)
      - [Maker](#maker)
      - [Token A's id](#token-A's-id)
      - [Token B's id](#token-B's-id)
      - [Liquidity token's id](#Liquidity_token's-id)
      - [Swap status](#Swap-status)
      - [Minimum liquidity](#Minimum-liquidity)
      - [Token A reserved](#Token-A-reserved)
      - [Token B reserved](#Token-B-reserved)
      - [Total supply](#Total-supply)
      - [Liquidity token left](#Liquidity-token-left)
      - [Token A's balance](#Token-A's-balance)
      - [Token B's balance](#Token-B's-balance)
      - [Liquidity's balance](#Liquidity's-balance)
    - [Actions](#actions)
      - [Supersede](#Supersede)
      - [Set swap](#Set-swap)
      - [Add Liquidity](#Add-Liquidity)
      - [Remove liquidity](#Remove-liquidity)
      - [Swap token for exact base token](#Swap-token-for-exact-base-token)
      - [Swap exact token for base token](#Swap-exact-token-for-base-token)
      - [Swap token for exact target token](#Swap-token-for-exact-target-token)
      - [Swap exact token for target token](#Swap-exact-token-for-base-token)


## Introduction

V Swap is an automated market making protocol. Prices are regulated by a constant product formula, and requires no action from the liquidity provider to maintain prices.

The contract allows completely decentralised exchanges to be formed, and allows anyone to be a liquidity provider as long as they have tokens on both sides of the swap.

## Usage with Javascript SDK

### Registration

`tokId` is the token id of the token that deposited into this V Swap contract.

For testing purpose, you can create a new [token contract]() , then [issue]() some tokens and [deposit]() into the V Swap contract.

```javascript
import * as sp from './src/contract/v_swap_ctrt.js';

// acnt: Account
// tokAId: string
// tokBId: string
// liqTokId: string
// minLiq: number

// Register a new V Swap contract
const nc = await sp.VSwapCtrt.register(
    acnt, // by
    tokAId, // tokAId
    tokBId, // tokBId
    liqTokId, // liqTokId
    50 // minLiq
);
console.log(nc.ctrtId); // print the id of the newly registered contract
```

Example output

```
CtrtID { data: 'CFFCYjeGokKuDfAZAeSS5jdvfwc7imzB4Sk' }
```

### From Existing Contract

ncId is the V Swap contract's id.

```javascript
import * as sp from './src/contract/v_swap_ctrt.js';

// ch: Chain
// ncId: string

const ncId = "CFFCYjeGokKuDfAZAeSS5jdvfwc7imzB4Sk";
const nc = new sp.VSwapCtrt(ncId, ch);
```

### Querying

#### Maker

The address that made this V Swap contract instance.

```javascript
// nc: VSwapCtrt

console.log(await nc.getMaker());
```

Example output

```
Addr { data: 'ATse3RcjEzwc5JHDPcduPYe4qA2mWhSNZaV' }
```

#### Token A's id

The token A's id.

```javascript
// nc: VSwapCtrt

console.log(await nc.getTokAId());
```

Example output

```
TokenID { data: 'TWsrgLbsjgaZCXH6Kb356EJvf2nHEyAoNPpggjBKw' }
```

#### Token B's id

The token B's id.

```javascript
// nc: VSwapCtrt

console.log(await nc.getTokBId());
```

Example output

```
TokenID { data: 'TWu7afhhWt6jpxx2N9D5374owXmvUYvA7k3EyYQBD' }
```

#### Liquidity token's id

The liquidity token's id.

```javascript
// nc: VSwapCtrt

console.log(await nc.getLiqTokId());
```

Example output

```
TokenID { data: 'TWu7afhhWt6jpxx2N9D5374owXmvUYvA7k3EyYQBD' }
```

#### Swap status

The swap status of whether or not the swap is currently active. 

```javascript
// nc: VSwapCtrt

console.log(await nc.getSwapStatus());
```

Example output

```
true
```

#### Minimum liquidity

The minimum liquidity for the pool. This liquidity cannot be withdrawn.

```javascript
// nc: VSwapCtrt

const amt = await nc.getMinLiq();
console.log(amt);
console.log(amt.data.toNumber());
```

Example output

```
Token { data: BigNumber { s: 1, e: 2, c: [ 200 ] }, unit: 100 }
200
```

#### Token A reserved

The amount of token A inside the pool.

```javascript
// nc: VSwapCtrt

const amt = await nc.getTokARes();
console.log(amt);
console.log(amt.data.toNumber());
```

Example output

```
Token { data: BigNumber { s: 1, e: 0, c: [ 0 ] }, unit: 100 }
0
```

#### Token B reserved

the amount of token B inside the pool.

```javascript
// nc: VSwapCtrt

const amt = await nc.getTokBRes();
console.log(amt);
console.log(amt.data.toNumber());
```

Example output

```
Token { data: BigNumber { s: 1, e: 0, c: [ 0 ] }, unit: 100 }
0
```

#### Total supply

The total amount of liquidity tokens that can be minted.

```javascript
// nc: VSwapCtrt

const amt = await nc.getTotalSupply();
console.log(amt);
console.log(amt.data.toNumber());
```

Example output

```
Token { data: BigNumber { s: 1, e: 2, c: [ 300 ] }, unit: 100 }
300
```

#### Liquidity token left

The amount of liquidity tokens left to be minted.

```javascript
// nc: VSwapCtrt
// chanId: string

const amt = await nc.getLiqTokLeft();
console.log(amt);
console.log(amt.data.toNumber());
```

Example output

```
Token { data: BigNumber { s: 1, e: 2, c: [ 100 ] }, unit: 100 }
100
```

#### Token A's balance

The balance of token A stored within the contract belonging to the given user address.

```javascript
// nc: VSwapCtrt
// acnt: Account

const amt = await nc.getTokABal(acnt.addr.data);
console.log(amt);
console.log(amt.data.toNumber());
```

Example output

```
Token { data: BigNumber { s: 1, e: 3, c: [ 1000 ] }, unit: 100 }
1000
```

#### Token B's balance

The balance of token B stored within the contract belonging to the given user address.

```javascript
// nc: VSwapCtrt
// acnt: Account

const amt = await nc.getTokBBal(acnt.addr.data);
console.log(amt);
console.log(amt.data.toNumber());
```

Example output

```
Token { data: BigNumber { s: 1, e: 3, c: [ 1000 ] }, unit: 100 }
1000
```

#### Liquidity's balance

The balance of liquidity token stored within the contract belonging to the given user address.

```javascript
// nc: VSwapCtrt
// acnt: Account

const amt = await nc.getLiqTokBal(acnt.addr.data);
console.log(amt);
console.log(amt.data.toNumber());
```

Example output

```
Token { data: BigNumber { s: 1, e: 3, c: [ 1000 ] }, unit: 100 }
1000
```

### Actions

#### Supersede

Transfer the contract rights of the contract to a new account.

```javascript
import * as sp from './src/contract/v_swap_ctrt.js';

// acnt0: Account
// acnt1: Account

const resp = await nc.supersede(acnt0, acnt1.addr.data);
console.log(resp);
```

Example output

```
{
  type: 9,
  id: '5sgMZLVMm3uDVAKe6d4oWyCZbcNqaNphrpYAJGUnkef9',
  fee: 30000000,
  feeScale: 100,
  timestamp: 1654760835226000000,
  proofs: [
    {
      proofType: 'Curve25519',
      publicKey: 'FwuW4LhiBFn6uu5id9nZGtp9o1RUG3DoX5MhyZibrjkE',
      address: 'ATse3RcjEzwc5JHDPcduPYe4qA2mWhSNZaV',
      signature: '3ZqCwhXxcG9hGvJ3Qo3ThNzaeAMZLHzK5vTqUFKY9R4RQMJBMKFS82amDkKrii8v8u6wwiQiop4yVppXespXvfmp'
    }
  ],
  contractId: 'CFFCYjeGokKuDfAZAeSS5jdvfwc7imzB4Sk',
  functionIndex: 0,
  functionData: '1bscuQUYkKxix6tJGrWaSXbXzTYAxGAhLZhMZC',
  attachment: ''
}
```

#### Set swap

Create a swap and deposit initial amounts into the pool.

```javascript
import * as sp from './src/contract/v_swap_ctrt.js';

// acnt: Account
// amountA: number
// amountB: number

const resp = await nc.setSwap(
    acnt, // by
    amountA, // amountA
    amountB // amountB
);
console.log(resp);
```

Example output

```
{
   "type":9,
   "id":"HkkPF9aZgZPW9zcZuUQMKuaNbCD8XcbdWpkjdnyCC2bj",
   "fee":30000000,
   "feeScale":100,
   "timestamp":1646750242564954880,
   "proofs":[
      {
         "proofType":"Curve25519",
         "publicKey":"AGy4ASY2CmVPSjQX4rNHrSHmcYAL4DNBawdyKT7p8vot",
         "address":"AU8h6YH5iJuwFzcUdGugUwKo2E8tbEHdtqu",
         "signature":"4kLMY15QJBfoiSvnCKzA6BRrco2NBA6vPVk5FJ9UmwCJimQ7dfV76PjxpaPMavz8CeRsTYFT25ap92YasJtzaCKD"
      }
   ],
   "contractId":"CF5XanD64XpzMZPoaMZ1svYrAriaqsUDeSb",
   "functionIndex":1,
   "functionData":"1NMvHJqnrtUFrg5Y9jz2PsmaMV",
   "attachment":""
}
```

#### Add Liquidity

Adds liquidity to the pool. The final added amount of token A & B will be in the same proportion as the pool at that moment as the liquidity provider shouldn't change the price of the token while the price is determined by the ratio between A & B.

```javascript
import * as sp from './src/contract/v_swap_ctrt.js';

// acnt: Account
// amountA: number
// amountB: number
// amountAMin: number
// amountBMin: number
// deadline: number

const resp = await nc.addLiquidity(
    acnt, // by
    amountA, // amountA
    amountB, // amountB
    amountAMin, // amountAMin
    amountBMin, // amountBMin
    600 // deadline
);
console.log(resp);
```

Example output

```
{
   "type":9,
   "id":"9qPbSARZNbRPejXturjFD8oqSMG4Fi5Y99fqHadDX9cw",
   "fee":30000000,
   "feeScale":100,
   "timestamp":1646750678165733888,
   "proofs":[
      {
         "proofType":"Curve25519",
         "publicKey":"AGy4ASY2CmVPSjQX4rNHrSHmcYAL4DNBawdyKT7p8vot",
         "address":"AU8h6YH5iJuwFzcUdGugUwKo2E8tbEHdtqu",
         "signature":"3iX53Tom7zBkmC3D5Jv7vbVGZDoxbGLbK6CXLnwLioUV9tEL8Hp95HPP5YZ89ZbTwoFQNarYZfdYEUhuN2EihZ2R"
      }
   ],
   "contractId":"CF5XanD64XpzMZPoaMZ1svYrAriaqsUDeSb",
   "functionIndex":2,
   "functionData":"1YkDihBAK4EBxo5ZQLxHEYePHibL6E3zZwTp3niNCCgSf5uXiFVUxBCcYyAdJUF",
   "attachment":""
}
```

#### Remove liquidity

Remove liquidity from the pool by redeeming token A & B with liquidity tokens.

```javascript
import * as sp from './src/contract/v_swap_ctrt.js';

// acnt: Account
// amountLiq: number
// amountAMin: number
// amountBMin: number
// deadline: number

const resp = await nc.removeLiquidity(
    acnt, // by
    amountLiq, // amountLiq
    amountAMin, // amountAMin
    amountBMin, // amountBMin
    600 // deadline
);
console.log(resp);
```

Example output

```
{
   "type":9,
   "id":"4N3KrtBjcfjhWw17jaQChge28j8K5sBYJ3bBcGa6m1GZ",
   "fee":30000000,
   "feeScale":100,
   "timestamp":1646751831698266112,
   "proofs":[
      {
         "proofType":"Curve25519",
         "publicKey":"AGy4ASY2CmVPSjQX4rNHrSHmcYAL4DNBawdyKT7p8vot",
         "address":"AU8h6YH5iJuwFzcUdGugUwKo2E8tbEHdtqu",
         "signature":"3LVKU382LmBNdtNuvBLch6NVDN49w4V4oQuvj2d5VzmEP61HcQVU8JCVuC9Yq91gV8xr52ksUBvYsmYrXYVhC9Dy"
      }
   ],
   "contractId":"CF5XanD64XpzMZPoaMZ1svYrAriaqsUDeSb",
   "functionIndex":3,
   "functionData":"18oJLXPeLXM58Dy52J6Vf6vXv2ThDMNHffq2iLUxWtkAGL1YKeX",
   "attachment":""
}
```

#### Swap token for exact base token

Swap token B for token A where the desired amount of token A is fixed.

```javascript
import * as sp from './src/contract/v_swap_ctrt.js';

// acnt: Account
// amountA: number
// amountBMax: number
// deadline: number

const resp = await nc.swapBForExactA(
    acnt, // by
    amountA, // amountA
    amountBMax, // amountBMax
    600 // deadline
);
console.log(resp);
```

Example output

```
{
   "type":9,
   "id":"GyFxdveSBubqSC1ecFqggKMajd5YxJhRgWCVZYmLpdgt",
   "fee":30000000,
   "feeScale":100,
   "timestamp":1646751159738810112,
   "proofs":[
      {
         "proofType":"Curve25519",
         "publicKey":"AGy4ASY2CmVPSjQX4rNHrSHmcYAL4DNBawdyKT7p8vot",
         "address":"AU8h6YH5iJuwFzcUdGugUwKo2E8tbEHdtqu",
         "signature":"4yusBVpfWFvJeJDaUp5K61c2rfsVfaQ75kzJyz3GA4a8BrUiFP7Vhh8QMSqFkwM8cN1n16EiKwxHzA4XBpdUuUtY"
      }
   ],
   "contractId":"CF5XanD64XpzMZPoaMZ1svYrAriaqsUDeSb",
   "functionIndex":4,
   "functionData":"12oCrKY2h2JDrHSpggsjRgLgWhBWn6hzfVbqTrX",
   "attachment":""
}
```

####  Swap exact token for base token

Swap token B for token A where the amount of token B to pay is fixed.

```javascript
import * as sp from './src/contract/v_swap_ctrt.js';

// acnt: Account
// amountAMin: number
// amountB: number
// deadline: number

const resp = await nc.swapExactBForA(
    acnt, // by
    amountAMin, // amountAMin 
    amountB, // amountB
    600 // deadline
);
console.log(resp);
```

Example output

```
{
   "type":9,
   "id":"BwgqHZ16GKotSJLHUDUyRghk7yX8CjTNiXYif3T1pc1t",
   "fee":30000000,
   "feeScale":100,
   "timestamp":1646751699139240960,
   "proofs":[
      {
         "proofType":"Curve25519",
         "publicKey":"AGy4ASY2CmVPSjQX4rNHrSHmcYAL4DNBawdyKT7p8vot",
         "address":"AU8h6YH5iJuwFzcUdGugUwKo2E8tbEHdtqu",
         "signature":"242YDuBKjo2x48JMxjMCNKAw2xg6PttQckjTFXZNv97wX5BmvnjHvrBwoFyk5ckopVwLaEGMWXS4h8wxRQbCe2gR"
      }
   ],
   "contractId":"CF5XanD64XpzMZPoaMZ1svYrAriaqsUDeSb",
   "functionIndex":5,
   "functionData":"12oCrKY2h2JDrHSpggsjRgLgWhBWn6hzuhr9shR",
   "attachment":""
}
```

#### Swap token for exact target token

Swap token A for token B where the desired amount of token B is fixed.

```javascript
import * as sp from './src/contract/v_swap_ctrt.js';

// acnt: Account
// amountB: number
// amountAMax: number
// deadline: number

const resp = nc.swapAForExactB(
    acnt, // by
    amountB, // amountB
    amountAMax, // amountAMax
    600 // deadline
);
console.log(resp);
```

Example output

```
{
   "type":9,
   "id":"GP7ve9jRGBbvdVqNE1GFRdmKvSJyXA6LcgUkeBTy22xe",
   "fee":30000000,
   "feeScale":100,
   "timestamp":1646751738105092096,
   "proofs":[
      {
         "proofType":"Curve25519",
         "publicKey":"AGy4ASY2CmVPSjQX4rNHrSHmcYAL4DNBawdyKT7p8vot",
         "address":"AU8h6YH5iJuwFzcUdGugUwKo2E8tbEHdtqu",
         "signature":"4uVAaJnCjm1zRpuvtJ5CaiECMSGb8die2EBE5Q47FUPMKyniNoWFjWd1RpzvuRegpWe1v9vTuA8z48mGwxWDf6FV"
      }
   ],
   "contractId":"CF5XanD64XpzMZPoaMZ1svYrAriaqsUDeSb",
   "functionIndex":6,
   "functionData":"12oCrKY2h2JDrHSpggsjRgLgWhBWn6hzvgDiYdu",
   "attachment":""
}
```

#### Swap exact token for target token

Swap token B for token B where the amount of token A to pay is fixed.

```javascript
import * as sp from './src/contract/v_swap_ctrt.js';

// acnt: Account
// amountBMin: number
// amountA: number
// deadline: number

const resp = await nc.swapExactAForB(
    acnt, // by
    amountBMin, // amountBMin 
    amountA, // amountA
    600 // deadline
);
console.log(resp);
```

Example output

```
{
   "type":9,
   "id":"3hUtP18hEDrrhgJC11e6hjrZ37iffKiGi86JG5B2kxFH",
   "fee":30000000,
   "feeScale":100,
   "timestamp":1646751751630425088,
   "proofs":[
      {
         "proofType":"Curve25519",
         "publicKey":"AGy4ASY2CmVPSjQX4rNHrSHmcYAL4DNBawdyKT7p8vot",
         "address":"AU8h6YH5iJuwFzcUdGugUwKo2E8tbEHdtqu",
         "signature":"2mQ4hTAc692dLxYB631mN3rbKDGEn1QmWD1dZRaDTt9Vorumo51PLmPX889ngYTmVXeKyGbeGZGsmcGPxfyVn2xb"
      }
   ],
   "contractId":"CF5XanD64XpzMZPoaMZ1svYrAriaqsUDeSb",
   "functionIndex":7,
   "functionData":"12oCrKY2h2JDrHSpggsjRgLgWhBWn6hzw3YrCtF",
   "attachment":""
}
```