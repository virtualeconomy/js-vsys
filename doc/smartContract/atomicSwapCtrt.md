# Atomic Swap Contract

## Introduction

[Atomic Swap](https://en.bitcoin.it/wiki/Atomic_swap) is a general algorithm to achieve the exchange between two parties without having to trust a third party.

Atomic Swap Contract is the VSYS implementation of [Atomic Swap](https://en.bitcoin.it/wiki/Atomic_swap) which supports atomic-swapping tokens on VSYS chain with other tokens(either on VSYS chain or on other atomic-swap-supporting chain like Ethereum).

We have written a helper which exclusively serve when both users' accounts and tokens are on VSYS chain.

## Usage with Python SDK

### Registration

Register an Atomic Swap Contract instance.

```javascript
import * as atomic from './src/contract/atomic_swap_ctrt.js';

// acnt: Account
// tokId: string
const ac = await atomic.AtomicSwapCtrt.register(acnt,tokId);
console.log(ac.ctrtId);
```

Example output

```
CtrtID(CFAAxTu44NsfwMUfpmVd6y4vuN9xQNVFtGa)
```

### From Existing Contract

Get an object for an existing contract instance.

```javascript
import * as atomic from './src/contract/atomic_swap_ctrt.js';

// ch: Chain
const ctrtId = 'CFAAxTu44NsfwMUfpmVd6y4vuN9xQNVFtGa';
const atomicCtrt = new atomic.AtomicSwapCtrt(atomicCtrtId, ch);
```

### Querying

#### Maker

The address that made this contract instance.

```javascript
// ac: AtomicSwapCtrt

console.log(await ac.getMaker());
```

Example output

```
Addr(AU6BNRK34SLuc27evpzJbAswB6ntHV2hmjD)
```

#### Token ID

The token ID of the token deposited into this contract.

```javascript
// ac: AtomicSwapCtrt

console.log(await ac.getTokId());
```

Example output

```
TokenID(TWsSkEv5w3Bkb7fhBhUcZr7X69We5ST2GuwmbuMrR)
```

#### Unit

The unit of the token deposited into this contract.

```javascript
// ac: AtomicSwapCtrt

console.log(await ac.getUnit())
```

Example output

```
100
```

#### Contract Balance

The balance of the token deposited into this contract for the given user.

```javascript
// ac: AtomicSwapCtrt
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
// ac: AtomicSwapCtrt
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
// ac: AtomicSwapCtrt
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
// ac: AtomicSwapCtrt
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
// ac: AtomicSwapCtrt
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
// ac: AtomicSwapCtrt
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
// ac: AtomicSwapCtrt
// makerLockTxId: string E.g. "FHZdvf3yyWuDnNTYeR6MZKTEqLJ1QxKfrDBqFrHDVBeJ"

console.log(await ac.getSwapStatus(makerLockTxId))
```

Example output

```
True
```

### Actions

#### lock

For this lock function sample code, we consider it as the maker lock of the atomic swap. 

Maker is the one who first creates the swap contract, and creates the secret.

If the lock is executed by the taker, we need the hashed secret bytes from the maker lock transaction.

```javascript
// ac: AtomicSwapCtrt
// acnt0: Account
// acnt1: Account
// lockAmount: number
import * as hs from './src/utils/hashes.js';

// maker lock sample code
secret = "abc";
const puzzleBytes = hs.sha256Hash(Buffer.from(makerPuzzlePlain, 'latin1'));
const makerLockTimestamp = Date.now() + 1800 * 1000;

resp = await ac.lock(
    acnt0,// by
    lockAmount,// amount
    acnt1.addr.data,// recipient
    puzzleBytes,// hashedSecret
    makerLockTimestamp// expireTime
)        
console.log(resp)
```

Example output

```
{'type': 9, 'id': 'FHZdvf3yyWuDnNTYeR6MZKTEqLJ1QxKfrDBqFrHDVBeJ', 'fee': 30000000, 'feeScale': 100, 'timestamp': 1646811541818733056, 'proofs': [{'proofType': 'Curve25519', 'publicKey': '6gmM7UxzUyRJXidy2DpXXMvrPqEF9hR1eAqsmh33J6eL', 'address': 'AU6BNRK34SLuc27evpzJbAswB6ntHV2hmjD', 'signature': '26gn57S3xmf1XVcrhcnmSEp82j6v7sMsskBj1pc8NZt5Gd5jKijkmUwgb52LLsnPepWfj7VH1TurTCcp3GrJSsMf'}], 'contractId': 'CFAAxTu44NsfwMUfpmVd6y4vuN9xQNVFtGa', 'functionIndex': 0, 'functionData': '1CC6B9Tu94MJrtVckkunxuvwR4ixhCVVLeT4ZX9NUBN6KUifUdbuevxsezvw45po5HFnmyFYAchxWVfwG3zAdK5H729k8VxbmehT2pTXJ1T2xKh', 'attachment': ''}
```

#### solve

If the solve function is executed by the maker, then the maker takes the tokens locked by the taker and reveals the plain text of the hashed secret.

If the solve function is executed by the taker, then the taker will get the revealed secret and takes the tokens locked by the maker.

The following sample code shows how maker solve runs.

```javascript
// ac: AtomicSwapCtrt
// maker: Account
// taker: Account
// takerAc: AtomicSwapCtrt
// takerLockTxId: string E.g. "D5ZPPhw7y4eWcL6zBNWNHdWf9jGxPAi5XCP5KxuZzirP"
// secret: string E.g. "abc"

resp = await ac.solve(
    taker,// by
    takerAc.ctrtId.data,// atomicCtrtId
    takerLockTxId,// lockTxId
    secret,// secret
)
console.log(resp)
```

Example output

```
{'type': 9, 'id': 'JsMcYQGcTEFw3LUG3PGUjSRJVvXkb3xcwabHrPzaZXk', 'fee': 30000000, 'feeScale': 100, 'timestamp': 1646818867232348928, 'proofs': [{'proofType': 'Curve25519', 'publicKey': '6gmM7UxzUyRJXidy2DpXXMvrPqEF9hR1eAqsmh33J6eL', 'address': 'AU6BNRK34SLuc27evpzJbAswB6ntHV2hmjD', 'signature': 'B9hWAijnuCZnvEy9wZpvLkUcX9Rerptxma32tgai628Hax9Xyx5TAhJMt7CNP39DYYFrmR4b7RLeukvNrKyXiTq'}], 'contractId': 'CF8rnUdzqVczGideBebaLPAa73HEQnxBu8E', 'functionIndex': 1, 'functionData': '12yhZiQ65kxBjM5KFWFGfsfpKQ9AmFtdWZKYUvT6KZ1kb3XaeW4RZ7XJZp', 'attachment': ''}
```

#### Withdraw after expiration

Either the maker or taker withdraws the tokens from the contract after the expiration time.

The example below shows the withdraw after expiration by the maker. It is the same for the taker.

```javascript
// ac: AtomicSwapCtrt
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