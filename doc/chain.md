# Chain

- [Chain](#chain)
  - [Introduction](#introduction)
  - [Usage with JavaScript SDK](#usage-with-javascript-sdk)
    - [Properties](#properties)
      - [Api](#api)
      - [Chain ID](#chain-id)
      - [Height](#height)
      - [Last block](#last-block)
    - [Actions](#actions)
      - [Get the Block at a Certain Height](#get-the-block-at-a-certain-height)

## Introduction

Chain is a logical concept that represents the abstract data structure where transactions are packed into a block and blcoks are chained together by including the hash from the last block.

In VSYS, there are 2 types of chains:

- mainnet
- testnet

They have different chain IDs, namely `M` for mainnet & `T` for testnet, which will be used in cases like the address of an account.

In other words, the same pair of seed and nonce will lead to different account addresses on mainnet & testnet.

## Usage with JavaScript SDK

In JavaScript SDK we have an `Chain` module that represents the chain.

### Properties

#### Api

The `NodeAPI` object that serves as the API wrapper for calling RESTful APIs that exposed by a node in the VSYS blockchain.

```javascript
// ch: Chain
console.log(ch.api);
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

#### Chain ID

The chain ID.

```javascript
// ch: Chain
console.log(ch.chainId);
```

Example output

```
ChainID { key: 'TEST_NET', val: 'T' }
```

#### Height

The current height of blocks on the chain.

Note that it is queried by calling RESTful APIs of a node. Technically speaking, the result is of the node. It can be used as of the chain as long as the node synchronises with other nodes well.

```javascript
// ch: Chain
console.log(await ch.getHeight());
```

Example output

```
1355645
```

#### Last block

The last block on the chain.

Note that it is queried by calling RESTful APIs of a node. Technically speaking, the result is of the node. It can be used as of the chain as long as the node synchronises with other nodes well.

```javascript
// ch: Chain
console.log(await ch.getLastBlock());
```

Example output

```
{
  version: 1,
  timestamp: 1654760904013142000,
  reference: '4zJxRM2XSJZovHYnAyWpbasNsKG6UTrAcGJwxY5UfAAWtZe9s13D4392ibZV2KiJTRETajWrBMzp5dcq7KDaafgb',
  SPOSConsensus: { mintTime: 1654760904000000000, mintBalance: 91459551193920 },
  resourcePricingData: {
    computation: 0,
    storage: 0,
    memory: 0,
    randomIO: 0,
    sequentialIO: 0
  },
  TransactionMerkleRoot: '36baTYAcqCXawg6nbK4YHqGaJmw6iNMU9nFe7sC4WaLr',
  transactions: [
    {
      type: 5,
      id: '7pD9QofsdVUr62ezgZ5siqQRnaCbBBmVxFDu4axW3qxe',
      recipient: 'AUDwJXq3esDqasmyVrN5FpXr7iFbKSXL8E2',
      timestamp: 1654760904013142000,
      amount: 900000000,
      currentBlockHeight: 2651683,
      status: 'Success',
      feeCharged: 0
    }
  ],
  generator: 'AUDwJXq3esDqasmyVrN5FpXr7iFbKSXL8E2',
  signature: '2r4bi4c1Cts28vcaBscbHpCFVSQfBLgxYZDDWqXfDHBBHyuUox495bhHeqSSi6Q4UcW4xsbf2UxTrrdbEPvThjAH',
  fee: 0,
  blocksize: 330,
  height: 2651683,
  'transaction count': 1
}
```

### Actions

#### Get the Block at a Certain Height

Get the block at a certain height.

```javascript
// ch: Chain
console.log(await ch.get_block_at(12345));
```

Example output

```
{
  version: 1,
  timestamp: 1638924876006686500,
  reference: '5xc3jXLWNt5ojVon31TQxNnS4U8eKaZphvzz8745S3u4Y4jTtEg1NsPtb7orEE5re79KbabQRub9JQdBCqArdzQ',
  SPOSConsensus: { mintTime: 1638924876000000000, mintBalance: 6656610613533642 },
  resourcePricingData: {
    computation: 0,
    storage: 0,
    memory: 0,
    randomIO: 0,
    sequentialIO: 0
  },
  TransactionMerkleRoot: '2HquwZg55eKpKK9NEpXKxvExow2hm3fpAQTN9ReRsyMJ',
  transactions: [
    {
      type: 5,
      id: '3vHcurnVyHvM8rNhEDbyf4628Xat2KXoEWmfH5FFttAT',
      recipient: 'AU7fEwBgHpe6oeH1iuo2mE5TMCrBxPR8LFc',
      timestamp: 1638924876006686500,
      amount: 900000000,
      currentBlockHeight: 12345,
      status: 'Success',
      feeCharged: 0
    }
  ],
  generator: 'AU7fEwBgHpe6oeH1iuo2mE5TMCrBxPR8LFc',
  signature: '2B2ff3zWSqiiDkPTvRnhspFvpBqS4UUk41e8frLCpB3YTPLKzFQiEtgiEAP4QJjWEvtMc3rYWBwzPxNXNywKg7dQ',
  fee: 0,
  blocksize: 330,
  height: 12345,
  'transaction count': 1
}
```
