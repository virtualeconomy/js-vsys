# Token Contract V1 Without Split

- [Token Contract V1 Without Split](#token-contract-v1-without-split)
  - [Introduction](#introduction)
  - [Usage with JavaScript SDK](#usage-with-javascript-sdk)
    - [Registration](#registration)
    - [From Existing Contract](#from-existing-contract)
    - [Querying](#querying)
      - [Issuer](#issuer)
      - [Maker](#maker)
      - [Token ID](#token-id)
      - [Unit](#unit)
      - [Token Balance](#token-balance)
    - [Actions](#actions)
      - [Supersede](#supersede)
      - [Issue](#issue)
      - [Send](#send)
      - [Destroy](#destroy)
      - [Transfer](#transfer)
      - [Deposit](#deposit)
      - [Withdraw](#withdraw)

## Introduction

Token contract supports defining & managing custom tokens on VSYS blockchain.

A token is a logical entity on the blockchain. It can represent basically everything that can be stored in a database. Be it a fiat currency like USD, financial assets like a share in a company, or even reputation points of an online platform.

A contract can be thought of as a class in OOP with a bunch of methods. An instance needs to be created before using a contract. Every node will maintain the states for a contract instance. The user interacts with the contract instance by publishing transactions. Upon receiving transactions, every node will update the contract instance states accordingly.

_Token Contract V1 Without Split_ is the classic version of token contracts supported by VSYS blockchain. The token unit cannot be updated once specified when registering the contract instance.

> “Unit” is the granularity of splitting a token. It can be thought of as the smallest denomination available. Let’s take real-world money as an example, if the unit is set to 100, it means the smallest denomination is a cent, and 100 cents is a dollar.
>
> With “Unit”, float numbers can be represented in integers so as to avoid the uncertainty comes from float computation. If we set unit == 100, 1.5 tokens are actually stored as 150 on the blockchain.

## Usage with JavaScript SDK

### Registration

The example below shows registering an instance of Token Contract V1 Without Split where the max amount is 10000 & the unit is 100. Fee set as a default value.

```javascript
import * as jv from '@virtualeconomy/js-vsys';

// acnt: Account

const tc = await jv.TokCtrtWithoutSplit.register(
  acnt, // by
  10000, // max
  100, // unit
  'token description', // tokDescription
  'certificate description' // ctrtDescription
);

console.log('ctrtID:', tc.ctrtId.data);
```

Example output

```
ctrtID: CEuFhD7N4sRfGnx6HZnCLnnd517Zgy19p4Q
```

### From Existing Contract

`tokCtrtId` is the ctrtID of previously registered token.

```javascript
import * as jv from '@virtualeconomy/js-vsys';

// ch: Chain

const tokCtrtId = 'CEuFhD7N4sRfGnx6HZnCLnnd517Zgy19p4Q';
const tc = new jv.TokCtrtWithoutSplit(tokCtrtId, ch);
```

### Querying

#### Issuer

The address that has the issuing right of the Token contract instance.

```javascript
// tc: TokCtrtWithoutSplit

console.log(await tc.getIssuer());
```

Example output

```
Addr { data: 'ATracVxHwdYF394gXEawdZe9stB9yLH6V7q' }
```

#### Maker

The address that made this Token contract instance.

```javascript
// tc: TokCtrtWithoutSplit

console.log(await tc.getMaker());
```

Example output

```
Addr { data: 'ATracVxHwdYF394gXEawdZe9stB9yLH6V7q' }
```

#### Token ID

The token ID of the token defined in the token contract instance.

Note that theoretically a token contract instance can have multiple kinds of token, it is restricted to 1 kind of token per token contract instance. In other word, the token ID is of the token index `0`.

```javascript
// tc: TokCtrtWithoutSplit

console.log(tokB.getTokId(0));
```

Example output

```
TokenID { data: 'TWsipaf2H3TPkDXwp2usNX9fdStSJ7SPPJzAc7nZo' }
```

#### Unit

The unit of the token defined in this token contract instance.

```javascript
// tc: TokCtrtWithoutSplit

console.log(await tc.getUnit());
```

Example output

```
100
```

#### Token Balance

Query the balance of the token defined in the contract for the given user.

```javascript
// tc: TokCtrtWithoutSplit
// acnt: Account

console.log(await tc.getTokBal(acnt.addr.data));
```

Example output

```
Token { data: BigNumber { s: 1, e: 5, c: [ 500000 ] }, unit: 100 }
```

### Actions

#### Supersede

Transfer the issuer role of the contract to a new user.
The maker of the contract has the privilege to take this action.

```javascript
// acnt0: Account
// acnt1: Account
// tc: TokCtrtWithoutSplit

const resp = await tc.supersede(
  acnt0, // by
  acnt1.addr.data // newIssuer
);
console.log(resp);
```

Example output

```
{
  type: 9,
  id: 'HmZczUdRvmTVyHvZgy4vMxPoeSp2x6gVDTys82tr6pfJ',
  fee: 30000000,
  feeScale: 100,
  timestamp: 1654658215952000000,
  proofs: [
    {
      proofType: 'Curve25519',
      publicKey: '2PvathWebooKLBrJpwPzdTrM1sLLiWHCrJ6TzSfh5Tkm',
      address: 'ATracVxHwdYF394gXEawdZe9stB9yLH6V7q',
      signature: '35XimNdZ92WbxB9aHgepE8b1h9crU448TZrNeZhQVaMyYkN9C4ZMztLdiE32YW9XtbekwvubqtAVSeHmUi6ik7RV'
    }
  ],
  contractId: 'CEuFhD7N4sRfGnx6HZnCLnnd517Zgy19p4Q',
  functionIndex: 0,
  functionData: '1bscuJD5pDLBReyZLKHWPXGEFkZxrBq2GaKRLX',
  attachment: '2aTZvrfa2Ax23REA3BKNRVqbgHBsmjYCHWoAj9npRRz'
}
```

#### Issue

Issue the a certain amount of the token. The issued tokens will belong to the issuer.

Note that only the address with the issuer role can take this action.

```javascript
// acnt1: Account
// tc: TokCtrtWithoutSplit

const data = await tc.issue(acnt, 2500);
console.log(data);
```

Example output

feeScale: 100,

```
{
  type: 9,
  id: 'FssVRfvdrZo3C41U8NjVqovPBF8Brmzi1CJcCk2uWZUd',
  fee: 30000000,
  timestamp: 1654653445368000000,
  proofs: [
    {
      proofType: 'Curve25519',
      publicKey: '2PvathWebooKLBrJpwPzdTrM1sLLiWHCrJ6TzSfh5Tkm',
      address: 'ATracVxHwdYF394gXEawdZe9stB9yLH6V7q',
      signature: '4mnS3CJeYgYs5GrnNChEAXbtdc19RB2bCM2XczE4rUBHBMrBUFXx1Vv1oqFXAKePo43Kw4ca6xNFoeb3fDhVK3HG'
    }
  ],
  contractId: 'CF2T8YbuMzBTz5sRKuTNCLanC5sRdaC9Soh',
  functionIndex: 1,
  functionData: '14JDCrdo1xyACX',
  attachment: ''
}
```

#### Send

Send a certain amount of the token to another user.

```javascript
// acnt0: Account
// acnt1: Accout
// tc: TokCtrtWithoutSplit

let resp = await tc.send(
  acnt0, // by
  acnt1.addr.data, // recipient
  100 // amount
);
console.log(resp);
```

Example output

```
{
  type: 9,
  id: '381fZ8eeZ7SVKTnQfvU1P7HH3ewX3hQGPJFXBhzJRzgF',
  fee: 30000000,
  feeScale: 100,
  timestamp: 1654658766148000000,
  proofs: [
    {
      proofType: 'Curve25519',
      publicKey: '2PvathWebooKLBrJpwPzdTrM1sLLiWHCrJ6TzSfh5Tkm',
      address: 'ATracVxHwdYF394gXEawdZe9stB9yLH6V7q',
      signature: '46jaDN6LwabEMijiQ6RWg2HL7pwswYWSyyaFmz7wCoFaRZmL4doHxC4EvMG2iafxJqXZD8PYDK2FTa7eMeQPSYFJ'
    }
  ],
  contractId: 'CEuFhD7N4sRfGnx6HZnCLnnd517Zgy19p4Q',
  functionIndex: 3,
  functionData: '14uNyP1vcvYHknSVFL8C4hVccNhDi737TxjF58tBNvpEcAcNGf1',
  attachment: 'YKYpT6ZcoWLMH2r6MBNvuoeLPFPCL8'
}
```

#### Destroy

Destroy a certain amount of the token.

Note that only the address with the issuer role can take this action.

```javascript
// acnt: Accout
// tc: TokCtrtWithoutSplit

let resp = await tc.destroy(
  acnt, // by
  50 // amount
);
console.log(resp);
```

Example output

```
{
  type: 9,
  id: 'ECu4e6Rx5XRfjKFYVUdYBupb1SkaJXm2Nn9K3zhmDZh9',
  fee: 30000000,
  feeScale: 100,
  timestamp: 1654659488012000000,
  proofs: [
    {
      proofType: 'Curve25519',
      publicKey: '6VH5QC2ktUA5UK4j6c4hxQTZi4cm9jdNYhnCQV2rT4Wv',
      address: 'AU8xJNjE5RNo8hmPYA1bSgQzPKYNgejytiP',
      signature: '3QKcT6b3kKiwX1FCztXbWLRR288rD9UTqvCf4CpRHUToUpqbFzJwGeVPjyQanKDf6tJk9uPQQF5YwdPQ9sPWCh3t'
    }
  ],
  contractId: 'CEuFhD7N4sRfGnx6HZnCLnnd517Zgy19p4Q',
  functionIndex: 2,
  functionData: '14JDCrdo1xwuNP',
  attachment: '2Xnstj5JdDLk4UoJ7mAAN3CGaaFmKRvUfzGzN5x16v9'
}
```

#### Transfer

Transfer a certain amount of the token to another account(e.g. user or contract).
`transfer` is the underlying action of `send`, `deposit`, and `withdraw`. It is not recommended to use transfer directly. Use `send`, `deposit`, `withdraw` instead when possible.

```javascript
// acnt0: Accout
// acnt1: Accout
// tc: TokCtrtWithoutSplit

let resp = await tokB.transfer(
  acnt0, // by
  acnt0.addr.data, // sender
  acnt1.addr.data, // recipient
  10 // amount
);
console.log(resp);
```

Example output

```
{
  type: 9,
  id: 'EErHX4BNCzpfqk7fbrSed2XLKth9qRrPta37XzvsjvKL',
  fee: 30000000,
  feeScale: 100,
  timestamp: 1654659844659000000,
  proofs: [
    {
      proofType: 'Curve25519',
      publicKey: '6VH5QC2ktUA5UK4j6c4hxQTZi4cm9jdNYhnCQV2rT4Wv',
      address: 'AU8xJNjE5RNo8hmPYA1bSgQzPKYNgejytiP',
      signature: '26ZbVi2x8fMJrXfDf45ZsA2bcdS2iTacApeEwKwh4NaArgPTscEhZdL3vp4PLujkRMBmeXP84EYNSsn8qWffYeCY'
    }
  ],
  contractId: 'CEuFhD7N4sRfGnx6HZnCLnnd517Zgy19p4Q',
  functionIndex: 4,
  functionData: '14VJY1ZthR99KumZMvcjjGnwmMggYiBsTzkczYTL1fh62FGgJmJfWBJ1yGDjL7nEHzYr6iGDzhVwK4KCQnjDxurf',
  attachment: '26U7Yk1UsXAPPLDaRK4FPsoE'
}
```

#### Deposit

Deposit a certain amount of the token into a token-holding contract instance(e.g. lock contract).

Note that only the token defined in the token-holding contract instance can be deposited into it.

```javascript
// acnt: Accout
// tc: TokCtrtWithoutSplit
// lc: LockCtrt

const lcId = lc.ctrtId.data;

let resp = await tc.deposit(
  acnt, // by
  lcId, // ctrtId
  100 // amount
);
console.log(resp);
```

Example output

```
{
  type: 9,
  id: 'B4xTs6aTvTSc4HA7TDPgSX5uNg9tBNhjaweBMVv3V66o',
  fee: 30000000,
  feeScale: 100,
  timestamp: 1654661416631000000,
  proofs: [
    {
      proofType: 'Curve25519',
      publicKey: '2PvathWebooKLBrJpwPzdTrM1sLLiWHCrJ6TzSfh5Tkm',
      address: 'ATracVxHwdYF394gXEawdZe9stB9yLH6V7q',
      signature: '2X4YWHNUCB8eBEgVoSEMJhdWLWFodDpus4jZQPRWp8xqXmQx4XGthe7x3EETXomWdebp4EQ1fpMTgemkZAGtVrBq'
    }
  ],
  contractId: 'CEuFhD7N4sRfGnx6HZnCLnnd517Zgy19p4Q',
  functionIndex: 5,
  functionData: '14VJY124dSzeYQLb1TnhVGx2HCWyqimTHEh2dQw7g5z2zS1V6fQrpu9rhVQG4owL8ScRfD79ntBekaWPxoai8d4B',
  attachment: '2Xnskmww39TWaHYgpQjToZWq6CbWjbKQkv5YNyHtz8b'
}
```

#### Withdraw

Withdraw a certain amount of the token from a token-holding contract instance(e.g. lock contract).

Note that only the token defined in the token-holding contract instance can be withdrawn from it.

```javascript
// acnt: Accout
// tc: TokCtrtWithoutSplit
// lc: LockCtrt

const lcId = lc.ctrtId.data;

let resp = await tc.withdraw(
  acnt, // by
  lcId, // ctrtId
  100 // amount
);
console.log(resp);
```

Example output

```
{
  type: 9,
  id: 'b1tNgLYRQLm5dMxrF2NSYnJzUH25oixw85snGqWGBiX',
  fee: 30000000,
  feeScale: 100,
  timestamp: 1654661447784000000,
  proofs: [
    {
      proofType: 'Curve25519',
      publicKey: '2PvathWebooKLBrJpwPzdTrM1sLLiWHCrJ6TzSfh5Tkm',
      address: 'ATracVxHwdYF394gXEawdZe9stB9yLH6V7q',
      signature: 'pPQ7M4fUKcCpUvoyYK3BKLYGfvvWkvWpNRmXh5gKxzQ99PhBEM6cJTPFvPwftB1ffoTJSks5B58WxGoWWWbkMJd'
    }
  ],
  contractId: 'CEuFhD7N4sRfGnx6HZnCLnnd517Zgy19p4Q',
  functionIndex: 6,
  functionData: '14WMYf6g4W8vNhWqmQ8okgnviNcAbsY3xf1w8DypLquRJM6YYDkC8sgY4HakSZ3zCQJRT1x7GKYFRZMyhPt92e95',
  attachment: '2EEcDWCrw6nEYnXvVj4qkomcCf4eXDdUQV3pRuM'
}
```
