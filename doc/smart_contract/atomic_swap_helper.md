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
const ac = await atomic.AtomicSwapHelper.register(acnt, tokId);
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
Addr { data: 'AU8h6YH5iJuwFzcUdGugUwKo2E8tbEHdtqu' }
```

#### Token ID

The token ID of the token deposited into this contract.

```javascript
// ac: AtomicSwapHelper

console.log(await ac.getTokId());
```

Example output

```
TokenID { data: 'TWt6EyaxKRPeG92Hq3HpHzc4vnYY7JxmfCGMhgYh2' }
```

#### Unit

The unit of the token deposited into this contract.

```javascript
// ac: AtomicSwapHelper

console.log(await ac.getUnit());
```

Example output

```
1
```

#### Contract Balance

The balance of the token deposited into this contract for the given user.

```javascript
// ac: AtomicSwapHelper
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
// ac: AtomicSwapHelper
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
// ac: AtomicSwapHelper
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
// ac: AtomicSwapHelper
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
// ac: AtomicSwapHelper
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
// ac: AtomicSwapHelper
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
// ac: AtomicSwapHelper
// makerLockTxId: string E.g. "FHZdvf3yyWuDnNTYeR6MZKTEqLJ1QxKfrDBqFrHDVBeJ"

console.log(await ac.getSwapStatus(makerLockTxId));
```

Example output

```
true
```

### Actions

#### makerLock

The maker locks tokens into the contract with the recipient, secret, and expiration time specified.

```javascript
// ac: AtomicSwapHelper
// maker: Account
// lockAmount: number
import * as hs from './src/utils/hashes.js';

secret = 'abc';
const makerLockTimestamp = Date.now() + 1800 * 1000;

resp = await ac.makerLock(
  maker, // by
  lockAmount, // amount
  acnt1.addr.data, // recipient
  secret, // secret
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
  taker, // by
  lockAmount, // amount
  makerCtrtId, // makerCtrtId
  acnt0.addr.data, // recipient
  makerLockTxId, // makerLockTxId
  takerLockTimestamp // expireTime
);
console.log(resp);
```

Example output

```
{
  type: 9,
  id: '9ToVi1gSJq9hvRbeLZGJkxz7gMYHZkyv7mM5feANCsA3',
  fee: 30000000,
  feeScale: 100,
  timestamp: 1654829818593000000,
  proofs: [
    {
      proofType: 'Curve25519',
      publicKey: 'BMGVmvR8MmasttdxzQqFMCwP4QnmRaWYKfDQd7trscJ2',
      address: 'AU1KWrn3sFwddbZjfeKnauh4zAYiDTmo9gM',
      signature: '66dFjrH7sXL3onSvWMagErF46wTYX4gd2Sx4iz632cqopaH2gk5GVA76zB6n2RjQmqGrzSimWZZJu3CTDV2hgvSy'
    }
  ],
  contractId: 'CFDec4GueRAqaGoukCN4ire6QQv4vnfogMZ',
  functionIndex: 0,
  functionData: '1CC6B9Tu94MGLm9e7vXeTtrTzEgZCZ7xndkhJbzHtR7ciuqb9EvaFFXKRaER98vesdij7m65d2gexUaCUcSUJXunfp9vvbcTRKgd6QgGBVoaZeP',
  attachment: ''
}
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
  maker, // by
  atomicCtrtId, // atomicCtrtId
  takerLockTxId, // takerLockTxId
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

#### takerSolve

The taker gets the revealed plain text of hased secret from the maker's solving transaction ID and then takes the tokens locked by the maker.

```javascript
// ac: AtomicSwapHelper
// taker: Account
// makerCtrtId: string
// makerLockTxId: string
// makerSolveTxId: string

resp = await ac.takerSolve(
  taker, // by
  makerCtrtId, // makerCtrtId
  makerLockTxId, // makerLockTxId
  makerSolveTxId // makerSolveTxId
);
console.log(resp);
```

Example output

```
{
  type: 9,
  id: 'FdLe837WwY3jUqxD32iXijqC3zZai26PkGSS2EB5xuyM',
  fee: 30000000,
  feeScale: 100,
  timestamp: 1654829923529000000,
  proofs: [
    {
      proofType: 'Curve25519',
      publicKey: 'BMGVmvR8MmasttdxzQqFMCwP4QnmRaWYKfDQd7trscJ2',
      address: 'AU1KWrn3sFwddbZjfeKnauh4zAYiDTmo9gM',
      signature: 'GsKUXNkRzwVWRHjWAZjSrKG9ehmK7kGEoDgvwiRbxHkvUHh2f6TeDirtRj9agjpTTJBSvime3bygGBoQnP14wzH'
    }
  ],
  contractId: 'CF4YKpuuevHY7CVPK9r9sUKKNuZVJWAkgM3',
  functionIndex: 1,
  functionData: '12yhZiNL5g7AwyShVQf5EqpKCwSdTaauEqZFw29xGM1gDGxmnN8qU7DW42',
  attachment: ''
}
```

#### expWithdraw

Either the maker or taker withdraws the tokens from the contract after the expiration time.

The example below shows the withdraw after expiration by the maker. It is the same for the taker.

```javascript
// ac: AtomicSwapHelper
// makerLockTxId: string E.g. "FHZdvf3yyWuDnNTYeR6MZKTEqLJ1QxKfrDBqFrHDVBeJ"

resp = await ac.expWithdraw(
  acnt0, // by
  makerLockTxId // lockTxId
);
console.log(resp);
```

Example output

```
{'type': 9, 'id': 'FKSpw247kNSNSWyBo3q8c4UwB4w4N8wKyC5wE9wN4rKQ', 'fee': 30000000, 'feeScale': 100, 'timestamp': 1646822309320972032, 'proofs': [{'proofType': 'Curve25519', 'publicKey': '6gmM7UxzUyRJXidy2DpXXMvrPqEF9hR1eAqsmh33J6eL', 'address': 'AU6BNRK34SLuc27evpzJbAswB6ntHV2hmjD', 'signature': '28nBpoKFHjdpZzoYzsXaCdMnkBeGXyoaQtjAJqKEpYBMV8iAhQC3Fx58xvsK1vhPPtKnbH9231HHF9gBT5BnFhcu'}], 'contractId': 'CEwifKGjBsE4MXj7FrhVF7ruvYcAuJ3bj3K', 'functionIndex': 2, 'functionData': '1TeCHZdsT9rN5FbvR5Bc5BFuMaGckQ2ags2NPTQq51cw6N4Yt', 'attachment': ''}
```
