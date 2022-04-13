/**
 * module utils/random provides functionalities for generating random bytes.
 * @module utils/random
 */

'use strict';

import { Buffer } from 'buffer';
import * as cro from 'crypto';
import * as env from './env.js';

/**
 * nodeRandom generates random bytes with the given size with approaches available
 * in node.js environment.
 * @param {number} size - The size of the random bytes.
 * @returns {Buffer} The generated random bytes.
 */
function nodeRandom(size) {
  return cro.randomBytes(size);
}

/**
 * browserRandom generates random bytes with the given size with approaches available
 * in browser environment.
 * @param {number} size - The size of the random bytes.
 * @returns {Buffer} The generated random bytes.
 */
function browserRandom(size) {
  const buf = Buffer.alloc(size);
  let cro = self.crypto || self.msCrypto;
  cro.getRandomValues(buf);
  return buf;
}

/**
 * getRandomBytes generates random bytes with the given size.
 * @param {number} size - The size of the random bytes.
 * @returns {Buffer} The generated random bytes.
 */
export function getRandomBytes(size) {
  if (env.isNode()) {
    return nodeRandom(size);
  } else if (env.isBrowser()) {
    return browserRandom(size);
  } else {
    throw new Error('Unknown environment');
  }
}
