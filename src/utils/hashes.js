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
import CryptoJS from 'crypto-js';

/**
 * sha256Hash hashes the given data in SHA256
 * @param {Buffer} data - The data to hash.
 * @returns {Buffer} The hashing result.
 */
export function sha256Hash(data) {
  return Buffer.from(sha256(data), 'hex');
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

/**
 * aesEncrypt encrypts the given data in AES.
 * @param {string} data - The data to hash.
 * @param {string} key - The key used to hash data.
 * @returns {string} The hash result
 */
export function aesEncrypt(data, key) {
  return CryptoJS.AES.encrypt(data, key).toString();
}

/**
 * aesDecrypt decrypts the data encrypted by AES.
 * @param {string} data - The data to hash.
 * @param {string} key - The key used to hash data.
 * @returns {string} The hash result.
 */
export function aesDecrypt(data, key) {
  return CryptoJS.AES.decrypt(data, key).toString(CryptoJS.enc.Utf8);
}