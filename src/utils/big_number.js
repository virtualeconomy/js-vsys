/**
 * Big Number module provides functionalities for big numbers.
 * @module utils/big_number
 */

'use strict';

import jsBNPkg from 'bignumber.js';
export const { BigNumber } = jsBNPkg;

/**
 * toBigInt converts BigNumber to JS built-in BigInt
 * @param {BigNumber} bn - The BigNumber instance.
 * @returns {BigInt} The BigInt instance.
 */
export function toBigInt(bn) {
  return BigInt('0x' + bn.toString(16));
}
