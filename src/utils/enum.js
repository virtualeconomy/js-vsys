/**
 * module utils/enum provides supports for enum classes.
 * @module utils/enum
 */

'use strict';

/** Enum is the base class for enum classes
 *
 * To derive a concrete Enum class, just extend Enum and fill in elems.
 * Below is an example.
 *
 * class Foo extends Enum {
 *   static elems = {
 *     A: 1,
 *     B: 2,
 *   }
 *   static _ = this.createElems();
 * }
 *
 * console.log(Foo.A);
 * // Foo { key: 'A', val: 1 }
 */
export class Enum {
  static elems = {};
  static _ = this.createElems();

  /**
   * Create an Enum instance.
   * @param {string} key
   * @param {any} val
   */
  constructor(key, val) {
    this.key = key;
    this.val = val;
    this.validate();
  }

  /**
   * validate validates the Enum instance.
   */
  validate() {
    const cls = this.constructor;
    if (this.val === undefined || cls.elems[this.key] !== this.val) {
      throw new Error(`Invalid ${cls.name}`);
    }
  }

  /**
   * equals compares this enum instance with the given enum instance.
   * @param {Enum} other - The given enum instance to compare.
   * @returns {boolean} If this enum instance equals to the given one.
   */
  equals(other) {
    return (
      this.constructor === other.constructor &&
      this.key === other.key &&
      this.val === other.val
    );
  }

  /**
   * createElems adds enum elements dynamically to the class.
   */
  static createElems() {
    Object.entries(this.elems).forEach(([k, v]) => (this[k] = new this(k, v)));
  }

  /**
   * fromStr returns an Enum instance by the given string.
   * @param {string} s - The string for the element.
   * @returns {Enum} The Enum instance.
   */
  static fromStr(s) {
    for (const [k, v] of Object.entries(this.elems)) {
      if (v === s) {
        return this[k];
      }
    }
    throw new Error(`Invalid element name: ${s}`);
  }
}
