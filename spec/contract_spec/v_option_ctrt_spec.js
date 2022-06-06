/**
 * module VOptionCtrtSpec tests module contract/VOptionCtrt
 * @module VOptionCtrtSpec
 */

'use strict';

import * as jv from '../../src/index.js';
import * as ut from '../../spec/helpers/utils.js';
import * as bn from '../../src/utils/big_number.js';

describe('Test class VOptionCtrt', function () {
  beforeEach(async function () {
    const MAX_ISSUE_AMOUNT = 1000;
    const MINT_AMOUNT = 200;
    const EXEC_TIME_DELTA = 50;
    const EXEC_DDL_DELTA = 95;

    const [baseTc, targetTc, optionTc, proofTc] = await Promise.all([
      jv.TokCtrtWithoutSplit.register(this.acnt0, 1000, 1),
      jv.TokCtrtWithoutSplit.register(this.acnt0, 1000, 1),
      jv.TokCtrtWithoutSplit.register(this.acnt0, 1000, 1),
      jv.TokCtrtWithoutSplit.register(this.acnt0, 1000, 1),
    ]);
    await this.waitForBlock();

    await Promise.all([
      baseTc.issue(this.acnt0, 1000),
      targetTc.issue(this.acnt0, 1000),
      optionTc.issue(this.acnt0, 1000),
      proofTc.issue(this.acnt0, 1000),
    ]);
    await this.waitForBlock();

    const execTime = Date.now() + EXEC_TIME_DELTA * 1000;
    const executeDeadline = Date.now() + EXEC_DDL_DELTA * 1000;
    this.vc = await jv.VOptionCtrt.register(
      this.acnt0,
      baseTc.tokId.data,
      targetTc.tokId.data,
      optionTc.tokId.data,
      proofTc.tokId.data,
      execTime,
      executeDeadline
    );
    await this.waitForBlock();

    await Promise.all([
      baseTc.deposit(this.acnt0, this.vc.ctrtId.data, 1000),
      targetTc.deposit(this.acnt0, this.vc.ctrtId.data, 1000),
      optionTc.deposit(this.acnt0, this.vc.ctrtId.data, 1000),
      proofTc.deposit(this.acnt0, this.vc.ctrtId.data, 1000),
    ]);
    await this.waitForBlock();

    await this.vc.activate(this.acnt0, MAX_ISSUE_AMOUNT, 10, 1);
    await this.waitForBlock();

    await this.vc.mint(this.acnt0, MINT_AMOUNT);
    await this.waitForBlock();
  });

  describe('Test method register', function () {
    it('should register an instance of V Option Contract', async function () {
      const ctrtMakerActual = await this.vc.getMaker();
      const ctrtMakerExpected = await this.acnt0.addr;
      expect(ctrtMakerActual.equal(ctrtMakerExpected)).toBeTrue();
    });
  });

  describe('Test method activate', function () {
    it('should activate the V Option contract to store option token and proof token into the pool', async function () {
      const maxIssueNum = (await this.vc.getMaxIssueNum()).data;
      expect(maxIssueNum).toEqual(new bn.BigNumber(1000));
    });
  });

  describe('Test method mint', function () {
    it('should lock target tokens into the pool to get option tokens and proof tokens', async function () {
      const targetBal = (await this.vc.getTargetTokBal(this.acnt0.addr.data))
        .data;
      expect(targetBal).toEqual(new bn.BigNumber(800));
    });
  });

  describe('Test method unlock', function () {
    it('should get the remaining option tokens and proof tokens from the pool before the execute time', async function () {
      const UNLOCK_AMOUNT = 100;

      const resp = await this.vc.unlock(this.acnt0, UNLOCK_AMOUNT);
      await this.waitForBlock();
      const txId = resp.id;
      await this.assertTxSuccess(txId);

      const targetBal = (await this.vc.getTargetTokBal(this.acnt0.addr.data))
        .data;

      expect(targetBal).toEqual(new bn.BigNumber(900));
    });
  });

  describe('Test method execute&collect', function () {
    it('should test method execute&collect', async function () {
      const execAmount = 10;
      const targetTokBalInit = await this.vc.getTargetTokBal(
        this.acnt0.addr.data
      );

      await ut.sleep(36 * 1000);

      const execTxinfo = await this.vc.execute(this.acnt0, execAmount);
      await this.waitForBlock();
      const execTxId = execTxinfo.id;
      await this.assertTxSuccess(execTxId);

      const targetTokBalExec = await this.vc.getTargetTokBal(
        this.acnt0.addr.data
      );
      expect(targetTokBalExec.data.minus(targetTokBalInit.data)).toEqual(
        new bn.BigNumber(execAmount)
      );

      await ut.sleep(30 * 1000);

      const collectTxinfo = await this.vc.collect(this.acnt0, execAmount);
      await this.waitForBlock();
      const collectTxId = collectTxinfo.id;
      await this.assertTxSuccess(collectTxId);

      const targetTokBalCol = await this.vc.getTargetTokBal(
        this.acnt0.addr.data
      );
      expect(targetTokBalCol.data.minus(targetTokBalExec.data)).toEqual(
        new bn.BigNumber(9)
      );
    });
  });
});
