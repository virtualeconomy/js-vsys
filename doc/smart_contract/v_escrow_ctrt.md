# V Escrow Contract

- [V Escrow Contract](#v-escrow-contract)
  - [Introduction](#introduction)
  - [Usage with JavaScript SDK](#usage-with-javascript-sdk)
    - [Registration](#registration)
    - [From Existing Contract](#from-existing-contract)
    - [Querying](#querying)
      - [Maker](#maker)
      - [Judge](#judge)
      - [Token id](#token-id)
      - [Duration](#duration)
      - [Judge Duration](#judge-duration)
      - [Contract balance](#contract-balance)
      - [Order payer](#order-payer)
      - [Order recipient](#order-recipient)
      - [Order amount](#order-amount)
      - [Order recipient deposit](#order-recipient-deposit)
      - [Order judge deposit](#order-judge-deposit)
      - [Order fee](#order-fee)
      - [Order recipient amount](#order-recipient-amount)
      - [Order refund](#order-refund)
      - [Order recipient refund](#order-recipient-refund)
      - [Order expiration time](#order-expiration-time)
      - [Order status](#order-status)
      - [Order recipient deposit status](#order-recipient-deposit-status)
      - [Order judge deposit status](#order-judge-deposit-status)
      - [Order submit status](#order-submit-status)
      - [Order judge status](#order-judge-status)
      - [Order recipient locked amount](#order-recipient-locked-amount)
      - [Order judge locked amount](#order-judge-locked-amount)
    - [Actions](#actions)
      - [Supersede](#supersede)
      - [Create](#create)
      - [Recipient_deposit](#recipient_deposit)
      - [Judge deposit](#judge-deposit)
      - [Payer cancel](#payer-cancel)
      - [Recipient cancel](#recipient-cancel)
      - [Judge cancel](#judge-cancel)
      - [Submit work](#submit-work)
      - [Approve work](#approve-work)
      - [Apply to judge](#apply-to-judge)
      - [Do judge](#do-judge)
      - [Submit penalty](#submit-penalty)
      - [Payer refund](#payer-refund)
      - [Recipient refund](#recipient-refund)
      - [Collect](#collect)

## Introduction

[Escrow contract](https://en.wikipedia.org/wiki/Escrow) is a contractual arrangement in which a third party (the stakeholder or escrow agent) receives and disburses money or property for the primary transacting parties, with the disbursement dependent on conditions agreed to by the transacting parties.

The V Escrow contract allows two parties to do transactions with one another if they have mutual trust in a third party. It is expected that the third party will be a large trusted entity that receives fees for facilitating transactions between parties.

## Usage with JavaScript SDK

### Registration

`tokId` is the token id of the token that deposited into this V Escrow contract.

Note that the caller is the judge of the escrow contract.

For testing purpose, you can create a new [token contract]() , then [issue]() some tokens and [deposit]() into the escrow contract.

```javascript
import * as jv from '@virtualeconomy/js-vsys';

// acnt: Account
// tokId: string
// dur: number
// judgeDur: number
// description: string

// Register a new V Escrow contract
const vec = await jv.VEscrowCtrt.register(
  acnt, // by
  tokId, // tokId
  dur, // duration - The duration in which the recipient can take actions.
  judgeDur, // judgeDuration - The duration in which the judge can take actions.
  'docs escrow contract' // ctrtDescription
);
console.log('ctrtId: ', vec.ctrtId.data);
```

Example output

```
ctrtId: CEzgEwke6qw4im78x22aNgnqKe3dVxfeciD
```

### From Existing Contract

`vecId` is the escrow contract's id.

```javascript
import * as jv from '@virtualeconomy/js-vsys';

// ch: Chain
// vecId: string

const vecId = 'CEzgEwke6qw4im78x22aNgnqKe3dVxfeciD';
const vec = jv.VEscrowCtrt(
  vecId, // ctrtId
  ch // chain
);
```

### Querying

#### Maker

The address that made this v escrow contract instance.

```javascript
// vec: VEscrowCtrt

console.log(await vec.getMaker());
```

Example output

```
Addr { data: 'ATracVxHwdYF394gXEawdZe9stB9yLH6V7q' }
```

#### Judge

The judge of the contract.

```javascript
// vec: VEscrowCtrt

console.log(await vec.getJudge());
```

Example output

```
Addr { data: 'ATracVxHwdYF394gXEawdZe9stB9yLH6V7q' }
```

#### Token id

The token_id of the contract. Caches result if it hasn't been retrieved earlier.

```javascript
// vec: VEscrowCtrt
// acnt: Account

console.log(await vec.getTokId());
```

Example output

```
TokenID { data: 'TWsi8XxwJqrHZTbjYMj4f3nHCTE37oRXRjfHCwahj' }
```

#### Duration

The duration where the recipient can take actions in the contract.

```javascript
// vec: VEscrowCtrt

console.log(await vec.getDuration());
```

Example output

```
VSYSTimestamp { data: BigNumber { s: 1, e: 21, c: [ 16552542 ] } }
```

#### Judge Duration

The duration where the judge can take actions in the contract.

```javascript
// vec: VEscrowCtrt

console.log(await vec.getJudgeDuration());
```

Example output

```
VSYSTimestamp { data: BigNumber { s: 1, e: 21, c: [ 16558590 ] } }
```

#### Contract balance

The balance of the token within this contract belonging to the user address.

```javascript
// vec: VEscrowCtrt
// acnt: Account

console.log(await vec.getCtrtBal(acnt.addr.data));
```

Example output

```
Token { data: BigNumber { s: 1, e: 0, c: [ 0 ] }, unit: 100 }
```

#### Order payer

The payer of the order.

```javascript
// vec: VEscrowCtrt
// orderID: string - TransactionID of escrow order

console.log(await vec.getOrderPayer(orderID));
```

Example output

```
Addr { data: 'ATracVxHwdYF394gXEawdZe9stB9yLH6V7q' }
```

#### Order recipient

The recipient of the order.

```javascript
// vec: VEscrowCtrt
// orderID: string - TransactionID of buy order

let resp = await vec.getOrderRcpt(orderID);
console.log(resp);
```

Example output

```
Addr { data: 'ATracVxHwdYF394gXEawdZe9stB9yLH6V7q' }
```

#### Order amount

The amount of the order.

```javascript
// vec: VEscrowCtrt
// orderID: string - TransactionID of escrow order

let resp = await vec.getOrderAmount(orderID);
console.log(resp);
```

Example output

```
Token { data: BigNumber { s: 1, e: 0, c: [ 0 ] }, unit: 100 }
```

#### Order recipient deposit

The amount the recipient should deposit in the order.

```javascript
// vec: VEscrowCtrt
// orderID: string - TransactionID of escrow order

let resp = await vec.getOrderRcptDeposit(orderID);
console.log(resp);
```

Example output

```
Token { data: BigNumber { s: 1, e: 4, c: [ 10000 ] }, unit: 100 }
```

#### Order judge deposit

The amount the judge should deposit in the order.

```javascript
// vec: VEscrowCtrt
// orderID: string - TransactionID of escrow order

let resp = await vec.getOrderJudgeDeposit(orderID);
console.log(resp);
```

Example output

```
Token { data: BigNumber { s: 1, e: 4, c: [ 10000 ] }, unit: 100 }
```

#### Order fee

The fee of the order.

```javascript
// vec: VEscrowCtrt
// orderID: string - TransactionID of escrow order

let resp = await vec.getOrderFee(orderID);
console.log(resp);
```

Example output

```
Token { data: BigNumber { s: 1, e: 2, c: [ 100 ] }, unit: 100 }
```

#### Order recipient amount

The amount the recipient will receive from the order if the order goes smoothly(i.e. work is submitted & approved).

The recipient amount = order amount - order fee.

```javascript
// vec: VEscrowCtrt
// orderID: string - TransactionID of escrow order

let resp = await vec.getOrderRcptAmount(orderID);
console.log(resp);
```

Example output

```
Token { data: BigNumber { s: 1, e: 4, c: [ 19900 ] }, unit: 100 }
```

#### Order refund

The refund amount of the order.

The refund amount means how much the payer will receive if the refund occurs.

It is defined when the order is created.

```javascript
// vec: VEscrowCtrt
// orderID: string - TransactionID of escrow order

let resp = await vec.getOrderRefund(orderID);
console.log(resp);
```

Example output

```
Token { data: BigNumber { s: 1, e: 4, c: [ 10000 ] }, unit: 100 }
```

#### Order recipient refund

The recipient refund amount of the order.

The recipient refund amount means how much the recipient will receive if the refund occurs.

The recipient refund amount = The total deposit(order amount + judge deposit + recipient deposit) - payer refund

```javascript
// vec: VEscrowCtrt
// orderID: string - TransactionID of escrow order

let resp = await vec.getOrderRcptRefund(orderID);
console.log(resp);
```

Example output

```
Token { data: BigNumber { s: 1, e: 4, c: [ 10000 ] }, unit: 100 }
```

#### Order expiration time

The expiration time of the order.

```javascript
// vec: VEscrowCtrt
// orderID: string - TransactionID of escrow order

let resp = await vec.getOrderExpTime(orderID);
console.log(resp);
```

Example output

```
VSYSTimestamp {
  data: BigNumber { s: 1, e: 24, c: [ 16547444780, 2194200000000 ] }
}
```

#### Order status

The status of the order. (check if the order is still active)

```javascript
// vec: VEscrowCtrt
// orderID: string - TransactionID of escrow order

let resp = await vec.getOrderStatus(orderID);
console.log(resp);
```

Example output

```
true
```

#### Order recipient deposit status

The recipient deposit status of the order.

The order recipient deposit status means if the recipient has deposited into the order.

true - recipient deposited

false - recipient didn't deposit

```javascript
// vec: VEscrowCtrt
// orderID: string - TransactionID of escrow order

let resp = await vec.getOrderRcptDepositStatus(orderID);
console.log(resp);
```

Example output

```
true
```

#### Order judge deposit status

The judge deposit status of the order.

The order judge deposit status means if the judge has deposited into the order.

```javascript
// vec: VEscrowCtrt
// orderID: string - TransactionID of escrow order

let resp = await vec.getOrderJudgeDepositStatus(orderID);
console.log(resp);
```

Example output

```
true
```

#### Order submit status

The submit status of the order.

true - submitted

false - not submitted

```javascript
// vec: VEscrowCtrt
// orderID: string - TransactionID of escrow order

let resp = await vec.getOrderSubmitStatus(orderID);
console.log(resp);
```

Example output

```
true
```

#### Order judge status

The judge status of the order.

```javascript
// vec: VEscrowCtrt
// orderID: string - TransactionID of escrow order

let resp = await vec.getOrderJudgeStatus(orderID);
console.log(resp);
```

Example output

```
true
```

#### Order recipient locked amount

The amount from the recipient that is locked(deposited) in the order.

```javascript
// vec: VEscrowCtrt
// orderID: string - TransactionID of escrow order

let resp = await vec.getOrderRcptLockedAmount(orderID);
console.log(resp);
```

Example output

```
Token { data: BigNumber { s: 1, e: 4, c: [ 20000 ] }, unit: 100 }
```

#### Order judge locked amount

The amount from the judge that is locked(deposited) in the order.

```javascript
// vec: VEscrowCtrt
// orderID: string - TransactionID of escrow order

let resp = await vec.getOrderJudgeLockedAmount(orderID);
console.log(resp);
```

Example output

```
Token { data: BigNumber { s: 1, e: 4, c: [ 10000 ] }, unit: 100 }
```

### Actions

#### Supersede

Transfer the judge right of the contract to another account.

```javascript
// acnt: Account
// newJudge: Account

resp = await vec.supersede(
  acnt, // by
  newJudge.addr.data // newJudge
);
console.log(resp);
```

Example output

```
{
   type: 9,
   id: '3rcBvZgjmWwuyGxj8bYKszq9gAh2EaYhsdtuVytzdefX',
   fee: 30000000,
   feeScale: 100,
   timestamp: 1646882999824276992,
   proofs:[
      {
         proofType: 'Curve25519',
         publicKey: 'AGy4ASY2CmVPSjQX4rNHrSHmcYAL4DNBawdyKT7p8vot',
         address: 'AU8h6YH5iJuwFzcUdGugUwKo2E8tbEHdtqu',
         signature: '3AeCypzYrGUKN9SvCsqEzBZHfwE22sskbwW9YnZHAJWr7SZDx126Fox6X4taxUUUvkSQXzcvUQ8TfFZdxSBU2E4i'
      }
   ],
   contractId: 'CFELoT1MwMpnvyUkjLe1QHPfah1qNJKFNo1',
   functionIndex: 0,
   functionData: '1bscuAaJJG9yGDp4E7ddsqTNV2eZhCAZ5c8gJV',
   attachment: ''
}
```

#### Create

Create an escrow order and called by the payer.

Note that this transaction id of this action is the **order ID**.

```javascript
// acnt: Account
// recipient: string
// amount: number
// rcptDepositAmount: number
// judgeDepositAmount: number
// orderFee: number
// refundAmount : number
// expireTime : number - UNIX timestamp

let resp = await vec.create(
  acnt0, // by
  acnt2.addr.data, // recipient
  100, // amount
  10, // rcptDepositAmount
  10, // judgeDepositAmount
  5, // orderFee
  80, // refundAmount
  Date.now() + 45 * 1000 // expireTime
);
console.log(resp);
```

Example output

```
{
  type: 9,
  id: 'BzSm8WcjDeK1UQLiddXN4ot4A5eXJwqry9D5QjLD12KJ',
  fee: 30000000,
  feeScale: 100,
  timestamp: 1646881388346998016,
  proofs:[
    {
      proofType: 'Curve25519',
      publicKey: 'AGy4ASY2CmVPSjQX4rNHrSHmcYAL4DNBawdyKT7p8vot',
      address: 'AU8h6YH5iJuwFzcUdGugUwKo2E8tbEHdtqu',
      signature: '2FqDCHPU4ZgbozmrzvV4msi3ZvMwiemA6F9N9hGaciHBRTPTZXtTXYPKUi4ejdrKf2ZM1ZG6X4pXc2DKXnoaKCct'
    }
  ],
  contractId: 'CFELoT1MwMpnvyUkjLe1QHPfah1qNJKFNo1',
  functionIndex: 1,
  functionData: '12VHeVqTaDWskAAiGYkBQL6oihG5kovw4gj29jE7JoVYfUnEmpw8VL8qWjamUyrjfdG6HQFx9NUpw3YRYs2wtRZ1r61T1HbJmmmTTY7R7v8Nvmur7',
  attachment: ''
}
```

#### Recipient_deposit

Deposit tokens the recipient deposited into the contract into the order.

Note that it is called by the recipient.

```javascript
// acnt: Account
// orderID: string - transaction ID of order(create) transaction

resp = await vec.recipientDeposit(
  acnt, // by
  orderID
);
console.log(resp);
```

Example output

```
{
  type: 9,
  id: 'GwXxuKBBPPXTzYyDnMCZNjyPDR3EiUNLbkfFSH9dFPv5',
  fee: 30000000,
  feeScale: 100,
  timestamp: 1646882048437253120,
  proofs:[
    {
      proofType: 'Curve25519',
      publicKey: '3b3bu31esBWgeQyFfUeYmPwPUhQpPtVJehuRpreM5pMY',
      address: 'AUCzwTg7EjGoa68nRy27873LY5LtvKmQy2H',
      signature: '61ViUq32Yj6S4vJFCXQVcaodk3W4HphfGdxomwqi3o8XCetSxF3Zko6QXds6giZKTY1amYtBqn1GM7Km6VX4MGZU'
    }
  ],
  contractId: 'CFELoT1MwMpnvyUkjLe1QHPfah1qNJKFNo1',
  functionIndex: 2,
  functionData: '1TeCHebgxCv7DkqMwg9L3SixXNuZGCu9pX4pjQ7rkK1gfotqN',
  attachment: ''
}
```

#### Judge deposit

Deposit tokens the judge deposited into the contract into the order.

Note that it is called by the judge.

```javascript
// acnt: Account
// orderID: string - transaction ID of order(create) transaction

let resp = await vec.judgeDeposit(acnt, orderID);
console.log(resp);
```

Example output

```
{
  type: 9,
  id: '3bLWQKSwWF2kJqzakiysL1QfkbQXGWr7EVtEskDnt4Vs',
  fee: 30000000,
  feeScale: 100,
  timestamp: 1646882146032102912,
  proofs:[
    {
      proofType: 'Curve25519',
      publicKey: 'AGy4ASY2CmVPSjQX4rNHrSHmcYAL4DNBawdyKT7p8vot',
      address: 'AU8h6YH5iJuwFzcUdGugUwKo2E8tbEHdtqu',
      signature: '51QzEjGeZ6ssM2kUrJd41aNn1zGLehyVBNA5hcxHaKCknXLwfcnJaUgViUZxvQeYRJFFJaAbyYfBgfRkHb686DTQ'
    }
  ],
  contractId: 'CFELoT1MwMpnvyUkjLe1QHPfah1qNJKFNo1',
  functionIndex: 3,
  functionData: '1TeCHebgxCv7DkqMwg9L3SixXNuZGCu9pX4pjQ7rkK1gfotqN',
  attachment: ''
}
```

#### Payer cancel

Cancel the order by the payer.

Note that it is called by the payer.

```javascript
// acnt: Account
// orderID: string - transaction ID of order(create) transaction

let resp = await vec.payerCancel(acnt, orderID);
console.log(resp);
```

Example output

```
{
  type: 9,
  id: '6pAcJvw9GFAyaCoyKfBHcxrrSxAcuEfD7z31NQeJN3uy',
  fee: 30000000,
  feeScale: 100,
  timestamp: 1646882889741327104,
  proofs:[
    {
      proofType: 'Curve25519',
      publicKey: 'AGy4ASY2CmVPSjQX4rNHrSHmcYAL4DNBawdyKT7p8vot',
      address: 'AU8h6YH5iJuwFzcUdGugUwKo2E8tbEHdtqu',
      signature: '3itBEv8Z7XZXhrxyUHcxgh8RvdCq9g7we95aWw2whCrCJQqj56yPvXYJMuWW5xV3UjYByXeg2vCooYzAbEmAeArH'
    }
  ],
  contractId: 'CFELoT1MwMpnvyUkjLe1QHPfah1qNJKFNo1',
  functionIndex: 4,
  functionData: '1TeCHebgxCv7DkqMwg9L3SixXNuZGCu9pX4pjQ7rkK1gfotqN',
  attachment: ''
}
```

#### Recipient cancel

Cancel the order by the recipient.

Note that it is called by the recipient.

```javascript
// acnt: Account
// orderID: string - transaction ID of order(create) transaction

let resp = await vec.recipientCancel(acnt, orderID);
console.log(resp);
```

Example output

```
{
  type: 9,
  id: 'F1S2w6sJCoK7mgivpY6hpEZ1rThc8uuzNMXfid2XA5Ab',
  fee: 30000000,
  feeScale: 100,
  timestamp: 1646882915023735040,
  proofs:[
    {
      proofType: 'Curve25519',
      publicKey: '3b3bu31esBWgeQyFfUeYmPwPUhQpPtVJehuRpreM5pMY',
      address: 'AUCzwTg7EjGoa68nRy27873LY5LtvKmQy2H',
      signature: '3g2Ycs9581XRTb2xKfnH431vCYknVE5mK3EgR1yKAq7Du3jLqdEg64k6qxTL639f8Fg4toYv5i2SaDXmKXEZqb5s'
    }
  ],
  contractId: 'CFELoT1MwMpnvyUkjLe1QHPfah1qNJKFNo1',
  functionIndex: 5,
  functionData: '1TeCHebgxCv7DkqMwg9L3SixXNuZGCu9pX4pjQ7rkK1gfotqN',
  attachment: ''
}
```

#### Judge cancel

Cancel the order by the judge.

Note that it is called by the judge.

```javascript
// acnt: Account
// orderID: string - transaction ID of order(create) transaction

let resp = await vec.judgeCancel(acnt, orderID);
console.log(resp);
```

Example output

```
{
  type: 9,
  id: 'Ja1XDa5A9vJpWehU1RbJaJB27v4f9azzQBbxPZiS6UC',
  fee: 30000000,
  feeScale: 100,
  timestamp: 1646882932349136896,
  proofs:[
    {
      proofType: 'Curve25519',
      publicKey: '3b3bu31esBWgeQyFfUeYmPwPUhQpPtVJehuRpreM5pMY',
      address: 'AUCzwTg7EjGoa68nRy27873LY5LtvKmQy2H',
      signature: '4k3MdqqDJuAa3VJwt7o61Q9Vak9JCV8wGJ8Rc5s4cgushtapLyLZZaQQQAqX7TYDtq3u2PskUkiN5WubUWRQWd6R'
    }
  ],
  contractId: 'CFELoT1MwMpnvyUkjLe1QHPfah1qNJKFNo1',
  functionIndex: 6,
  functionData: '1TeCHebgxCv7DkqMwg9L3SixXNuZGCu9pX4pjQ7rkK1gfotqN',
  attachment: ''
}
```

#### Submit work

Submit the work by the recipient.

Note that it is called by the recipient.

```javascript
// acnt: Account
// orderID: string - transaction ID of order(create) transaction

resp = await vec.submitWork(acnt, orderID);
console.log(resp);
```

Example output

```
{
  type: 9,
  id: 'EMzhichuGTqePvzfiGhjeef9vpPaTu9AK4XfJExZTWUi',
  fee: 30000000,
  feeScale: 100,
  timestamp: 1646882211703728896,
  proofs:[
    {
      proofType: 'Curve25519',
      publicKey: '3b3bu31esBWgeQyFfUeYmPwPUhQpPtVJehuRpreM5pMY',
      address: 'AUCzwTg7EjGoa68nRy27873LY5LtvKmQy2H',
      signature: 'dhEw5KTUav7MjSX3ScETjyXsvbfdeYL1Hy7Yh6STe2p4PEgjW9MQteo2rdN3qpFNokBYwUTndXPySYtRJzi2LHd'
    }
  ],
  contractId: 'CFELoT1MwMpnvyUkjLe1QHPfah1qNJKFNo1',
  functionIndex: 7,
  functionData: '1TeCHebgxCv7DkqMwg9L3SixXNuZGCu9pX4pjQ7rkK1gfotqN',
  attachment: ''
}
```

#### Approve work

Approve the work and agrees the amounts are paid by the payer.

Note that it is called by the payer.

```javascript
// acnt: Account
// orderID: string - transaction ID of order(create) transaction

resp = await vec.approveWork(acnt, orderID);
console.log(resp);
```

Example output

```
{
  type: 9,
  id: 'D16ZTeCaZf4w4NwVRNnYGqfDC2EUXqxR2FaZffLqGCz1',
  fee: 30000000,
  feeScale: 100,
  timestamp: 1646882254024552960,
  proofs:[
    {
      proofType: 'Curve25519',
      publicKey: 'AGy4ASY2CmVPSjQX4rNHrSHmcYAL4DNBawdyKT7p8vot',
      address: 'AU8h6YH5iJuwFzcUdGugUwKo2E8tbEHdtqu',
      signature: '5iTtmpm3rBZPj3QYwVyT9KVAVxgCo3mxRz38HpV38dWAYe7d2D34o2UFrBXwXH2bo17dcB1L9AKgEdAne2aLvVk2'
    }
  ],
  contractId: 'CFELoT1MwMpnvyUkjLe1QHPfah1qNJKFNo1',
  functionIndex: 8,
  functionData: '1TeCHebgxCv7DkqMwg9L3SixXNuZGCu9pX4pjQ7rkK1gfotqN',
  attachment: ''
}
```

#### Apply to judge

Apply for the help from judge by the payer.

Note that it is called by the payer.

```javascript
// acnt: Account
// orderID: string - transaction ID of order(create) transaction

let resp = await vec.applyToJudge(
  acnt, // by
  orderID
);
console.log(resp);
```

Example output

```
{
  type: 9,
  id: 'GQfoMmJMaANuitsZ44MmDTBByLppCm4dK4h65cWA5ewv',
  fee: 30000000,
  feeScale: 100,
  timestamp: 1646882524284631040,
  proofs:[
    {
      proofType: 'Curve25519',
      publicKey: 'AGy4ASY2CmVPSjQX4rNHrSHmcYAL4DNBawdyKT7p8vot',
      address: 'AU8h6YH5iJuwFzcUdGugUwKo2E8tbEHdtqu',
      signature: '3yksVGHttsYgQKCh3E6956TraEed2i2gTxsPKMHoQXazx5cVQCfS3yjZSnvVpGV6midGTQLioHLLv1mVXzCv6tU9'
    }
  ],
  contractId: 'CFELoT1MwMpnvyUkjLe1QHPfah1qNJKFNo1',
  functionIndex: 9,
  functionData: '1TeCHebgxCv7DkqMwg9L3SixXNuZGCu9pX4pjQ7rkK1gfotqN',
  attachment: ''
}
```

#### Do judge

Judge the work and decides on how much the payer & recipient will receive.

Note that it is called by the judge.

```javascript
// acnt: Account
// orderID: string - transaction ID of order(create) transaction

let resp = await vec.doJudge(
  acnt, // by
  orderID,
  45, // payerAmount
  5 // rcptAmount
);
console.log(resp);
```

Example output

```
{
  type: 9,
  id: '2ufCFAuGYvFDrswnhBmy8fds255iygZvKfJE7UyPNEZQ',
  fee: 30000000,
  feeScale: 100,
  timestamp: 1646882653100937984,
  proofs:[
    {
      proofType: 'Curve25519',
      publicKey: 'AGy4ASY2CmVPSjQX4rNHrSHmcYAL4DNBawdyKT7p8vot',
      address: 'AU8h6YH5iJuwFzcUdGugUwKo2E8tbEHdtqu',
      signature: '3saCcJ5LkrwpqH7Lx9ZrExyjbC6etzGjTZrikZ3ivutakjHKcMmAVAYTQX9JPUMeo6gCPuh5E418koTA4XZZmSAZ'
    }
  ],
  contractId: 'CFELoT1MwMpnvyUkjLe1QHPfah1qNJKFNo1',
  functionIndex: 10,
  functionData: '1FELDwy6qwRvq3v9gcwpMQGspRNRNFweWzzPq5X2iu5vepdwvsKsrMotgQUmexGpkrdt2M4JuZ',
  attachment: ''
}
```

#### Submit penalty

Submit penalty by the payer for the case where the recipient does not submit work before the expiration time. The payer will obtain the recipient deposit amount and the payer amount(fee deducted).

The judge will still get the fee.

Note that it is called by the payer.

```javascript
// acnt: Account
// orderID: string - transaction ID of order(create) transaction

let resp = await vec.submitPenalty(
  acnt, // by
  orderID
);
console.log(resp);
```

Example output

```
{
  type: 9,
  id: '4FqBmqcAGANwiyViWyk4h4mo2yF2gDmtYLEgGi68d5os',
  fee: 30000000,
  feeScale: 100,
  timestamp: 1646882694781840896,
  proofs:[
    {
      proofType: 'Curve25519',
      publicKey: 'AGy4ASY2CmVPSjQX4rNHrSHmcYAL4DNBawdyKT7p8vot',
      address: 'AU8h6YH5iJuwFzcUdGugUwKo2E8tbEHdtqu',
      signature: '9DsgCCeCPwNZUswZx4Rj8o3vCEajE2NS5REjfVbamYWKjKM1kpvrf88ZUcTCrppPvE2w3enm936PMhrpjxPnigZ'
    }
  ],
  contractId: 'CFELoT1MwMpnvyUkjLe1QHPfah1qNJKFNo1',
  functionIndex: 11,
  functionData: '1TeCHebgxCv7DkqMwg9L3SixXNuZGCu9pX4pjQ7rkK1gfotqN',
  attachment: ''
}
```

#### Payer refund

Make the refund action by the payer when the judge does not judge the work in time after the apply_to_judge function is invoked.

The judge loses his deposit amount and the payer receives the refund amount.

The recipient receives the rest.

Note that it is called by the payer.

```javascript
// acnt: Account
// orderID: string - transaction ID of order(create) transaction

let resp = await vec.payerRefund(
  acnt1, // by
  orderID
);
console.log(resp);
```

Example output

```
{
  type: 9,
  id: 'HDe4BqtyMd2Fk6gU4piZ8MuSe613cdG7JsxgJeML68nh',
  fee: 30000000,
  feeScale: 100,
  timestamp: 1646882724888898048,
  proofs:[
    {
      proofType: 'Curve25519',
      publicKey: 'AGy4ASY2CmVPSjQX4rNHrSHmcYAL4DNBawdyKT7p8vot',
      address: 'AU8h6YH5iJuwFzcUdGugUwKo2E8tbEHdtqu',
      signature: '3tQS3AiEtUigvUx26KAqpiHwfJ2kjB7fxUUsAG4NyQbQ8eLp5qqiTkVxUTCZA9Di5s5vWVchCKkFN8wzqguwjijQ'
    }
  ],
  contractId: 'CFELoT1MwMpnvyUkjLe1QHPfah1qNJKFNo1',
  functionIndex: 12,
  functionData: '1TeCHebgxCv7DkqMwg9L3SixXNuZGCu9pX4pjQ7rkK1gfotqN',
  attachment: ''
}
```

#### Recipient refund

Make the refund action by the recipient when the judge does not judge the work in time after the apply_to_judge function is invoked.

The judge loses his deposit amount and the payer receives the refund amount.

The recipient receives the rest.

Note that it is called by the recipient.

```javascript
// acnt: Account
// orderID: string - transaction ID of order(create) transaction

let resp = await vec.rcptRefund(
  acnt, // by
  orderID
);
console.log(resp);
```

Example output

```
{
  type: 9,
  id: '65zmh3W5SPaaAGx41w3n773P2hxYhWsts28dB136oVKS',
  fee: 30000000,
  feeScale: 100,
  timestamp: 1646882745370246912,
  proofs:[
    {
      proofType: 'Curve25519',
      publicKey: '3b3bu31esBWgeQyFfUeYmPwPUhQpPtVJehuRpreM5pMY',
      address: 'AUCzwTg7EjGoa68nRy27873LY5LtvKmQy2H',
      signature: '66fb4EJVxYrq42485i2hcf5LcgkD6nmQ2cRLRtLNQNoozzhTsV7zMonpvgCLtDeJnCsrjcYxmtg2uUTXxWWVtQAi'
    }
  ],
  contractId: 'CFELoT1MwMpnvyUkjLe1QHPfah1qNJKFNo1',
  functionIndex: 13,
  functionData: '1TeCHebgxCv7DkqMwg9L3SixXNuZGCu9pX4pjQ7rkK1gfotqN',
  attachment: ''
}
```

#### Collect

Collect the order amount & recipient deposited amount by the recipient when the work is submitted while the payer doesn't either approve or apply to judge in his action duration.

The judge will get judge deposited amount & fee.

Note that it is called by the recipient.

```javascript
// acnt: Account
// orderID: string - transaction ID of order(create) transaction

let resp = await vec.collect(
  acnt0, // by
  orderID
);
console.log(resp);
```

Example output

```
{
  type: 9,
  id: 'FwGaUzMokx9LeK11JQMhWqifZTGnY9FxcHTHqukK9WLg',
  fee: 30000000,
  feeScale: 100,
  timestamp: 1646882826686446080,
  proofs:[
    {
      proofType: 'Curve25519',
      publicKey: '3b3bu31esBWgeQyFfUeYmPwPUhQpPtVJehuRpreM5pMY',
      address: 'AUCzwTg7EjGoa68nRy27873LY5LtvKmQy2H',
      signature: '4nHAtc7xRrrdTvGsRri8eWkGv7ncMZapiQqBimR6so7ELAMwMGh7VTdu5cxQcZiiCr3xkw6tn7VQHurKLytB5CgB'
    }
  ],
  contractId: 'CFELoT1MwMpnvyUkjLe1QHPfah1qNJKFNo1',
  functionIndex: 14,
  functionData: '1TeCHebgxCv7DkqMwg9L3SixXNuZGCu9pX4pjQ7rkK1gfotqN',
  attachment: ''
}
```
