'use strict';

import {BN} from 'bn.js';
export {BN}; 

/**
 * powm raises x to the power n and modulos the modulus m.
 * @param {BN} x
 * @param {BN} y
 * @param {BN} m
 * @returns {BN} The result.
 */
export function powm(x, y, m) {
    let base = x;

    const zero = new BN(0);
    if (x.lt(zero)) {
        base = base.mul(new BN(-1));
    }

    let res = base.toRed(BN.red(m)).redPow(y).fromRed();

    if (x.lt(zero)) {
        res = m.sub(res);
    }
    return res;
}

/**
 * posMod calculates x % y and ensures the result is positive.
 * @param {BN} x
 * @param {BN} y
 * @returns {BN} The result.
 */
export function posMod(x, y) {
    let res = x.mod(y);
    if (res.isNeg()) {
        res = res.add(y);
    }
    return res;
}