/**
 * apiSpec tests module api
 * @module apiSpec
 */

'use strict';

describe('Test class Session', function () {
  describe('Test method get', function () {
    it('should be able to fetch data', async function () {
      const resp = await this.api.sess.get('/blocks/height');
      expect(resp.height).toBeGreaterThan(0);
    });
  });

  describe('Test method post', function () {
    it('should be able to post data', async function () {
      const resp = await this.api.sess.post('/utils/hash/fast', 'hello');
      expect(resp.hash).toBe('4PNCZERNLKAqwSYHhZpb7B4GE34eiYDPXGgeNKWNNaBp');
    });
  });
});

describe('Test class APIGrp', function () {
  describe('Test method makeUrl', function () {
    it('adds the API Group prefix to the given endpoint', function () {
      const blk = this.api.blocks;
      const blkCls = blk.constructor;
      expect(blkCls.PREFIX).toBe('/blocks');

      const edpt = '/test';
      expect(blkCls.makeUrl(edpt)).toBe('/blocks/test');
    });
  });

  describe('Test method get', function () {
    it('should be able to fetch data', async function () {
      const resp = await this.api.blocks.get('/height');
      expect(resp.height).toBeGreaterThan(0);
    });
  });

  describe('Test method post', function () {
    it('should be able to post data', async function () {
      const resp = await this.api.utils.post('/hash/fast', 'hello');
      expect(resp.hash).toBe('4PNCZERNLKAqwSYHhZpb7B4GE34eiYDPXGgeNKWNNaBp');
    });
  });
});
