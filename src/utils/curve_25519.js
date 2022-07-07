/**
 * utils/curve25519 module provides functionalities for curve 25519 encryption.
 * @module utils/curve25519
 */

'use strict';

import Axlsign from 'axlsign';
import bs58 from 'bs58';
import { Buffer } from 'buffer';
import * as rd from './random.js';

/**
 * sign signs the given message with the given private key.
 * @param {Buffer} priKey - The private key.
 * @param {Buffer} msg - The message to sign.
 * @returns {Buffer} - The signature.
 */
export function sign(priKey, msg) {
  const sig = Axlsign.sign(priKey, msg, rd.getRandomBytes(64));
  return Buffer.from(sig);
}

/**
 * verify verfies the given signature with the given public key & message.
 * @param {Buffer} pubKey - The public key.
 * @param {Buffer} msg - The message to verify.
 * @param {Buffer} sig - The signature.
 * @returns {boolean} If the signature is valid.
 */
export function verify(pubKey, msg, sig) {
  return Axlsign.verify(pubKey, msg, sig);
}

/**
 * genKeyPair generates a curve 25519 key pair based on the given 32-byte random bytes.
 * @param {Buffer} rand32 - 32-byte random bytes
 * @returns {object} The generated key pair.
 */
export function genKeyPair(rand32) {
  const kp = Axlsign.generateKeyPair(rand32);
  return {
    pri: Buffer.from(kp.private),
    pub: Buffer.from(kp.public),
  };
}

/**
 * derivePublicKey generates a public key based on the given private key string.
 * @param {string} priKey - The private key string.
 * @returns {Buffer} The public key.
 */
export function derivePublicKey(priKey) {
  return Buffer.from(Axlsign.derivePublicKey(bs58.decode(priKey)));
}
