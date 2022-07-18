/**
 * module utils/crypto provides functionalities for cryptograhphy.
 * @module utils/crypto
 */

'use strict';

import encUtf8 from "crypto-js/enc-utf8.js"
import AES from "crypto-js/aes.js";

/**
 * aesEncrypt encrypts the given data in AES.
 * @param {string} data - The data to encrypt.
 * @param {string} key - The key used to encrypt data.
 * @returns {string} The encryption result
*/
export function aesEncrypt(data, key) {
  return AES.encrypt(data, key).toString();
}
  
/**
 * aesDecrypt decrypts the given data encrypted by AES.
 * @param {string} data - The data to decrypt.
 * @param {string} key - The key used to decrypt data.
 * @returns {string} The decryption result.
 */
export function aesDecrypt(data, key) {
  return AES.decrypt(data, key).toString(encUtf8);
}
