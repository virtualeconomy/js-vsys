'use strict'

import CryptoJS from 'crypto-js';
import Converters from './converters.js';


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

function strengthenPassword(password, rounds) {
    if (rounds === void 0) { rounds = 5000; }
    while (rounds--)
        password = Converters.byteArrayToHexString(sha256(password));
    return password;
}

const Crypto = {
    encryptSeed: function (seed, password, encryptionRounds) {
        if (typeof seed !== 'string') {
            throw new Error('Seed is required');
        }
        if (!password || typeof password !== 'string') {
            throw new Error('Password is required');
        }
        password = strengthenPassword(password, encryptionRounds);
        return CryptoJS.AES.encrypt(seed, password).toString();
    },

    decryptSeed: function (encryptedSeed, password, encryptionRounds) {
        if (!encryptedSeed || typeof encryptedSeed !== 'string') {
            throw new Error('Encrypted seed is required');
        }
        if (!password || typeof password !== 'string') {
            throw new Error('Password is required');
        }
        password = strengthenPassword(password, encryptionRounds);
        let hexSeed = CryptoJS.AES.decrypt(encryptedSeed, password);
        return Converters.hexStringToString(hexSeed.toString());
    },

};

export default Crypto;