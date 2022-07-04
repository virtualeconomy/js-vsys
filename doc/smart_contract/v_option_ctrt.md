# V Option Contract

- [V Option Contract](#v-option-contract)
  - [Introduction](#introduction)
  - [Usage with JavaScript SDK](#usage-with-javascript-sdk)
    - [Registration](#registration)
    - [From Existing Contract](#from-existing-contract)
    - [Querying](#querying)
      - [Maker](#maker)
      - [Base token ID](#base-token-id)
      - [Target token ID](#target-token-id)
      - [Option token ID](#option-token-id)
      - [Proof token ID](#proof-token-id)
      - [Execute time](#execute-time)
      - [Execute deadline](#execute-deadline)
      - [Option status](#option-status)
      - [Max issue num](#max-issue-num)
      - [Reserved option](#reserved-option)
      - [Reserved proof](#reserved-proof)
      - [Price](#price)
      - [Price unit](#price-unit)
      - [Token locked](#token-locked)
      - [Token collected](#token-collected)
      - [Base token balance](#base-token-balance)
      - [Target token balance](#target-token-balance)
      - [Option token balance](#option-token-balance)
      - [Proof token balance](#proof-token-balance)
    - [Actions](#actions)
      - [Supersede](#supersede)
      - [Activate](#activate)
      - [Mint](#mint)
      - [Unlock](#unlock)
      - [Execute](#execute)
      - [Collect](#collect)

## Introduction

[Option contract](https://en.wikipedia.org/wiki/Option_contract) is defined as "a promise which meets the requirements for the formation of a contract and limits the promisor's power to revoke an offer".

Option Contract in VSYS provides an opportunity for the interested parties to buy or sell a VSYS underlying asset based on the determined agreement(e.g., pre-determined price, execute timestamp and so on). It allows users to create option tokens on the VSYS blockchain, and buyers holding these option tokens have the right to buy or sell some underlying asset at some point in the future. Different from the traditional option market, everyone can buy or sell option tokens to join the option market at any time without any contractual relationship with an exchange.

## Usage with JavaScript SDK

### Registration

Register an V Option Contract instance.

```javascript
import * as jv from '@virtualeconomy/js-vsys';

// acnt: Account
// baseTokId: str
// targetTokId: str
// optionTokId: str
// proofTokId: str
// executeTime: int - Unix timestamp
// executeDeadline: int - Unix timestamp

// Register a new contract instance
const voc = await jv.VOptionCtrt.register(
  acnt, // by
  'TWuTFmDynQz815ygjgmoiwU1BL3UTA7VC5VFVQLdw', // baseTokId
  'TWsbVKNno1EHdeWfjJpkQkCqgPcba2zk8Ud4BU5dV', // targetTokId
  'TWu14YBZrSKfK3bMpNpoLx4jWjFKPuyeWYdnXNqHt', // optionTokId
  'TWttyxGagVTPWjx2zJ5Wqb67RuvY3B6gXpkkJ39cA', // proofTokId
  Date.now() + 100 * 1000, // executeTime - Unix timestamp
  Date.now() + 200 * 1000, // executeDeadline - Unix timestamp
  '' // ctrtDescription
);
console.log(voc.ctrtId);
```

Example output

```
CtrtID { data: 'CErjKJcYHWiho1KnnRBfYYZmouNpvms7bAh' }
```

### From Existing Contract

Get an object for an existing contract instance.

```javascript
import * as jv from '@virtualeconomy/js-vsys';

// ch: Chain
// voc_id: str - contract Id of registered V Option contract

voc_id = 'CErjKJcYHWiho1KnnRBfYYZmouNpvms7bAh';
voc = jv.VOptionCtrt(
  voc_id, // ctrtId
  ch // chain
);
```

### Querying

#### Maker

The address that made this contract instance.

```javascript
// voc: VOptionCtrt

console.log(await vec.getMaker());
```

Example output

```
Addr { data: 'ATracVxHwdYF394gXEawdZe9stB9yLH6V7q' }
```

#### Base token ID

The base token ID.

```javascript
// voc: VOptionCtrt

console.log(await voc.getBaseTokId());
```

Example output

```
TokenID { data: 'TWuTFmDynQz815ygjgmoiwU1BL3UTA7VC5VFVQLdw' }
```

#### Target token ID

The target token ID.

```javascript
// voc: VOptionCtrt

console.log(await voc.getTargetTokId());
```

Example output

```
TokenID { data: 'TWuTFmDynQz815ygjgmoiwU1BL3UTA7VC5VFVQLdw' }
```

#### Option token ID

The option token ID.

```javascript
// voc: VOptionCtrt

console.log(await voc.getOptionTokId());
```

Example output

```
TokenID { data: 'TWuTFmDynQz815ygjgmoiwU1BL3UTA7VC5VFVQLdw' }
```

#### Proof token ID

The proof token ID.

```javascript
// voc: VOptionCtrt

console.log(await voc.getProofTokId());
```

Example output

```
TokenID { data: 'TWuTFmDynQz815ygjgmoiwU1BL3UTA7VC5VFVQLdw' }
```

#### Execute time

The execute time.

```javascript
// voc: VOptionCtrt

console.log(await voc.getExeTime());
```

Example output

```
VSYSTimestamp {
  data: BigNumber { s: 1, e: 24, c: [ 16547444780, 2194200000000 ] }
}
```

#### Execute deadline

The execute deadline.

```javascript
// voc: VOptionCtrt

console.log(await voc.getExeDeadline());
```

Example output

```
VSYSTimestamp {
  data: BigNumber { s: 1, e: 24, c: [ 16547444780, 2194200000000 ] }
}
```

#### Option status

The option contract's status.(check if it is still alive)

```javascript
// voc: VOptionCtrt

console.log(await voc.getOptionStatus());
```

Example output

```
false
```

#### Max issue num

The maximum issue of the option tokens.

```javascript
// voc: VOptionCtrt

console.log(await voc.getMaxIssueNum());
```

Example output

```
Token { data: BigNumber { s: 1, e: 8, c: [ 100000000 ] }, unit: 100 }
```

#### Reserved option

The reserved option tokens remaining in the pool.

```javascript
// voc: VOptionCtrt

console.log(await voc.getReservedOption());
```

Example output

```
Token { data: BigNumber { s: 1, e: 7, c: [ 98200000 ] }, unit: 100 }
```

#### Reserved proof

The reserved proof tokens remaining in the pool.

```javascript
// voc: VOptionCtrt

console.log(await voc.getReservedProof());
```

Example output

```
Token { data: BigNumber { s: 1, e: 6, c: [ 9000000 ] }, unit: 100 }
```

#### Price

The price of the contract creator.

```javascript
// voc: VOptionCtrt

console.log(await voc.getPrice());
```

Example output

```
Token { data: BigNumber { s: 1, e: 3, c: [ 5000 ] }, unit: 1 }
```

#### Price unit

The price unit of the contract creator.

```javascript
// voc: VOptionCtrt

console.log(await voc.getPriceUnit());
```

Example output

```
Token { data: BigNumber { s: 1, e: 4, c: [ 10000 ] }, unit: 1 }
```

#### Token locked

The locked token amount. What kind of token?

```javascript
// voc: VOptionCtrt

console.log(await voc.getTokenLocked());
```

Example output

```
Token { data: BigNumber { s: 1, e: 6, c: [ 1800000 ] }, unit: 100 }
```

#### Token collected

The amount of the base tokens in the pool.

```javascript
// voc: VOptionCtrt

console.log(await voc.getTokenCollected());
```

Example output

```
Token { data: BigNumber { s: 1, e: 5, c: [ 100100 ] }, unit: 100 }
```

#### Base token balance

Get the balance of the available base tokens.

```javascript
// voc: VOptionCtrt
// acnt: Account

console.log(await voc.getBaseTokBal(acnt.addr.data));
```

Example output

```
Token { data: BigNumber { s: 1, e: 5, c: [ 198999 ] }, unit: 100 }
```

#### Target token balance

Get the balance of the available target tokens.

```javascript
// voc: VOptionCtrt
// acnt: Account

console.log(await voc.getTargetTokBal(acnt.addr.data));
```

Example output

```
Token { data: BigNumber { s: 1, e: 5, c: [ 182000 ] }, unit: 100 }
```

#### Option token balance

Get the balance of the available option tokens.

```javascript
// voc: VOptionCtrt
// acnt: Account

console.log(await voc.getOptionTokBal(acnt0.addr.data));
```

Example output

```
Token { data: BigNumber { s: 1, e: 3, c: [ 8000 ] }, unit: 100 }
```

#### Proof token balance

Get the balance of the available proof tokens.

```javascript
// voc: VOptionCtrt
// acnt: Account

console.log(await voc.getProofTokBal(acnt0.addr.data));
```

Example output

```
Token { data: BigNumber { s: 1, e: 4, c: [ 10000 ] }, unit: 100 }
```

### Actions

#### Supersede

Transfer the ownership of the contract to another account.

```javascript
// voc: VOptionCtrt
// acnt0: Account
// acnt1: Account

let resp = await voc.supersede(
  acnt0, // by
  acnt1.addr.data // newOwner
);
console.log(resp);
```

Example output

```
{
  type: 9,
  id: 'FHZdvf3yyWuDnNTYeR6MZKTEqLJ1QxKfrDBqFrHDVBeJ',
  fee: 30000000,
  feeScale: 100,
  timestamp: 1646811541818733056,
  'proofs':[
    {
      proofType: 'Curve25519',
      publicKey: '6gmM7UxzUyRJXidy2DpXXMvrPqEF9hR1eAqsmh33J6eL',
      address: 'AU6BNRK34SLuc27evpzJbAswB6ntHV2hmjD',
      signature: '26gn57S3xmf1XVcrhcnmSEp82j6v7sMsskBj1pc8NZt5Gd5jKijkmUwgb52LLsnPepWfj7VH1TurTCcp3GrJSsMf'
    }
  ],
  contractId: 'CFAAxTu44NsfwMUfpmVd6y4vuN9xQNVFtGa',
  functionIndex: 0,
  functionData: '1CC6B9Tu94MJrtVckkunxuvwR4ixhCVVLeT4ZX9NUBN6KUifUdbuevxsezvw45po5HFnmyFYAchxWVfwG3zAdK5H729k8VxbmehT2pTXJ1T2xKh',
  attachment: ''
}
```

#### Activate

Activate the V Option contract to store option token and proof token into the pool.

```javascript
// acnt: Account
// voc: VOptionCtrt
// maxIssueNum: number
// price: number
// priceUnit: number

let resp = await voc.activate(
  acnt, // by
  10000, // maxIssueNum
  50, // price,
  100 //priceUnit
);
console.log(resp);
```

Example output

```
{
  type: 9,
  id: 'GSvfYox5vLADXAUYyu5Bm3VUKjyDwGvme2TBzDbSFfgS',
  fee: 30000000,
  feeScale: 100,
  timestamp: 1646897374037286912,
  'proofs':[
    {
      proofType: 'Curve25519',
      publicKey: 'AGy4ASY2CmVPSjQX4rNHrSHmcYAL4DNBawdyKT7p8vot',
      address: 'AU8h6YH5iJuwFzcUdGugUwKo2E8tbEHdtqu',
      signature: '3QzPAmP2yLqX1xaoFnYKMapPYgMHbB2Dsd3HFhgKyu5tZSbxmVuFqK9vxRZ1Aq4w3oDNwRWWrE3VvkcSQ1N8c29H'
    }
  ],
  contractId: 'CEyb8Q7A1kQw62vem1Jz5gmQFVrK28iny9b',
  functionIndex: 1,
  functionData: '12oCrKY2h2JDu8D8RTzEMDhUcrQ8dYoVQvjhPd2',
  attachment: ''
}
```

#### Mint

Mint target tokens into the pool to get option tokens and proof tokens. Same amount of option, proof and target tokens are used for minting. For example, if we set amount to 200, then 200 proof and option tokens will be given to acnt and 200 target tokens will be locked.

```javascript
// voc: VOptionCtrt
// acnt: Account
// amount: number

let resp = await voc.mint(
  acnt, // by
  200 // amount
);
console.log(resp);
```

Example output

```
{
  type: 9,
  id: 'AAnv8tdQfPvnuqxnbk7WvbvuRm4qZrLcaL9KMRbYLoPi',
  fee: 30000000,
  feeScale: 100,
  timestamp: 1646897448154491904,
  'proofs':[
    {
      proofType: 'Curve25519',
      publicKey: 'AGy4ASY2CmVPSjQX4rNHrSHmcYAL4DNBawdyKT7p8vot',
      address: 'AU8h6YH5iJuwFzcUdGugUwKo2E8tbEHdtqu',
      signature: '2KRogFF3Ws2govyDWN2CEEdPm7XQ7Mr83E4TTNz5kMomPtB36p1atnr9H96gduSKUTJSZS83Z8idywmrKbTTDcV8'
    }
  ],
  contractId: 'CEyb8Q7A1kQw62vem1Jz5gmQFVrK28iny9b',
  functionIndex: 2,
  functionData: '14JDCrdo1xwsuu',
  attachment: ''
}
```

#### Unlock

Get the remaining option tokens and proof tokens from the pool before the execute time. Amount equals to the amount of Target tokens to be unclocked.

```javascript
// voc: VOptionCtrt
// acnt: Account
// amount: number

let resp = await voc.unlock(
  acnt, // by
  100 // amount
);
console.log(resp);
```

Example output

```
{
  type: 9,
  id: '8PAsLgoAtFrn2kV3BTeoACyFW51vnFGNbEe97G6AhrjT',
  fee: 30000000,
  feeScale: 100,
  timestamp: 1646897501076599040,
  'proofs':[
    {
      proofType: 'Curve25519',
      publicKey: 'AGy4ASY2CmVPSjQX4rNHrSHmcYAL4DNBawdyKT7p8vot',
      address: 'AU8h6YH5iJuwFzcUdGugUwKo2E8tbEHdtqu',
      signature: '4Vjg1mDE7TwPn4VmP4DN8cRjnUciRU6iLbV3vG7BNYc8Z5LtCExs2TtTvJBP2axEkwtBAaqdqgtNWmDrNQbY1h3B'
    }
  ],
  contractId: 'CEyb8Q7A1kQw62vem1Jz5gmQFVrK28iny9b',
  functionIndex: 3,
  functionData: '14JDCrdo1xwsuu',
  attachment: ''
}
```

#### Execute

Execute the V Option contract to get target token after execute time. Amount equals to the amount of option tokens to be executed.

Note that amount of `price * amount` Base Tokens need to be deposited to V Option contract by executor.

```javascript
// voc: VOptionCtrt
// acnt: Account
// amount: number

let resp = await voc.execute(
  acnt, // by
  100 // amount
);
console.log(resp);
```

Example output

```
{
  type: 9,
  id: '6RyJ3reSorSmP6QuoS3A2p4tPJg7AAxKMcZqfvC7CnwM',
  fee: 30000000,
  feeScale: 100,
  timestamp: 1646898377867204096,
  'proofs':[
    {
      proofType: 'Curve25519',
      publicKey: 'AGy4ASY2CmVPSjQX4rNHrSHmcYAL4DNBawdyKT7p8vot',
      address: 'AU8h6YH5iJuwFzcUdGugUwKo2E8tbEHdtqu',
      signature: '5zW6HWiSHGePiSTpN53mfUKqJNo8XTjXjkXsyBXGNtH8wh9mSMzKbZiryTuf6vE6zvc1QnoszkaHGGhH4JxoShus'
    }
  ],
  contractId: 'CEyb8Q7A1kQw62vem1Jz5gmQFVrK28iny9b',
  functionIndex: 4,
  functionData: '14JDCrdo1xwstM',
  attachment: ''
}
```

#### Collect

Collect the base tokens or/and target tokens from the pool depending on the amount of proof tokens after execute deadline.

```javascript
// voc: VOptionCtrt
// acnt: Account
// amount: number

let resp = await vc.collect(
  acnt, // by
  10 // amount
);
console.log(resp);
```

Example output

```
{
  type: 9,
  id: 'D3KUN1JnteKE6vdqzSzg9xJUNDXDE7AUFyZ7vmqHoQvT',
  fee: 30000000,
  feeScale: 100,
  timestamp: 1646898410086354944,
  'proofs':[
    {
      proofType: 'Curve25519',
      publicKey: 'AGy4ASY2CmVPSjQX4rNHrSHmcYAL4DNBawdyKT7p8vot',
      address: 'AU8h6YH5iJuwFzcUdGugUwKo2E8tbEHdtqu',
      signature: 'XbmHoY36np9aRU9iZnSPpH4BZbSrtEBwof2uunRAGMcqnBiXo5zohX85sQxgtgi12SagJjpzaoXjyn3ZXCdSnH7'
    }
  ],
  contractId: 'CEyb8Q7A1kQw62vem1Jz5gmQFVrK28iny9b',
  functionIndex: 5,
  functionData: '14JDCrdo1xwsuu',
  attachment: ''
}
```
