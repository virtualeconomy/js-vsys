# NFT Contract V1

- [NFT Contract V1](#nft-contract-v1)
  - [Introduction](#introduction)
  - [Usage with Javascript SDK](#usage-with-javascript-sdk)
    - [Registration](#registration)
    - [From Existing Contract](#from-existing-contract)
    - [Querying](#querying)
      - [Issuer](#issuer)
      - [Maker](#maker)
      - [Unit](#unit)
    - [Actions](#actions)
      - [Issue](#issue)
      - [Send](#send)
      - [Transfer](#transfer)
      - [Deposit](#deposit)
      - [Withdraw](#withdraw)
      - [Supersede](#supersede)


## Introduction

NFT contract supports defining & managing [NFTs(Non-Fungible Tokens)](https://en.wikipedia.org/wiki/Non-fungible_token).
NFT can be thought of as a special kind of custom token where
- The unit is fixed to 1 and cannot be updated
- The max issuing amount for a kind of token is fixed to 1.

Note that a NFT contract instance on the VSYS blockchain supports defining multiple NFTs (unlike Token contact which supports defining only 1 kind of token per contract instance).

## Usage with Javascript SDK

### Registration

```Javascript
import * as nft from './src/contract/nft_ctrt.js';
// acnt: Account

// Register a new NFT contract
const ctrt = await nft.NFTCtrt.register(acnt);
console.log(ctrt.ctrtId); // print the id of the newly registered contract
```
Example output

```
CtrtID { data: 'CF3cK7TJFfw1AcPk74osKyGeGxee6u5VNXD' }
```

### From Existing Contract

```Javascript
import * as nft from './src/contract/nft_ctrt.js';

// ch: Chain

const ncId = "CF3cK7TJFfw1AcPk74osKyGeGxee6u5VNXD";
const nc = new nft.NFTCtrt(ncId, ch);
```

### Querying

#### Issuer

The address that has the issuing right of the NFT contract instance.

```Javascript
// nc: nft.NFTCtrt

console.log(await nc.getIssuer());
```
Example output

```
Addr { data: 'ATse3RcjEzwc5JHDPcduPYe4qA2mWhSNZaV' }
```

#### Maker
The address that made this NFT contract instance.

```Javascript
// nc: nft.NFTCtrt

console.log(await nc.getMaker());
```
Example output

```
Addr { data: 'ATse3RcjEzwc5JHDPcduPYe4qA2mWhSNZaV' }
```

#### Unit
The unit of tokens defined in this NFT contract instance.

As the unit is obviously fixed to 1 for NFTs, the support of querying unit of NFT is for the compatibility with other token-defining contracts.

```Javascript
// nc: nft.NFTCtrt

console.log(await nc.getUnit());
```
Example output

```
1
```

### Actions

#### Issue
Define a new NFT and issue it. Only the issuer of the contract instance can take this action. The issued NFT will belong to the issuer.

```Javascript
import * as nft from './src/contract/nft_ctrt.js';

// acnt: Account
// nc: nft.NFTCtrt

const resp = await nc.issue(acnt);
console.log(resp);
```
Example output

```
{
  type: 9,
  id: '7GEDAu2xQtFm1coo7exKUiGQYcCp1c72hN6Xkwpy2c5k',
  fee: 30000000,
  feeScale: 100,
  timestamp: 1654657467768000000,
  proofs: [
    {
      proofType: 'Curve25519',
      publicKey: 'FwuW4LhiBFn6uu5id9nZGtp9o1RUG3DoX5MhyZibrjkE',
      address: 'ATse3RcjEzwc5JHDPcduPYe4qA2mWhSNZaV',
      signature: '4nZnn8DUWveZQLEcSP8MLbxy2BB62xjPhMU166rpfjTacwr31cfV2oN6GYan1imqWSXg756FikmQpfAAkhSKsn3w'
    }
  ],
  contractId: 'CF3cK7TJFfw1AcPk74osKyGeGxee6u5VNXD',
  functionIndex: 1,
  functionData: '12Wfh1',
  attachment: ''
}
```

#### Send
Send an NFT to another user.

```Javascript
import * as nft from './src/contract/nft_ctrt.js';

// acnt0: Account
// acnt1: Account
// nc: nft.NFTCtrt

const resp = await nc.send(
  acnt0, // by
  acnt1.addr.data, // recipient 
  0 // tokIdx
);
console.log(resp);
```
Example output

```
{
  type: 9,
  id: 'CBZcDp8VYpHRAsSedabxtKy4VK8KZSiUXTg3MvxNg8Fh',
  fee: 30000000,
  feeScale: 100,
  timestamp: 1654658097871000000,
  proofs: [
    {
      proofType: 'Curve25519',
      publicKey: 'FwuW4LhiBFn6uu5id9nZGtp9o1RUG3DoX5MhyZibrjkE',
      address: 'ATse3RcjEzwc5JHDPcduPYe4qA2mWhSNZaV',
      signature: '2pFNScc9yknjxP3cGtAvNyNwPvSHWQBqYkTnXgWocv95dGk6KPEsPBVLMCc1fn9kviYyyxvU9B6EGnQ2K7bnSjWK'
    }
  ],
  contractId: 'CF3cK7TJFfw1AcPk74osKyGeGxee6u5VNXD',
  functionIndex: 2,
  functionData: '1bbXGo33yHPwRQiiXCuvbs4p4HHQtakjvHkAd1p49czVD',
  attachment: ''
}
```

#### Transfer
Transfer the ownership of an NFT to another account(e.g. user or contract).
`transfer` is the underlying action of `send`, `deposit`, and `withdraw`. It is not recommended to use transfer directly. Use `send`, `deposit`, `withdraw` instead when possible.

```Javascript
import * as nft from './src/contract/nft_ctrt.js';

// acnt0: Account
// acnt1: Account
// nc: nft.NFTCtrt

const resp = await nc.transfer(
  acnt1, // by
  acnt1.addr.data, // sender 
  acnt0.addr.data, // recipient
  0 // tokIdx
);
console.log(resp);
```
Example output

```
{
  type: 9,
  id: 'BZBDxESE3TVqNZc8riFPPd7ES1qbJd1EhWYh398kLpR4',
  fee: 30000000,
  feeScale: 100,
  timestamp: 1654658405593000000,
  proofs: [
    {
      proofType: 'Curve25519',
      publicKey: 'FwuW4LhiBFn6uu5id9nZGtp9o1RUG3DoX5MhyZibrjkE',
      address: 'ATse3RcjEzwc5JHDPcduPYe4qA2mWhSNZaV',
      signature: '3Hf7T2Ps5HznYbDrYCEYs3GENjf4r64kShVnxAFY5oBWch529DfVSUBkMYXMnHotXoYivuyjeXeVpL7MHL5DyPd7'
    }
  ],
  contractId: 'CF3cK7TJFfw1AcPk74osKyGeGxee6u5VNXD',
  functionIndex: 3,
  functionData: '1Xv7sDVNoccGfJcpGvrbujZAc1vfRFTghwoy7RGpq5ptgC8LpZedPvAj1tDZeHXR2qVd2SSTxZPefpAjyH',
  attachment: ''
}
```

#### Deposit
Deposit an NFT to a token-holding contract instance(e.g. lock contract).

Note that only the token defined in the token-holding contract instance can be deposited into it.

```Javascript
import * as lock from './src/contract/lock_ctrt.js';
import * as nft from './src/contract/nft_ctrt.js';

// acnt0: Account
// lc: lock.LockCtrt
// nc: nft.NFTCtrt

const lcId = lc.ctrtId.data;

const resp = await nc.deposit(
  acnt0, // by
  lcId, // ctrtId
  0 // tokIdx
  );
console.log(resp);
```
Example output

```
{
  type: 9,
  id: 'ABbEBEEtianokGQAuKMG2zjCTXNpHWEig8r5r6rBYxrx',
  fee: 30000000,
  feeScale: 100,
  timestamp: 1654660350012000000,
  proofs: [
    {
      proofType: 'Curve25519',
      publicKey: 'FwuW4LhiBFn6uu5id9nZGtp9o1RUG3DoX5MhyZibrjkE',
      address: 'ATse3RcjEzwc5JHDPcduPYe4qA2mWhSNZaV',
      signature: '2p6yvQaebFJL2Ajrugxhu5m6SZhYFtXxzxJxs2Phznwt7XjuWDn3ucs6QYc35FdNcEaxFkrUVwq3haaNvv4GtdLT'
    }
  ],
  contractId: 'CF3cK7TJFfw1AcPk74osKyGeGxee6u5VNXD',
  functionIndex: 4,
  functionData: '1Xv7sDVNoccGfJcpGvrbujZAc1vfRFTghwoy7RH6TbWpZQSKd3f8QsbmQ1ZVJf99u7AiYtUebQeirAzmTM',
  attachment: ''
}
```

#### Withdraw
Withdraw an NFT from a token-holding contract instance(e.g. lock contract).

Note that only the one who deposits the token can withdraw.

```Javascript
import * as lock from './src/contract/lock_ctrt.js';
import * as nft from './src/contract/nft_ctrt.js';

// acnt0: Account
// lc: lock.LockCtrt
// nc: nft.NFTCtrt

const lcId = lc.ctrtId.data;

const resp = await nc.withdraw(
  acnt0, // by
  lcId, // ctrtId
  0 // tokIdx
);
console.log(resp);
```
Example output

```
{
  type: 9,
  id: '5FUhSmSKpAQhDxoZD19FBKhekHmNsqGeLbEyLtxguSXq',
  fee: 30000000,
  feeScale: 100,
  timestamp: 1654660613070000000,
  proofs: [
    {
      proofType: 'Curve25519',
      publicKey: 'FwuW4LhiBFn6uu5id9nZGtp9o1RUG3DoX5MhyZibrjkE',
      address: 'ATse3RcjEzwc5JHDPcduPYe4qA2mWhSNZaV',
      signature: '5RQYhA3uwufXVxsr8yF5euwAbeTpUt5749AS4Xu9ed1hkZtaBAgtwzfaFJkiFPmZ46BPaYSSPuCDmZK7FkBtVU8'
    }
  ],
  contractId: 'CF3cK7TJFfw1AcPk74osKyGeGxee6u5VNXD',
  functionIndex: 5,
  functionData: '1Y5SeHoJy5GCVPK7AReyRPVpQNXMdzNZomTwqxHvwMkGq1yVzpZeTR76wsJbzRXPvW4G2LnwTdMxdBk9FV',
  attachment: ''
}
```

#### Supersede
Transfer the issuer role of the contract to a new user.
The maker of the contract has the privilege to take this action.

```Javascript
import * as lock from './src/contract/lock_ctrt.js';
import * as nft from './src/contract/nft_ctrt.js';

// acnt0: Account
// lc: lock.LockCtrt
// nc: nft.NFTCtrt

const resp = await nc.supersede(acnt0, acnt1.addr.data);
console.log(resp);
```
Example output

```
{
  type: 9,
  id: 'Fd3rE5Aa4RqRr4MB2PcUf7NmdVYscYiwZD4xR9icTxGP',
  fee: 30000000,
  feeScale: 100,
  timestamp: 1654660762216000000,
  proofs: [
    {
      proofType: 'Curve25519',
      publicKey: 'FwuW4LhiBFn6uu5id9nZGtp9o1RUG3DoX5MhyZibrjkE',
      address: 'ATse3RcjEzwc5JHDPcduPYe4qA2mWhSNZaV',
      signature: '5NzQ1XG5mfY9MLXFFj2KKJ1nMZ7Aut8e6ebvrYcSL73bcBLs4uZTVoHdahMBZkAnFk62NMLvi4h8BX6qeyfoqLSS'
    }
  ],
  contractId: 'CF3cK7TJFfw1AcPk74osKyGeGxee6u5VNXD',
  functionIndex: 0,
  functionData: '1bscuQUYkKxix6tJGrWaSXbXzTYAxGAhLZhMZC',
  attachment: ''
}
```