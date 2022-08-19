/**
 * module utils/bytesPacker provides functionalities to pack & unpack values to & from bytes.
 * @module utils/bytesPacker
 */

'use strict';

import { Buffer } from 'buffer';

import jsBNPkg from 'bignumber.js';
export const BigNumber = jsBNPkg;

/**
 * packUInt8 packs the given integer into 1 byte
 * @param {number} val - The value to pack.
 * @returns {Buffer} The packing result.
 */
export function packUInt8(val) {
  const buf = Buffer.alloc(1);
  buf.writeUInt8(val);
  return buf;
}

/**
 * packInt8 packs the given integer into 1 byte
 * @param {number} val - The value to pack.
 * @returns {Buffer} The packing result.
 */
export function packInt8(val) {
  const buf = Buffer.alloc(1);
  buf.writeInt8(val);
  return buf;
}

/**
 * packUInt16 packs the given integer into 2 bytes in Big Endian order.
 * @param {number} val - The value to pack.
 * @returns {Buffer} The packing result.
 */
export function packUInt16(val) {
  const buf = Buffer.alloc(2);
  buf.writeUInt16BE(val);
  return buf;
}

/**
 * packUInt32 packs the given integer into 4 bytes in Big Endian order.
 * @param {number} val - The value to pack.
 * @returns {Buffer} The packing result.
 */
export function packUInt32(val) {
  const buf = Buffer.alloc(4);
  buf.writeUInt32BE(val);
  return buf;
}

/**
 * packUInt64 packs the given integer into 8 bytes in Big Endian order.
 * @param {BigNumber} val - The value to pack.
 * @returns {Buffer} The packing result.
 */
export function packUInt64(val) {
  let s = val.toString(16);
  if (s.length < 16) {
    let diff = 16 - s.length;
    let prefix = '';
    while (diff--) {
      prefix = prefix + '0';
    }
    s = prefix + s;
  }

  return Buffer.from(s, 'hex');
}

/**
 * packBool packs the given boolean value into 1 byte
 * @param {boolean} val - The value to pack.
 * @returns {Buffer} The packing result.
 */
export function packBool(val) {
  return Buffer.of(val);
}

/**
 * unpackUInt8 unpacks the given 1-byte Buffer to an integer.
 * @param {Buffer} buf - The 1-byte buffer to unpack.
 * @returns {number} The unpacking result.
 */
export function unpackUInt8(buf) {
  return buf.readUInt8(0);
}

/**
 * unpackUInt16 unpacks the given 2-byte Buffer to an integer in Big Endian order.
 * @param {Buffer} buf - The 2-byte buffer to unpack.
 * @returns {number} The unpacking result.
 */
export function unpackUInt16(buf) {
  return buf.readUInt16BE(0);
}

/**
 * unpackUInt32 unpacks the given 4-byte Buffer to an integer in Big Endian order.
 * @param {Buffer} buf - The 4-byte buffer to unpack.
 * @returns {number} The unpacking result.
 */
export function unpackUInt32(buf) {
  return buf.readUInt32BE(0);
}

/**
 * unpackUInt64 unpacks the given 8-byte Buffer to an integer in Big Endian order.
 * @param {Buffer} buf - The 8-byte buffer to unpack.
 * @returns {BigNumber} The unpacking result.
 */
export function unpackUInt64(buf) {
  const s = buf.toString('hex');
  return new BigNumber(s, 16);
}

/**
 * unpackBool unpacks the given 1-byte Buffer to a boolean value.
 * @param {Buffer} buf - The 1-byte Buffer to unpack.
 * @returns {boolean} The unpacking result.
 */
export function unpackBool(buf) {
  const i = buf.readUInt8(0);
  return !!i;
}
