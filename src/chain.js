/**
 * module chain provides functionalities for the chain in VSYS blockchain network.
 * @module chain
 */

'use strict';

import * as api from './api.js';
import * as en from './utils/enum.js';

/** ChainID is the Enum class for chain ID */
export class ChainID extends en.Enum {
  static elems = {
    MAIN_NET: 'M',
    TEST_NET: 'T',
  };
  static _ = this.createElems();
}

/** Chain is the class for chain in VSYS blockchain network */
export class Chain {
  /**
   * @param {api.NodeAPI} nodeApi - The NodeAPI instance.
   * @param {ChainID} chainId - The chain ID. Defaults to ChainID.TEST_NET.
   */
  constructor(nodeApi, chainId) {
    this.api = nodeApi;
    this.chainId = chainId;
  }

  /**
   * getHeight gets the height of the current chain.
   * @returns {number} The height of the chain.
   */
  async getHeight() {
    const data = await this.api.blocks.getHeight();
    return data['height'];
  }

  /**
   * getLastBlock gets the last block of the current chain.
   * @returns {number} The last block of the chain.
   */
  async getLastBlock() {
    const data = await this.api.blocks.getLastBlock();
    return data;
  }

  /**
   * getBlockAt gets the block of the certain height.
   * @param {number} height - The height of the block.
   * @returns {number} The block of the certain height.
   */
  async getBlockAt(height) {
    const data = await this.api.blocks.getBlockAt(height);
    return data;
  }
}
