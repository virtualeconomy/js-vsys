# NFT Contract V2

- [NFT Contract V2](#nft-contract-v2)
  - [Introduction](#introduction)
  - [Usage with Javascript SDK](#usage-with-js-sdk)
    - [Registration](#registration)
    - [From Existing Contract](#from-existing-contract)
    - [Querying](#querying)
      - [Issuer](#issuer)
      - [Maker](#maker)
      - [Regulator](#regulator)
      - [Unit](#unit)
      - [Is user in the list](#is-user-in-the-list)
      - [Is contract in the list](#is-contract-in-the-list)
    - [Actions](#actions)
      - [Issue](#issue)
      - [Send](#send)
      - [Transfer](#transfer)
      - [Deposit](#deposit)
      - [Withdraw](#withdraw)
      - [Supersede](#supersede)
      - [Add/remove a user from the list](#addremove-a-user-from-the-list)
      - [Add/remove a contract from the list](#addremove-a-contract-from-the-list)

## Introduction
NFT contract V2 adds additional whitelist/blacklist regulation feature upon [NFT contract V1](./nft_ctrt.md).

For the whitelist flavor, only users & contracts included in the list can interact with the NFT contract instance.

For the blacklist flavor, only users & contracts excluded from the list can interact with the NFT contract instance.

## Usage with JS SDK

Examples of NFT contract V2 with whitelist are shown below. The usage of the blacklist one is very similar.

### Registration

```Javascript
import * as nftv2 from './src/contract/nft_ctrt_v2.js';

// acnt: Account

// Register a new NFT contract
const nc = await nftv2.NFTCtrtV2Whitelist.register(acnt0);
console.log(nc.ctrtId); // print the id of the newly registered contract
```
Example output

```
CtrtID { data: 'CF46ab6o5HTfyLwgyBhwrhkEmLxbaLkSJ8a' }
```

### From Existing Contract

```javascript
import * as nftv2 from './src/contract/nft_ctrt_v2.js';

// acnt: Account

const nc_id = "CF46ab6o5HTfyLwgyBhwrhkEmLxbaLkSJ8a";
const nc = nftv2.NFTCtrtV2Whitelist(nc_id, ch);
```

### Querying

#### Issuer

The address that has the issuing right of the NFT contract instance.

```javascript
// nc: nftv2.NFTCtrtV2Whitelist

console.log(await nc.getIssuer());
```
Example output

```
Addr { data: 'ATse3RcjEzwc5JHDPcduPYe4qA2mWhSNZaV' }
```

#### Maker
The address that made this NFT contract instance.

```javascript
// nc: nftv2.NFTCtrtV2Whitelist

console.log(await nc.getMaker());
```
Example output

```
Addr { data: 'ATse3RcjEzwc5JHDPcduPYe4qA2mWhSNZaV' }
```

#### Regulator
The address that serves as the regulator of the NFT contract instance.

```javascript
// nc: nftv2.NFTCtrtV2Whitelist

console.log(await nc.getRegulator());
```
Example output

```
Addr { data: 'ATse3RcjEzwc5JHDPcduPYe4qA2mWhSNZaV' }
```

#### Unit
The unit of tokens defined in this NFT contract instance.

As the unit is obviously fixed to 1 for NFTs, the support of querying unit of NFT is for the compatibility with other token-defining contracts.

```javascript
// nc: nftv2.NFTCtrtV2Whitelist

console.log(await nc.getUnit());
```
Example output

```
1
```

#### Is user in the list
Check if the user is in the whitelist/blacklist

```javascript
// acnt: Account
// nc: nftv2.NFTCtrtV2Whitelist

console.log(await nc.isUserInList(acnt.addr.data));
```
Example output

```
false
```

#### Is contract in the list
Check if the user is in the whitelist/blacklist

```javascript
// nc: nftv2.NFTCtrtV2Whitelist
arbitrary_ctrt_id = "CEsGmTPZMvPkkG7g5gyqgRcXRVc2ZcVXz9J";

console.log(await nc.isCtrtInList(nc_id));
```
Example output

```
false
```
### Actions

#### Issue
Define a new NFT and issue it. Only the issuer of the contract instance can take this action. The issued NFT will belong to the issuer.

```javascript
import * as nftv2 from './src/contract/nft_ctrt_v2.js';

// acnt: Account
// nc: nftv2.NFTCtrtV2Whitelist

const resp = await nc.issue(acnt);
console.log(resp);
```
Example output

```
{
  type: 9,
  id: 'BtmvJja9JzU3utUUox9Z3jvyoBdjPGkTPiVGJLEvc9jV',
  fee: 30000000,
  feeScale: 100,
  timestamp: 1654665727601000000,
  proofs: [
    {
      proofType: 'Curve25519',
      publicKey: 'FwuW4LhiBFn6uu5id9nZGtp9o1RUG3DoX5MhyZibrjkE',
      address: 'ATse3RcjEzwc5JHDPcduPYe4qA2mWhSNZaV',
      signature: '3FCeAZXjsqms3CRdn1GWtCHewNuN5UJcAwFoXaPSHfTGzrzebZeY1iY28o98qawaF7U2kmthdYHt7KzQwdNYYMZL'
    }
  ],
  contractId: 'CF46ab6o5HTfyLwgyBhwrhkEmLxbaLkSJ8a',
  functionIndex: 1,
  functionData: '12Wfh1',
  attachment: ''
}
```

#### Send
Send an NFT to another user.

```javascript
import * as nftv2 from './src/contract/nft_ctrt_v2.js';

// acnt0: Account
// acnt1: Account
// nc: nftv2.NFTCtrtV2Whitelist

const resp = await nc.send(acnt0, acnt1.addr.data, 0);
console.log(resp);
```
Example output

```
{
  type: 9,
  id: '6n1W3ZPHqY1bqEykhCjUynKp8R44H8LxdAXRse7bcBAv',
  fee: 30000000,
  feeScale: 100,
  timestamp: 1654665954765000000,
  proofs: [
    {
      proofType: 'Curve25519',
      publicKey: 'FwuW4LhiBFn6uu5id9nZGtp9o1RUG3DoX5MhyZibrjkE',
      address: 'ATse3RcjEzwc5JHDPcduPYe4qA2mWhSNZaV',
      signature: '3QejFeZGif3bZ5DcDjKUMtLrXV8ZBEBY6WVnoyRRzXCGcNv3ctWjytMPoN42nh1w1zgdX6L7XAcBuPgXtui2Gb8Z'
    }
  ],
  contractId: 'CF46ab6o5HTfyLwgyBhwrhkEmLxbaLkSJ8a',
  functionIndex: 3,
  functionData: '1bbXGo33yHPwRQiiXCuvbs4p4HHQtakjvHkAd1p49czVD',
  attachment: ''
}
```

#### Transfer
Transfer the ownership of an NFT to another account(e.g. user or contract).
`transfer` is the underlying action of `send`, `deposit`, and `withdraw`. It is not recommended to use transfer directly. Use `send`, `deposit`, `withdraw` instead when possible.

```javascript
import * as nftv2 from './src/contract/nft_ctrt_v2.js';

// acnt0: Account
// acnt1: Account
// nc: nftv2.NFTCtrtV2Whitelist

const resp = await nc.transfer(acnt0, acnt0.addr.data, acnt1.addr.data, 0);
console.log(resp);
```
Example output

```
{
  type: 9,
  id: 'GX7k8JeJ4ziZ2fSiLAeYH2z9zSVmFLzCpSZ4M2srS5r',
  fee: 30000000,
  feeScale: 100,
  timestamp: 1654666126506000000,
  proofs: [
    {
      proofType: 'Curve25519',
      publicKey: 'FwuW4LhiBFn6uu5id9nZGtp9o1RUG3DoX5MhyZibrjkE',
      address: 'ATse3RcjEzwc5JHDPcduPYe4qA2mWhSNZaV',
      signature: '5kgZ2A2d6CGrtU3GNYNcVqPbDGDht1G25LiY42dcxSigpEv8FkEHtJvHvt9i9H7bvxDVAzRovFRvsx6t1XxwZDAM'
    }
  ],
  contractId: 'CF46ab6o5HTfyLwgyBhwrhkEmLxbaLkSJ8a',
  functionIndex: 4,
  functionData: '1Xv7sDVNoccGfJcpGvrbujZAc1vfRFTghwoy7RGpq5ptgC8LpZedPvAj1tDZeHXR2qVd2SSTxZPefpAjyH',
  attachment: ''
}
```

#### Deposit
Deposit an NFT to a token-holding contract instance(e.g. lock contract).

Note that only the token defined in the token-holding contract instance can be deposited into it.

```javascript
import * as nftv2 from './src/contract/nft_ctrt_v2.js';

// acnt0: Account
// acnt1: Account
// nc: nftv2.NFTCtrtV2Whitelist

const lc_id = lc.ctrtId.data;

const resp = await nc.deposit(acnt0, lc_id, 0);
console.log(resp);
```
Example output

```
{
  type: 9,
  id: 'DQshV61j5wcBo53p3JT5KEajD19hcWWcTekpP6hgVZsm',
  fee: 30000000,
  feeScale: 100,
  timestamp: 1654666432193000000,
  proofs: [
    {
      proofType: 'Curve25519',
      publicKey: 'FwuW4LhiBFn6uu5id9nZGtp9o1RUG3DoX5MhyZibrjkE',
      address: 'ATse3RcjEzwc5JHDPcduPYe4qA2mWhSNZaV',
      signature: '372akphCT3822CF4R374KoWZ47QLMbmFPZmVn6JpbsqNkMERnr92iWduspuUAwnDyWGSSZimqGkMYyGw3XmQmP84'
    }
  ],
  contractId: 'CF46ab6o5HTfyLwgyBhwrhkEmLxbaLkSJ8a',
  functionIndex: 5,
  functionData: '1Xv7sDVNoccGfJcpGvrbujZAc1vfRFTghwoy7RH6TbWpZQSKd3f8QsbmQ1ZVJf99u7AiYtUebQeirAzmTM',
  attachment: ''
}
```

#### Withdraw
Withdraw an NFT from a token-holding contract instance(e.g. lock contract).

Note that only the one who deposits the token can withdraw.

```javascript
import * as nftv2 from './src/contract/nft_ctrt_v2.js';

// acnt0: Account
// acnt1: Account
// nc: nftv2.NFTCtrtV2Whitelist

const lc_id = lc.ctrtId.data;

const resp = await nc.withdraw(acnt0, lc_id, 0);
console.log(resp);
```
Example output

```
{
  type: 9,
  id: 'Ea4UAP1Wkxjr4tg3qYT3Vxg1DmQ5p2F78kGedpVx8Yok',
  fee: 30000000,
  feeScale: 100,
  timestamp: 1654666602779000000,
  proofs: [
    {
      proofType: 'Curve25519',
      publicKey: 'FwuW4LhiBFn6uu5id9nZGtp9o1RUG3DoX5MhyZibrjkE',
      address: 'ATse3RcjEzwc5JHDPcduPYe4qA2mWhSNZaV',
      signature: '4kaRZrEV1sRjGkUMT2sub5EQpE7XVjWcJxcGAhSfcAQ9yhhzjwtpfPBHodS7ZmpqfnTovaMszZ8tC7Gq9oMyw8Tt'
    }
  ],
  contractId: 'CF46ab6o5HTfyLwgyBhwrhkEmLxbaLkSJ8a',
  functionIndex: 6,
  functionData: '1Y5SeHoJy5GCVPK7AReyRPVpQNXMdzNZomTwqxHvwMkGq1yVzpZeTR76wsJbzRXPvW4G2LnwTdMxdBk9FV',
  attachment: ''
}
```

#### Supersede
Transfer the issuer & regulator role of the contract to a new user.

Note that only the contract maker has the privilege to take this action.

```javascript
import * as nftv2 from './src/contract/nft_ctrt_v2.js';

// acnt0: Account
// acnt1: Account
// acnt2: Account
// nc: nftv2.NFTCtrtV2Whitelist

const resp = await nc.supersede(
    acnt0, 
    acnt1.addr.data, 
    anct2.addr.data
);
console.log(resp);
```
Example output

```
{
  type: 9,
  id: '7e54c4W9xJZK8PBFyPgN2GC7aXW1WLzTKvN38Q1V7o5q',
  fee: 30000000,
  feeScale: 100,
  timestamp: 1654666934860000000,
  proofs: [
    {
      proofType: 'Curve25519',
      publicKey: 'FwuW4LhiBFn6uu5id9nZGtp9o1RUG3DoX5MhyZibrjkE',
      address: 'ATse3RcjEzwc5JHDPcduPYe4qA2mWhSNZaV',
      signature: '4rX4uLqhWVsS7EJoa1pe1Zoi45j1KJpuFdRdZkyscPzK8xko6LSYYDpej6YQ5T2x9Uf4KzkrkpsbCAWCHj7CMb6F'
    }
  ],
  contractId: 'CF46ab6o5HTfyLwgyBhwrhkEmLxbaLkSJ8a',
  functionIndex: 0,
  functionData: '1iSib7tL92cQrH2FyWCgmPNKpZyZYdr58nWjxd3wpfW2YyGGh4ojkfPu3tc5ibVfPtgteKABM1F',
  attachment: ''
}
```

#### Add/remove a user from the list
Add/remove a user from the whitelist/blacklist.

Note the regulator has the privilege to take this action.

```javascript
import * as nftv2 from './src/contract/nft_ctrt_v2.js';

// acnt0: Account
// acnt1: Account
// nc: nftv2.NFTCtrtV2Whitelist

const resp = await nc.updateListUser(
    acnt0, 
    acnt1.addr.data, 
    true // false to remove
);
console.log(resp);
```
Example output

```
{
  type: 9,
  id: 'CWoHpF642e6nvwkwBsATVzDy1khbcQxosaBuQGKgfogc',
  fee: 30000000,
  feeScale: 100,
  timestamp: 1654667149185000000,
  proofs: [
    {
      proofType: 'Curve25519',
      publicKey: 'FwuW4LhiBFn6uu5id9nZGtp9o1RUG3DoX5MhyZibrjkE',
      address: 'ATse3RcjEzwc5JHDPcduPYe4qA2mWhSNZaV',
      signature: 'gZusgHkgVEFVsb3SZHw4ix9VnLNjT2QuKRWv83eGneqsiPeXzKpjNHaXmE5p4KfPfVu2scKkh9erWzAjqim213B'
    }
  ],
  contractId: 'CF46ab6o5HTfyLwgyBhwrhkEmLxbaLkSJ8a',
  functionIndex: 2,
  functionData: '1QLRyXdftSZu4epV66KAEcQFqW1HJPZrQofgvusap',
  attachment: ''
}
```

#### Add/remove a contract from the list
Add/remove a contract from the whitelist/blacklist.

Note the regulator has the privilege to take this action.

```javascript
import * as nftv2 from './src/contract/nft_ctrt_v2.js';

// acnt0: Account
// acnt1: Account
// nc: nftv2.NFTCtrtV2Whitelist

arbitrary_ctrt_id = "CEsGmTPZMvPkkG7g5gyqgRcXRVc2ZcVXz9J"

const resp = await nc.updateListCtrt(
    acnt0, 
    lc_id, 
    true // false to remove
);
console.log(resp);
```
Example output

```
{
  type: 9,
  id: '2JdKH9sTQe3qSmwdNNRw4LSpVFWTmpdAFuYCHD6fSVCc',
  fee: 30000000,
  feeScale: 100,
  timestamp: 1654667424874000000,
  proofs: [
    {
      proofType: 'Curve25519',
      publicKey: 'FwuW4LhiBFn6uu5id9nZGtp9o1RUG3DoX5MhyZibrjkE',
      address: 'ATse3RcjEzwc5JHDPcduPYe4qA2mWhSNZaV',
      signature: '5wfqmKkFUKdR2SWEEFoUcCbZvdvuXL3HqVLwLnR6dfH9vSoQwkuHsfQPKKAzDHsVkNouFn4C54fSyYignjwNKEiG'
    }
  ],
  contractId: 'CF46ab6o5HTfyLwgyBhwrhkEmLxbaLkSJ8a',
  functionIndex: 2,
  functionData: '1QWyS1LH3zZd7sfccA42TVKzCPBeyCF58rHE7mNmv',
  attachment: ''
}
```