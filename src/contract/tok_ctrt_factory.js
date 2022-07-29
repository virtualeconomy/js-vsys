/**
 * module tokCtrtFactory provides factory methods to create a token contract(NFT included) instance.
 * @module contract/tokCtrtFactory
 */

'use strict';

import * as en from '../utils/enum.js';
import * as md from '../model.js';
import * as ctrt from './ctrt.js';
import * as tok_ctrt_no_split from './tok_ctrt_no_split.js';
import * as tok_ctrt_split from './tok_ctrt_split.js';
import * as tok_ctrt_v2 from './tok_ctrt_v2.js';
import * as nft_ctrt from './nft_ctrt.js';
import * as nft_ctrt_v2 from './nft_ctrt_v2.js';
import * as sys_ctrt from './sys_ctrt.js';

/** TokCtrtType is the class for token contract types */
export class TokCtrtType extends en.Enum {
  static elems = {
    NFT: 'NonFungibleContract',
    NFT_V2_BLACKLIST: 'NFTContractWithBlacklist',
    NFT_V2_WHITELIST: 'NFTContractWithWhitelist',
    TOK_NO_SPLIT: 'TokenContract',
    TOK_WITH_SPLIT: 'TokenContractWithSplit',
    TOK_V2_WHITELIST: 'TokenContractWithWhitelist',
    TOK_V2_BLACKLIST: 'TokenContractWithBlacklist',
  };
  static _ = this.createElems();
}

const TokCtrtMap = new Map([
  [TokCtrtType.NFT, nft_ctrt.NFTCtrt],
  [TokCtrtType.NFT_V2_BLACKLIST, nft_ctrt_v2.NFTCtrtV2Blacklist],
  [TokCtrtType.NFT_V2_WHITELIST, nft_ctrt_v2.NFTCtrtV2Whitelist],
  [TokCtrtType.TOK_NO_SPLIT, tok_ctrt_no_split.TokCtrtWithoutSplit],
  [TokCtrtType.TOK_WITH_SPLIT, tok_ctrt_split.TokCtrtWithSplit],
  [TokCtrtType.TOK_V2_WHITELIST, tok_ctrt_v2.TokCtrtV2Whitelist],
  [TokCtrtType.TOK_V2_BLACKLIST, tok_ctrt_v2.TokCtrtV2Blacklist],
]);

/**
 * fromTokId creates a token contract instance based on the given token ID.
 * @param {md.TokenID} tokId - The token ID.
 * @param {ch.Chain} chain - The chain.
 * @returns {ctrt.BaseTokCtrt} The token contract instance.
 */
export async function fromTokId(tokId, chain) {
  if (tokId.isMainnetVsysTok) {
    return sys_ctrt.SysCtrt.forMainnet(chain);
  }
  if (tokId.isTestnetVsysTok) {
    return sys_ctrt.SysCtrt.forTestnet(chain);
  }

  const resp = await chain.api.ctrt.getTokInfo(tokId.data);

  let ctrtId;
  try {
    ctrtId = resp.contractId;
  } catch {
    throw new Error(JSON.stringify(resp));
  }

  const ctrtInfo = await chain.api.ctrt.getCtrtInfo(ctrtId);
  const type = TokCtrtType.fromStr(ctrtInfo.type);

  const cls = TokCtrtMap.get(type);
  return new cls(ctrtId, chain);
}
