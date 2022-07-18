/**
 * modelSpec tests module model.
 * @module modelSpec
 */

'use strict';

import * as jv from '../src/index.js';

describe('Test class Seed', function () {
    describe('Test method encrypt', function () {
        it('should properly encrypt', function () {
            const key = 'abc';
            const rounds = 5000;

            const seed = new jv.Seed(this.SEED);  
            const enc = seed.encrypt(key, rounds);

            const dec = enc.decrypt(key, rounds);
            expect(dec.data).toEqual(seed.data);
        });
    });
});

describe('Test class EncryptedSeed', function () {
    describe('Test method decrypt', function () {
        it('should properly decrypt', function () {
            const key = 'abc';
            const rounds = 5000;

            const seed = new jv.Seed(this.SEED);  
            const enc = seed.encrypt(key, rounds);

            const dec = enc.decrypt(key, rounds);
            expect(dec.data).toEqual(seed.data);
        });
    });
});
