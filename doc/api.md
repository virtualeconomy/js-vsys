# Api

- [Api](#api)
  - [Introduction](#introduction)
  - [Usage with JavaScript SDK](#usage-with-javascript-sdk)
    - [Instantiation](#instantiation)
    - [Properties](#properties)
      - [Session](#session)
      - [API Group: Blocks](#api-group-blocks)
      - [API Group: Utils](#api-group-utils)
      - [API Group: Node](#api-group-node)
      - [API Group: Transactions](#api-group-transactions)
      - [API Group: Contract](#api-group-contract)
      - [API Group: Addresses](#api-group-addresses)
      - [API Group: Database](#api-group-database)
      - [API Group: Leasing](#api-group-leasing)
      - [API Group: VSYS](#api-group-vsys)
    - [Actions](#actions)
      - [Make HTTP GET Request](#make-http-get-request)
      - [Make HTTP POST Request](#make-http-post-request)

## Introduction

Nodes in VSYS net can expose RESTful APIs for users to interact with the chain(e.g. query states, broadcast transactions).

## Usage with JavaScript SDK

In Javascript SDK we have

- `NodeAPI` class that serves as an API wrapper for calling node APIs.
- `APIGrp` class that represents a group of APIs that share the same prefix.

### Instantiation

Create an object of `NodeAPI`

```javascript
const HOST = "http://veldidina.vos.systems:9928";
const api = NodeAPI.new(HOST);
const console.log(api);
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

### Properties

#### Session

The `Session` object that records the HTTP session(e.g. host).

```javascript
// api: NodeAPI
console.log(api.sess);
```

Example output

```
Session { host: 'http://veldidina.vos.systems:9928', apiKey: '' }
```

#### API Group: Blocks

The group of APIs that share the prefix `/blocks`

```javascript
// api: NodeAPI
console.log(api.blocks);

// /blocks/height
console.log(await api.blocks.getHeight());
```

Example output

```
Blocks {
  sess: Session { host: 'http://veldidina.vos.systems:9928', apiKey: '' }
}
{ height: 2651194 }
```

#### API Group: Utils

The group of APIs that share the prefix `/utils`

```javascript
// api: NodeAPI
console.log(api.utils);

// /utils/hash/fast
const resp = await api.utils.hashFast('foo');
console.log(resp);
```

Example output

```
Utils {
  sess: Session { host: 'http://veldidina.vos.systems:9928', apiKey: '' }
}
{
  message: 'foo',
  hash: 'DT9CxyH887V4WJoNq9KxcpnF68622oK3BNJ41C2TvESx'
}
```

#### API Group: Node

The group of APIs that share the prefix `/node`

```javascript
// api: NodeAPI
console.log(api.node);

// /node/status
const resp = await api.node.getStatus();
console.log(resp);
```

Example output

```
Node {
  sess: Session { host: 'http://veldidina.vos.systems:9928', apiKey: '' }
}
{
  blockchainHeight: 2651213,
  stateHeight: 2651213,
  updatedTimestamp: 1654758084012254200,
  updatedDate: '2022-06-09T07:01:24.012Z'
}
```

#### API Group: Transactions

The group of APIs that share the prefix `/transactions`

```javascript
// api: NodeAPI
console.log(api.tx);

txId = 'Eui1yaRcE4jCnf4yBawroxSvqGa54WyQV9LjHkRHVvPd';
// /transactions/info/{tx_id}
const resp = await api.tx.getinfo(txId);
console.log(resp);
```

Example output

```
Transactions {
  sess: Session { host: 'http://veldidina.vos.systems:9928', apiKey: '' }
}

{
  type: 4,
  id: 'Eui1yaRcE4jCnf4yBawroxSvqGa54WyQV9LjHkRHVvPd',
  fee: 10000000,
  feeScale: 100,
  timestamp: 1646974337469930000,
  proofs: [
    {
      proofType: 'Curve25519',
      publicKey: '6gmM7UxzUyRJXidy2DpXXMvrPqEF9hR1eAqsmh33J6eL',
      address: 'AU6BNRK34SLuc27evpzJbAswB6ntHV2hmjD',
      signature: '3MHpURmQHBAedZ6qww5372B4gYZrVUUD7jgjChn7mecqQECxmaU1f1KURY5eK4UebaSpHQMpFbURth6EP3vL4LPL'
    }
  ],
  leaseId: '3gjreLTVhHZfqLYVNwFEmUgKYJr3T6iSifi3BoMTqwyw',
  status: 'Success',
  feeCharged: 10000000,
  lease: {
    type: 3,
    id: '3gjreLTVhHZfqLYVNwFEmUgKYJr3T6iSifi3BoMTqwyw',
    fee: 10000000,
    feeScale: 100,
    timestamp: 1646973577747307000,
    proofs: [ [Object] ],
    amount: 10000000000,
    recipient: 'AUA1pbbCFyFSte38uENPXSAhZa7TH74V2Tc'
  },
  height: 1353923
}
```

#### API Group: Contract

The group of APIs that share the prefix `/contract`

```javascript
// api: NodeAPI
console.log(api.ctrt);

tokId = 'TWu2qeuPdfjFQ7HdZGqjSYCSTh3m9k7kCttv7NmSx';
// /contract/tokenInfo/{tok_id}
const resp = await api.ctrt.getTokInfo(tokId);
console.log(resp);
```

Example output

```
Contract {
  sess: Session { host: 'http://veldidina.vos.systems:9928', apiKey: '' }
}
{
  tokenId: 'TWu2qeuPdfjFQ7HdZGqjSYCSTh3m9k7kCttv7NmSx',
  contractId: 'CF6sVHb2Y8i5Cqcw5yZL1m2PmaTvk1KdB2T',
  max: 10000,
  total: 3000,
  unity: 100,
  description: ''
}
```

#### API Group: Addresses

The group of APIs that share the prefix `/addresses`

```javascript
// api: NodeAPI
console.log(api.addr);

const addr = 'AUA1pbbCFyFSte38uENPXSAhZa7TH74V2Tc';
// /addresses/balance/{addr}
const resp = await api.addr.get_balance(addr);
console.log(resp);
```

Example output

```
Addresses {
  sess: Session { host: 'http://veldidina.vos.systems:9928', apiKey: '' }
}
{
  address: 'AU7Bekp3fBj25vPR6w1PK7cDC8kDJoLTiCQ',
  confirmations: 0,
  balance: 785795740000000
}
```

#### API Group: Database

The group of APIs that share the prefix `/database`

```javascript
// api: NodeAPI
console.log(api.database);

const addr = 'AU6BNRK34SLuc27evpzJbAswB6ntHV2hmjD';
const dbKey = 'foo';
// /database/get/{addr}/{db_key}
const resp = await api.database.getDB(addr, dbKey);
console.log(resp);
```

Example output

```
Database {
  sess: Session { host: 'http://veldidina.vos.systems:9928', apiKey: '' }
}
{data: 'bar', type: 'ByteArray'}
```

#### API Group: Leasing

The group of APIs that share the prefix `/leasing`

```javascript
// api: NodeAPI
console.log(api.leasing);
```

Example output

```
Leasing {
  sess: Session { host: 'http://veldidina.vos.systems:9928', apiKey: '' }
}
```

#### API Group: VSYS

The group of APIs that share the prefix `/vsys`

```javascript
// api: NodeAPI
console.log(api.vsys);
```

Example output

```
VSYS {
  sess: Session { host: 'http://veldidina.vos.systems:9928', apiKey: '' }
}
```

### Actions

#### Make HTTP GET Request

Make an HTTP GET request to given endpoint.

```javascript
// api: NodeAPI

const resp = await api.get('/node/version');
console.log(resp);
```

Example output

```
{ version: 'VSYS Core v0.4.1' }
```

#### Make HTTP POST Request

Make an HTTP POST request to given endpoint.

```javascript
// api: NodeAPI

const resp = await api.post('/utils/hash/fast', 'foo');
console.log(resp);
```

Example output

```
{
  message: 'foo',
  hash: 'DT9CxyH887V4WJoNq9KxcpnF68622oK3BNJ41C2TvESx'
}
```
