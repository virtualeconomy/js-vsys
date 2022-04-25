import * as jv from './src/index.js';

import * as tcf from './src/contract/tok_ctrt_factory.js';

import * as api from './src/api.js';
import * as ch from './src/chain.js';
import * as md from './src/model.js';

const nodeApi = api.NodeAPI.new(
  'http://veldidina.vos.systems:9928',
);
const chain = new ch.Chain(nodeApi);

const tokId = new md.TokenID('TWtA2zFHnwsbydEhFQqyrDzg235Vg5JT88nQV367F');
const tc = await tcf.fromTokId(tokId, chain);
console.log(tc);
