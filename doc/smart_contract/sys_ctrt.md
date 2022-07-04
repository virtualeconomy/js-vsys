# System Contract

- [System Contract](#system-contract)
  - [Introduction](#introduction)
  - [Usage with JavaScript SDK](#usage-with-javascript-sdk)
    - [Registration](#registration)
    - [Actions](#actions)
      - [Send](#send)
      - [Deposit](#deposit)
      - [Withdraw](#withdraw)
      - [Transfer](#transfer)

## Introduction

The System Contract on V Systems is quite unique in that it is directly included in the protocol and not registered by users. Since Contract variables and VSYS tokens use different databases, it is normally not possible for them to interact. However, the System Contract handles the mixing of these two databases, and allows users to do things such as deposit and withdraw VSYS token from contracts.

## Usage with JavaScript SDK

### Registration

```javascript
import * as jv from '@virtualeconomy/js-vsys';

// acnt: Account
// ch: Chain

// initial a new system contract on mainnet
const nc = new jv.SysCtrt('CCL1QGBqPAaFjYiA8NMGVhzkd3nJkGeKYBq');
// initial a new system contract on testnet
const nc = new jv.SysCtrt('CF9Nd9wvQ8qVsGk8jYHbj6sf8TK7MJ2GYgt', ch);

console.log(nc.ctrtId); // print the id of the system contract
```

Example output

```
CtrtID { data: 'CF9Nd9wvQ8qVsGk8jYHbj6sf8TK7MJ2GYgt' }
```

### Actions

#### Send

Send VSYS tokens to another user.

```javascript
import * as jv from '@virtualeconomy/js-vsys';

// acnt0: Account
// acnt1: Account
// amount: number

const resp = await nc.send(
  acnt0, // acnt0
  acnt1.addr.data, // acnt1
  10 // amount
);
console.log(resp);
```

Example output

```
{
  type: 9,
  id: 'Frn5wW8QrVP15amwBUvYKU2v17xczMJhEbwy2mpLZz3k',
  fee: 30000000,
  feeScale: 100,
  timestamp: 1655112977675000000,
  proofs: [
    {
      proofType: 'Curve25519',
      publicKey: 'FwuW4LhiBFn6uu5id9nZGtp9o1RUG3DoX5MhyZibrjkE',
      address: 'ATse3RcjEzwc5JHDPcduPYe4qA2mWhSNZaV',
      signature: '62f1ScywBJwmeMZNEC2D7Hnhnd5rE7MHrj8MSGvbmrawwAnnfPLXpexKJYMBm5vkDo6eBmoV4C7asCKs32rdM3oP'
    }
  ],
  contractId: 'CF9Nd9wvQ8qVsGk8jYHbj6sf8TK7MJ2GYgt',
  functionIndex: 0,
  functionData: '14uNyPNLz6igvdRLtuP8E7K8eVTNvW9mniVqpF3TCPRmFGpWH7D',
  attachment: ''
}
```

#### Deposit

Deposit VSYS tokens to a token-holding contract instance(e.g. lock contract).

Note that only the token defined in the token-holding contract instance can be deposited into it.

```javascript
import * as jv from '@virtualeconomy/js-vsys';

// acnt0: Account
// nc: jv.SysCtrt
// lc: jv.LockCtrt
// amount: number

const lcId = lc.ctrtId.data;

const resp = await nc.deposit(
  acnt0, // by
  lcId, // ctrtId
  10 // amount
);
console.log(resp);
```

Example output

```
{
   type:9,
   id:'7DxP86FzXEDxNqiNhQkehL51GXSyoeRGYH5YSHshh1ga',
   fee:30000000,
   feeScale:100,
   timestamp:1646663600529510912,
   proofs:[
      {
         proofType:'Curve25519',
         publicKey:'AGy4ASY2CmVPSjQX4rNHrSHmcYAL4DNBawdyKT7p8vot',
         address:'AU8h6YH5iJuwFzcUdGugUwKo2E8tbEHdtqu',
         signature:'3uaoJmeUdoPGuyqAbVjt3ASbcknNMfz15XKR4ZW3UH9Hds3hj7vygsdiYVMRoYp3orp3ptvVFepX2wcisgLtZHeS'
      }
   ],
   contractId:'CF9Nd9wvQ8qVsGk8jYHbj6sf8TK7MJ2GYgt',
   functionIndex:1,
   functionData:'14VJY1ZP9F8AxnTMyoWJiGRvyvgT7cKTmLDrGJJp1VtHTAWRFTDHsGqz5YaSHFiE33y1QtrPZwSTz5PKzi6xyv7Z',
   attachment:'
}
```

#### Withdraw

Withdraw VSYS tokens from a token-holding contract instance(e.g. lock contract).

Note that only the one who deposits the token can withdraw.

```javascript
import * as jv from '@virtualeconomy/js-vsys';

// acnt0: Account
// nc: jv.SysCtrt
// lc: jv.LockCtrt
// amount: number

const lcId = lc.ctrtId.data;

const resp = await nc.withdraw(
  acnt0, // by
  lcId, // ctrtId
  10 // amount
);
console.log(resp);
```

Example output

```
{
   type:9,
   id:'EF6Brq21Wi1Hv3N4z2BuVNRNfeXjb9uzv2HBVS8voRqG',
   fee:30000000,
   feeScale:100,
   timestamp:1646295771726907904,
   proofs:[
      {
         proofType:'Curve25519',
         publicKey:'6gmM7UxzUyRJXidy2DpXXMvrPqEF9hR1eAqsmh33J6eL',
         address:'AU6BNRK34SLuc27evpzJbAswB6ntHV2hmjD',
         signature:'4bEfdwPrwNzGkdLjP7JSvg2xdDnbPabtGK3fdGampaF9LySUHtsMJrD3V35F7C9zwgBrvMhEZfTfEB7iyY7SGquM'
      }
   ],
   contractId:'CEu8AuKJS2Pr67RPV9dFjPAb8TL151weQsi',
   functionIndex:5,
   functionData:'1Y5SeLwhk5NvqLEeqZuAFHiVY6k713zijrRcTwsgJDd7gGwi9dxZpZCyGMqUWZJovQUcDw6MBsnz1AKygj',
   attachment:'
}
```

#### Transfer

Transfer the VSYS token to another account(e.g. user or contract).
`transfer` is the underlying action of `send`, `deposit`, and `withdraw`. It is not recommended to use transfer directly. Use `send`, `deposit`, `withdraw` instead when possible.

```javascript
import * as jv from '@virtualeconomy/js-vsys';

// acnt0: Account
// acnt1: Account
// nc: jv.SysCtrt
// amount: number

const resp = await nc.transfer(
  acnt1, // by
  acnt1.addr.data, // sender
  acnt0.addr.data, // recipient
  10 // amount
);
console.log(resp);

Example output
```

{
type: 9,
id: 'Gfwdba3CVwKbYkj4ApowajmQfDmzzLPiRoB6VKT23dFm',
fee: 30000000,
feeScale: 100,
timestamp: 1655114346074000000,
proofs: [
{
proofType: 'Curve25519',
publicKey: 'FwuW4LhiBFn6uu5id9nZGtp9o1RUG3DoX5MhyZibrjkE',
address: 'ATse3RcjEzwc5JHDPcduPYe4qA2mWhSNZaV',
signature: '4P4MEXGLh1b43gdSRrfbBT5Sf6xNNKkj3AXdK1QU5vw7ySjRmts42tQE64SxYHCsPhB2TUe4F7jaRgMUuntTZbj2'
}
],
contractId: 'CF9Nd9wvQ8qVsGk8jYHbj6sf8TK7MJ2GYgt',
functionIndex: 3,
functionData: '14VJY1483JwCJVMajdB5ZaWwLWpHK3XV2ArryugxyB9sCGPgWBURtLLbQnCunuE97bAULDv7cWyEU2q1R3cUZTQK',
attachment: ''
}

```

```
