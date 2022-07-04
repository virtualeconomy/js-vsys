# Payment Channel Contract

- [Payment Channel Contract](#payment-channel-contract)
  - [Introduction](#introduction)
  - [Usage with JavaScript SDK](#usage-with-javascript-sdk)
    - [Registration](#registration)
    - [From Existing Contract](#from-existing-contract)
    - [Querying](#querying)
      - [Maker](#maker)
      - [Token id](#token-id)
      - [Contract balance](#contract-balance)
      - [Channel creator](#channel-creator)
      - [Channel creator's public key](#channel-creators-public-key)
      - [Channel recipient](#channel-recipient)
      - [Channel accumulated load](#channel-accumulated-load)
      - [Channel accumulated payment](#channel-accumulated-payment)
      - [Channel expiration time](#channel-expiration-time)
      - [Channel status](#channel-status)
    - [Actions](#actions)
      - [Create and load](#create-and-load)
      - [Extend expiration time](#extend-expiration-time)
      - [Load](#load)
      - [Abort](#abort)
      - [Unload](#unload)
      - [Collect payment](#collect-payment)
      - [Generate the signature for off chain payments](#generate-the-signature-for-off-chain-payments)
      - [Verify the signature](#verify-the-signature)

## Introduction

Payment Channels have been implemented in a large number of blockchains as a method to increase the scalability of any protocol. By taking a large number of the transactions between two parties off-chain, it can significantly reduce the time and money cost of transactions.

The payment channel contract in VSYS is a one-way payment channel, which means that the paying user is considered as `sender` and the receiving user is `receiver`.

## Usage with JavaScript SDK

### Registration

`tokId` is the token id of the token that deposited into this payment channel contract.

For testing purpose, you can create a new [token contract]() , then [issue]() some tokens and [deposit]() into the payment channel contract.

```javascript
import * as jv from '@virtualeconomy/js-vsys';

// acnt: pv.Account
// tokId: str

// Register a new Payment Channel contract
const nc = await jv.PayChanCtrt.register(acnt, tokId);
console.log(nc.ctrtId); // print the id of the newly registered contract
```

Example output

```
CtrtID { data: 'CF78zQNY1kRBSVckXnnQFGveCTWBXpQaF4i' }
```

### From Existing Contract

ncId is the payment channel contract's id.

```javascript
import * as jv from '@virtualeconomy/js-vsys';

// ch: Chain
// ncId: string

const ncId = 'CF78zQNY1kRBSVckXnnQFGveCTWBXpQaF4i';
const nc = new jv.PayChanCtrt(ncId, ch);
```

### Querying

#### Maker

The address that made this payment channel contract instance.

```javascript
// nc: jv.PayChanCtrt

console.log(await nc.getMaker());
```

Example output

```
Addr { data: 'ATse3RcjEzwc5JHDPcduPYe4qA2mWhSNZaV' }
```

#### Token id

The token id of the token that deposited into this payment channel contract.

```javascript
// nc: jv.PayChanCtrt

console.log(await nc.getTokId());
```

Example output

```
TokenID { data: 'TWum8FrkHp3qooZShMtm3q4GKneV66evJibiwL3EM' }
```

#### Contract balance

The token balance within this contract.

```javascript
// nc: jv.PayChanCtrt
// acnt: pv.Account

const bal = await nc.getCtrtBal(acnt0.addr.data);
console.log(bal);
console.log(bal.data.toNumber());
```

Example output

```
Token { data: BigNumber { s: 1, e: 2, c: [ 300 ] }, unit: 1 }
300
```

#### Channel creator

The channel creator.

```javascript
// nc: jv.PayChanCtrt
// chanId: string e.g. '5dv575QktQMfB9YEi1qyzm5yi9YMMApGNZyddTbsxmpK'
// chanId is the transaction id of the createAndLoad function.

console.log(await nc.getChanCreator(chanId));
```

Example output

```
Addr { data: 'ATse3RcjEzwc5JHDPcduPYe4qA2mWhSNZaV' }
```

#### Channel creator's public key

The channel creator's public key.

```javascript
// nc: PayChanCtrt
// chanId: string e.g. '5dv575QktQMfB9YEi1qyzm5yi9YMMApGNZyddTbsxmpK'
// chanId is the transaction id of the createAndLoad function.

console.log(await nc.getChanCreatorPubKey(chanId));
```

Example output

```
PubKey { data: 'FwuW4LhiBFn6uu5id9nZGtp9o1RUG3DoX5MhyZibrjkE' }
```

#### Channel recipient

The recipient of the channel.

```javascript
// nc: PayChanCtrt
// chanId: string e.g. '5dv575QktQMfB9YEi1qyzm5yi9YMMApGNZyddTbsxmpK'
// chanId is the transaction id of the createAndLoad function.

console.log(await nc.getChanRecipient(chanId));
```

Example output

```
Addr { data: 'AUFDmJqrcwphseJccD1vkR7xbRciMijMpw4' }
```

#### Channel accumulated load

The accumulated load of the channel.

```javascript
// nc: PayChanCtrt
// chanId: string e.g. '5dv575QktQMfB9YEi1qyzm5yi9YMMApGNZyddTbsxmpK'
// chanId is the transaction id of the createAndLoad function.

const bal = await nc.getChanAccumLoad(chanId);
console.log(bal);
console.log(bal.data.toNumber());
```

Example output

```
Token { data: BigNumber { s: 1, e: 2, c: [ 300 ] }, unit: 1 }
300
```

#### Channel accumulated payment

The accumulated payment of the channel.

```javascript
// nc: PayChanCtrt
// chanId: string e.g. '5dv575QktQMfB9YEi1qyzm5yi9YMMApGNZyddTbsxmpK'
// chanId is the transaction id of the createAndLoad function.

const bal = await nc.getChanAccumPay(chanId);
console.log(bal);
console.log(bal.data.toNumber());
```

Example output

```
Token { data: BigNumber { s: 1, e: 2, c: [ 200 ] }, unit: 1 }
200
```

#### Channel expiration time

The expiration time of the channel.

```javascript
// nc: PayChanCtrt
// chanId: string e.g. '5dv575QktQMfB9YEi1qyzm5yi9YMMApGNZyddTbsxmpK'
// chanId is the transaction id of the createAndLoad function.

const ts = await nc.getChanAccumPay(chanId);
console.log(ts);
console.log(ts.data.toNumber());
```

Example output

```
VSYSTimestamp { data: BigNumber { s: 1, e: 18, c: [ 16463, 88206000000000 ] } }
1646388206000000000
```

#### Channel status

The channel status.(check if the channel is still alive)

```javascript
// nc: PayChanCtrt
// chanId: string e.g. '5dv575QktQMfB9YEi1qyzm5yi9YMMApGNZyddTbsxmpK'
// chanId is the transaction id of the createAndLoad function.

console.log(await nc.getChanStatus(chanId));
```

Example output

```
true
```

### Actions

#### Create and load

Create the payment channel and loads an amount into it.

Note that this transaction id is the channel id.

```javascript
import * as jv from '@virtualeconomy/js-vsys';

// acnt: Account
// receipt: string
// amount: number
// expiredTime: number

const resp = await nc.createAndLoad(
  acnt, // account
  acnt1.addr.data, // string
  amount, // number
  expiredTime // expiredTime
);
console.log(resp);
```

Example output

```
{
  type: 9,
  id: 'CK9X5ihyYFWNaTnyKTDpKSBiCvMv995GymftHdA49cxu',
  fee: 30000000,
  feeScale: 100,
  timestamp: 1655180876173000000,
  proofs: [
    {
      proofType: 'Curve25519',
      publicKey: 'FwuW4LhiBFn6uu5id9nZGtp9o1RUG3DoX5MhyZibrjkE',
      address: 'ATse3RcjEzwc5JHDPcduPYe4qA2mWhSNZaV',
      signature: '4R3LjDu4VHLED8iFQCX417Nx3DQ46w5NrFajT7KJLX1k2Fs1LWdf4UMiyScBu1Bid9Pgap76AgGUUjz99sGzTXnQ'
    }
  ],
  contractId: 'CF78zQNY1kRBSVckXnnQFGveCTWBXpQaF4i',
  functionIndex: 0,
  functionData: '1L43p6UZAJwBbkrGR5Xmkksnzh3juUkZNenxMnsvQeH5rHjbUxCfCmsMrv1EhTM',
  attachment: ''
}
```

#### Extend expiration time

Extend the expiration time of the channel to the new input timestamp.

```javascript
import * as jv from '@virtualeconomy/js-vsys';

// acnt: Account
// chanId: string
// expiredTime: number

const resp = await nc.extendExpTime(
  acnt, // acnt
  chanId, // chanId
  expiredTime // expiredTime
);
console.log(resp);
```

Example output

```
{
  type: 9,
  id: 'BQo3DsdktZ7uDbPNcLgKkr2VNQTJBrSneH68iTy9reFj',
  fee: 30000000,
  feeScale: 100,
  timestamp: 1655185652231000000,
  proofs: [
    {
      proofType: 'Curve25519',
      publicKey: 'FwuW4LhiBFn6uu5id9nZGtp9o1RUG3DoX5MhyZibrjkE',
      address: 'ATse3RcjEzwc5JHDPcduPYe4qA2mWhSNZaV',
      signature: '5z1vsF9Sba4coaLPSVw75Zf6RATGqbGd1q6N2KYxF37edKanCMUEXbmh1z5tqR4GMwZhmcXdkJyy4sqMVsQQYjE9'
    }
  ],
  contractId: 'CF78zQNY1kRBSVckXnnQFGveCTWBXpQaF4i',
  functionIndex: 1,
  functionData: '13w3j89HJuJoqWz8kk9gachT1W2ZBkCT3XQCEeHbiTipxU4biYxpXaD3uokRqh',
  attachment: ''
}
```

#### Load

Load more tokens into the channel.

```javascript
import * as jv from '@virtualeconomy/js-vsys';

// acnt: Account
// chanId: string
// amount: number

const resp = await nc.load(
  acnt, // account
  chanId, // chanId
  amount // amount
);
console.log(resp);
```

Example output

```
{
  type: 9,
  id: 'FGnvtcoSMdMFx87No45RkEwACK5wwtfdJCDnrPpBuvFY',
  fee: 30000000,
  feeScale: 100,
  timestamp: 1655185987297000000,
  proofs: [
    {
      proofType: 'Curve25519',
      publicKey: 'FwuW4LhiBFn6uu5id9nZGtp9o1RUG3DoX5MhyZibrjkE',
      address: 'ATse3RcjEzwc5JHDPcduPYe4qA2mWhSNZaV',
      signature: '4WNhqkEfRtVa38CwuPLSKsGc7KWGTGQMPYH8Ft5LGRqkh3E3Aasur3iDpMzXV8C4K6up914zFEDyyXGU2hCHrdNp'
    }
  ],
  contractId: 'CF78zQNY1kRBSVckXnnQFGveCTWBXpQaF4i',
  functionIndex: 2,
  functionData: '13w3j89HJuJoqWz8kk9gachT1W2ZBkCT3XQCEeHbiTipxU4biYtPcT1fkpTqJ7',
  attachment: ''
}
```

#### Abort

Abort the channel, triggering a 2-day grace period where the recipient can still collect payments. After 2 days, the payer can unload all the remaining funds that was locked in the channel.

```javascript
import * as jv from '@virtualeconomy/js-vsys';

// acnt: Account
// chanId: string

const resp = await nc.abort(acnt0, chanId);
console.log(resp);
```

Example output

```
{
  type: 9,
  id: '2UtbM2JU8cModdpUHVSAmtUE8vbUQmkks47jgz7f5tzY',
  fee: 30000000,
  feeScale: 100,
  timestamp: 1655186138342000000,
  proofs: [
    {
      proofType: 'Curve25519',
      publicKey: 'FwuW4LhiBFn6uu5id9nZGtp9o1RUG3DoX5MhyZibrjkE',
      address: 'ATse3RcjEzwc5JHDPcduPYe4qA2mWhSNZaV',
      signature: 'urmAkLYsA513vNJQHd3pLhHYV9juJFVPkgEdFgymWWm33Yn4jKv6F2CkrV8pyNDrQbrUrJrBC1W89CwKcmEtbYr'
    }
  ],
  contractId: 'CF78zQNY1kRBSVckXnnQFGveCTWBXpQaF4i',
  functionIndex: 3,
  functionData: '1TeCHbscabzz1zay7FwUwoEXvkNwBMtFfYxzM7hDRoF2ddXAX',
  attachment: ''
}
```

#### Unload

Unload all the funcs locked in the channel (only works if the channel has expired).

```javascript
import * as jv from '@virtualeconomy/js-vsys';

// acnt: Account
// chanId: string

const resp = await nc.unload(acnt0, chanId);
console.log(resp);
```

Example output

```
{
  type: 9,
  id: '2voS1zgyXDcvTGoBMhrTbAgWdLBgT1P5DghhomLX6je4',
  fee: 30000000,
  feeScale: 100,
  timestamp: 1655186248816000000,
  proofs: [
    {
      proofType: 'Curve25519',
      publicKey: 'FwuW4LhiBFn6uu5id9nZGtp9o1RUG3DoX5MhyZibrjkE',
      address: 'ATse3RcjEzwc5JHDPcduPYe4qA2mWhSNZaV',
      signature: '3LDp5reEQE2hTKyQKZtVsxjNbBNR24Hk98L2qM7aEw5zVjDA2prjiZhpiavXmcAyhzQWMD2GDpXWz3Nn2n1royAY'
    }
  ],
  contractId: 'CF78zQNY1kRBSVckXnnQFGveCTWBXpQaF4i',
  functionIndex: 4,
  functionData: '1TeCHbscabzz1zay7FwUwoEXvkNwBMtFfYxzM7hDRoF2ddXAX',
  attachment: ''
}
```

#### Collect payment

Collect the payment from the channel (only works if the channel has expired).

```javascript
import * as jv from '@virtualeconomy/js-vsys';

// acnt: Account
// chanId: string
// amount: number
// signature: string

const resp = await nc.collectPayment(
  acnt, // account
  chanId, // chanId
  amount, // amount
  signature // signature
);
console.log(resp);
```

Example output

```
{
   type:9,
   id:'Cvoga5EYH7XEetKW972TkY2hPrhUAKfSrqsWRwEgY3bw',
   fee:30000000,
   feeScale:100,
   timestamp:1646660721929943040,
   proofs:[
      {
         proofType:'Curve25519',
         publicKey:'AGy4ASY2CmVPSjQX4rNHrSHmcYAL4DNBawdyKT7p8vot',
         address:'AU8h6YH5iJuwFzcUdGugUwKo2E8tbEHdtqu',
         signature:'2FvBPw9gHSEk2wVdWVL1cNoUcdF79mwEavqcnQDtUmihf5d78wumJkTAsRyKc6CXuAswC9sFPwFyppiQgHGfs3FB'
      }
   ],
   contractId:'CFF4SuQRfkbWzNQx3NdykwZf1kfrZGHwzek',
   functionIndex:5,
   functionData:'1a8vFbntDanX1XowEXaTicnG3JdfcjbrUoEiCdxX8Yceqpo8eZ44WazR1yK1MnjZaQJ5GfJiyu53ZdRaWPGCXij87buUM3cKNswKswiRgmgCPGaHV6pa2ZE2G8BfTFZa1kurQUyVTJqMiTry2VmZFnBvq',
   attachment:''
}
```

#### Generate the signature for off chain payments

Generate the offchain payment signature.

```javascript
import * as jv from '@virtualeconomy/js-vsys';

// keyPair: md.KeyPair
// chanId: string
// amount: number

const resp = await nc.offchainPay(
  keyPair, // keyPair
  chan_id, // chanId
  amount // amount
);
console.log(resp);
```

Example output

```
2NreuGDAcLCfUnUkCMny9NSHJguWKQPZTZusxHP4uDyDfo9xBAGB2EuQ975KtHgzJGCAqWa1E1APnMJwbbfY6SmF
```

#### Verify the signature

Verify the payment signature.

```javascript
import * as jv from '@virtualeconomy/js-vsys';

// chanId: string
// amount: number
// signature: string

const resp = await nc.verifySig(
    chanId // chanId
    amount // amount
    signature // signature
);
console.log(resp);
```

Example output

```
true
```
