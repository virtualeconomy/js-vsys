/**
 * apiSpec tests module api
 * @module apiSpec
 */

 'use strict';

 import * as api from '../src/api.js';
 
 const HOST = 'http://veldidina.vos.systems:9928';
 
 beforeAll(function () {
   this.nodeApi = api.NodeAPI.new(HOST);
 });
 
 describe('Test Session', function () {
   describe('Test method get', function () {
     it('should be able to fetch data', async function () {
       const resp = await this.nodeApi.sess.get('/blocks/height');
       expect(resp.height).toBeGreaterThan(0);
     });
   });
 
   describe('Test method post', function () {
     it('should be able to post data', async function () {
       const resp = await this.nodeApi.sess.post('/utils/hash/fast', 'hello');
       expect(resp.hash).toBe('4PNCZERNLKAqwSYHhZpb7B4GE34eiYDPXGgeNKWNNaBp');
     });
   });
 });
 
 describe('Test APIGrp', function () {
   describe('Test method makeUrl', function () {
     it('adds the API Group prefix to the given endpoint', function () {
       const blk = this.nodeApi.blocks;
       const blkCls = blk.constructor;
       expect(blkCls.PREFIX).toBe('/blocks');
 
       const edpt = '/test';
       expect(blkCls.makeUrl(edpt)).toBe('/blocks/test');
     });
   });
 
   describe('Test method get', function () {
     it('should be able to fetch data', async function () {
       const resp = await this.nodeApi.blocks.get('/height');
       expect(resp.height).toBeGreaterThan(0);
     });
   });
 
   describe('Test method post', function () {
     it('should be able to post data', async function () {
       const resp = await this.nodeApi.utils.post('/hash/fast', 'hello');
       expect(resp.hash).toBe('4PNCZERNLKAqwSYHhZpb7B4GE34eiYDPXGgeNKWNNaBp');
     });
   });
 });
 