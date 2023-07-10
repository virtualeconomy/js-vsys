# Account

- [Multisign Account](#multisign-account)
  - [Introduction](#introduction)
  - [Usage with JavaScript SDK](#usage-with-javascript-sdk)
    - [Create Multisign Account](#create-multisingn-account)
    - [Properties](#properties)
      - [Public Key](#public-key)
      - [Multisig Address](#multisig-address)
      - [Signature](#signature)
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

Multi-signatures or “multisig wallets” for short, are a type of cryptocurrency wallet for which at least two private keys are needed to sign a transaction. It requires group of users to approve a transaction.


## Usage with JavaScript SDK

In JS SDK we have an `multiSignAccount` class that allows Multi signing.

### Create MultisignAccount
```javascript

const PRI_KEY_1 = 'CtDURXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXLW';
const PRI_KEY_2 = 'At2URXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXRW';
const PRI_KEY_3 = 'Cv23CXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXCB';

const private_keys = [PRI_KEY_1, PRI_KEY_2, PRI_KEY_3];

const api = jv.NodeAPI.new('http://veldidina.vos.systems:9928');

const ch = new jv.Chain(api, jv.ChainID.TEST_NET);

const MulAcnt = new jv.MultiSignAccount(private_keys, ch);
```

### Properties
#### Public Key

The `getPubKeyStr` object that represents the public key of the multisig account

```javascript
//MulAcnt: multisig account
MulPubKey = MulAcnt.getPubKeyStr();
console.log(MulPubKey);

```
Example output

```
PubKey { data: 'CTgzuXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXat' }
```
#### Multisig Address

The `getAddr` object that represents the address of the Multisig account

```javascript
// chain: main net or testnet
// MulAcnt: multisig account
MulAddr = MulAcnt.getAddr(ch);
console.log(MulAddr);
```
Example output

```
Addr { data: 'ATXXXXXXXXXXXXXXXXXXXZa' }
```

#### Signature

The `getSign` object that represents getting signature of multisig

```javascript
//msg: tx payload
//MulAcnt: multisig account
const signature = MulAcnt.getSign(msg);
console.log(signature);
```
Example output

```
<Buffer 0e 55 10 98 2f e4 c0 48 ad a8 c4 81 1b 07 7a c3 c2 f3 7a da 19 47 7c 1f c2 68 37 a1 b2 0f 54 40 5c e6 91 8f 7f 76 a6 8b 84 39 39 be b4 bc 87 7b cf 9c ... 14 more bytes>
```

#### Api

The `NodeAPI` object that serves as the API wrapper for calling RESTful APIs that exposed by a node in the VSYS blockchain.

```javascript
// MPKS: multisig account
const mulApi = MulAcnt.api;
console.log(mulApi);
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
  },
  leasing: Leasing {
    sess: Session { host: 'http://veldidina.vos.systems:9928', apiKey: '' }
  },
  node: Node {
    sess: Session { host: 'http://veldidina.vos.systems:9928', apiKey: '' }
  },
  database: Database {
    sess: Session { host: 'http://veldidina.vos.systems:9928', apiKey: '' }
  }
}
```

#### Key Pair

The private/public key pair of the account.

```javascript
// MulAcnt:Multisig
console.log(MulAcnt.keyPair);
```

Example output

```
KeyPair {
  sign: [Function: sign],
  pub: PubKey { data: '5N32sXXXXXXXXXXXXXXXXXXXXXXXXXXXXHJusMfbDcjp' }
}
```

#### VSYS Balance

The VSYS ledger(regular) balance of the account.

```javascript
//MulAcnt: multisig account
console.log(await MulAcnt.getBal());
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
// MulAcnt: multisig account
console.log(await MulAcnt.getAvailBal());
```

Example output

```
VSYS { data: BigNumber { s: 1, e: 14, c: [ 7, 85795740000000 ] } }
```

#### VSYS Effective Balance

The VSYS effective balance(i.e. the balance that counts when contending a slot) of the account.
The amount leased in & out will be reflected in this balance.

```javascript
// MulAcnt: multisig account
console.log(await MulAcnt.getEffBal());
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
// MulAcnt: multisig account
const tokId = 'TWu66r3ebS3twXNWh7aiAEWcNAaRPs1JxkAw2A3Hi';

console.log(await MulAcnt.getTokBal(tokId));
```

Example output

```
VSYS { data: BigNumber { s: 1, e: 14, c: [ 7, 85795740000000 ] } }
```

#### Pay

Pay the VSYS coins from the action taker to the recipient.

The example below shows paying 100 VSYS coins to another account.

```javascript
// MulAcnt: Account
// acnt1: Account
acnt1='ATt7XXXXXXXXXXXXXXXXXXXXXXXXXXXXXZa'
const resp = await MulAcnt.pay(
  acnt1 // recipient
  100 // amount
);
console.log(resp);
```

Example output

```
{
  type: 2,
  id: 'ABxXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXy7',
  fee: 10000000,
  feeScale: 100,
  timestamp: 1688630129675000000,
  proofs: [
    {
      proofType: 'Curve25519',
      publicKey: 'EsXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXGU',
      address: 'AU7qMm19r9sej8w9tmscCKCFPampQTNfQnn',
      signature: '65cAem68ft6zGNZQVmaWRxp2ak8r98DAzxXDo1pG8ugxNtXz2uJPriNcpk5pfxC6bKZ76tpBxNzL7J6rraBNGjeS'
    }
  ],
  recipient: 'ATt7XXXXXXXXXXXXXXXXXXXXXXXXXXXXXZa',
  amount: 3000000000,
  attachment: ''
}
```

#### Lease

Lease the VSYS coins from the action taker to the recipient(a supernode).

Note that the transaction ID in the response can be used to cancel leasing later.

The example below shows leasing 100 VSYS coins to a supernode.

```javascript
// MulAcnt: Account

const supernodeAddr = 'AUA1pbbCFyFSte38uENPXSAhZa7TH74V2Tc';
const resp = await MulAcnt.lease(
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
// MulAcnt: Account

// leasingTxId: string E.g. "3gjreLTVhHZfqLYVNwFEmUgKYJr3T6iSifi3BoMTqwyw"
const resp = await MulAcnt.leaseCancel(
  leasingTxId // leasingTxId
);
console.log(resp);
```

Example output

```
{'type': 4, 'id': 'Eui1yaRcE4jCnf4yBawroxSvqGa54WyQV9LjHkRHVvPd', 'fee': 10000000, 'feeScale': 100, 'timestamp': 1646974337469929984, 'proofs': [{'proofType': 'Curve25519', 'publicKey': '6gmM7UxzUyRJXidy2DpXXMvrPqEF9hR1eAqsmh33J6eL', 'address': 'AU6BNRK34SLuc27evpzJbAswB6ntHV2hmjD', 'signature': '3MHpURmQHBAedZ6qww5372B4gYZrVUUD7jgjChn7mecqQECxmaU1f1KURY5eK4UebaSpHQMpFbURth6EP3vL4LPL'}], 'leaseId': '3gjreLTVhHZfqLYVNwFEmUgKYJr3T6iSifi3BoMTqwyw'}
```

#### Register Contract

The `multiSignAccount` module does not provide a public interface for this action. Users should always use a contract instance object and pass in the `multiSignAccount` object as the action taker instead.

See [the example of registering an NFT contract instance](./smart_contract/nft_ctrt.md#Registration).

#### Execute Contract

The `multiSignAccount` module does not provide a public interface for this action. Users should always use a contract instance object and pass in the `multiSignAccount` object as the action taker instead.

See [the example of executing a function of an NFT instance](./smart_contract/nft_ctrt.md#Send)