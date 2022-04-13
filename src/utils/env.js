/**
 * module utils/env provides functions to detect the runtime environment(e.g. node.js or browsers).
 * @module utils/env
 */

'use strict';

import * as en from './enum.js';

/** RuntimeEnv is the enum class for runtime environments*/
export class RuntimeEnv extends en.Enum {
  static elems = {
    BROWSER: 0,
    NODE: 1,
  };
  static _ = this.createElems();
}

/**
 * isNode checks if the runtime environment is node.js.
 * @returns {boolean} If the runtime environment is node.js.
 */
export function isNode() {
  if (
    typeof process === 'object' &&
    typeof process.versions === 'object' &&
    typeof process.versions.node !== 'undefined'
  ) {
    return true;
  }
  return false;
}

/**
 * isBrowser checks if the runtime environment is browser.
 * @returns {boolean} If the runtime environment is browser.
 */
export function isBrowser() {
  if (typeof window !== 'undefined' || typeof self !== 'undefined') {
    return true;
  }
  return false;
}

/**
 * detectEnv detects the current runtime environment. Can be BROWSER || NODE
 * @returns {RuntimeEnv} The the runtime environment.
 */
export function detectEnv() {
  if (isBrowser()) {
    return RuntimeEnv.BROWSER;
  } else if (isNode()) {
    return RuntimeEnv.NODE;
  } else {
    throw new Error('Unknown environment detected');
  }
}
