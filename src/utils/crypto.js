'use strict'

import CryptoJS from 'crypto-js';
import Converters from './converters.js';

/**
 * encrypt input with sha256 method.
 * @param {string} input - The string needed to be encrypted.
 * @returns The encrypted string.
 */
function sha256(input) {
    let bytes;
    if (typeof input === 'string') {
        bytes = Converters.stringToByteArray(input);
    }
    else {
        bytes = input;
    }
    let wordArray = Converters.byteArrayToWordArrayEx(Uint8Array.from(bytes));
    let resultWordArray = CryptoJS.SHA256(wordArray);
    return Converters.wordArrayToByteArrayEx(resultWordArray);
}

/**
 * encrypt the password.
 * @param {string} password - The password used when encrypting seed previously.
 * @param {number} rounds - The number of encryption round when encrypting seed previously.
 * @returns The encrypted password.
 */
function strengthenPassword(password, rounds) {
    if (rounds === void 0) { rounds = 5000; }
    while (rounds--)
        password = Converters.byteArrayToHexString(sha256(password));
    return password;
}

/**
 * encrypt the seed.
 * @param {Seed} seed - The seed needed to be encrypted.
 * @param {string} password - The password used when encrypting seed.
 * @param {number} encryptionRounds - The number of encryption round when encrypting seed.
 * @returns {string} The encrypted seed.
 */
export function encryptSeed(seed, password, encryptionRounds) {
    if (typeof seed !== 'string') {
        throw new Error('Seed is required');
    }
    if (!password || typeof password !== 'string') {
        throw new Error('Password is required');
    }
    password = strengthenPassword(password, encryptionRounds);
    return CryptoJS.AES.encrypt(seed, password).toString();
}

/**
 * decrypt the seed.
 * @param {Seed} encryptedSeed - The encrypted seed needed to be decrypted.
 * @param {string} password - The password used when encrypting seed previously.
 * @param {string} encryptionRounds - The number of encryption round when encrypting seed previously.
 * @returns The decrypted seed.
 */
export function decryptSeed(encryptedSeed, password, encryptionRounds) {
    if (!encryptedSeed || typeof encryptedSeed !== 'string') {
        throw new Error('Encrypted seed is required');
    }
    if (!password || typeof password !== 'string') {
        throw new Error('Password is required');
    }
    password = strengthenPassword(password, encryptionRounds);
    let hexSeed = CryptoJS.AES.decrypt(encryptedSeed, password);
    return Converters.hexStringToString(hexSeed.toString());
}