/**
 * multisign_spec tests module multisign
 * @module multiSignSpec
 */

'use strict';

import { Buffer } from 'buffer';
import Axlsign from 'axlsign';
import bs58 from 'bs58';
import * as jv from '../src/index.js';

const PRI_KEY_1 = 'EV9ADJzYKZpk4MjxEkXxDSfRRSzBFnA9LEQNbepKZRFc';
const PRI_KEY_2 = '3hQRGJkqKFbks77cZ12ugHxDtbweH3EZjhfVzfr4RqPs';

const MSG = Buffer.from('test');
const RAND = Buffer.from('b298c9d1947fcb8373a200232b6f6c79f7854814c74e66613b2ea0c843bdad50cb3c8373942f0a8a0aaada8c238c011279554f7459bab560b6eb43992aaf3886', 'hex');

const MULPK1 = new jv.MultiSignPriKey(Buffer.from(bs58.decode(PRI_KEY_1)));
const MULPK2 = new jv.MultiSignPriKey(Buffer.from(bs58.decode(PRI_KEY_2)));

describe('Test multisign', function() {
    it('should work with one key', () => {
        const A = MULPK1.A;
        const allAs = [A];

        const xA = MULPK1.getxA([A]);
        const xAs = [xA];
        const unionA = jv.MultiSign.getUnionA(xAs);

        const R = MULPK1.getR(MSG, RAND);
        const Rs = [R];
        const unionR = jv.MultiSign.getUnionR(Rs);

        const subSig = MULPK1.sign(MSG, RAND, unionA, unionR, allAs);
        const mulSig = jv.MultiSign.getSig(unionA, unionR, [subSig]);

        const bpA = MULPK1.getbpA(allAs);
        const bpAs = [bpA];
        const mulPub = jv.MultiSign.getPub(bpAs);

        const rawSig = Buffer.from(Axlsign.sign(MULPK1.priKey, MSG, RAND));

        expect(rawSig.equals(mulSig)).toBeTrue();

        const rawPub = Buffer.from(Axlsign.derivePublicKey(MULPK1.priKey));
        expect(rawPub.equals(mulPub)).toBeTrue();

        const valid = Axlsign.verify(mulPub, MSG, mulSig);
        expect(valid).toBeTrue();
    });

    it('should work with two keys', () => {
        const A1 = MULPK1.A; 
        const A2 = MULPK2.A; 

        const allAs = [A1, A2];

        const xA1 = MULPK1.getxA(allAs);
        const xA2 = MULPK2.getxA(allAs);
        const xAs = [xA1, xA2];
        const unionA = jv.MultiSign.getUnionA(xAs);

        const R1 = MULPK1.getR(MSG, RAND);
        const R2 = MULPK2.getR(MSG, RAND);
        const Rs = [R1, R2];
        const unionR = jv.MultiSign.getUnionR(Rs);

        const subSig1 = MULPK1.sign(MSG, RAND, unionA, unionR, allAs);
        const subSig2 = MULPK2.sign(MSG, RAND, unionA, unionR, allAs);
        const sigs = [subSig1, subSig2];
        const mulSig = jv.MultiSign.getSig(unionA, unionR, sigs);

        const bpA1 = MULPK1.getbpA(allAs);
        const bpA2 = MULPK2.getbpA(allAs);
        const bpAs = [bpA1, bpA2];
        const mulPub = jv.MultiSign.getPub(bpAs);

        const valid = Axlsign.verify(mulPub, MSG, mulSig);
        expect(valid).toBeTrue();
    });
});
