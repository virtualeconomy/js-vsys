/**
 * multisign_spec tests module multisign
 * @module multiSignSpec
 */

'use strict';

import { Buffer } from 'buffer';
import Axlsign from 'axlsign';
import bs58 from 'bs58';
import * as md from '../src/model.js';
import * as jv from '../src/index.js';
import * as rd from '../src/utils/random.js';
import { sign } from 'crypto';
const msg = Buffer.from('test');

describe('Test class Multisign account', function () {
  describe('Test create Multisign account', function () {
    it('should work with one key', async function () {
      const acnt0_prikey = await this.acnt0.keyPair.pri.data;
      const private_keys = [acnt0_prikey];
      const MulAcnt = new jv.MultiSignAccount(private_keys, this.chain);

      const rawPub = Buffer.from(
        Axlsign.derivePublicKey(Buffer.from(bs58.decode(acnt0_prikey)))
      );
      expect(MulAcnt.getPubKeyStr()).toEqual(md.PubKey.fromBytes(rawPub));

      const Muladdr = MulAcnt.addr;
      expect(Muladdr).toEqual(
        md.Addr.fromPubKey(md.PubKey.fromBytes(rawPub), this.chain.chainId)
      );

      const signature = MulAcnt.getSign(msg);
      expect(signature.length).toBe(64);
    });
    it('should work with two or more keys', async function () {
      const acnt0_prikey = await this.acnt0.keyPair.pri.data;
      const acnt1_prikey = await this.acnt1.keyPair.pri.data;
      const private_keys = [acnt0_prikey, acnt1_prikey];

      const MulAcnt = new jv.MultiSignAccount(private_keys, this.chain);
      const rawPub = jv.MultiSign.getPub(MulAcnt.bpAs);
      expect(MulAcnt.getPubKeyStr()).toEqual(md.PubKey.fromBytes(rawPub));

      const Muladdr = MulAcnt.addr;
      expect(Muladdr).toEqual(
        md.Addr.fromPubKey(md.PubKey.fromBytes(rawPub), this.chain.chainId)
      );

      const signature = MulAcnt.getSign(msg);
      expect(signature.length).toBe(64);
    });
    it('should not work with different RAND', async function () {
      var RAND = rd.getRandomBytes(64);
      const acnt0_prikey = await this.acnt0.keyPair.pri.data;
      const acnt1_prikey = await this.acnt1.keyPair.pri.data;

      const MULPK1 = new jv.MultiSignPriKey(
        Buffer.from(bs58.decode(acnt0_prikey))
      );
      const MULPK2 = new jv.MultiSignPriKey(
        Buffer.from(bs58.decode(acnt1_prikey))
      );
      const A1 = MULPK1.A;
      const A2 = MULPK2.A;

      const allAs = [A1, A2];

      const xA1 = MULPK1.getxA(allAs);
      const xA2 = MULPK2.getxA(allAs);
      const xAs = [xA1, xA2];
      const unionA = jv.MultiSign.getUnionA(xAs);

      const R1 = MULPK1.getR(msg, RAND);
      const R2 = MULPK2.getR(msg, RAND);
      const Rs = [R1, R2];
      const unionR = jv.MultiSign.getUnionR(Rs);

      const subSig1 = MULPK1.sign(msg, RAND, unionA, unionR, allAs);
      const subSig2 = MULPK2.sign(msg, RAND, unionA, unionR, allAs);
      const sigs = [subSig1, subSig2];
      const mulSig = jv.MultiSign.getSig(unionA, unionR, sigs);

      const bpA1 = MULPK1.getbpA(allAs);
      const bpA2 = MULPK2.getbpA(allAs);
      const bpAs = [bpA1, bpA2];
      const rawPub = jv.MultiSign.getPub(bpAs);

      const private_keys = [acnt0_prikey, acnt1_prikey];
      const MulAcnt = new jv.MultiSignAccount(private_keys, this.chain);
      const signature = MulAcnt.getSign(msg);

      expect(MulAcnt.getPubKeyStr()).toEqual(md.PubKey.fromBytes(rawPub));

      expect(signature.length).toBe(64);

      expect(mulSig.length).toBe(64);

      expect(mulSig).not.toEqual(signature);
    });
  });
  describe('Test method pay', function () {
    it('should be able to pay from the action taker to the recipient', async function () {
      const payAmount = 1;
      const acnt0_prikey = await this.acnt0.keyPair.pri.data;
      const acnt1_prikey = await this.acnt1.keyPair.pri.data;
      const private_keys = [acnt0_prikey, acnt1_prikey];

      const MulAcnt = new jv.MultiSignAccount(private_keys, this.chain);
    
      const acnt0BalBefore = await this.acnt0.getBal();
      const MulAcntBalBefore = await MulAcnt.getBal();

      const resp = await this.acnt0.pay(MulAcnt.addr.data, payAmount);
      await this.waitForBlock();
      await this.assertTxSuccess(resp.id);

      const acnt0BalAfter = await this.acnt0.getBal();
      const MulAcntBalAfter = await MulAcnt.getBal();

      const acnt0CostActual = acnt0BalBefore.data.minus(acnt0BalAfter.data);
      const acnt0CostExpected = jv.VSYS.forAmount(payAmount).data.plus(
        jv.PaymentFee.default().data
      );
      expect(acnt0CostActual.isEqualTo(acnt0CostExpected)).toBeTrue();

      const MulAcntGainActual = MulAcntBalAfter.data.minus(
        MulAcntBalBefore.data
      );
      const MulAcntGainExpected = jv.VSYS.forAmount(payAmount).data;
      expect(MulAcntGainActual.isEqualTo(MulAcntGainExpected)).toBeTrue();
    });
  });
});
