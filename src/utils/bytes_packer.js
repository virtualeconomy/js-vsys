/**
 * Bytes packer module provides functionalities to pack & unpack values to & from bytes.
 * @module utils/bytes_packer
 */

'use strict';

import { Buffer } from 'buffer';

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
 * @param {BigInt} val - The value to pack.
 * @returns {Buffer} The packing result.
 */
export function packUInt64(val) {
  const buf = Buffer.alloc(8);
  buf.writeBigUInt64BE(val);
  return buf;
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
  return buf.readUInt8();
}

/**
 * unpackUInt16 unpacks the given 2-byte Buffer to an integer in Big Endian order.
 * @param {Buffer} buf - The 2-byte buffer to unpack.
 * @returns {number} The unpacking result.
 */
export function unpackUInt16(buf) {
  return buf.readUInt16BE();
}

/**
 * unpackUInt32 unpacks the given 4-byte Buffer to an integer in Big Endian order.
 * @param {Buffer} buf - The 4-byte buffer to unpack.
 * @returns {number} The unpacking result.
 */
export function unpackUInt32(buf) {
  return buf.readUInt32BE();
}

/**
 * unpackUInt64 unpacks the given 8-byte Buffer to an integer in Big Endian order.
 * @param {Buffer} buf - The 8-byte buffer to unpack.
 * @returns {BigInt} The unpacking result.
 */
export function unpackUInt64(buf) {
  return buf.readUInt64BE();
}

/**
 * unpackBool unpacks the given 1-byte Buffer to a boolean value.
 * @param {Buffer} buf - The 1-byte Buffer to unpack.
 * @returns {boolean} The unpacking result.
 */
export function unpackBool(buf) {
  const i = buf.readUInt8();
  return !!i;
}
