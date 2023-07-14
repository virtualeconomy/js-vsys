/**
 * module api provides functionalities for calling RESTful APIs exposed by a node in the VSYS blockchain network.
 * @module api
 */

'use strict';

import nodeFetch from 'node-fetch';
globalThis.fetch = globalThis.fetch || nodeFetch;

/** Session is the class for HTTP request session */
class Session {
  /**
   * Create a Session instance.
   * @param {string} host - The host of the node.
   * @param {string} apiKey - The API key of the node. Defaults to ''.
   */
  constructor(host, apiKey = '') {
    this.host = host;
    this.apiKey = apiKey;
  }

  /**
   * headers returns the headers of the session.
   * @returns {object} The headers of the session.
   */
  get headers() {
    const headers = {
      'Content-Type': 'application/json',
    };
    if (this.apiKey !== '') {
      headers['api_key'] = this.apiKey;
    }

    return headers;
  }

  /**
   * get calls the given endpoint with HTTP GET.
   * @param {string} edpt - The endpoint name.
   * @returns {object} The response.
   */
  async get(edpt) {
    const resp = await fetch(this.host + edpt, {
      method: 'GET',
      headers: this.headers,
    });
    return await resp.json();
  }

  /**
   * post calls the given endpoint with HTTP POST.
   * @param {string} edpt - The endpoint name.
   * @param {string} data - The payload.
   * @returns {object} The response.
   */
  async post(edpt, data) {
    const resp = await fetch(this.host + edpt, {
      method: 'POST',
      headers: this.headers,
      body: data,
    });
    return await resp.json();
  }
}

/** NodeAPI is the class for accessing RESTful APIs exposed by
 * a node in the VSYS blockchain network.
 */
export class NodeAPI {
  /**
   * Creates a new NodeAPI instance.
   * @param {Session} sess - The session.
   */
  constructor(sess) {
    this.sess = sess;
    this.blocks = new Blocks(sess);
    this.tx = new Transactions(sess);
    this.utils = new Utils(sess);
    this.addr = new Addresses(sess);
    this.ctrt = new Contract(sess);
    this.vsys = new VSYS(sess);
    this.leasing = new Leasing(sess);
    this.node = new Node(sess);
    this.database = new Database(sess);
  }

  /**
   * new creates a new NodeAPI instance.
   * @param {string} host - The host of the node.
   * @param {string} apiKey - The api key of the node. Defaults to ''.
   * @returns {NodeAPI} The new NodeAPI instance.
   */
  static new(host, apiKey = '') {
    const sess = new Session(host, apiKey);
    return new NodeAPI(sess);
  }

  /**
   * get calls the given endpoint with HTTP GET.
   * @param {string} edpt - The endpoint name.
   * @returns {object} The response.
   */
  async get(edpt) {
    const resp = this.sess.get(edpt);
    return resp;
  }

  /**
   * post calls the given endpoint with HTTP POST.
   * @param {string} edpt - The endpoint name.
   * @param {string} data - The payload. Either a JSON string or a plain text string.
   * @returns {object} The response.
   */
  async post(edpt, data) {
    const resp = this.sess.post(edpt, data);
    return resp;
  }
}

/** APIGrp is the class for a groups of APIs that share the same prefix */
class APIGrp {
  static PREFIX = '';

  /**
   * Creates a new APIGrp instance.
   * @param {Session} sess - The session instance.
   */
  constructor(sess) {
    this.sess = sess;
  }

  /**
   * makeUrl makes the full url based on the given endpoint name.
   * @param {string} edpt - The endpoint name.
   * @returns {string} The full url.
   */
  static makeUrl(edpt) {
    return this.PREFIX + edpt;
  }

  /**
   * get calls the given endpoint with HTTP GET.
   * @param {string} edpt - The endpoint name.
   * @returns {object} The response.
   */
  async get(edpt) {
    let url = this.constructor.makeUrl(edpt);
    return await this.sess.get(url);
  }

  /**
   * post calls the given endpoint with HTTP POST.
   * @param {string} edpt - The endpoint name.
   * @param {string} data - The payload.
   * @returns {object} The response.
   */
  async post(edpt, data) {
    let url = this.constructor.makeUrl(edpt);
    return await this.sess.post(url, data);
  }
}

/** Blocks is the class for API group 'blocks' */
class Blocks extends APIGrp {
  static PREFIX = '/blocks';

  /**
   * getHeights gets the height of the chain.
   * @returns {object} The response.
   */
  async getHeight() {
    return await this.get('/height');
  }

  /**
   * getLastBlock gets the last block of the chain.
   * @returns {object} The response.
   */
  async getLastBlock() {
    return await this.get('/last');
  }

  /**
   * getLastBlock gets the last block of the chain.
   * @param height - The height of the block.
   * @returns {object} The response.
   */
  async getBlockAt(height) {
    return await this.get(`/at/${height}`);
  }
}

/** Transactions is the class for API group 'transactions' */
class Transactions extends APIGrp {
  static PREFIX = '/transactions';

  /**
   * getInfo gets the information about a transaction.
   * @param {string} txId - The transaction ID.
   * @returns {object} The response.
   */
  async getInfo(txId) {
    return await this.get(`/info/${txId}`);
  }

  /**
   * getTxList gets the list of transactions involving the given address.
   * @param {string} addr - The wallet address or contract address.
   * @param {number} limit - The number of records to be returned.
   * @returns {object} The response.
   */
  async getTxList(addr, limit) {
    return await this.get(`/address/${addr}/limit/${limit}`);
  }
}

/** Node is the class for API group 'node' */
class Node extends APIGrp {
  static PREFIX = '/node';

  /**
   * getStatus gets the status of the node.
   * @returns {object} The response.
   */
  async getStatus() {
    return await this.get('/status');
  }

  /**
   * getVersion gets the version of the node.
   * @returns {object} The response.
   */
  async getVersion() {
    return await this.get('/version');
  }
}

/** Utils is the class for API group 'utils' */
class Utils extends APIGrp {
  static PREFIX = '/utils';

  /**
   * hashFast posts the given data to the node and get the fast hash in response.
   * @param {string} data - The data to hash.
   * @returns {object} The response.
   */
  async hashFast(data) {
    return await this.post('/hash/fast', data);
  }
}

/** Addresses is the class for API group 'addresses' */
class Addresses extends APIGrp {
  static PREFIX = '/addresses';

  /**
   * getBalance gets the ledger(regular) balance of the given address.
   * @param {string} addr - The account address.
   * @returns {object} The response.
   */
  async getBalance(addr) {
    return await this.get(`/balance/${addr}`);
  }

  /**
   * getBalanceDetails gets the ledger(regular) balance of the given address.
   * @param {string} addr - The account address.
   * @returns {object} The response.
   */
  async getBalanceDetails(addr) {
    return await this.get(`/balance/details/${addr}`);
  }
}

/** Contract is the class for API group 'contract'*/
class Contract extends APIGrp {
  static PREFIX = '/contract';

  /**
   * getCtrtData gets the data of a contract with the given DB key.
   * @param {string} ctrtId - The contract ID.
   * @param {string} dbKey - The DB key.
   * @returns {object} The response.
   */
  async getCtrtData(ctrtId, dbKey) {
    return await this.get(`/data/${ctrtId}/${dbKey}`);
  }

  /**
   * getTokInfo gets the information of the token.
   * @param {string} tokId - The token ID.
   * @returns {object} The response.
   */
  async getTokInfo(tokId) {
    return await this.get(`/tokenInfo/${tokId}`);
  }

  /**
   * getCtrtInfo gets the information of the contract.
   * @param {string} ctrtId - The contract ID.
   * @returns {object} The response.
   */
  async getCtrtInfo(ctrtId) {
    return await this.get(`/info/${ctrtId}`);
  }

  /**
   * broadcastRegister broadcasts the register contract request.
   * @param {object} data - The payload for the API call.
   * @returns {object} The response.
   */
  async broadcastRegister(data) {
    return await this.post('/broadcast/register', JSON.stringify(data));
  }

  /**
   * broadcastExecute broadcasts the execute contract request.
   * @param {object} data - The payload for the API call.
   * @returns {object} The response.
   */
  async broadcastExecute(data) {
    return await this.post('/broadcast/execute', JSON.stringify(data));
  }

  /**
   * getTokBal gets the token balance for the account address.
   * @param {string} addr - The account address.
   * @param {string} tokId - The token ID.
   * @returns {object} The response.
   */
  async getTokBal(addr, tokId) {
    return await this.get(`/balance/${addr}/${tokId}`);
  }

  /**
   * getLastTokIdx gets the last token index for the contract.
   * @param {string} ctrtId - The contract ID.
   * @returns {object} The response.
   */
  async getLastTokIdx(ctrtId) {
    return await this.get(`/lastTokenIndex/${ctrtId}`);
  }

  /**
   * getTokInfo gets the token information for the token ID.
   * @param {string} tokId - The token ID.
   * @returns {object} The response.
   */
  async getTokInfo(tokId) {
    return await this.get(`/tokenInfo/${tokId}`);
  }
}

/** Database is the class for API group 'database' */
class Database extends APIGrp {
  static PREFIX = '/database';

  /**
   * broadcastPut broadcasts the DB Put request.
   * @param {object} data - The payload for the API call.
   * @returns {object} The response.
   */
  async broadcastPut(data) {
    return await this.post('/broadcast/put', JSON.stringify(data));
  }

  /**
   * get broadcasts the DB Put request.
   * @param {string} addr - The address that owns the data.
   * @param {string} dbKey - The db key of the data.
   * @returns {object} The response.
   */
  async getDB(addr, dbKey) {
    return await this.get(`/get/${addr}/${dbKey}`);
  }
}

/** Leasing is the class for API group 'leasing' */
class Leasing extends APIGrp {
  static PREFIX = '/leasing';

  /**
   * broadcastLease broadcasts the lease request.
   * @param {object} data - The payload for the API call.
   * @returns {object} The response.
   */
  async broadcastLease(data) {
    return await this.post('/broadcast/lease', JSON.stringify(data));
  }

  /**
   * broadcastCancel broadcasts the lease cancel request.
   * @param {object} data - The payload for the API call.
   * @returns {object} The response.
   */
  async broadcastCancel(data) {
    return await this.post('/broadcast/cancel', JSON.stringify(data));
  }
}

/** VSYS is the class for API group 'VSYS' */
class VSYS extends APIGrp {
  static PREFIX = '/vsys';

  /**
   * broadcastPayment broadcasts the request for payment of VSYS coins.
   * @param {object} data - The payload for the API call.
   * @returns {object} The response.
   */
  async broadcastPayment(data) {
    return await this.post('/broadcast/payment', JSON.stringify(data));
  }

  /**
   * payment makes the payment of VSYS coins for one of the built-in account of the node (API Key required).
   * @param {object} data - The payload for the API call.
   * @returns {object} The response.
   */
  async payment(data) {
    return await this.post('/payment', JSON.stringify(data));
  }
}
