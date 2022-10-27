import * as md from './model.js';
import * as bp from './utils/bytes_packer.js';


// DBPutKey is the key for the data stored by the DB Put transaction.
export class DBPutKey {

    /**
    * @param {md.Str} data -
    */
    constructor(data) {
        this.data = data;
    }

    static fromStr(s) {
        return new this(new md.Str(s));
    }

    get bytes() {
        return this.data.bytes;
    }

    /**
    * serialize serializes the containing data to bytes.
    * @returns {Buffer} The serialization result.
    */
    serialize() {
        return Buffer.concat([bp.packUInt16(this.data.data.length), this.bytes]);
    }
}

// DBPutData is the data for DB put.
export class DBPutData {
    static ID = 0;

    /**
     * @param {md.Str} data
     */
    constructor(data) {
        this.data = data;
    }

    static new(data, dataType) {
        return new dataType(new md.Str(data));
    }

    get idBytes() {
        return bp.packUInt8(this.constructor.ID);
    }

    get bytes() {
        return this.data.bytes;
    }

    serialize() {
       return Buffer.concat([bp.packUInt16(this.data.data.length + 1), this.idBytes, this.bytes]);
    }
}

export class ByteArray extends DBPutData {
    static ID = 1
}