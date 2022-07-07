# Account

- [Account](#account)
  - [Introduction](#introduction)
  - [Usage with JavaScript SDK](#usage-with-javascript-sdk)
    - [Create Account](#create-account)
      - [From Wallet](#from-wallet)
      - [From Private Key & Public Key](#from-private-key--public-key)
    - [Properties](#properties)
      - [Chain](#chain)
      - [Api](#api)
      - [Key Pair](#key-pair)
      - [Address](#address)
      - [VSYS Balance](#vsys-balance)
      - [VSYS Available Balance](#vsys-available-balance)
      - [VSYS Effective Balance](#vsys-effective-balance)
    - [Actions](#actions)
      - [Get Token Balance](#get-token-balance)
      - [Pay](#pay)
      - [Lease](#lease)
      - [Cancel Lease](#cancel-lease)
      - [Register Contract](#register-contract)
      - [Execute Contract](#execute-contract)

## Introduction

Account is the basic entity in the VSYS blockchain that pocesses tokens & can take actions(e.g. send tokens, execute smart contracts).

There are 2 kinds of accounts:

- user account: the most common account.
- contract account: the account for a smart contract instance.

The key difference between them lies in whether they have a private key.

## Usage with JavaScript SDK

In JS SDK we have an `Account` class that represents a user account on the VSYS blockchain.

### Create Account

#### From Wallet
The `Account` object can be contructed by a `Wallet` object given the `Chain` object & nonce.

```javascript
import * as jv from '@virtualeconomy/js-vsys';
// ch // a jv.Chain object
// wal // a jv.Wallet object
const acnt0 = wal.getAcnt(ch, 0); // get the account of nonce 0 of the wallet.
```

#### From Private Key & Public Key
The `Account` object can be constructed by a private key & opionally along with a public key.

If the public key is omitted, it will be derived from the private key.
If the public key is provided, it will be verified against the private key.

```javascript
import * as jv from '@virtualeconomy/js-vsys';
// ch // a jv.Chain object
const acnt0 = jv.Account.fromPriKeyStr(ch, 'your_private_key');
const acnt1 = new jv.Account(ch, new jv.PriKey('your_private_key'));
const acnt2 = new jv.Account(ch, new jv.PriKey('your_private_key'), new jv.PubKey('your_public_key'));
```

### Properties

#### Chain

The `Chain` object that represents the VSYS blockchain this account is on.

```javascript
// acnt: Account
console.log(acnt.chain);
```

Example output

```
Chain {
  api: NodeAPI {
    sess: Session { host: 'http://veldidina.vos.systems:9928', apiKey: '' },
    blocks: Blocks { sess: [Session] },
    tx: Transactions { sess: [Session] },
    utils: Utils { sess: [Session] },
    addr: Addresses { sess: [Session] },
    ctrt: Contract { sess: [Session] },
    vsys: VSYS { sess: [Session] }
  },
  chainId: ChainID { key: 'TEST_NET', val: 'T' }
}
```

#### Api

The `NodeAPI` object that serves as the API wrapper for calling RESTful APIs that exposed by a node in the VSYS blockchain.

```javascript
// acnt: Account
console.log(acnt.api);
```

Example output

```
NodeAPI {
  sess: Session { host: 'http://veldidina.vos.systems:9928', apiKey: '' },
  blocks: Blocks {
    sess: Session { host: 'http://veldidina.vos.systems:9928', apiKey: '' }
  },
  tx: Transactions {
    sess: Session { host: 'http://veldidina.vos.systems:9928', apiKey: '' }
  },
  utils: Utils {
    sess: Session { host: 'http://veldidina.vos.systems:9928', apiKey: '' }
  },
  addr: Addresses {
    sess: Session { host: 'http://veldidina.vos.systems:9928', apiKey: '' }
  },
  ctrt: Contract {
    sess: Session { host: 'http://veldidina.vos.systems:9928', apiKey: '' }
  },
  vsys: VSYS {
    sess: Session { host: 'http://veldidina.vos.systems:9928', apiKey: '' }
  }
}
```

#### Key Pair

The private/public key pair of the account.

```javascript
// acnt: Account
console.log(acnt.keyPair);
```

Example output

```
KeyPair {
  pub: PubKey { data: 'AGy4AXXXXXXXXXXXXXXXXXXXXXXXXXXXXwdyKT7p8vot' },
  pri: PriKey { data: '5N32sXXXXXXXXXXXXXXXXXXXXXXXXXXXXHJusMfbDcjp' }
}
```

#### Address

The address of the account.

```javascript
// acnt: Account
console.log(acnt.addr);
```

Example output

```
Addr { data: 'AU8h6YH5iJuwFzcUdGugUwKo2E8tbEHdtqu' }
```

#### VSYS Balance

The VSYS ledger(regular) balance of the account.

```javascript
// acnt: Account
console.log(await acnt.getBal());
// can use console.log((await acnt.getBal()).data.toNumber()) to get the number type value.
```

Example output

```
VSYS { data: BigNumber { s: 1, e: 13, c: [ 80873650000000 ] } }
```

#### VSYS Available Balance

The VSYS available balance(i.e. the balance that can be spent) of the account.
The amount leased out will be reflected in this balance.

```javascript
// acnt: Account
console.log(await acnt.getAvailBal());
```

Example output

```
VSYS { data: BigNumber { s: 1, e: 14, c: [ 7, 85795740000000 ] } }
```

#### VSYS Effective Balance

The VSYS effective balance(i.e. the balance that counts when contending a slot) of the account.
The amount leased in & out will be reflected in this balance.

```javascript
// acnt: Account
console.log(await acnt.getEffBal());
```

Example output

```
VSYS { data: BigNumber { s: 1, e: 14, c: [ 7, 85795740000000 ] } }
```

### Actions

#### Get Token Balance

Get the account balance of the token of the given token ID.

The example below shows querying the token balance of a certain kind of token.

```javascript
// acnt: Account
const tokId = 'TWu66r3ebS3twXNWh7aiAEWcNAaRPs1JxkAw2A3Hi';

console.log(await acnt.getTokBal(tokId));
```

Example output

```
VSYS { data: BigNumber { s: 1, e: 14, c: [ 7, 85795740000000 ] } }
```

#### Pay

Pay the VSYS coins from the action taker to the recipient.

The example below shows paying 100 VSYS coins to another account.

```javascript
// acnt0: Account
// acnt1: Account

const resp = await acnt0.pay(
  acnt1.addr.data, // recipient
  100 // amount
);
console.log(resp);
```

Example output

```
{
  type: 2,
  id: '6DJGGwdrjcVnAV1pRY2f5VEuR3MCehFduxcZVtL6Z3XE',
  fee: 10000000,
  feeScale: 100,
  timestamp: 1654827041025000000,
  proofs: [
    {
      proofType: 'Curve25519',
      publicKey: 'AGy4ASY2CmVPSjQX4rNHrSHmcYAL4DNBawdyKT7p8vot',
      address: 'AU8h6YH5iJuwFzcUdGugUwKo2E8tbEHdtqu',
      signature: '3GAHpXkV6kGczZtTp5PDKKKLcg8KCyoiby8RZzSPRb76JoF2sHamx64yubfoEdTXKg37EMa1Hs1y2FABCzD7vJdU'
    }
  ],
  recipient: 'AU1KWrn3sFwddbZjfeKnauh4zAYiDTmo9gM',
  amount: 10000000000,
  attachment: ''
}
```

#### Lease

Lease the VSYS coins from the action taker to the recipient(a supernode).

Note that the transaction ID in the response can be used to cancel leasing later.

The example below shows leasing 100 VSYS coins to a supernode.

```javascript
// acnt: Account

const supernodeAddr = 'AUA1pbbCFyFSte38uENPXSAhZa7TH74V2Tc';
const resp = await acnt.lease(
  supernodeAddr, // supernodeAddr
  100 // amount
);
console.log(resp);
```

Example output

```
{'type': 3, 'id': '3gjreLTVhHZfqLYVNwFEmUgKYJr3T6iSifi3BoMTqwyw', 'fee': 10000000, 'feeScale': 100, 'timestamp': 1646973577747307008, 'proofs': [{'proofType': 'Curve25519', 'publicKey': '6gmM7UxzUyRJXidy2DpXXMvrPqEF9hR1eAqsmh33J6eL', 'address': 'AU6BNRK34SLuc27evpzJbAswB6ntHV2hmjD', 'signature': 'SostBqsKNpp41TiLwh2K3HWzSu4Djs9JNUNyUTJr57Mi4XE4Pc1bKzi8VBWPXux7HoXDEQDEcTfdefphFj7Utsi'}], 'amount': 10000000000, 'recipient': 'AUA1pbbCFyFSte38uENPXSAhZa7TH74V2Tc'}
```

#### Cancel Lease

Cancel the leasing based on the leasing transaction ID.

```javascript
// acnt: Account

// leasingTxId: string E.g. "3gjreLTVhHZfqLYVNwFEmUgKYJr3T6iSifi3BoMTqwyw"
const resp = await acnt.leaseCancel(
  leasingTxId // leasingTxId
);
console.log(resp);
```

Example output

```
{'type': 4, 'id': 'Eui1yaRcE4jCnf4yBawroxSvqGa54WyQV9LjHkRHVvPd', 'fee': 10000000, 'feeScale': 100, 'timestamp': 1646974337469929984, 'proofs': [{'proofType': 'Curve25519', 'publicKey': '6gmM7UxzUyRJXidy2DpXXMvrPqEF9hR1eAqsmh33J6eL', 'address': 'AU6BNRK34SLuc27evpzJbAswB6ntHV2hmjD', 'signature': '3MHpURmQHBAedZ6qww5372B4gYZrVUUD7jgjChn7mecqQECxmaU1f1KURY5eK4UebaSpHQMpFbURth6EP3vL4LPL'}], 'leaseId': '3gjreLTVhHZfqLYVNwFEmUgKYJr3T6iSifi3BoMTqwyw'}
```

#### Register Contract

The `Account` module does not provide a public interface for this action. Users should always use a contract instance object and pass in the `Account` object as the action taker instead.

See [the example of registering an NFT contract instance](./smart_contract/nft_ctrt.md#Registration).

#### Execute Contract

The `Account` module does not provide a public interface for this action. Users should always use a contract instance object and pass in the `Account` object as the action taker instead.

See [the example of executing a function of an NFT instance](./smart_contract/nft_ctrt.md#Send)
