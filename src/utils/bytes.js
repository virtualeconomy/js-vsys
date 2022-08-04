/**
 * module utils/bytes provides utilities to bytes.
 * @module utils/bytes
 */

import { Buffer } from 'buffer';

/**
 * reverse reverses the given bytes and return the result.
 * @param {Buffer} b - The buffer to reverse.
 * @param {boolean} inPlace - Whether or not to reverse in place.
 * @returns {Buffer} The reverse result.
 */
export function reverse(b, inPlace) {
    if (inPlace === true) {
        return b.reverse();
    } 
    if (inPlace === false) {
        const copy = Buffer.allocUnsafe(b.length);
        b.copy(copy)
        return copy.reverse();
    }
}
