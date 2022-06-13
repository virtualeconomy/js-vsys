# V Stable Swap Contract

- [V Stable Swap Contract](#v-stable-swap-contract)
  - [Introduction](#introduction)
  - [Usage with Javascript SDK](#usage-with-javascript-sdk)
    - [Registration](#registration)
    - [From Existing Contract](#from-existing-contract)
    - [Querying](#querying)
      - [Maker](#maker)
      - [Base Token ID](#base-token-id)
      - [Target Token ID](#target-token-id)
      - [Base Token Contract](#base-token-contract)
      - [Target Token Contract](#target-token-contract)
      - [Base Token Unit](#base-token-unit)
      - [Target Token Unit](#target-token-unit)
      - [Max Order Limit Per User](#max-order-limit-per-user)
      - [Unit of Price of Base Token](#unit-of-price-of-base-token)
      - [Unit of Price of Target Token](#unit-of-price-of-target-token)
      - [Base Token Balance](#base-token-balance)
      - [Target Token Balance](#target-token-balance)
      - [User Orders](#user-orders)
      - [Order Owner](#order-owner)
      - [Base Token Fee](#base-token-fee)
      - [Target Token Fee](#target-token-fee)
      - [Base Token Minimum Trading Amount](#base-token-minimum-trading-amount)
      - [Base Token Maximum Trading Amount](#base-token-maximum-trading-amount)
      - [Target Token Minimum Trading Amount](#target-token-minimum-trading-amount)
      - [Target Token Maximum Trading Amount](#target-token-maximum-trading-amount)
      - [Base Token Price](#base-token-price)
      - [Target Token Price](#target-token-price)
      - [Base Token Locked Amount](#base-token-locked-amount)
      - [Target Token Locked Amount](#target-token-locked-amount)
      - [Order Status](#order-status)
    - [Actions](#actions)
      - [Supersede](#supersede)
      - [Set Order](#set-order)
      - [Update Order](#update-order)
      - [Deposit to Order](#deposit-to-order)
      - [Withdraw from Order](#withdraw-from-order)
      - [Close Order](#close-order)
      - [Swap Base Tokens to Target Tokens](#swap-base-tokens-to-target-tokens)
      - [Swap Target Tokens to Base Tokens](#swap-target-tokens-to-base-tokens)

## Introduction
The V Stable Swap contract supports creating a liquidity pool of 2 kinds of tokens for exchange on VSYS. The fee is fixed.

The order created in the contract acts like a liquidity pool for two kinds of tokens(i.e. the base token & the target token). Traders are free to take either side of the trade(i.e. base to target or target to base).

The V Stable Swap contract can accept any type of token in the VSYS blockchain, including option tokens created through the V Option Contract.

## Usage with Javascript SDK

### Registration
Register a contract instance.

```javascript
import * as vss from './src/contract/v_stable_swap_ctrt.js';
// acnt: Account
// baseTokId: string E.g. "TWssXmoLvyB3ssAaJiKk5d7ambFHBxcmr9sMRtPLa"
// targetTokId: string E.g. "TWtoBbmn5UgQd9KgtbWkBY96hiUJWzeTTggGrb8ba"

const scc = await vss.StableSwapCtrt.register(
    acnt,
    baseTokId,
    targetTokId,
    5, // maxOrderPerUser
    1, // basePriceUnit
    1 // targetPriceUnit
);
console.log(scc.ctrtId);     
```
Example output

```
CtrtID { data: 'CF1LQZ5U2S1WiXHbVdY8CwKjhqC1kF8GZwt' }
```

### From Existing Contract
Get an object for an existing contract instance.

```javascript
import * as vss from './src/contract/v_stable_swap_ctrt.js';

// ch: Chain

const sccId = "CF1LQZ5U2S1WiXHbVdY8CwKjhqC1kF8GZwt";
const scc = new vss.StableSwapCtrt(sccId, ch);
```

### Querying

#### Maker
The address that made this contract instance.

```javascript
// ssc: VStableSwapCtrt

console.log(await scc.getMaker());
```

Example output

```
Addr { data: 'ATse3RcjEzwc5JHDPcduPYe4qA2mWhSNZaV' }
```

#### Base Token ID
The token ID of the base token in the contract instance.

```javascript
// ssc: VStableSwapCtrt

console.log(await scc.getBaseTokId());
```
Example output

```
TokenID { data: 'TWssXmoLvyB3ssAaJiKk5d7ambFHBxcmr9sMRtPLa' }
```

#### Target Token ID
The token ID of the target token in the contract instance.

```javascript
// ssc: VStableSwapCtrt

console.log(await scc.getTargetTokId());
```
Example output

```
TokenID { data: 'TWtoBbmn5UgQd9KgtbWkBY96hiUJWzeTTggGrb8ba' }
```

#### Base Token Contract
The token contract object of the base token in the contract instance.

```javascript
// ssc: VStableSwapCtrt

console.log(await scc.getBaseTokCtrt());
```
Example output

```
TokCtrtWithoutSplit {
  ctrtId: CtrtID { data: 'CEvau1VzdNumioqo7xNwstZtn5MxUWtp6HM' },
  chain: Chain {
    api: NodeAPI {
      sess: [Session],
      blocks: [Blocks],
      tx: [Transactions],
      utils: [Utils],
      addr: [Addresses],
      ctrt: [Contract],
      vsys: [VSYS]
    },
    chainId: ChainID { key: 'TEST_NET', val: 'T' }
  },
  FUNIDX_CLS: [class FuncIdx extends FuncIdx] {
    elems: {
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
      GEISSUER: 10
    },
    SUPERSEDE: FuncIdx { key: 'SUPERSEDE', val: 0 },
    ISSUE: FuncIdx { key: 'ISSUE', val: 1 },
    DESTROY: FuncIdx { key: 'DESTROY', val: 2 },
    SEND: FuncIdx { key: 'SEND', val: 3 },
    TRANSFER: FuncIdx { key: 'TRANSFER', val: 4 },
    DEPOSIT: FuncIdx { key: 'DEPOSIT', val: 5 },
    WITHDRAW: FuncIdx { key: 'WITHDRAW', val: 6 },
    TOTAL_SUPPLY: FuncIdx { key: 'TOTAL_SUPPLY', val: 7 },
    MAX_SUPPLY: FuncIdx { key: 'MAX_SUPPLY', val: 8 },
    BALANCE_OF: FuncIdx { key: 'BALANCE_OF', val: 9 },
    GEISSUER: FuncIdx { key: 'GEISSUER', val: 10 },
    _: undefined
  },
  _tokId: undefined,
  _unit: 0
}
```

#### Target Token Contract
The token contract object of the target token in the contract instance.

```javascript
// ssc: VStableSwapCtrt

console.log(await scc.getTargetTokCtrt());
```
Example output

```
TokCtrtWithoutSplit {
  ctrtId: CtrtID { data: 'CF4nSsRa8KvgNYeaVwjmeHaCAf7gLk6KRvH' },
  chain: Chain {
    api: NodeAPI {
      sess: [Session],
      blocks: [Blocks],
      tx: [Transactions],
      utils: [Utils],
      addr: [Addresses],
      ctrt: [Contract],
      vsys: [VSYS]
    },
    chainId: ChainID { key: 'TEST_NET', val: 'T' }
  },
  FUNIDX_CLS: [class FuncIdx extends FuncIdx] {
    elems: {
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
      GEISSUER: 10
    },
    SUPERSEDE: FuncIdx { key: 'SUPERSEDE', val: 0 },
    ISSUE: FuncIdx { key: 'ISSUE', val: 1 },
    DESTROY: FuncIdx { key: 'DESTROY', val: 2 },
    SEND: FuncIdx { key: 'SEND', val: 3 },
    TRANSFER: FuncIdx { key: 'TRANSFER', val: 4 },
    DEPOSIT: FuncIdx { key: 'DEPOSIT', val: 5 },
    WITHDRAW: FuncIdx { key: 'WITHDRAW', val: 6 },
    TOTAL_SUPPLY: FuncIdx { key: 'TOTAL_SUPPLY', val: 7 },
    MAX_SUPPLY: FuncIdx { key: 'MAX_SUPPLY', val: 8 },
    BALANCE_OF: FuncIdx { key: 'BALANCE_OF', val: 9 },
    GEISSUER: FuncIdx { key: 'GEISSUER', val: 10 },
    _: undefined
  },
  _tokId: undefined,
  _unit: 0
}
```

#### Base Token Unit
The unit of the base token in the contract instance.

```javascript
// ssc: VStableSwapCtrt

console.log(await scc.getBaseTokUnit());
```
Example output

```
100
```

#### Target Token Unit
The unit of the target token in the contract instance.

```javascript
// ssc: VStableSwapCtrt

console.log(await scc.getTargetTokUnit());
```
Example output

```
100
```

#### Max Order Limit Per User
The maximum number of orders each user can create.

```javascript
// ssc: VStableSwapCtrt

console.log(await scc.getMaxOrderPerUser());
```
Example output

```
5
```

#### Unit of Price of Base Token
The unit of price of base token(i.e. how many target tokens are required to get one base token).

```javascript
// ssc: VStableSwapCtrt

console.log(await scc.getBasePriceUnit());
```
Example output

```
1
```

#### Unit of Price of Target Token
The unit of price of target token(i.e. how many base tokens are required to get one target token).

```javascript
// ssc: VStableSwapCtrt

console.log(await scc.getBasePriceUnit());
```
Example output

```
1
```

#### Base Token Balance
Get the base token balance of the given user.

```javascript
// ssc: VStableSwapCtrt
// acnt: Account

const bal = await scc.getBaseTokBal(acnt.addr.data);
console.log(bal);
console.log(bal.data.toNumber());
```
Example output

```
Token { data: BigNumber { s: 1, e: 0, c: [ 0 ] }, unit: 100 }
0
```

#### Target Token Balance
Get the target token balance of the given user.

```javascript
// ssc: VStableSwapCtrt
// acnt: Account

const bal = await scc.getTargetTokBal(acnt.addr.data);
console.log(bal);
console.log(bal.data.toNumber());
```
Example output

```
Token { data: BigNumber { s: 1, e: 0, c: [ 0 ] }, unit: 100 }
0
```

#### User Orders
Get the number of orders the user has made.

```javascript
// ssc: VStableSwapCtrt
// acnt: Account


console.log(await scc.getUserOrders(acnt.addr.data));
```
Example output

```
0
```

#### Order Owner
Get the owner of the order.

```javascript
// ssc: VStableSwapCtrt
// orderId: string E.g. "JChwB1yFyFMUjSLCruuTDHVPWHWqvYvQBkFkinnmRmvY"

console.log(await scc.getOrderOwner(orderId));
```
Example output

```
Addr { data: 'ATse3RcjEzwc5JHDPcduPYe4qA2mWhSNZaV' }
```

#### Base Token Fee
Get the fee for trading base token in the given order.

```javascript
// ssc: VStableSwapCtrt
// orderId: string E.g. "JChwB1yFyFMUjSLCruuTDHVPWHWqvYvQBkFkinnmRmvY"

const bal = await scc.getFeeBase(orderId);
console.log(bal);
console.log(bal.data.toNumber());
```
Example output

```
Token { data: BigNumber { s: 1, e: 0, c: [ 100 ] }, unit: 100 }
100
```

#### Target Token Fee
Get the fee for trading target token in the given order.

```javascript
// ssc: VStableSwapCtrt
// orderId: string E.g. "JChwB1yFyFMUjSLCruuTDHVPWHWqvYvQBkFkinnmRmvY"

const bal = await scc.getFeeTarget(orderId);
console.log(bal);
console.log(bal.data.toNumber());
```
Example output

```
Token { data: BigNumber { s: 1, e: 0, c: [ 100 ] }, unit: 100 }
100
```

#### Base Token Minimum Trading Amount
Get the minimum trading amount for base token in the given order.

```javascript
// ssc: VStableSwapCtrt
// orderId: string E.g. "JChwB1yFyFMUjSLCruuTDHVPWHWqvYvQBkFkinnmRmvY"

const bal = await scc.getMinBase(orderId);
console.log(bal);
console.log(bal.data.toNumber());
```
Example output

```
Token { data: BigNumber { s: 1, e: 0, c: [ 100 ] }, unit: 100 }
100
```

#### Base Token Maximum Trading Amount
Get the maximum trading amount for base token in the given order.

```javascript
// ssc: VStableSwapCtrt
// orderId: string E.g. "JChwB1yFyFMUjSLCruuTDHVPWHWqvYvQBkFkinnmRmvY"

const bal = await scc.getMaxBase(orderId);
console.log(bal);
console.log(bal.data.toNumber());
```
Example output

```
Token { data: BigNumber { s: 1, e: 2, c: [ 200 ] }, unit: 100 }
200
```

#### Target Token Minimum Trading Amount
Get the minimum trading amount for target token in the given order.

```javascript
// ssc: VStableSwapCtrt
// orderId: string E.g. "JChwB1yFyFMUjSLCruuTDHVPWHWqvYvQBkFkinnmRmvY"

const bal = await scc.getMinTarget(orderId);
console.log(bal);
console.log(bal.data.toNumber());
```
Example output

```
Token { data: BigNumber { s: 1, e: 0, c: [ 100 ] }, unit: 100 }
100
```

#### Target Token Maximum Trading Amount
Get the maximum trading amount for target token in the given order.

```javascript
// ssc: VStableSwapCtrt
// orderId: string E.g. "JChwB1yFyFMUjSLCruuTDHVPWHWqvYvQBkFkinnmRmvY"

const bal = await scc.getMaxTarget(orderId);
console.log(bal);
console.log(bal.data.toNumber());
```
Example output

```
Token { data: BigNumber { s: 1, e: 2, c: [ 200 ] }, unit: 100 }
200
```

#### Base Token Price
Get the price for base token in the given order.

```javascript
// ssc: VStableSwapCtrt
// orderId: string E.g. "JChwB1yFyFMUjSLCruuTDHVPWHWqvYvQBkFkinnmRmvY"

const bal = await scc.getPriceBase(orderId);
console.log(bal);
console.log(bal.data.toNumber());
```
Example output

```
Token { data: BigNumber { s: 1, e: 0, c: [ 0 ] }, unit: 100 }
1
```

#### Target Token Price
Get the price for target token in the given order.

```javascript
// ssc: VStableSwapCtrt
// orderId: string E.g. "JChwB1yFyFMUjSLCruuTDHVPWHWqvYvQBkFkinnmRmvY"

const bal = await scc.getPriceTarget(orderId);
console.log(bal);
console.log(bal.data.toNumber());
```
Example output

```
Token { data: BigNumber { s: 1, e: 0, c: [ 0 ] }, unit: 100 }
1
```

#### Base Token Locked Amount
Get the locked amount of base token in the given order.

```javascript
// ssc: VStableSwapCtrt
// orderId: string E.g. "JChwB1yFyFMUjSLCruuTDHVPWHWqvYvQBkFkinnmRmvY"

const bal = await scc.getBaseTokLocked(orderId);
console.log(bal);
console.log(bal.data.toNumber());
```
Example output

```
Token { data: BigNumber { s: 1, e: 4, c: [ 10000 ] }, unit: 100 }
10000
```

#### Target Token Locked Amount
Get the locked amount of target token in the given order.

```javascript
// ssc: VStableSwapCtrt
// ordeId: string E.g. "JChwB1yFyFMUjSLCruuTDHVPWHWqvYvQBkFkinnmRmvY"

const bal = await scc.getTargetTokLocked(ordeId);
console.log(bal);
console.log(bal.data.toNumber());
```
Example output

```
Token { data: BigNumber { s: 1, e: 4, c: [ 10000 ] }, unit: 100 }
10000
```

#### Order Status
Get the status of the given order(i.e. if the order is active).

```javascript
// ssc: VStableSwapCtrt
// ordeId: string E.g. "JChwB1yFyFMUjSLCruuTDHVPWHWqvYvQBkFkinnmRmvY"

console.log(await scc.getOrderStatus(ordeId));
```
Example output

```
true
```

### Actions

#### Supersede
Transfer the contract right to another account.

Only the maker of the contract has the right to take this action.

```javascript
// ssc: VStableSwapCtrt
// acnt0: Account
// acnt1: Account

const resp = await scc.supersede(acnt0, acnt1.addr.data);
console.log(resp);
```
Example output

```
{
  type: 9,
  id: '6ZKodKQ2TPTffpAGvioBmqqJEL1HJo9BZbkTYcB8VPsc',
  fee: 30000000,
  feeScale: 100,
  timestamp: 1654744952653000000,
  proofs: [
    {
      proofType: 'Curve25519',
      publicKey: 'FwuW4LhiBFn6uu5id9nZGtp9o1RUG3DoX5MhyZibrjkE',
      address: 'ATse3RcjEzwc5JHDPcduPYe4qA2mWhSNZaV',
      signature: 'nipcF7LWdBLHYaq7qbyViT1CBnSXwU3a2f5ft3DJYxYb97sb7HkwdhT8E69wGhPFQndWPNnvnY81ZeCeTHficQU'
    }
  ],
  contractId: 'CEzip4FF5yJMJkmVQQ2UHoQfWiDGKy93kxF',
  functionIndex: 0,
  functionData: '1bscuQUYkKxix6tJGrWaSXbXzTYAxGAhLZhMZC',
  attachment: ''
}
```

#### Set Order
Create an order and deposit initial amounts into the order.

The transaction ID returned by this action serves as the ordeId.

```javascript
// ssc: VStableSwapCtrt
// acnt: Account

const resp = await scc.setOrder(
    acnt, // by
    1, // feeBase
    1, // feeTarget
    1, // minBase
    2, // maxBase
    1, // minTarget
    2, // maxTarget
    1, // priceBase
    1, // priceTarget
    100, // baseDeposit
    100 // targetDeposit
);
console.log(resp);
```
Example output

```
{
  type: 9,
  id: 'HGCYFvx7EFBUpxJHfyxzQ4FUUkoGmTKxL43P4o7Q7zEH',
  fee: 30000000,
  feeScale: 100,
  timestamp: 1654744313342000000,
  proofs: [
    {
      proofType: 'Curve25519',
      publicKey: 'FwuW4LhiBFn6uu5id9nZGtp9o1RUG3DoX5MhyZibrjkE',
      address: 'ATse3RcjEzwc5JHDPcduPYe4qA2mWhSNZaV',
      signature: 'nXorhhcG1aPZjo6MKVMZYTEjoGXYGv6ib6gecdEWkdjmBoMt6PumYm1m6nRKUpFnn5wiZf7pAoYaxpABRXDf1ME'
    }
  ],
  contractId: 'CEzip4FF5yJMJkmVQQ2UHoQfWiDGKy93kxF',
  functionIndex: 1,
  functionData: '17vgyw5jxgmT6gnum2fGA3uMgc6YBPLzZyp3gxn4n1mcNHP2UGNCFtm1pj9WtZYSUMdNyC8NMiQoy5QuXiohc8HYEbAgo4B4aJ76b6wYZ1oiPtBdfKBJ54J7LgBX5',
  attachment: ''
}
```

#### Update Order
Update the order settings(e.g. fee, price)

```javascript
// ssc: VStableSwapCtrt
// acnt: Account
// ordeId: string E.g. "JChwB1yFyFMUjSLCruuTDHVPWHWqvYvQBkFkinnmRmvY"

const resp = await scc.updateOrder(
    acnt, // by
    ordeId, // orderId
    1, // feeBase
    1, // feeTarget
    1, // minBase
    2, // maxBase
    1, // minTarget
    2, // maxTarget
    1, // priceBase
    1 // priceTarget
);
console.log(resp);
```
Example output

```
{
  type: 9,
  id: '6WeFy78kZDfM3jv7nh1G7zpGk6qnYtVtZas865oZy6Fu',
  fee: 30000000,
  feeScale: 100,
  timestamp: 1654745841757000000,
  proofs: [
    {
      proofType: 'Curve25519',
      publicKey: 'FwuW4LhiBFn6uu5id9nZGtp9o1RUG3DoX5MhyZibrjkE',
      address: 'ATse3RcjEzwc5JHDPcduPYe4qA2mWhSNZaV',
      signature: '5vR5pb8mvXpYH2y564p7B1c5JXPoSZJKnymzereDL219yBqqtYMJPHppsktjtmLqNBp2HqS1ASRZJ58Bur3C5xoM'
    }
  ],
  contractId: 'CEzip4FF5yJMJkmVQQ2UHoQfWiDGKy93kxF',
  functionIndex: 2,
  functionData: '1G3pzCo7ntg5dZ53PzUnjqmnsva62DdqhtYcxn9v2r6MN79gdq8zo3RwfjWzu8H5YzXxw7W9Q3szxD87cGtFnB7d9CeuoTJoPShntaWQ1gDePvjZaaFW7fL6yEM75Y9gxfC3fdNLNYbi85bgENba',
  attachment: ''
}
```

#### Deposit to Order
Deposit more tokens into the order.

```javascript
// ssc: VStableSwapCtrt
// acnt: Account
// ordeId: string E.g. "JChwB1yFyFMUjSLCruuTDHVPWHWqvYvQBkFkinnmRmvY"

const resp = await scc.orderDeposit(
    acnt, // by
    ordeId, // orderId
    50, // baseDeposit
    50 // targetDeposit
);
console.log(resp);
```
Example output

```
{
  type: 9,
  id: '9NoSxaXKGqxWjyLqZYAcsN4KfKmqPgLPsGSiCgZBeoNe',
  fee: 30000000,
  feeScale: 100,
  timestamp: 1654746040276000000,
  proofs: [
    {
      proofType: 'Curve25519',
      publicKey: 'FwuW4LhiBFn6uu5id9nZGtp9o1RUG3DoX5MhyZibrjkE',
      address: 'ATse3RcjEzwc5JHDPcduPYe4qA2mWhSNZaV',
      signature: '5u4oSomY3jKzxVvEw65a7iTKFWqgFLremTRUYqpSD6gX1f7NvzpBZMtxBa4nns8oawcWvDZEnLVH4ZVN7Rm4b8zU'
    }
  ],
  contractId: 'CEzip4FF5yJMJkmVQQ2UHoQfWiDGKy93kxF',
  functionIndex: 3,
  functionData: '1FELDybc1PuP4wuPZ6t9iCYVaC1X7NeZE1HgMxw2nj6GzYxvDHjzYS129G5zAkEGPsmPvNn15Z',
  attachment: ''
}
```

#### Withdraw from Order
Withdraw some tokens from the order.

```javascript
// ssc: VStableSwapCtrt
// acnt: Account
// ordeId: string E.g. "JChwB1yFyFMUjSLCruuTDHVPWHWqvYvQBkFkinnmRmvY"

const resp = await scc.orderWithdraw(
    acnt, // by
    ordeId, // orderId
    50, // baseDeposit
    50 // targetDeposit
);
console.log(resp);
```
Example output

```
{
  type: 9,
  id: '8BSMLUt9rTsssuDHJGQSPs6uw87vNAxSTLUkz1bDrKse',
  fee: 30000000,
  feeScale: 100,
  timestamp: 1654746271814000000,
  proofs: [
    {
      proofType: 'Curve25519',
      publicKey: 'FwuW4LhiBFn6uu5id9nZGtp9o1RUG3DoX5MhyZibrjkE',
      address: 'ATse3RcjEzwc5JHDPcduPYe4qA2mWhSNZaV',
      signature: '3Ge5ickiKkjKPJZFTSEYYcrHCG1nHzCvGK69zSmEfnazwL2jvcF7NBJh85bS3U7tyAhPsRJtfPdqdHfEUwAUFewM'
    }
  ],
  contractId: 'CEzip4FF5yJMJkmVQQ2UHoQfWiDGKy93kxF',
  functionIndex: 4,
  functionData: '1FELDybc1PuP4wuPZ6t9iCYVaC1X7NeZE1HgMxw2nj6GzYxvDHjzYS129G5zAkEGPsmPvNn15Z',
  attachment: ''
}
```

#### Close Order
Close the given order.

```javascript
// ssc: VStableSwapCtrt
// acnt0: Account
// ordeId: string E.g. "JChwB1yFyFMUjSLCruuTDHVPWHWqvYvQBkFkinnmRmvY"

const resp = await scc.closeOrder(
    acnt0, // by
    ordeId, // orderId
);
console.log(resp);
```
Example output

```
{
  type: 9,
  id: 'CGJZQ82drT7Eqenur9WuZNRZu9MQ1LxjCC1Tqx4dNjDA',
  fee: 30000000,
  feeScale: 100,
  timestamp: 1654750673837000000,
  proofs: [
    {
      proofType: 'Curve25519',
      publicKey: 'FwuW4LhiBFn6uu5id9nZGtp9o1RUG3DoX5MhyZibrjkE',
      address: 'ATse3RcjEzwc5JHDPcduPYe4qA2mWhSNZaV',
      signature: '2JS9jZVt1sQTFWuyTbmek8EA8rRvs1huxjxf2kL5ee2w7zgnCJYwsGMgg2oVW27yEZYnzdLfCZhje8nWKKgZkwuN'
    }
  ],
  contractId: 'CEzip4FF5yJMJkmVQQ2UHoQfWiDGKy93kxF',
  functionIndex: 5,
  functionData: '1TeCHoVu3krXNLRnvukEzmCew9g6g8VWayFW35BHBEaY9njaV',
  attachment: ''
}
```

#### Swap Base Tokens to Target Tokens
Trade base tokens for the target tokens.

```javascript
// ssc: VStableSwapCtrt
// acnt1: Account
// ordeId: string E.g. "JChwB1yFyFMUjSLCruuTDHVPWHWqvYvQBkFkinnmRmvY"

const aDayLater = (new Date().getTime()) + 86400;
const resp = await scc.swapBaseToTarget(
    acnt1, // by
    ordeId, // orderId
    2, // amount
    1, // swapFee
    1, // price
    aDayLater 
);
console.log(resp);
```
Example output

```
{
   "type":9,
   "id":"BrdXjGfg51bQRpfS8q5ZdFfPVh6z1wnYxp1YEpetr12X",
   "fee":30000000,
   "feeScale":100,
   "timestamp":1646901807605651968,
   "proofs":[
      {
         "proofType":"Curve25519",
         "publicKey":"4Z7yUcUqa1TcHMPtp7G6XMjxTKuZWXA2hQWNz7X8XsFZ",
         "address":"AU5NsHE8eC2guo3JobD8jrGvnEDQhBP8GtW",
         "signature":"5mT4xrUNtky5eqCow89ZNCQcYjAbLjBCNmh3cGmHLvGZGSSE1smtXSpRWchXxB19TgqBP7fZjEEav1gsG2rhan6J"
      }
   ],
   "contractId":"CF4T3EVdaDcu5Y2xMbYKZ1xs1jBsfxGDf29",
   "functionIndex":6,
   "functionData":"15KQH1wa5mfq3fSkjif5XryFTH1kfby8qFRjUXNXzoiAEvppk5eGYVUYKCX2FCSKEybH7jHgfw4GDsUcecRLAe29aHdm9CqdqMy",
   "attachment":""
}
```

#### Swap Target Tokens to Base Tokens
Trade target tokens for the base tokens.

```javascript
// ssc: VStableSwapCtrt
// acnt1: Account
// ordeId: string E.g. "JChwB1yFyFMUjSLCruuTDHVPWHWqvYvQBkFkinnmRmvY"

const aDayLater = (new Date().getTime()) + 86400;
const resp = await scc.swapTargetToBase(
    acnt1, // by
    ordeId, // orderId
    2, // amount
    1, // swapFee
    1, // price
    aDayLater
);
console.log(resp);
```
Example output

```
{
   "type":9,
   "id":"CaSgv7n6HEVUoHNHBAxMK2CgbU4q9H1ytZB1r697p8Ek",
   "fee":30000000,
   "feeScale":100,
   "timestamp":1646901983609026048,
   "proofs":[
      {
         "proofType":"Curve25519",
         "publicKey":"4Z7yUcUqa1TcHMPtp7G6XMjxTKuZWXA2hQWNz7X8XsFZ",
         "address":"AU5NsHE8eC2guo3JobD8jrGvnEDQhBP8GtW",
         "signature":"4sggSuW3tep11NhBj1HwJckqVB2ZF1oYMjgVVjzTyTkNTY4LhAYLQZ3XZ4kpwchMh7YUJUA5bxP4CtZBsxybpVwd"
      }
   ],
   "contractId":"CF4T3EVdaDcu5Y2xMbYKZ1xs1jBsfxGDf29",
   "functionIndex":7,
   "functionData":"15KQH1wa5mfq3fSkjif5XryFTH1kfby8qFRjUXNXzoiAEvppk5eGYVUYKCX2FCSKEybH7jHgfw4GDsUcecRLAe29aHdmDpz9qcb",
   "attachment":""
}
```