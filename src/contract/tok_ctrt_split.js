/**
 * module contract/tokCtrtSplit provides functionalities for Token contract V1 with split.
 * @module contract/tokCtrtSplit
 */

'use strict';

import * as ctrt from './ctrt.js';
import * as acnt from '../account.js';
import * as md from '../model.js';
import * as tx from '../tx_req.js';
import * as de from '../data_entry.js';
import * as tcns from './tok_ctrt_no_split.js';
import * as msacnt from '../multisign_account.js';

/** FuncIdx is the class for function indexes */
export class FuncIdx extends ctrt.FuncIdx {
  static elems = {
    SUPERSEDE: 0,
    ISSUE: 1,
    DESTROY: 2,
    SPLIT: 3,
    SEND: 4,
    TRANSFER: 5,
    DEPOSIT: 6,
    WITHDRAW: 7,
    TOTAL_SUPPLY: 8,
    MAX_SUPPLY: 9,
    BALANCE_OF: 10,
    GET_ISSUER: 11,
  };
  static _ = this.createElems();
}

/** TokCtrtWithSplit is the class for Token Contract V1 with split */
export class TokCtrtWithSplit extends tcns.TokCtrtWithoutSplit {
  static CTRT_META = md.CtrtMeta.fromB58Str(
    '3dPGAWbTw4srh5hmMiRUhHtcxmXXLUooKGAfnmz11j5NruyJpBzZpgvADMdZS7Mevy5MAHqFbfHYdfqaAe1JEpLWt1pJWLHZBV62zUhLGmVLXUP5UDvSs24jsBRHqZMC71ciE1uYtgydKxCoFJ3rAgsYqp7GDeTU2PXS5ygDmL6WXmbAYPS8jE4sfNUbJVwpvL1cTw4nnjnJvmLET8VmQybxFt415RemV3MFPeYZay5i5gMmyZa63bjzK1uMZAVWA9TpF5YQ1NTZjPaRPvQGYVY4kY9L4LFJvUG2bib1QaNh7wUAQnTzJfRYJoy1aegFGFZFnBGp9GugH4fHAY69vGmZQnhDw3jU45G9odFyXo3T5Ww4R5szegbjCUKdUGpXf9vY2cKEMJ7i8eCkFVG1dDFZeVov1KMjkVNV8rDBDYfcp3oSGNWQQvGSUT5iGUvDRN8phy1UpR3A9uMVebvjLnVzPx9RyqQ8HaXLM8vPhLuWLoh5hk1Zi1n9nwz55XvKDYjP6eeB55yK5vpg8xjaYDnw9bjYV7ZmS7LAsHvXfnwi8y2W6vk2hGvs4rtR1vNRZSQMPGRRSuwCRJL1yngH6uHWwm2ajWxc684jApuoLdyjZomfCtdpabSyU3kp9Lrn8zT8BVY332sJPQU6gTQi8ke9s9dBxCae4cfSQM6HhuBmFc5KKWHCVG4bm4KZRYbMtidw8ZZnjaAMtcGq7k3Se6GXaTxdS3GcuttB3VB7njypyzuqAcfCdYb9ht8Y1WuTCZ1aLsXsL6eydfk2WLJVrqYpbTk6AchV5gMAEopvc3qXvzrDCedjtNsDmA56Lh6PxrrKr8aV8Wzz8aMaQ88YsVBpE8J4cDkxzo31AojhzEGVBKLmpb3bjmsaw9VkpB6yL8ngYs8eJMSPdM289TSMaEmG4eHt1jezpHTKxkuB9cwqcvhGNLWuv8KXQkik5pRMXV67Qs2FvjpzeJ81z2hnVh1wCtsa6M6qAG1gsqLHa1AVMRzsowafC99uDexwWMBS2RqsZWZBXJcUiNVULjApSnoBREYfHYEpjJ152hnTYZCAwpZMWEkVdBQpZ3zk8gbfLxB4fWMfKgJJucbKPGp1K56u7P8MHQu9aNb9dEof2mwX8rTHjk8jSQ7kXVX4Mf1JqMRWWftkV3GmU1nqYhxRGu4FjDNAomwTr5epHpcMF6P5oiXcLWh5BFQVmGYKz129oizAyUJBsZdxr2WZEGDieLxUg8cve25g28oTuCVENST4z1ZsFAN9wTa1'
  );

  /**
   * getUnit queries & returns the unit.
   * @returns {number} The unit.
   */
  async getUnit() {
    const resp = await this.chain.api.ctrt.getTokInfo(this.tokId.data);
    return resp.unity;
  }

  /**
   * split updates the unit.
   * @param {acnt.Account | msacnt.MultiSignAccount} by - The action taker.
   * @param {number} newUnit - The new unit to update.
   * @param {string} attachment - The attachment of the action. Defaults to ''.
   * @param {number} fee - The fee to pay for this action. Defaults to md.ExecCtrtFee.DEFAULT.
   * @returns {object} The response returned by the Node API.
   */
  async split(by, newUnit, attachment = '', fee = md.ExecCtrtFee.DEFAULT) {
    const data = await by.executeContractImpl(
      new tx.ExecCtrtFuncTxReq(
        this.ctrtId,
        FuncIdx.SPLIT,
        new de.DataStack(de.Amount.fromNumber(newUnit)),
        md.VSYSTimestamp.now(),
        new md.Str(attachment),
        md.ExecCtrtFee.fromNumber(fee)
      )
    );
    return data;
  }
}
