# Atomic Swap Contract

- [Atomic Swap Contract](#atomic-swap-contract)
  - [Introduction](#introduction)
  - [Usage with JavaScript SDK](#usage-with-javascript-sdk)
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
      - [lock](#lock)
      - [solve](#solve)
      - [Withdraw after expiration](#withdraw-after-expiration)

## Introduction

[Atomic Swap](https://en.bitcoin.it/wiki/Atomic_swap) is a general algorithm to achieve the exchange between two parties without having to trust a third party.

Atomic Swap Contract is the VSYS implementation of [Atomic Swap](https://en.bitcoin.it/wiki/Atomic_swap) which supports atomic-swapping tokens on VSYS chain with other tokens(either on VSYS chain or on other atomic-swap-supporting chain like Ethereum).

We have written a helper which exclusively serve when both users' accounts and tokens are on VSYS chain.

## Usage with JavaScript SDK

### Registration

Register an Atomic Swap Contract instance.

```javascript
import * as jv from '@virtualeconomy/js-vsys';

// acnt: jv.Account
// tokId: string
const ac = await jv.AtomicSwapCtrt.register(acnt, tokId);
console.log(ac.ctrtId);
```

Example output

```
CtrtID(CFAAxTu44NsfwMUfpmVd6y4vuN9xQNVFtGa)
```

### From Existing Contract

Get an object for an existing contract instance.

```javascript
import * as jv from '@virtualeconomy/js-vsys';

// ch: Chain
const ctrtId = 'CFAAxTu44NsfwMUfpmVd6y4vuN9xQNVFtGa';
const atomicCtrt = new jv.AtomicSwapCtrt(atomicCtrtId, ch);
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
Addr { data: 'AU8h6YH5iJuwFzcUdGugUwKo2E8tbEHdtqu' }
```

#### Token ID

The token ID of the token deposited into this contract.

```javascript
// ac: AtomicSwapCtrt

console.log(await ac.getTokId());
```

Example output

```
TokenID { data: 'TWt6EyaxKRPeG92Hq3HpHzc4vnYY7JxmfCGMhgYh2' }
```

#### Unit

The unit of the token deposited into this contract.

```javascript
// ac: AtomicSwapCtrt

console.log(await ac.getUnit());
```

Example output

```
1
```

#### Contract Balance

The balance of the token deposited into this contract for the given user.

```javascript
// ac: AtomicSwapCtrt
// acnt: Account

console.log(await ac.getCtrtBal(acnt.addr.data));
```

Example output

```
Token { data: BigNumber { s: 1, e: 2, c: [ 100 ] }, unit: 1 }
```

#### Swap Owner

Get the owner of the swap based on the given token-locking transaction ID(e.g. the transaction ID obtained from taking the maker locking action).

```javascript
// ac: AtomicSwapCtrt
// makerLockTxId: string E.g. "FHZdvf3yyWuDnNTYeR6MZKTEqLJ1QxKfrDBqFrHDVBeJ"

console.log(await ac.getSwapOwner(makerLockTxId));
```

Example output

```
Addr { data: 'AU8h6YH5iJuwFzcUdGugUwKo2E8tbEHdtqu' }
```

#### Swap Recipient

Get the recipient of the swap based on the given token-locking transaction ID(e.g. the transaction ID obtained from taking the maker locking action).

```javascript
// ac: AtomicSwapCtrt
// makerLockTxId: str E.g. "FHZdvf3yyWuDnNTYeR6MZKTEqLJ1QxKfrDBqFrHDVBeJ"

console.log(await ac.getSwapRecipient(makerLockTxId));
```

Example output

```
Addr { data: 'AU1KWrn3sFwddbZjfeKnauh4zAYiDTmo9gM' }
```

#### Swap Puzzle

Get the hashed puzzle(i.e. secret) of the swap based on the given token-locking transaction ID(e.g. the transaction ID obtained from taking the maker locking action).

```javascript
// ac: AtomicSwapCtrt
// makerLockTxId: string E.g. "FHZdvf3yyWuDnNTYeR6MZKTEqLJ1QxKfrDBqFrHDVBeJ"

console.log(await ac.getSwapPuzzle(makerLockTxId));
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

console.log(await ac.getSwapAmount(makerLockTxId));
```

Example output

```
Token { data: BigNumber { s: 1, e: 2, c: [ 100 ] }, unit: 1 }
```

#### Swap Expiration Time

Get the expiration time of the swap based on the given token-locking transaction ID(e.g. the transaction ID obtained from taking the maker locking action).

```javascript
// ac: AtomicSwapCtrt
// makerLockTxId: string E.g. "FHZdvf3yyWuDnNTYeR6MZKTEqLJ1QxKfrDBqFrHDVBeJ"

console.log(await ac.getSwapExpiredTime(makerLockTxId));
```

Example output

```
VSYSTimestamp { data: BigNumber { s: 1, e: 21, c: [ 16552542 ] } }
```

#### Swap Status

Get the status of the swap(if the swap is active) based on the given token-locking transaction ID(e.g. the transaction ID obtained from taking the maker locking action).

```javascript
// ac: AtomicSwapCtrt
// makerLockTxId: string E.g. "FHZdvf3yyWuDnNTYeR6MZKTEqLJ1QxKfrDBqFrHDVBeJ"

console.log(await ac.getSwapStatus(makerLockTxId));
```

Example output

```
true
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
import * as jv from '@virtualeconomy/js-vsys';

// maker lock sample code
secret = 'abc';
const puzzleBytes = jv.sha256Hash(Buffer.from(secret, 'latin1'));
const makerLockTimestamp = Date.now() + 1800 * 1000;

resp = await ac.lock(
  acnt0, // by
  lockAmount, // amount
  acnt1.addr.data, // recipient
  puzzleBytes, // hashedSecret
  makerLockTimestamp // expireTime
);
console.log(resp);
```

Example output

```
{
  type: 9,
  id: 'CH9jjspCxK21vdbyRBj2TVzUkk9KMsVubpxaHfLxdE8r',
  fee: 30000000,
  feeScale: 100,
  timestamp: 1654829045256000000,
  proofs: [
    {
      proofType: 'Curve25519',
      publicKey: 'AGy4ASY2CmVPSjQX4rNHrSHmcYAL4DNBawdyKT7p8vot',
      address: 'AU8h6YH5iJuwFzcUdGugUwKo2E8tbEHdtqu',
      signature: '5q9uAGEiNaGw4pDwK7Eu25nzCyPvUhXEro6rouDwjz2NKsm9ZGDzE3qqj6huKH2tdPAb9LFtZ34fa88nini91QQs'
    }
  ],
  contractId: 'CF4YKpuuevHY7CVPK9r9sUKKNuZVJWAkgM3',
  functionIndex: 0,
  functionData: '1CC6B9Tu94MGLm9e7vM4r9GXknWei3sxHSq9u8oQ5USoxMPKC3ibdKttMtsYbtshrTTsbw8fcUyjskyt1BYMEsixZ5meVf3dpvdDEPnkPKdKWdu',
  attachment: ''
}
```

#### solve

If the solve function is executed by the maker, then the maker takes the tokens locked by the taker and reveals the plain text of the hashed secret.

If the solve function is executed by the taker, then the taker will get the revealed secret and takes the tokens locked by the maker.

The following sample code shows how maker solve runs.

```javascript
// ac: AtomicSwapCtrt instance of TAKER's
// maker: Account
// takerLockTxId: string E.g. "D5ZPPhw7y4eWcL6zBNWNHdWf9jGxPAi5XCP5KxuZzirP"
// secret: string E.g. "abc"

resp = await ac.solve(
  maker, // by
  takerLockTxId, // lockTxId
  secret // secret
);
console.log(resp);
```

Example output

```
{
  type: 9,
  id: 'AJYjfwsxWeLaMKgRYuixqVus3njjHedM6XkbVP8XEpXv',
  fee: 30000000,
  feeScale: 100,
  timestamp: 1654829867740000000,
  proofs: [
    {
      proofType: 'Curve25519',
      publicKey: 'AGy4ASY2CmVPSjQX4rNHrSHmcYAL4DNBawdyKT7p8vot',
      address: 'AU8h6YH5iJuwFzcUdGugUwKo2E8tbEHdtqu',
      signature: '2Ra9bj4wNppbJbN4aaFwQiCXNbAUwB9pS5R8kmCvxeasZCdzkpoeC2NTft4iS2yxhqB9yxj84yUiRiu2t2uAVY5D'
    }
  ],
  contractId: 'CFDec4GueRAqaGoukCN4ire6QQv4vnfogMZ',
  functionIndex: 1,
  functionData: '12yhZiG93rnjqP4EWEUhxYRt7BWTcHHQVQm4nBikhmQxGgbFFtKVzoUudt',
  attachment: ''
}
```

#### Withdraw after expiration

Either the maker or taker withdraws the tokens from the contract after the expiration time.

The example below shows the withdraw after expiration by the maker. It is the same for the taker.

```javascript
// ac: AtomicSwapCtrt
// makerLockTxId: string E.g. "FHZdvf3yyWuDnNTYeR6MZKTEqLJ1QxKfrDBqFrHDVBeJ"

resp = await ac.expWithdraw(
  acnt0, // by
  makerLockTxId // lockTxId
);
console.log(resp);
```

Example output

```
{
  type: 9,
  id: '5Wwi3zAZFhdRx3ngrjt4fDX1hAtsi4ZQLGt9u9U1uBR2',
  fee: 30000000,
  feeScale: 100,
  timestamp: 1654830809754000000,
  proofs: [
    {
      proofType: 'Curve25519',
      publicKey: 'AGy4ASY2CmVPSjQX4rNHrSHmcYAL4DNBawdyKT7p8vot',
      address: 'AU8h6YH5iJuwFzcUdGugUwKo2E8tbEHdtqu',
      signature: '278Ydo6hju5XvRgDFhqyHgK56ndxobPzYS71eKKinS5oVEQaVsR7ZZn88pNNuAzvEvAqZTRFnixoEPZ7aqMtwgiV'
    }
  ],
  contractId: 'CF4YKpuuevHY7CVPK9r9sUKKNuZVJWAkgM3',
  functionIndex: 2,
  functionData: '1TeCHms39cxgn3ifBZdtv8FQUUMgPhjGtupGUVPgEC1bqdfKZ',
  attachment: ''
}
```
