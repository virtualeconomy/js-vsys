# Lock Contract

- [Lock Contract](#lock-contract)
  - [Introduction](#introduction)
  - [Usage with JavaScript SDK](#usage-with-javascript-sdk)
    - [Registration](#registration)
    - [From Existing Contract](#from-existing-contract)
    - [Querying](#querying)
      - [Maker](#maker)
      - [Token id](#token-id)
      - [Contract balance](#contract-balance)
      - [Lock time](#lock-time)
    - [Actions](#actions)
      - [Lock](#lock)

## Introduction

Lock contract allows users to lock a specific token in the contract for some period of time. This allows users to guarantee they have a certain amount of funds upon lock expiration. This may be helpful in implementing some kinds of staking interactions with users of a VSYS token for instance.

## Usage with JavaScript SDK

### Registration

`tokId` is the token id of the token that deposited into this lock contract.

For testing purpose, you can create a new [token contract]() , then [issue]() some tokens and [deposit]() into the lock contract.

```javascript
import * as jv from '@virtualeconomy/js-vsys';

// acnt: Account
// tokId: string

// Register a new Lock contract
const lc = await jv.LockCtrt.register(acnt, tokId);
console.log(lc.ctrtId); // print the id of the newly registered contract
```

Example output

```
CtrtID { data: 'CFFGTjUwuM41Dk7iVaJg88BrEsPmwQKTmM6' }
```

### From Existing Contract

```javascript
import * as jv from '@virtualeconomy/js-vsys';

// ch: Chain

const ncId = 'CFFGTjUwuM41Dk7iVaJg88BrEsPmwQKTmM6';
const lc = jv.LockCtrt(ncId, ch);
```

### Querying

#### Maker

The address that made this lock contract instance.

```javascript
// nc: jv.LockCtrt

console.log(await lc.getMaker());
```

Example output

```
Addr { data: 'ATse3RcjEzwc5JHDPcduPYe4qA2mWhSNZaV' }
```

#### Token id

The token id of the token that deposited into this lock contract.

```javascript
// nc: jv.LockCtrt

console.log(await lc.getTokId());
```

Example output

```
TokenID { data: 'TWum8FrkHp3qooZShMtm3q4GKneV66evJibiwL3EM' }
```

#### Contract balance

The token balance within this contract.

Note that the balance is the same no matter the token is locked or not.

```javascript
// nc: jv.LockCtrt
// acnt: Account

const bal = await lc.getCtrtBal(acnt.addr.data);
console.log(bal);
console.log(bal['data'].toNumber()); // to see the result better
```

Example output

```
Token { data: BigNumber { s: 1, e: 0, c: [ 0 ] }, unit: 1 }
0
```

#### Lock time

The expire timestamp.

```javascript
// nc: jv.LockCtrt
// acnt: Account

const ts = await lc.getCtrtLockTime(acnt.addr.data);
console.log(ts);
console.log(ts['data'].toNumber()); // to see the result better
```

Example output

```
VSYSTimestamp {
  data: BigNumber { s: 1, e: 18, c: [ 16463, 87206000000000 ] }
}
1646387206000000000
```

### Actions

#### Lock

Lock the token until the expire time. The token can't be withdrawn before the expire time.

```javascript
import * as jv from '@virtualeconomy/js-vsys';

// acnt: Account
// expireTime: number

const expireTime = parseInt(new Date().getTime()) + 600;
const resp = await lc.lock(acnt0, expireTime);
console.log(resp);
```

Example output

```
{
  type: 9,
  id: 'tJS2Ky14qWrH8Zvrm5cuzVzib835MHhHrWrEAt9De3m',
  fee: 30000000,
  feeScale: 100,
  timestamp: 1654675912372000000,
  proofs: [
    {
      proofType: 'Curve25519',
      publicKey: 'FwuW4LhiBFn6uu5id9nZGtp9o1RUG3DoX5MhyZibrjkE',
      address: 'ATse3RcjEzwc5JHDPcduPYe4qA2mWhSNZaV',
      signature: '5HkWJTXn71jdG3YT2Cx9AFs2gJREuuGaVPMhWK3ohJK8VP7ZcDAKWtBe2hhyq9ksfb7hQjfizePKEBG68oiRcaWz'
    }
  ],
  contractId: 'CFFGTjUwuM41Dk7iVaJg88BrEsPmwQKTmM6',
  functionIndex: 0,
  functionData: '14NhxkcsJnM9cb',
  attachment: ''
}
```
