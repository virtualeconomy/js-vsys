# js-vsys

[![License](https://img.shields.io/badge/License-BSD_4--Clause-green.svg)](./LICENSE)

> **_Under active maintenance. Contributions are always welcome!_**

The official Javascript SDK for VSYS APIs. The [old Javascript SDK](https://github.com/virtualeconomy/js-v-sdk) is deprecated and will be archived soon.

- [js-vsys](#js-vsys)
  - [Installation](#installation)
  - [Quick Example](#quick-example)
  - [Docs](#docs)
    - [Account & Wallet](#account--wallet)
    - [Chain & API](#chain--api)
    - [Smart Contracts](#smart-contracts)
  - [Run Tests](#run-tests)
    - [Specification Tests](#specification-tests)
  - [Contributing](#contributing)

## Installation

Install from Github

```bash
git clone git@github.com:virtualeconomy/js-vsys.git
```

Then locate to the folder and run `npm install`.

## Quick Example

```javascript
'use strict';

import * as jv from '@virtualeconomy/js-vsys';

// The RESTful API host address to a node in a public test net
const host = 'http://veldidina.vos.systems:9928';

// A test net wallet seed
const seed = new jv.Seed('your seed');

function printHeading(msg) {
  function times(char, num) {
    let ret = '';
    while (num-- > 0) ret += char;

    return ret;
  }
  console.log(times('=', 10), msg, times('=', 10));
}

printHeading('Try out NodeAPI');
// NodeAPI is the wrapper for RESTful APIs
const api = jv.NodeAPI.new(host);
// GET /blocks/height
console.log(await api.blocks.getHeight());
// GET /node/version
console.log(await api.node.getVersion());

printHeading('Try out Chain');
// Chain represents the chain itself
const ch = new jv.Chain(api, jv.ChainID.TEST_NET);
// Get chain's height
console.log('Height:', await ch.getHeight());
// Get chain's last block
console.log('Last block: \n', await ch.getLastBlock());

printHeading('Try out Account');
// Account represents an account in the net
const wal = new jv.Wallet(seed);
const acnt = wal.getAcnt(ch, 0);
// Get the account's balance
console.log('Balance:', await acnt.getBal());
// Get the account's public key
console.log('Public key:', acnt.keyPair.pub);
// Get the account's private key
console.log('Private key:', acnt.keyPair.pri);
// Get the account's address
console.log('Account address:', acnt.addr);

printHeading('Try out Smart Contract');
const ctrtId = 'CF3cK7TJFfw1AcPk74osKyGeGxee6u5VNXD';
const ctrt = new jv.NFTCtrt(ctrtId, ch);
// Get the contract's maker
console.log('Maker:', await ctrt.getMaker());
// Get the contract's issuer
console.log('Issuer:', await ctrt.getIssuer());
// Get the contract's ID
console.log('Contract id:', ctrt.ctrtId);
```

Example output

```
========== Try out NodeAPI ==========
{ height: 2767707 }
{ version: 'VSYS Core v0.4.1' }
========== Try out Chain ==========
Height: 2767707
Last block:
 {
  version: 1,
  timestamp: 1655457048010768100,
  reference: '3dRCKVabnC4XdTdv64BB6486uoGypbNSHNiUgBf1WzuCe3GdLCvihgkvFsygNehtA2vQ6PAUBVPcpXs3MEeoG5sC',
  SPOSConsensus: { mintTime: 1655457048000000000, mintBalance: 191899551193920 },
  resourcePricingData: {
    computation: 0,
    storage: 0,
    memory: 0,
    randomIO: 0,
    sequentialIO: 0
  },
  TransactionMerkleRoot: '6Gx217pr8eYcz7Xu4FLexRWi3ufV19t2BtUNkmDUN14q',
  transactions: [
    {
      type: 5,
      id: 'Hs9QaTVZhReBLcGzTqFiLCRPwiGutsN1RbvSVKsHRCWB',
      recipient: 'AU1EWbfR8mTwbvzgnY8wdpLy3vEvF64WSEE',
      timestamp: 1655457048010768100,
      amount: 900000000,
      currentBlockHeight: 2767707,
      status: 'Success',
      feeCharged: 0
    }
  ],
  generator: 'AU1EWbfR8mTwbvzgnY8wdpLy3vEvF64WSEE',
  signature: 'DtMAp1bVCLzSZQAkVkuaDVEyctmydkBH469VmTzqLnrTnBrVxkp9PvWHuWSBJLEyGeqUeJ9TPZYZw6o5ofmEXw9',
  fee: 0,
  blocksize: 330,
  height: 2767707,
  'transaction count': 1
}
========== Try out Account ==========
Balance: VSYS { data: BigNumber { s: 1, e: 13, c: [ 48592200000000 ] } }
Nonce: Nonce { data: 0 }
Public key: PubKey { data: 'FwuW4LhiBFn6uu5id9nZGtp9o1RUG3DoX5MhyZibrjkE' }
Private key: PriKey { data: '2dC1PVfaeWBR6bsT4jpPkp4Zr9PNhXwQThPLEAvKWB37' }
Account address: Addr { data: 'ATse3RcjEzwc5JHDPcduPYe4qA2mWhSNZaV' }
========== Try out Smart Contract ==========
Maker: Addr { data: 'ATse3RcjEzwc5JHDPcduPYe4qA2mWhSNZaV' }
Issuer: Addr { data: 'AUFDmJqrcwphseJccD1vkR7xbRciMijMpw4' }
Contract id: CtrtID { data: 'CF3cK7TJFfw1AcPk74osKyGeGxee6u5VNXD' }
```

## Docs

### Account & Wallet

- [Account](./doc/account.md)
- [Wallet](./doc/wallet.md)
- [Multisign](./doc/multisign.md)

### Chain & API

- [Chain](./doc/chain.md)
- [Api](./doc/api.md)

### Smart Contracts

- [NFT Contract V1](./doc/smart_contract/nft_ctrt.md)
- [NFT Contract V2](./doc/smart_contract/nft_ctrt_v2.md)
- [Token Contract V1 without split](./doc/smart_contract/tok_ctrt_no_split.md)
- [Token Contract V1 with split](./doc/smart_contract/tok_ctrt_split.md)
- [Token Contract V2 without split](./doc/smart_contract/tok_ctrt_v2.md)
- [Atomic Swap Contract](./doc/smart_contract/atomic_swap_ctrt.md)
- [Payment Channel Contract](./doc/smart_contract/pay_chan_ctrt.md)
- [Lock Contract](./doc/smart_contract/lock_ctrt.md)
- [System Contract](./doc/smart_contract/sys_ctrt.md)
- [V Escrow Contract](./doc/smart_contract/v_escrow_ctrt.md)
- [V Option Contract](./doc/smart_contract/v_option_ctrt.md)
- [V Stable Swap Contract](./doc/smart_contract/v_stable_swap_ctrt.md)
- [V Swap Contract](./doc/smart_contract/v_swap_ctrt.md)

## Run Tests

### Specification Tests

Specification tests are scripts that simulate the behaviour of a normal user to interact wtih `js_vsys`(e.g. register a smart contract & call functions of it).

To run it, ensure that you have `jasmine` properly installed.

First set up the global variables like below.

```bash
export JS_VSYS_HOST='http://veldidina.vos.systems:9928'
export JS_VSYS_AVG_BLOCK_DELAY=6
export JS_VSYS_SEED='your_seed'
```

Then go to the root of the project and run (take NFT contract as an example).

```bash
npx jasmine './spec/contract_spec/nft_ctrt_spec.js'
```

The above command will test each aspect(e.g. function `send` of NFT contract) individually and have required resources set up before testing(e.g. register a new contract, issue a token, etc). It's good for testing a specific aspect while it might consume too much resources to test every aspect in this way.

Take NFT contract as an example, it will register a contract first and then execute functions like `send`, `transfer`, `deposit`, etc in a pre-orchestrated manner so that some common set up(e.g. register a contract) will be done only once.

To run a single test, say `issue`, just comment all parts except `beforeAll` and `test method issue`, run

```bash
npx jasmine './spec/contract_spec/nft_ctrt_spec.js'
```

## Contributing

**Contributions are always welcome!**

See [the development documentation](./doc/dev.md) for more details and please adhere to conventions mentioned in it.
