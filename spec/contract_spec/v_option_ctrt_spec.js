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
    this.MAX_ISSUE_AMOUNT = 1000;
    this.BASETC_UNIT = 100;
    this.TARGETTC_UNIT = 100;
    this.TOKEN_UNIT = 100;
    this.PRICE = 5;
    this.MINT_AMOUNT = 250;
    this.ACNT0_DEP_AMOUNT = 4000;
    const EXEC_TIME_DELTA = 50;
    const EXEC_DDL_DELTA = 95;
    // ideally those constants should be asserted, as there is relationship between them. Most likely it will be ok if you follow guidlines in comments.

    const [baseTc, targetTc, optionTc, proofTc] = await Promise.all([
      jv.TokCtrtWithoutSplit.register(this.acnt0, 5000, this.BASETC_UNIT),
      jv.TokCtrtWithoutSplit.register(this.acnt0, 5000, this.TARGETTC_UNIT),
      jv.TokCtrtWithoutSplit.register(
        this.acnt0,
        this.MAX_ISSUE_AMOUNT,
        this.TOKEN_UNIT
      ),
      jv.TokCtrtWithoutSplit.register(
        this.acnt0,
        this.MAX_ISSUE_AMOUNT,
        this.TOKEN_UNIT
      ),
    ]);
    this.baseTc = baseTc;
    this.optionTc = optionTc;
    // issue just enough amount for all tests.
    // test if optionTc have different unit from proofTc or write it in docs.
    // cannot mint if baseTc and targetTc have higher unit than option/proofTc.
    // should be targetTc_amount_deposited >= option/proofTc_issue_amount
    // should be targetTc_unit <= option/proofTc_unit

    await this.waitForBlock();

    await Promise.all([
      baseTc.issue(this.acnt0, 5000),
      targetTc.issue(this.acnt0, 5000),
      optionTc.issue(this.acnt0, this.MAX_ISSUE_AMOUNT),
      proofTc.issue(this.acnt0, this.MAX_ISSUE_AMOUNT),
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
      baseTc.deposit(this.acnt0, this.vc.ctrtId.data, this.ACNT0_DEP_AMOUNT),
      targetTc.deposit(this.acnt0, this.vc.ctrtId.data, this.ACNT0_DEP_AMOUNT),
      optionTc.deposit(this.acnt0, this.vc.ctrtId.data, this.MAX_ISSUE_AMOUNT),
      proofTc.deposit(this.acnt0, this.vc.ctrtId.data, this.MAX_ISSUE_AMOUNT),
    ]);
    await this.waitForBlock();

    await this.vc.activate(
      this.acnt0,
      this.MAX_ISSUE_AMOUNT,
      this.PRICE, // price
      100 // priceUnit
    );
    await this.waitForBlock();

    await this.vc.mint(this.acnt0, this.MINT_AMOUNT);
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
      expect(maxIssueNum).toEqual(
        new bn.BigNumber(
          this.MAX_ISSUE_AMOUNT * this.TOKEN_UNIT * this.BASETC_UNIT
        )
      );
      // max_issue_amount * option/proof_token_unit * baseTc_unit
    });
  });

  describe('Test method mint', function () {
    it('should lock target tokens into the pool to get option tokens and proof tokens', async function () {
      const targetBal = (await this.vc.getTargetTokBal(this.acnt0.addr.data))
        .data;
      expect(targetBal).toEqual(
        new bn.BigNumber(
          (this.ACNT0_DEP_AMOUNT - this.MINT_AMOUNT) * this.TARGETTC_UNIT
        )
      );
      // (TargetTc_deposited_amount-minted) * targetTc_unit
      const optionBal = (await this.vc.getOptionTokBal(this.acnt0.addr.data))
        .data;
      expect(optionBal).toEqual(
        new bn.BigNumber(this.MINT_AMOUNT * this.TARGETTC_UNIT)
      );
      // minted_amount * targetTc_unit
      const proofBal = (await this.vc.getProofTokBal(this.acnt0.addr.data))
        .data;
      expect(proofBal).toEqual(
        new bn.BigNumber(this.MINT_AMOUNT * this.TARGETTC_UNIT)
      );
      // minted_amount * targetTc_unit
      let resp = await this.vc.getReversedOption();
      expect(resp.data).toEqual(
        new bn.BigNumber(
          (this.MAX_ISSUE_AMOUNT * this.TOKEN_UNIT -
            this.MINT_AMOUNT * this.TARGETTC_UNIT) *
            this.TOKEN_UNIT
        )
      );
      // Amount of reserved option tokens should equal:
      // (MAX_ISSUE_AMOUNT * option/proofTc_unit - total_minted * targetTc_unit) * proofTc_unit
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

      expect(targetBal).toEqual(
        new bn.BigNumber(
          (this.ACNT0_DEP_AMOUNT - this.MINT_AMOUNT + UNLOCK_AMOUNT) *
            this.TARGETTC_UNIT
        )
      );
      // Total amount of target tokens after unlocking some amount should be:
      // (acnt0_targetTc_deposited - minted_amount + acnt0_unlock_amount) * targetTc_unit
    });
  });

  describe('Test method execute&collect', function () {
    it('should test method execute&collect', async function () {
      const execAmount = 100;
      const collectAmount = 100;

      let resp = await this.optionTc.withdraw(
        this.acnt0,
        this.vc.ctrtId.data,
        execAmount
      );
      await this.waitForBlock();

      const targetTokBalInit = await this.vc.getTargetTokBal(
        this.acnt1.addr.data
      );

      resp = await this.baseTc.send(
        this.acnt0,
        this.acnt1.addr.data,
        this.PRICE * execAmount
      );
      resp = await this.optionTc.send(
        this.acnt0,
        this.acnt1.addr.data,
        execAmount
      );
      await this.waitForBlock();

      await ut.sleep(24 * 1000); // after execute timestamp
      resp = await this.baseTc.deposit(
        this.acnt1,
        this.vc.ctrtId.data,
        this.PRICE * execAmount
      );
      resp = await this.optionTc.deposit(
        this.acnt1,
        this.vc.ctrtId.data,
        execAmount
      );
      await this.waitForBlock();
      let txID = resp.id;
      await this.assertTxSuccess(txID);

      const execTxinfo = await this.vc.execute(this.acnt1, execAmount);
      await this.waitForBlock();
      const execTxId = execTxinfo.id;
      await this.assertTxSuccess(execTxId);

      const targetTokBalExec = await this.vc.getTargetTokBal(
        this.acnt1.addr.data
      );
      expect(targetTokBalExec.data.minus(targetTokBalInit.data)).toEqual(
        new bn.BigNumber(execAmount * this.TARGETTC_UNIT)
      );
      // execAmount * targetTc_unit

      await ut.sleep(30 * 1000); // after execute deadline timestamp

      const collectTxinfo = await this.vc.collect(this.acnt0, collectAmount);
      await this.waitForBlock();
      const collectTxId = collectTxinfo.id;
      await this.assertTxSuccess(collectTxId);

      const targetTokBalCol = await this.vc.getTargetTokBal(
        this.acnt0.addr.data
      );
      expect(targetTokBalCol.data).toEqual(
        new bn.BigNumber(
          (this.ACNT0_DEP_AMOUNT -
            this.MINT_AMOUNT +
            ((this.MINT_AMOUNT - execAmount) * collectAmount) /
              this.MINT_AMOUNT) *
            this.TARGETTC_UNIT
        )
      );
      // Balance of tokens available to acnt0 in contract should be:
      // (accnt0_deposit - minted + targetTc_in_pool * collectAmount_byAcnt0 / Total_ProofTc_amount) * targetTc_unit
      // targetTc_in_pool = minted - (unlocked or executed)
      // Total_ProofTC_amount = MINT_AMOUNT. Because we minted only this amount of proof tokens.
    });
  });
});
