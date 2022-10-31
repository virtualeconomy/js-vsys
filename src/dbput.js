import * as md from './model.js';
import * as bp from './utils/bytes_packer.js';

// DBPutKey is the key for the data stored by the DB Put transaction.
export class DBPutKey {
  /**
   * @param {md.Str} data - The db put key in string format.
   */
  constructor(data) {
    this.data = data;
  }

  /**
   * fromStr creates a DBPutKey from a string.
   * @param {string} s - The db put key in string format.
   * @returns {DBPutKey} - The DBPutKey object.
   */
  static fromStr(s) {
    return new this(new md.Str(s));
  }

  /**
   * bytes returns the bytes representation of the containing data
   * It converts the data to bytes only.
   * @returns {Buffer} - The bytes representation of the containing data
   */
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

  /**
   * new creates a new DBPutData for the given data & data type.
   * @param {string} data - the data.
   * @param {DBPutData} dataType - the data type.
   * @returns {DBPutData} - the DBPutData object.
   */
  static new(data, dataType) {
    return new dataType(new md.Str(data));
  }

  /**
   * id_bytes returns the id in bytes.
   * @returns {Buffer} - The id in bytes.
   */
  get idBytes() {
    return bp.packUInt8(this.constructor.ID);
  }

  /**
   * bytes returns the bytes representation of the containing data.
   * It converts the data to bytes only.
   * @returns {Buffer} - The bytes representation of the containing data
   */
  get bytes() {
    return this.data.bytes;
  }

  /**
   * serialize serializes the containing data to bytes.
   * @returns {Buffer} - The serialization result.
   */
  serialize() {
    return Buffer.concat([
      bp.packUInt16(this.data.data.length + 1),
      this.idBytes,
      this.bytes,
    ]);
  }
}

// ByteArray is the DB Put data type for byte array.
export class ByteArray extends DBPutData {
  static ID = 1;
}
