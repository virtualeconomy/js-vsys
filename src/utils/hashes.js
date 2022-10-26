/**
 * module utils/hashes provides functionalities for hashings.
 * @module utils/hashes
 */

'use strict';

import { Buffer } from 'buffer';
import blake from 'blakejs';
const { blake2b } = blake;
import keccak256 from 'keccak256';
import sha256 from 'js-sha256';
import sha512 from 'js-sha512';

/**
 * sha256Hash hashes the given data in SHA256
 * @param {Buffer} data - The data to hash.
 * @returns {Buffer} The hashing result.
 */
export function sha256Hash(data) {
  return Buffer.from(sha256(data), 'hex');
}

/**
 * sha512Hash hashes the given data in SHA512
 * @param {Buffer} data - The data to hash.
 * @returns {Buffer} The hashing result.
 */
export function sha512Hash(data) {
  return Buffer.from(sha512.digest(data));
}

/**
 * keccak256Hash hashes the given data in Keccak 256 hash.
 * @param {Buffer} data - The data to hash.
 * @returns {Buffer} The hashing result.
 */
export function keccak256Hash(data) {
  return keccak256(data);
}

/**
 * blake2b32Hash hashes the given data in Blake2b 32-bit hash.
 * @param {Buffer} data - The data to hash.
 * @returns {Buffer} The hashing result.
 */
export function blake2b32Hash(data) {
  return Buffer.from(blake2b(data, null, 32), 'latin1');
}
