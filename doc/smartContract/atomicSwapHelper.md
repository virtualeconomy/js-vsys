# Atomic Swap Helper

- [Atomic Swap Helper](#atomic-swap-helper)
  - [Introduction](#introduction)
  - [Usage with Python SDK](#usage-with-python-sdk)
    - [Registration](#registration)
    - [From Existing Contract](#from-existing-contract)
    - [Querying](#querying)
      - [Maker](#maker)
      - [Token ID](#token-id)
      - [Unit](#unit)
      - [Contract Balance](#contract-balance)
      - [Swap Owner](#swap-owner)
      - [Swap Recipient](#swap-recipient)
      - [Swap Puzzle](#swap-puzzle)
      - [Swap Amount](#swap-amount)
      - [Swap Expiration Time](#swap-expiration-time)
      - [Swap Status](#swap-status)
    - [Actions](#actions)
      - [makerLock](#makerlock)
      - [takerLock](#takerlock)
      - [makerSolve](#makersolve)
      - [takerSolve](#takersolve)
      - [expWithdraw](#expwithdraw)

## Introduction

This is the helper that provides better user experience if you are just swap two tokens which are both on VSYS chain. We divide the lock and solve function into makerLock, takerLock, makerSolve and takerSolve.

## Usage with Python SDK

### Registration

Register an Atomic Swap Contract instance.

```javascript
import * as atomic from './src/contract/atomic_swap_helper.js';

// acnt: Account
// tokId: string
const ac = await atomic.AtomicSwapHelper.register(acnt,tokId);
console.log(ac.ctrtId);
```

Example output

```
CtrtID(CFAAxTu44NsfwMUfpmVd6y4vuN9xQNVFtGa)
```

### From Existing Contract

Get an object for an existing contract instance.

```javascript
import * as atomic from './src/contract/atomic_swap_helper.js';

// ch: Chain
const ctrtId = 'CFAAxTu44NsfwMUfpmVd6y4vuN9xQNVFtGa';
const atomicCtrt = new atomic.AtomicSwapHelper(atomicCtrtId, ch);
```

### Querying

#### Maker

The address that made this contract instance.

```javascript
// ac: AtomicSwapHelper

console.log(await ac.getMaker());
```

Example output

```
Addr(AU6BNRK34SLuc27evpzJbAswB6ntHV2hmjD)
```

#### Token ID

The token ID of the token deposited into this contract.

```javascript
// ac: AtomicSwapHelper

console.log(await ac.getTokId());
```

Example output

```
TokenID(TWsSkEv5w3Bkb7fhBhUcZr7X69We5ST2GuwmbuMrR)
```

#### Unit

The unit of the token deposited into this contract.

```javascript
// ac: AtomicSwapHelper

console.log(await ac.getUnit())
```

Example output

```
100
```

#### Contract Balance

The balance of the token deposited into this contract for the given user.

```javascript
// ac: AtomicSwapHelper
// acnt: Account

console.log(await ac.getCtrtBal(acnt.addr.data))
```

Example output

```
Token(10000)
```

#### Swap Owner

Get the owner of the swap based on the given token-locking transaction ID(e.g. the transaction ID obtained from taking the maker locking action).

```javascript
// ac: AtomicSwapHelper
// makerLockTxId: string E.g. "FHZdvf3yyWuDnNTYeR6MZKTEqLJ1QxKfrDBqFrHDVBeJ"

console.log(await ac.getSwapOwner(makerLockTxId))
```

Example output

```
Addr(AU6BNRK34SLuc27evpzJbAswB6ntHV2hmjD)
```

#### Swap Recipient

Get the recipient of the swap based on the given token-locking transaction ID(e.g. the transaction ID obtained from taking the maker locking action).

```javascript
// ac: AtomicSwapHelper
// makerLockTxId: str E.g. "FHZdvf3yyWuDnNTYeR6MZKTEqLJ1QxKfrDBqFrHDVBeJ"

console.log(await ac.getSwapRecipient(makerLockTxId))
```

Example output

```
Addr(AU5NsHE8eC2guo3JobD8jrGvnEDQhBP8GtW)
```

#### Swap Puzzle

Get the hashed puzzle(i.e. secret) of the swap based on the given token-locking transaction ID(e.g. the transaction ID obtained from taking the maker locking action).

```javascript
// ac: AtomicSwapHelper
// makerLockTxId: string E.g. "FHZdvf3yyWuDnNTYeR6MZKTEqLJ1QxKfrDBqFrHDVBeJ"

console.log(await ac.getSwapPuzzle(makerLockTxId))
```

Example output

```
DYu3G8aGTMBW1WrTw76zxQJQU4DHLw9MLyy7peG4LKkY
```

#### Swap Amount

Get the token amount locked into the swap based on the given token-locking transaction ID(e.g. the transaction ID obtained from taking the maker locking action).

```javascript
// ac: AtomicSwapHelper
// makerLockTxId: string E.g. "FHZdvf3yyWuDnNTYeR6MZKTEqLJ1QxKfrDBqFrHDVBeJ"

console.log(await ac.getSwapAmount(makerLockTxId))
```

Example output

```
Token(10000)
```

#### Swap Expiration Time

Get the expiration time of the swap based on the given token-locking transaction ID(e.g. the transaction ID obtained from taking the maker locking action).

```javascript
// ac: AtomicSwapHelper
// makerLockTxId: string E.g. "FHZdvf3yyWuDnNTYeR6MZKTEqLJ1QxKfrDBqFrHDVBeJ"

console.log(await ac.getSwapExpiredTime(makerLockTxId))
```

Example output

```
VSYSTimestamp(1646984339000000000)
```

#### Swap Status

Get the status of the swap(if the swap is active) based on the given token-locking transaction ID(e.g. the transaction ID obtained from taking the maker locking action).

```javascript
// ac: AtomicSwapHelper
// makerLockTxId: string E.g. "FHZdvf3yyWuDnNTYeR6MZKTEqLJ1QxKfrDBqFrHDVBeJ"

console.log(await ac.getSwapStatus(makerLockTxId))
```

Example output

```
True
```

### Actions

#### makerLock

The maker locks tokens into the contract with the recipient, secret, and expiration time specified.

```javascript
// ac: AtomicSwapHelper
// maker: Account
// lockAmount: number
import * as hs from './src/utils/hashes.js';

secret = "abc";
const makerLockTimestamp = Date.now() + 1800 * 1000;

resp = await ac.makerLock(
    maker,// by
    lockAmount,// amount
    acnt1.addr.data,// recipient
    secret,// secret
    makerLockTimestamp// expireTime
)        
console.log(resp)
```

Example output

```
{'type': 9, 'id': 'FHZdvf3yyWuDnNTYeR6MZKTEqLJ1QxKfrDBqFrHDVBeJ', 'fee': 30000000, 'feeScale': 100, 'timestamp': 1646811541818733056, 'proofs': [{'proofType': 'Curve25519', 'publicKey': '6gmM7UxzUyRJXidy2DpXXMvrPqEF9hR1eAqsmh33J6eL', 'address': 'AU6BNRK34SLuc27evpzJbAswB6ntHV2hmjD', 'signature': '26gn57S3xmf1XVcrhcnmSEp82j6v7sMsskBj1pc8NZt5Gd5jKijkmUwgb52LLsnPepWfj7VH1TurTCcp3GrJSsMf'}], 'contractId': 'CFAAxTu44NsfwMUfpmVd6y4vuN9xQNVFtGa', 'functionIndex': 0, 'functionData': '1CC6B9Tu94MJrtVckkunxuvwR4ixhCVVLeT4ZX9NUBN6KUifUdbuevxsezvw45po5HFnmyFYAchxWVfwG3zAdK5H729k8VxbmehT2pTXJ1T2xKh', 'attachment': ''}
```

#### takerLock

The taker locks tokens into the contract after the maker has locked the tokens.

```javascript
// ac: AtomicSwapHelper
// taker: Account
// lockAmount: number
// makerCtrtId: string E.g. "CFAAxTu44NsfwMUfpmVd6y4vuN9xQNVFtGa"
// makerLockTxId: string E.g. "FHZdvf3yyWuDnNTYeR6MZKTEqLJ1QxKfrDBqFrHDVBeJ"

const takerLockTimestamp = Date.now() + 1800 * 1000;

resp = await ac.takerLock(
    taker,// by
    lockAmount,// amount
    makerCtrtId,// makerCtrtId
    acnt0.addr.data,// recipient
    makerLockTxId,// makerLockTxId
    takerLockTimestamp// expireTime
)        
console.log(resp)
```

Example output

```
{'type': 9, 'id': 'D5ZPPhw7y4eWcL6zBNWNHdWf9jGxPAi5XCP5KxuZzirP', 'fee': 30000000, 'feeScale': 100, 'timestamp': 1646818399218075904, 'proofs': [{'proofType': 'Curve25519', 'publicKey': '4Z7yUcUqa1TcHMPtp7G6XMjxTKuZWXA2hQWNz7X8XsFZ', 'address': 'AU5NsHE8eC2guo3JobD8jrGvnEDQhBP8GtW', 'signature': '4XMYEJU4LiPzahzS6r9WfM6iaBaBSyQdicgimSgKRStjMPc5e4GYGoapRhpsXw2rL6gbdEYtxA52By4bAsajnBu9'}], 'contractId': 'CF8rnUdzqVczGideBebaLPAa73HEQnxBu8E', 'functionIndex': 0, 'functionData': '1CC6B9Tu94MJrtVckkvwhYn3EkvQmqoxs9Y789QGQ1Xe753PsmJiVZ23HYoZxUzUAdS3Vfc5JB7wWs5wa7oEcanxGqBNfbmJPyjm4mErHCZDiTR', 'attachment': ''}
```

#### makerSolve

The maker takes the tokens locked by the taker and reveals the plain text of the hashed secret.

```javascript
// ac: AtomicSwapHelper
// maker: Account
// atomicCtrtId: string
// takerLockTxId: string
// secret: string E.g. "abc"

resp = await ac.solve(
    maker,// by
	atomicCtrtId,// atomicCtrtId
    takerLockTxId,// takerLockTxId
    secret,// secret
)
console.log(resp)
```

Example output

```
{'type': 9, 'id': 'JsMcYQGcTEFw3LUG3PGUjSRJVvXkb3xcwabHrPzaZXk', 'fee': 30000000, 'feeScale': 100, 'timestamp': 1646818867232348928, 'proofs': [{'proofType': 'Curve25519', 'publicKey': '6gmM7UxzUyRJXidy2DpXXMvrPqEF9hR1eAqsmh33J6eL', 'address': 'AU6BNRK34SLuc27evpzJbAswB6ntHV2hmjD', 'signature': 'B9hWAijnuCZnvEy9wZpvLkUcX9Rerptxma32tgai628Hax9Xyx5TAhJMt7CNP39DYYFrmR4b7RLeukvNrKyXiTq'}], 'contractId': 'CF8rnUdzqVczGideBebaLPAa73HEQnxBu8E', 'functionIndex': 1, 'functionData': '12yhZiQ65kxBjM5KFWFGfsfpKQ9AmFtdWZKYUvT6KZ1kb3XaeW4RZ7XJZp', 'attachment': ''}
```

#### takerSolve

The taker gets the revealed plain text of hased secret from the maker's solving transaction ID and then takes the tokens locked by the maker.

```javascript
// ac: AtomicSwapHelper
// taker: Account
// makerCtrtId: string
// makerLockTxId: string
// makerSolveTxId: string

resp = await ac.takerSolve(
    taker,// by
	makerCtrtId,// makerCtrtId
    makerLockTxId,// makerLockTxId
    makerSolveTxId,// makerSolveTxId
)
console.log(resp)
```

Example output

```
{'type': 9, 'id': 'DJvrQBbFArmqWA9pLpiaM3WkKn4Xr8i9Gaw31T1EooSh', 'fee': 30000000, 'feeScale': 100, 'timestamp': 1646819256795354880, 'proofs': [{'proofType': 'Curve25519', 'publicKey': '4Z7yUcUqa1TcHMPtp7G6XMjxTKuZWXA2hQWNz7X8XsFZ', 'address': 'AU5NsHE8eC2guo3JobD8jrGvnEDQhBP8GtW', 'signature': 'V8wH4Co3WSvS3UjQhe3H6PDXTFGXvgg5kcLzfB5fYcZBLzrZFypUYDDgzo4hM8T1mRmbQfjQVBTWVD9znADhKMM'}], 'contractId': 'CFAAxTu44NsfwMUfpmVd6y4vuN9xQNVFtGa', 'functionIndex': 1, 'functionData': '12yhZiUwRpJMDzLKRqEkacsJ5ZcDSHrj9DpHSZ6P4AkTUHYuooPWv1e63L', 'attachment': ''}
```

#### expWithdraw

Either the maker or taker withdraws the tokens from the contract after the expiration time.

The example below shows the withdraw after expiration by the maker. It is the same for the taker.

```javascript
// ac: AtomicSwapHelper
// makerLockTxId: string E.g. "FHZdvf3yyWuDnNTYeR6MZKTEqLJ1QxKfrDBqFrHDVBeJ"

resp = await ac.expWithdraw(
    acnt0,// by
    makerLockTxId,// lockTxId
)
console.log(resp)
```

Example output

```
{'type': 9, 'id': 'FKSpw247kNSNSWyBo3q8c4UwB4w4N8wKyC5wE9wN4rKQ', 'fee': 30000000, 'feeScale': 100, 'timestamp': 1646822309320972032, 'proofs': [{'proofType': 'Curve25519', 'publicKey': '6gmM7UxzUyRJXidy2DpXXMvrPqEF9hR1eAqsmh33J6eL', 'address': 'AU6BNRK34SLuc27evpzJbAswB6ntHV2hmjD', 'signature': '28nBpoKFHjdpZzoYzsXaCdMnkBeGXyoaQtjAJqKEpYBMV8iAhQC3Fx58xvsK1vhPPtKnbH9231HHF9gBT5BnFhcu'}], 'contractId': 'CEwifKGjBsE4MXj7FrhVF7ruvYcAuJ3bj3K', 'functionIndex': 2, 'functionData': '1TeCHZdsT9rN5FbvR5Bc5BFuMaGckQ2ags2NPTQq51cw6N4Yt', 'attachment': ''}
```